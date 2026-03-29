# kubeadm deployment

## Recommended flow

1. Prepare the cluster and confirm `kubectl get nodes` works.
2. Build and push images with a unique image tag.
3. Replace image placeholders in the manifests.
4. Apply namespace, config, secret, postgres, and redis first.
5. Wait for postgres and redis readiness.
6. Run the DB setup job and wait for completion.
7. Deploy backend services and API gateway.
8. Optionally deploy frontend.
9. Validate through NodePort and health endpoints.

## Build and push images

```bash
export IMAGE_REGISTRY=mydockerhubuser
export IMAGE_TAG=build-101
./deploy/scripts/build-images.sh
./deploy/scripts/push-images.sh
```

## Prepare image placeholders

```bash
export IMAGE_REGISTRY=mydockerhubuser
export IMAGE_TAG=build-101
./deploy/scripts/replace-dockerhub-user.sh
```

## Edit secrets before deploy

Update `deploy/kubeadm/02-secret.yaml`.

Make sure:
- `POSTGRES_PASSWORD` matches the password embedded in `DATABASE_URL`
- `JWT_SECRET` is replaced with a long production value
- SMTP values are updated if notification flows are enabled

## Deploy backend stack only

```bash
DEPLOY_NAMESPACE=edutrack DEPLOY_FRONTEND=false ./deploy/scripts/deploy-kubeadm.sh
```

## Deploy backend + frontend

```bash
DEPLOY_NAMESPACE=edutrack DEPLOY_FRONTEND=true ./deploy/scripts/deploy-kubeadm.sh
```

## Validate

```bash
kubectl get all -n edutrack
kubectl get pvc -n edutrack
kubectl get svc -n edutrack
curl http://<NODE-IP>:30080/health
curl http://<NODE-IP>:30080/api/v1/health
```

## Why this order matters

- The DB setup job depends on postgres being reachable.
- The business services depend on database and redis readiness.
- The API gateway is validated only after its downstream services are deployed.
- Frontend is kept optional so backend troubleshooting is easier.

## Notes

- The shell scripts are thin wrappers around the Python helpers in `deploy/scripts/`.
- The deployment helper now performs ordered rollout checks instead of applying every file blindly.
- Business-route testing should be done through the API gateway once the service route rewrites are aligned with the current backend source.
- For the fuller pipeline explanation, see `deploy/docs/kubeadm-production-jenkins.md`.
