# EduTrack deployment repository - kubeadm only

This repository is now focused only on **local Kubernetes deployment with kubeadm**.

It keeps the same deployment style as the existing project, but removes OpenShift-specific pipeline stages and documents so the repo matches the current delivery goal exactly.

## Current scope

This repo currently supports:
- Docker image build for backend services and optional frontend
- Docker Hub image push from Jenkins
- kubeadm manifest preparation under `deploy/kubeadm/`
- ordered backend deployment to the local Kubernetes cluster
- optional frontend deployment to kubeadm
- smoke testing through the API Gateway NodePort endpoint

## Current services in scope

Backend platform:
- PostgreSQL
- Redis
- auth-service
- user-service
- course-service
- assignment-service
- meeting-service
- recording-service
- ai-chat-service
- notification-service
- api-gateway

Optional UI:
- frontend

## Deployment flow used in this repo

Jenkins pipeline flow:
1. Checkout code
2. Verify Docker, Python, kubectl, and kubeadm cluster access
3. Build images
4. Push images to Docker Hub
5. Replace image placeholders in kubeadm manifests
6. Deploy infra first: namespace, configmap, secret, postgres, redis, db setup job
7. Deploy backend services and api-gateway
8. Deploy frontend only when requested
9. Run smoke tests against the kubeadm API endpoint

## Files that matter most

- `Jenkinsfile`
- `deploy/scripts/build-images.sh`
- `deploy/scripts/push-images.sh`
- `deploy/scripts/deploy-kubeadm.sh`
- `deploy/scripts/replace-dockerhub-user.sh`
- `deploy/kubeadm/`
- `deploy/docs/kubeadm-production-jenkins.md`
- `deploy/docs/current-project-plan.md`

## What this repo does not currently claim

Not yet implemented in this repo as part of the current kubeadm phase:
- Gateway API
- TLS / certificate automation
- Cloudflare integration
- observability stack
- autoscaling activation in the live deployment pipeline
- final production hardening

## Why the repo is designed this way

This repo is intentionally scoped to one environment only so the Jenkins training can stay clean and interviewer-friendly.

The idea is:
- first complete a solid kubeadm CI/CD story
- then add Gateway API and TLS in a later phase
- then add monitoring, autoscaling, and hardening after the base deployment is stable
