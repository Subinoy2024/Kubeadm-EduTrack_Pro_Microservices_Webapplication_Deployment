# Deployment layout - kubeadm only

This deployment folder is now intentionally limited to **kubeadm deployment assets**.

## Main folders

### `kubeadm/`
Contains the current Kubernetes manifests for the local kubeadm environment:
- namespace
- configmap
- secret
- postgres
- redis
- microservices
- api-gateway
- optional frontend
- NodePort services for API access and optional frontend access

### `scripts/`
Deployment helper scripts used by Jenkins and manual execution:
- `build-images.py` and wrapper `build-images.sh`
- `push-images.py` and wrapper `push-images.sh`
- `deploy-kubeadm.py` and wrapper `deploy-kubeadm.sh`
- `replace-dockerhub-user.py` and wrapper `replace-dockerhub-user.sh`
- `replace_image_values.py`

### `docs/`
Current deployment documentation focused on the kubeadm phase.

### `kubeadm-optional/`
Optional examples that are not part of the active pipeline yet, such as HPA samples.

## Current delivery goal

The current delivery goal is to make the local Kubernetes deployment clean, repeatable, and Jenkins-driven before introducing Gateway API, TLS, and other production-hardening layers.
