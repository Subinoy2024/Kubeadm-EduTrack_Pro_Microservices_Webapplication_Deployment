# Current project plan - kubeadm only

## What the project currently has

The current deployment baseline includes:
- Docker-based image build flow
- Docker Hub push flow
- kubeadm manifests for backend services
- Postgres persistence
- Redis cache layer
- DB setup job
- API Gateway entrypoint
- optional frontend manifests
- Jenkins pipeline for kubeadm deployment

## Current services

- auth-service
- user-service
- course-service
- assignment-service
- meeting-service
- recording-service
- ai-chat-service
- notification-service
- api-gateway
- postgres
- redis
- optional frontend

## What we are doing now

We are working only on the **kubeadm deployment phase**.

That means the repo and Jenkins pipeline are aligned only to:
1. build images
2. push images
3. prepare kubeadm manifests
4. deploy to local Kubernetes
5. verify pods and health checks

## What will be done later

Later phases can add:
- Gateway API
- TLS and certificate handling
- Cloudflare integration
- observability and monitoring
- autoscaling
- production hardening

These later phases are not part of the current repo scope.
