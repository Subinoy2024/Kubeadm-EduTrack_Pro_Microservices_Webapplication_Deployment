# Docker build and push

## Prerequisites
- Docker installed on the build machine
- access to your image registry (Docker Hub or other OCI-compatible registry)
- run from the **repo root**

## Environment variables

```bash
export IMAGE_REGISTRY=mydockerhubuser
export IMAGE_TAG=v1
```

Backward-compatible alternatives are still supported:

```bash
export DOCKERHUB_USER=mydockerhubuser
export TAG=v1
```

## Build all images

```bash
chmod +x deploy/scripts/build-images.sh
IMAGE_REGISTRY=$IMAGE_REGISTRY IMAGE_TAG=$IMAGE_TAG ./deploy/scripts/build-images.sh
```

## Push all images

```bash
docker login
chmod +x deploy/scripts/push-images.sh
IMAGE_REGISTRY=$IMAGE_REGISTRY IMAGE_TAG=$IMAGE_TAG ./deploy/scripts/push-images.sh
```

## Images produced
- edutrack-auth-service
- edutrack-user-service
- edutrack-course-service
- edutrack-assignment-service
- edutrack-meeting-service
- edutrack-recording-service
- edutrack-ai-chat-service
- edutrack-notification-service
- edutrack-api-gateway
- edutrack-db-tools
