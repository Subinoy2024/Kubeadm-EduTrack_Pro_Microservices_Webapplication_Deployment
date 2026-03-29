# Kubeadm production-structured Jenkins design

This document explains the current Jenkins design for the **kubeadm-only** deployment phase.

## Goal

The current goal is to make the local Kubernetes deployment look structured, repeatable, and industry-oriented without mixing multiple platforms in the same training phase.

## Why kubeadm only right now

Keeping one environment in scope gives cleaner learning, easier troubleshooting, and a stronger interview explanation.

Instead of saying the project partially supports many targets, we can clearly say:
- the current pipeline is for kubeadm
- the deployment order is controlled
- the services are built and deployed consistently
- the next phases will add more production features after the kubeadm baseline is stable

## Current Jenkins parameters

### `DEPLOY_TARGET`
Only two values are used now:
- `kubeadm`
- `kubeadm-with-frontend`

### `IMAGE_TAG`
Allows an explicit image tag. If empty, Jenkins uses `build-BUILD_NUMBER`.

### `IMAGE_REGISTRY`
Docker Hub or other registry namespace.

### `KUBE_NAMESPACE`
Namespace to deploy into.

### `KUBEADM_API_BASE_URL`
Base URL used by the smoke test.

### `VITE_API_BASE_URL`
Frontend API base URL used during frontend image build.

### `SKIP_IMAGE_PUSH`
Useful when you want to test build and manifest preparation only.

## Current pipeline stages

1. Checkout
2. Verify tools
3. Build images
4. Push images
5. Prepare manifests
6. Deploy to kubeadm
7. Smoke test

## Why this looks industry-oriented

- immutable build-style image tags
- cluster access verification before deployment
- registry push separated from runtime deployment
- infra-first deployment order
- controlled smoke testing after rollout
- optional frontend kept behind an explicit parameter

## What is intentionally not in this phase

To keep the project honest and focused, this phase does not yet claim:
- Gateway API
- TLS
- monitoring stack
- autoscaling in active use
- advanced rollback orchestration
