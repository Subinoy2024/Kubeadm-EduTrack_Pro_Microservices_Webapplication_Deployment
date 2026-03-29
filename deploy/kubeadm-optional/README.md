# Optional future-phase manifests

This folder contains **optional future-phase examples**.

These files are **not part of the current validated deployment flow**.
They are included only as controlled scaffolding for later phases.

Current optional examples:
- sample HPA for `api-gateway`
- sample HPA for `auth-service`

Before using HPA in the cluster, complete these prerequisites:
- Metrics Server
- CPU and memory requests/limits
- stable readiness/liveness probes
- rollout validation for the target services
