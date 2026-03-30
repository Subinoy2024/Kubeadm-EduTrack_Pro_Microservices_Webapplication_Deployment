import os
import subprocess
import sys
from pathlib import Path

IMAGE_REGISTRY = os.getenv("IMAGE_REGISTRY", "dccloudimage").strip()
IMAGE_TAG = os.getenv("IMAGE_TAG", "v3").strip()
CONTAINER_TOOL = os.getenv("CONTAINER_TOOL", "docker").strip()
ROOT_DIR = Path(__file__).resolve().parents[2]

IMAGES = [
    ("edutrack-auth-service", "deploy/docker/auth-service.Dockerfile"),
    ("edutrack-user-service", "deploy/docker/user-service.Dockerfile"),
    ("edutrack-course-service", "deploy/docker/course-service.Dockerfile"),
    ("edutrack-assignment-service", "deploy/docker/assignment-service.Dockerfile"),
    ("edutrack-meeting-service", "deploy/docker/meeting-service.Dockerfile"),
    ("edutrack-recording-service", "deploy/docker/recording-service.Dockerfile"),
    ("edutrack-ai-chat-service", "deploy/docker/ai-chat-service.Dockerfile"),
    ("edutrack-notification-service", "deploy/docker/notification-service.Dockerfile"),
    ("edutrack-api-gateway", "deploy/docker/api-gateway.Dockerfile"),
    ("edutrack-db-tools", "deploy/docker/db-tools.Dockerfile"),
    ("edutrack-frontend", "deploy/docker/frontend.Dockerfile"),
]


def run_command(command):
    print("\nRunning command:")
    print(" ".join(command))
    result = subprocess.run(command, cwd=ROOT_DIR)
    if result.returncode != 0:
        print("Command failed.")
        sys.exit(result.returncode)


def validate_inputs():
    if not IMAGE_REGISTRY:
        print("IMAGE_REGISTRY is required.")
        sys.exit(1)
    if not IMAGE_TAG:
        print("IMAGE_TAG is required.")
        sys.exit(1)
    if CONTAINER_TOOL not in {"docker", "podman"}:
        print("CONTAINER_TOOL must be docker or podman.")
        sys.exit(1)


def build_images():
    validate_inputs()
    print(f"Using IMAGE_REGISTRY = {IMAGE_REGISTRY}")
    print(f"Using IMAGE_TAG      = {IMAGE_TAG}")
    print(f"Using CONTAINER_TOOL = {CONTAINER_TOOL}")

    for image_name, dockerfile in IMAGES:
        full_image_name = f"{IMAGE_REGISTRY}/{image_name}:{IMAGE_TAG}"
        print(f"\nBuilding image: {full_image_name}")

        command = [
            CONTAINER_TOOL, "build",
            "-f", dockerfile,
            "-t", full_image_name,
            "."
        ]

        run_command(command)

    print("\nAll images built successfully.")


if __name__ == "__main__":
    build_images()
