import os
import subprocess
import sys
import time
from pathlib import Path

KUBEADM_FOLDER = Path("deploy/kubeadm")
DEPLOY_NAMESPACE = os.getenv("DEPLOY_NAMESPACE", "edutracklocal")
DEPLOY_FRONTEND = os.getenv("DEPLOY_FRONTEND", "false").lower() == "true"
ROLLOUT_TIMEOUT = os.getenv("ROLLOUT_TIMEOUT", "180s")
WAIT_TIMEOUT_SECONDS = int(os.getenv("WAIT_TIMEOUT_SECONDS", "300"))

BASE_FILES = [
    "00-namespace.yaml",
    "01-configmap.yaml",
    "02-secret.yaml",
    "03-postgres.yaml",
    "04-redis.yaml",
    "15-db-setup-job.yaml",
    "05-auth-service.yaml",
    "06-user-service.yaml",
    "07-course-service.yaml",
    "08-assignment-service.yaml",
    "09-meeting-service.yaml",
    "10-recording-service.yaml",
    "11-ai-chat-service.yaml",
    "12-notification-service.yaml",
    "13-api-gateway.yaml",
    "14-api-gateway-nodeport.yaml",
]

FRONTEND_FILES = [
    "16-frontend.yaml",
    "17-frontend-nodeport.yaml",
]

ROLLOUT_DEPLOYMENTS = [
    "redis",
    "auth-service",
    "user-service",
    "course-service",
    "assignment-service",
    "meeting-service",
    "recording-service",
    "ai-chat-service",
    "notification-service",
    "api-gateway",
]


def run_command(command, check=True, capture_output=False):
    print("\nRunning command:")
    print(" ".join(command))
    result = subprocess.run(command, check=False, text=True, capture_output=capture_output)
    if check and result.returncode != 0:
        if capture_output:
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print(result.stderr)
        print("Command failed.")
        sys.exit(result.returncode)
    return result


def wait_for_resource(kind, name):
    print(f"\nWaiting for {kind}/{name} to become ready...")
    command = [
        "kubectl", "wait",
        f"--namespace={DEPLOY_NAMESPACE}",
        "--for=condition=ready",
        kind,
        name,
        f"--timeout={ROLLOUT_TIMEOUT}",
    ]
    run_command(command)


def wait_for_job(name):
    print(f"\nWaiting for job/{name} to complete...")
    command = [
        "kubectl", "wait",
        f"--namespace={DEPLOY_NAMESPACE}",
        "--for=condition=complete",
        f"job/{name}",
        f"--timeout={ROLLOUT_TIMEOUT}",
    ]
    run_command(command)


def wait_for_postgres_pod():
    print("\nWaiting for postgres pod to exist...")
    deadline = time.time() + WAIT_TIMEOUT_SECONDS
    while time.time() < deadline:
        result = run_command([
            "kubectl", "get", "pods",
            "-n", DEPLOY_NAMESPACE,
            "-l", "app=postgres",
            "-o", "jsonpath={.items[0].metadata.name}",
        ], check=False, capture_output=True)
        pod_name = (result.stdout or "").strip()
        if pod_name:
            print(f"Found postgres pod: {pod_name}")
            wait_for_resource("pod", pod_name)
            return
        time.sleep(5)
    raise SystemExit("Timed out waiting for postgres pod")


def apply_manifest(file_name):
    manifest_path = KUBEADM_FOLDER / file_name
    if not manifest_path.exists():
        raise SystemExit(f"Manifest not found: {manifest_path}")
    print(f"\nApplying: {manifest_path}")
    run_command(["kubectl", "apply", "-f", str(manifest_path)])


def rollout_deployment(name):
    command = [
        "kubectl", "rollout", "status",
        f"deployment/{name}",
        f"--namespace={DEPLOY_NAMESPACE}",
        f"--timeout={ROLLOUT_TIMEOUT}",
    ]
    run_command(command)


def main():
    if not KUBEADM_FOLDER.exists():
        print("deploy/kubeadm folder not found.")
        sys.exit(1)

    files_to_apply = list(BASE_FILES)
    if DEPLOY_FRONTEND:
        files_to_apply.extend(FRONTEND_FILES)

    print(f"Using DEPLOY_NAMESPACE = {DEPLOY_NAMESPACE}")
    print(f"Using DEPLOY_FRONTEND  = {DEPLOY_FRONTEND}")
    print(f"Using ROLLOUT_TIMEOUT  = {ROLLOUT_TIMEOUT}")

    for file_name in files_to_apply[:5]:
        apply_manifest(file_name)

    wait_for_postgres_pod()
    rollout_deployment("redis")

    apply_manifest("15-db-setup-job.yaml")
    wait_for_job("edutrack-db-setup")

    for file_name in [
        "05-auth-service.yaml",
        "06-user-service.yaml",
        "07-course-service.yaml",
        "08-assignment-service.yaml",
        "09-meeting-service.yaml",
        "10-recording-service.yaml",
        "11-ai-chat-service.yaml",
        "12-notification-service.yaml",
        "13-api-gateway.yaml",
        "14-api-gateway-nodeport.yaml",
    ]:
        apply_manifest(file_name)

    for deployment_name in ROLLOUT_DEPLOYMENTS[1:]:
        rollout_deployment(deployment_name)

    if DEPLOY_FRONTEND:
        for file_name in FRONTEND_FILES:
            apply_manifest(file_name)
        rollout_deployment("frontend")

    print("\nKubeadm deployment completed successfully.")


if __name__ == "__main__":
    main()
