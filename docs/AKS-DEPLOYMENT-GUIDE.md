# EduTrack Pro -- Azure Kubernetes Service (AKS) Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Azure Resources](#step-1-create-azure-resources)
3. [Step 2: Build and Push Docker Images](#step-2-build-and-push-docker-images)
4. [Step 3: Configure Secrets](#step-3-configure-secrets)
5. [Step 4: Deploy Infrastructure](#step-4-deploy-infrastructure)
6. [Step 5: Deploy Application Services](#step-5-deploy-application-services)
7. [Step 6: Configure Ingress](#step-6-configure-ingress)
8. [Step 7: Monitoring and Logging](#step-7-monitoring-and-logging)
9. [Step 8: CI/CD Pipeline](#step-8-cicd-pipeline)
10. [Step 9: Scaling and Updates](#step-9-scaling-and-updates)
11. [Step 10: Troubleshooting](#step-10-troubleshooting)

---

## Prerequisites

### Required Tools

| Tool | Minimum Version | Installation |
|------|----------------|--------------|
| Azure CLI | 2.60+ | `brew install azure-cli` or [docs.microsoft.com](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) |
| kubectl | 1.28+ | `az aks install-cli` |
| Docker | 24+ | [docker.com](https://docs.docker.com/get-docker/) |
| Helm | 3.14+ | `brew install helm` or [helm.sh](https://helm.sh/docs/intro/install/) |
| Node.js | 20 LTS | Required only for local development |

### Azure Requirements

- An active Azure subscription with Contributor or Owner role
- Azure CLI authenticated: `az login`
- The following Azure resource providers registered:
  - `Microsoft.ContainerService`
  - `Microsoft.ContainerRegistry`
  - `Microsoft.Network`
  - `Microsoft.OperationalInsights`

```bash
# Verify Azure CLI login
az account show

# Register required resource providers
az provider register --namespace Microsoft.ContainerService
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.Network
az provider register --namespace Microsoft.OperationalInsights
```

### EduTrack Pro Services Overview

The platform consists of the following microservices:

| Service | Port | Description |
|---------|------|-------------|
| api-gateway | 3000 | Central API gateway and request router |
| auth-service | 3001 | Authentication and JWT token management |
| user-service | 3002 | User profile management |
| course-service | 3003 | Course and lesson management |
| assignment-service | 3004 | Assignments and submissions |
| meeting-service | 3005 | Meeting scheduling and management |
| recording-service | 3006 | Recording management |
| ai-chat-service | 3007 | AI-powered chat assistant |
| notification-service | 3008 | Email and in-app notifications |
| frontend | 80 | React SPA served via NGINX |

---

## Step 1: Create Azure Resources

### 1.1 Set Environment Variables

```bash
# === Configuration -- Modify these values for your environment ===
export RESOURCE_GROUP="edutrack-rg"
export LOCATION="eastus"
export AKS_CLUSTER_NAME="edutrack-aks"
export ACR_NAME="edutrackacr"        # Must be globally unique, lowercase, alphanumeric only
export NODE_COUNT=3
export NODE_VM_SIZE="Standard_D4s_v5" # 4 vCPU, 16 GB RAM
export K8S_VERSION="1.29"
export VNET_NAME="edutrack-vnet"
export SUBNET_NAME="aks-subnet"
export LOG_ANALYTICS_WORKSPACE="edutrack-logs"
export DNS_ZONE_NAME="edutrack.example.com"
```

### 1.2 Create the Resource Group

```bash
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --tags Environment=Production Project=EduTrack
```

### 1.3 Create a Virtual Network (Recommended for Production)

```bash
az network vnet create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VNET_NAME" \
  --address-prefix 10.0.0.0/16 \
  --subnet-name "$SUBNET_NAME" \
  --subnet-prefix 10.0.1.0/24

# Get the subnet ID for AKS
SUBNET_ID=$(az network vnet subnet show \
  --resource-group "$RESOURCE_GROUP" \
  --vnet-name "$VNET_NAME" \
  --name "$SUBNET_NAME" \
  --query id -o tsv)
```

### 1.4 Create the AKS Cluster

```bash
az aks create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --node-count "$NODE_COUNT" \
  --node-vm-size "$NODE_VM_SIZE" \
  --kubernetes-version "$K8S_VERSION" \
  --vnet-subnet-id "$SUBNET_ID" \
  --network-plugin azure \
  --network-policy calico \
  --service-cidr 10.1.0.0/16 \
  --dns-service-ip 10.1.0.10 \
  --load-balancer-sku standard \
  --enable-managed-identity \
  --enable-cluster-autoscaler \
  --min-count 2 \
  --max-count 10 \
  --zones 1 2 3 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --tags Environment=Production Project=EduTrack

# Get cluster credentials
az aks get-credentials \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --overwrite-existing

# Verify cluster connectivity
kubectl get nodes
kubectl cluster-info
```

### 1.5 Create Azure Container Registry (ACR)

```bash
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Standard \
  --admin-enabled false \
  --tags Environment=Production Project=EduTrack

# Attach ACR to AKS (grants AcrPull role to AKS managed identity)
az aks update \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --attach-acr "$ACR_NAME"

# Verify the integration
az aks check-acr \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --acr "${ACR_NAME}.azurecr.io"
```

---

## Step 2: Build and Push Docker Images

### 2.1 Authenticate to ACR

```bash
az acr login --name "$ACR_NAME"
export ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"
```

### 2.2 Build and Push All Service Images

Run these commands from the repository root (`/Users/subdebna/learner-navigator`):

```bash
# Set image tag (use git SHA for traceability)
export IMAGE_TAG=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

# --- API Gateway ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/api-gateway:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/api-gateway:latest" \
  backend/api-gateway

docker push "${ACR_LOGIN_SERVER}/edutrack/api-gateway:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/api-gateway:latest"

# --- Auth Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/auth-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/auth-service:latest" \
  backend/services/auth-service

docker push "${ACR_LOGIN_SERVER}/edutrack/auth-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/auth-service:latest"

# --- User Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/user-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/user-service:latest" \
  backend/services/user-service

docker push "${ACR_LOGIN_SERVER}/edutrack/user-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/user-service:latest"

# --- Course Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/course-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/course-service:latest" \
  backend/services/course-service

docker push "${ACR_LOGIN_SERVER}/edutrack/course-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/course-service:latest"

# --- Assignment Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/assignment-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/assignment-service:latest" \
  backend/services/assignment-service

docker push "${ACR_LOGIN_SERVER}/edutrack/assignment-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/assignment-service:latest"

# --- Meeting Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/meeting-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/meeting-service:latest" \
  backend/services/meeting-service

docker push "${ACR_LOGIN_SERVER}/edutrack/meeting-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/meeting-service:latest"

# --- Recording Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/recording-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/recording-service:latest" \
  backend/services/recording-service

docker push "${ACR_LOGIN_SERVER}/edutrack/recording-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/recording-service:latest"

# --- AI Chat Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/ai-chat-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/ai-chat-service:latest" \
  backend/services/ai-chat-service

docker push "${ACR_LOGIN_SERVER}/edutrack/ai-chat-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/ai-chat-service:latest"

# --- Notification Service ---
docker build \
  -f docker/Dockerfile.service \
  -t "${ACR_LOGIN_SERVER}/edutrack/notification-service:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/notification-service:latest" \
  backend/services/notification-service

docker push "${ACR_LOGIN_SERVER}/edutrack/notification-service:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/notification-service:latest"

# --- Frontend ---
docker build \
  -f docker/Dockerfile.frontend \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  -t "${ACR_LOGIN_SERVER}/edutrack/frontend:${IMAGE_TAG}" \
  -t "${ACR_LOGIN_SERVER}/edutrack/frontend:latest" \
  source/learner-navigator-ai-main

docker push "${ACR_LOGIN_SERVER}/edutrack/frontend:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/edutrack/frontend:latest"
```

### 2.3 Verify Pushed Images

```bash
az acr repository list --name "$ACR_NAME" --output table
az acr repository show-tags --name "$ACR_NAME" --repository edutrack/api-gateway --output table
```

### 2.4 Build Script (Optional Automation)

Create a convenience script at the repo root:

```bash
#!/usr/bin/env bash
# build-and-push-all.sh
set -euo pipefail

ACR_LOGIN_SERVER="$1"
IMAGE_TAG="${2:-latest}"

SERVICES=(
  "api-gateway:backend/api-gateway"
  "auth-service:backend/services/auth-service"
  "user-service:backend/services/user-service"
  "course-service:backend/services/course-service"
  "assignment-service:backend/services/assignment-service"
  "meeting-service:backend/services/meeting-service"
  "recording-service:backend/services/recording-service"
  "ai-chat-service:backend/services/ai-chat-service"
  "notification-service:backend/services/notification-service"
)

for entry in "${SERVICES[@]}"; do
  IFS=":" read -r svc path <<< "$entry"
  echo "Building ${svc}..."
  docker build -f docker/Dockerfile.service \
    -t "${ACR_LOGIN_SERVER}/edutrack/${svc}:${IMAGE_TAG}" \
    "$path"
  docker push "${ACR_LOGIN_SERVER}/edutrack/${svc}:${IMAGE_TAG}"
done

echo "Building frontend..."
docker build -f docker/Dockerfile.frontend \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  -t "${ACR_LOGIN_SERVER}/edutrack/frontend:${IMAGE_TAG}" \
  source/learner-navigator-ai-main
docker push "${ACR_LOGIN_SERVER}/edutrack/frontend:${IMAGE_TAG}"

echo "All images pushed successfully."
```

---

## Step 3: Configure Secrets

### 3.1 Create the Namespace

```bash
kubectl apply -f k8s/base/ingress/namespace.yaml
# Or manually:
# kubectl create namespace edutrack
```

### 3.2 Create Kubernetes Secrets

Generate strong secret values:

```bash
# Generate secure random strings
JWT_SECRET=$(openssl rand -base64 48)
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)

# Create the main application secret
kubectl create secret generic edutrack-secrets \
  --namespace edutrack \
  --from-literal=DATABASE_URL="postgresql://edutrack:${DB_PASSWORD}@edutrack-postgres.edutrack.svc.cluster.local:5432/edutrack" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=REDIS_URL="redis://:${REDIS_PASSWORD}@edutrack-redis-master.edutrack.svc.cluster.local:6379" \
  --from-literal=SMTP_USER="smtp-user@yourdomain.com" \
  --from-literal=SMTP_PASS="your-smtp-password" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 3.3 Azure Key Vault Integration (Recommended for Production)

```bash
# Create Key Vault
export KEY_VAULT_NAME="edutrack-kv-$(openssl rand -hex 4)"

az keyvault create \
  --name "$KEY_VAULT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --enable-rbac-authorization true

# Store secrets in Key Vault
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "jwt-secret" --value "$JWT_SECRET"
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "db-password" --value "$DB_PASSWORD"
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "redis-password" --value "$REDIS_PASSWORD"

# Enable the Azure Key Vault Secrets Provider add-on
az aks enable-addons \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --addons azure-keyvault-secrets-provider

# Get the user-assigned managed identity for the secrets provider
IDENTITY_CLIENT_ID=$(az aks show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --query "addonProfiles.azureKeyvaultSecretsProvider.identity.clientId" -o tsv)

# Grant the identity access to the Key Vault
KEY_VAULT_ID=$(az keyvault show --name "$KEY_VAULT_NAME" --query id -o tsv)

az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee "$IDENTITY_CLIENT_ID" \
  --scope "$KEY_VAULT_ID"
```

Create a `SecretProviderClass` manifest:

```yaml
# k8s/base/ingress/secret-provider-class.yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: edutrack-keyvault
  namespace: edutrack
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    useVMManagedIdentity: "true"
    userAssignedIdentityID: "<IDENTITY_CLIENT_ID>"
    keyvaultName: "<KEY_VAULT_NAME>"
    tenantId: "<AZURE_TENANT_ID>"
    objects: |
      array:
        - |
          objectName: jwt-secret
          objectType: secret
        - |
          objectName: db-password
          objectType: secret
        - |
          objectName: redis-password
          objectType: secret
  secretObjects:
    - secretName: edutrack-secrets-from-kv
      type: Opaque
      data:
        - objectName: jwt-secret
          key: JWT_SECRET
        - objectName: db-password
          key: DB_PASSWORD
        - objectName: redis-password
          key: REDIS_PASSWORD
```

```bash
kubectl apply -f k8s/base/ingress/secret-provider-class.yaml
```

---

## Step 4: Deploy Infrastructure

### Option A: Azure Managed Services (Recommended for Production)

#### 4.1a Azure Database for PostgreSQL Flexible Server

```bash
export PG_SERVER_NAME="edutrack-pg"

az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$PG_SERVER_NAME" \
  --location "$LOCATION" \
  --admin-user edutrack \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_D2ds_v5 \
  --tier GeneralPurpose \
  --storage-size 128 \
  --version 16 \
  --vnet "$VNET_NAME" \
  --subnet "pg-subnet" \
  --private-dns-zone "edutrack-pg.private.postgres.database.azure.com" \
  --high-availability ZoneRedundant \
  --backup-retention 35 \
  --tags Environment=Production Project=EduTrack

# Create the database
az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$PG_SERVER_NAME" \
  --database-name edutrack

# Enable required PostgreSQL extensions
az postgres flexible-server parameter set \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$PG_SERVER_NAME" \
  --name azure.extensions \
  --value "uuid-ossp,pgcrypto"

# Get the fully qualified server name
PG_FQDN=$(az postgres flexible-server show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$PG_SERVER_NAME" \
  --query fullyQualifiedDomainName -o tsv)

echo "PostgreSQL FQDN: $PG_FQDN"

# Update the secret with the Azure PostgreSQL connection string
kubectl create secret generic edutrack-secrets \
  --namespace edutrack \
  --from-literal=DATABASE_URL="postgresql://edutrack:${DB_PASSWORD}@${PG_FQDN}:5432/edutrack?sslmode=require" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=REDIS_URL="rediss://:${REDIS_PASSWORD}@edutrack-redis.redis.cache.windows.net:6380" \
  --from-literal=SMTP_USER="smtp-user@yourdomain.com" \
  --from-literal=SMTP_PASS="your-smtp-password" \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### 4.1b Azure Cache for Redis

```bash
az redis create \
  --resource-group "$RESOURCE_GROUP" \
  --name "edutrack-redis" \
  --location "$LOCATION" \
  --sku Standard \
  --vm-size C1 \
  --enable-non-ssl-port false \
  --minimum-tls-version 1.2 \
  --tags Environment=Production Project=EduTrack

# Get the Redis access key
REDIS_KEY=$(az redis list-keys \
  --resource-group "$RESOURCE_GROUP" \
  --name "edutrack-redis" \
  --query primaryKey -o tsv)

REDIS_HOST=$(az redis show \
  --resource-group "$RESOURCE_GROUP" \
  --name "edutrack-redis" \
  --query hostName -o tsv)

echo "Redis Host: $REDIS_HOST"
```

### Option B: In-Cluster PostgreSQL and Redis (Development/Testing)

#### 4.2a Deploy PostgreSQL via Helm

```bash
# Add Bitnami Helm repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Deploy PostgreSQL
helm install edutrack-postgres bitnami/postgresql \
  --namespace edutrack \
  --set auth.database=edutrack \
  --set auth.username=edutrack \
  --set auth.password="$DB_PASSWORD" \
  --set primary.persistence.size=50Gi \
  --set primary.persistence.storageClass=managed-premium \
  --set primary.resources.requests.memory=512Mi \
  --set primary.resources.requests.cpu=250m \
  --set primary.resources.limits.memory=1Gi \
  --set primary.resources.limits.cpu=1000m \
  --set image.tag=16 \
  --wait
```

#### 4.2b Deploy Redis via Helm

```bash
helm install edutrack-redis bitnami/redis \
  --namespace edutrack \
  --set auth.password="$REDIS_PASSWORD" \
  --set master.persistence.size=10Gi \
  --set master.persistence.storageClass=managed-premium \
  --set master.resources.requests.memory=128Mi \
  --set master.resources.requests.cpu=100m \
  --set master.resources.limits.memory=256Mi \
  --set master.resources.limits.cpu=500m \
  --set replica.replicaCount=2 \
  --wait
```

### 4.3 Run Database Migrations

```bash
# Run migrations using a Kubernetes Job
cat <<'MIGRATION_EOF' | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: edutrack-migrations
  namespace: edutrack
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: postgres:16-alpine
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: edutrack-secrets
                  key: DATABASE_URL
          command:
            - /bin/sh
            - -c
            - |
              set -e
              echo "Running EduTrack database migrations..."
              for f in /migrations/*.sql; do
                echo "Applying: $f"
                psql "$DATABASE_URL" -f "$f"
              done
              echo "Migrations complete."
          volumeMounts:
            - name: migrations
              mountPath: /migrations
      volumes:
        - name: migrations
          configMap:
            name: edutrack-migrations
MIGRATION_EOF

# First, create a ConfigMap from the migration SQL files
kubectl create configmap edutrack-migrations \
  --namespace edutrack \
  --from-file=backend/database/migrations/

# Recreate the job if the configmap was just created
kubectl delete job edutrack-migrations --namespace edutrack --ignore-not-found
kubectl apply -f - <<'MIGRATION_EOF'
apiVersion: batch/v1
kind: Job
metadata:
  name: edutrack-migrations
  namespace: edutrack
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: postgres:16-alpine
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: edutrack-secrets
                  key: DATABASE_URL
          command:
            - /bin/sh
            - -c
            - |
              set -e
              echo "Running EduTrack database migrations..."
              for f in $(ls /migrations/*.sql | sort); do
                echo "Applying: $f"
                psql "$DATABASE_URL" -f "$f"
              done
              echo "All migrations applied successfully."
          volumeMounts:
            - name: migrations
              mountPath: /migrations
      volumes:
        - name: migrations
          configMap:
            name: edutrack-migrations
MIGRATION_EOF

# Monitor the migration job
kubectl wait --for=condition=complete job/edutrack-migrations --namespace edutrack --timeout=120s
kubectl logs job/edutrack-migrations --namespace edutrack
```

### 4.4 Seed Initial Data (Optional)

```bash
kubectl create configmap edutrack-seeds \
  --namespace edutrack \
  --from-file=backend/database/seeds/

kubectl apply -f - <<'SEED_EOF'
apiVersion: batch/v1
kind: Job
metadata:
  name: edutrack-seed
  namespace: edutrack
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: seed
          image: postgres:16-alpine
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: edutrack-secrets
                  key: DATABASE_URL
          command:
            - /bin/sh
            - -c
            - |
              set -e
              for f in $(ls /seeds/*.sql | sort); do
                echo "Seeding: $f"
                psql "$DATABASE_URL" -f "$f"
              done
              echo "Seeding complete."
          volumeMounts:
            - name: seeds
              mountPath: /seeds
      volumes:
        - name: seeds
          configMap:
            name: edutrack-seeds
SEED_EOF

kubectl wait --for=condition=complete job/edutrack-seed --namespace edutrack --timeout=60s
```

---

## Step 5: Deploy Application Services

### 5.1 Create ConfigMaps for Each Service

```bash
# API Gateway ConfigMap
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-gateway-config
  namespace: edutrack
data:
  PORT: "3000"
  NODE_ENV: "production"
  AUTH_SERVICE_URL: "http://auth-service.edutrack.svc.cluster.local:3001"
  USER_SERVICE_URL: "http://user-service.edutrack.svc.cluster.local:3002"
  COURSE_SERVICE_URL: "http://course-service.edutrack.svc.cluster.local:3003"
  ASSIGNMENT_SERVICE_URL: "http://assignment-service.edutrack.svc.cluster.local:3004"
  MEETING_SERVICE_URL: "http://meeting-service.edutrack.svc.cluster.local:3005"
  RECORDING_SERVICE_URL: "http://recording-service.edutrack.svc.cluster.local:3006"
  AI_CHAT_SERVICE_URL: "http://ai-chat-service.edutrack.svc.cluster.local:3007"
  NOTIFICATION_SERVICE_URL: "http://notification-service.edutrack.svc.cluster.local:3008"
  CORS_ORIGINS: "https://edutrack.example.com"
EOF

# Shared service ConfigMap
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: shared-service-config
  namespace: edutrack
data:
  NODE_ENV: "production"
  JWT_EXPIRES_IN: "15m"
  REFRESH_TOKEN_EXPIRES_IN: "7d"
  AI_PROVIDER: "built-in"
  SMTP_HOST: "smtp.yourdomain.com"
  SMTP_PORT: "587"
  FROM_EMAIL: "noreply@edutrack.example.com"
EOF
```

### 5.2 Deploy All Backend Services

Create a comprehensive deployment manifest. Save as `k8s/overlays/production/all-services.yaml`:

```yaml
# --- Auth Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: edutrack
  labels:
    app: auth-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: auth-service
          image: <ACR_LOGIN_SERVER>/edutrack/auth-service:latest
          ports:
            - containerPort: 3001
          env:
            - name: PORT
              value: "3001"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 15
            periodSeconds: 20
          securityContext:
            runAsNonRoot: true
            readOnlyRootFilesystem: true
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: auth-service
  ports:
    - port: 3001
      targetPort: 3001
---
# --- User Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: edutrack
  labels:
    app: user-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: user-service
          image: <ACR_LOGIN_SERVER>/edutrack/user-service:latest
          ports:
            - containerPort: 3002
          env:
            - name: PORT
              value: "3002"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3002
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3002
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: user-service
  ports:
    - port: 3002
      targetPort: 3002
---
# --- Course Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: course-service
  namespace: edutrack
  labels:
    app: course-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: course-service
  template:
    metadata:
      labels:
        app: course-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: course-service
          image: <ACR_LOGIN_SERVER>/edutrack/course-service:latest
          ports:
            - containerPort: 3003
          env:
            - name: PORT
              value: "3003"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3003
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3003
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: course-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: course-service
  ports:
    - port: 3003
      targetPort: 3003
---
# --- Assignment Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: assignment-service
  namespace: edutrack
  labels:
    app: assignment-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: assignment-service
  template:
    metadata:
      labels:
        app: assignment-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: assignment-service
          image: <ACR_LOGIN_SERVER>/edutrack/assignment-service:latest
          ports:
            - containerPort: 3004
          env:
            - name: PORT
              value: "3004"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3004
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3004
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: assignment-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: assignment-service
  ports:
    - port: 3004
      targetPort: 3004
---
# --- Meeting Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: meeting-service
  namespace: edutrack
  labels:
    app: meeting-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: meeting-service
  template:
    metadata:
      labels:
        app: meeting-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: meeting-service
          image: <ACR_LOGIN_SERVER>/edutrack/meeting-service:latest
          ports:
            - containerPort: 3005
          env:
            - name: PORT
              value: "3005"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3005
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3005
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: meeting-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: meeting-service
  ports:
    - port: 3005
      targetPort: 3005
---
# --- Recording Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recording-service
  namespace: edutrack
  labels:
    app: recording-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: recording-service
  template:
    metadata:
      labels:
        app: recording-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: recording-service
          image: <ACR_LOGIN_SERVER>/edutrack/recording-service:latest
          ports:
            - containerPort: 3006
          env:
            - name: PORT
              value: "3006"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3006
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3006
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: recording-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: recording-service
  ports:
    - port: 3006
      targetPort: 3006
---
# --- AI Chat Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-chat-service
  namespace: edutrack
  labels:
    app: ai-chat-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-chat-service
  template:
    metadata:
      labels:
        app: ai-chat-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: ai-chat-service
          image: <ACR_LOGIN_SERVER>/edutrack/ai-chat-service:latest
          ports:
            - containerPort: 3007
          env:
            - name: PORT
              value: "3007"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"
              cpu: "1000m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3007
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3007
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: ai-chat-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: ai-chat-service
  ports:
    - port: 3007
      targetPort: 3007
---
# --- Notification Service ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notification-service
  namespace: edutrack
  labels:
    app: notification-service
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: notification-service
  template:
    metadata:
      labels:
        app: notification-service
        app.kubernetes.io/part-of: edutrack
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: notification-service
          image: <ACR_LOGIN_SERVER>/edutrack/notification-service:latest
          ports:
            - containerPort: 3008
          env:
            - name: PORT
              value: "3008"
          envFrom:
            - configMapRef:
                name: shared-service-config
            - secretRef:
                name: edutrack-secrets
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3008
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3008
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: notification-service
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: notification-service
  ports:
    - port: 3008
      targetPort: 3008
```

### 5.3 Deploy Using Kustomize or Direct Apply

```bash
# Option 1: Using existing kustomize base (update image references first)
# Replace placeholder images with your ACR images
export ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)

# Apply the API gateway from the existing k8s manifests
kubectl apply -f k8s/base/ingress/namespace.yaml
kubectl apply -f k8s/base/api-gateway/deployment.yaml
kubectl apply -f k8s/base/api-gateway/service.yaml

# Option 2: Apply the full service manifest created above
# First replace the placeholder with your actual ACR server
sed "s|<ACR_LOGIN_SERVER>|${ACR_LOGIN_SERVER}|g" \
  k8s/overlays/production/all-services.yaml | kubectl apply -f -

# Deploy the frontend
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: edutrack
  labels:
    app: frontend
    app.kubernetes.io/part-of: edutrack
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        app.kubernetes.io/part-of: edutrack
    spec:
      containers:
        - name: frontend
          image: ${ACR_LOGIN_SERVER}/edutrack/frontend:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "200m"
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: edutrack
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
EOF
```

### 5.4 Verify Deployments

```bash
# Check all deployments
kubectl get deployments -n edutrack

# Check all pods are running
kubectl get pods -n edutrack -o wide

# Check services
kubectl get svc -n edutrack

# Wait for all deployments to be ready
kubectl wait --for=condition=available deployment --all -n edutrack --timeout=300s

# Test service health endpoints from within the cluster
kubectl run curl-test --rm -it --image=curlimages/curl --restart=Never -n edutrack -- \
  curl -s http://api-gateway.edutrack.svc.cluster.local:3000/health

kubectl run curl-test2 --rm -it --image=curlimages/curl --restart=Never -n edutrack -- \
  curl -s http://auth-service.edutrack.svc.cluster.local:3001/health
```

---

## Step 6: Configure Ingress

### 6.1 Install NGINX Ingress Controller via Helm

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set controller.admissionWebhooks.patch.nodeSelector."kubernetes\.io/os"=linux \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz \
  --set controller.service.externalTrafficPolicy=Local \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux

# Wait for the ingress controller to get an external IP
kubectl get svc ingress-nginx-controller -n ingress-nginx -w
# Press Ctrl+C once EXTERNAL-IP changes from <pending> to an actual IP

INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress External IP: $INGRESS_IP"
```

### 6.2 Install cert-manager for TLS Certificates

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.4 \
  --set installCRDs=true \
  --set nodeSelector."kubernetes\.io/os"=linux

# Wait for cert-manager to be ready
kubectl wait --for=condition=available deployment --all -n cert-manager --timeout=120s

# Create a ClusterIssuer for Let's Encrypt
kubectl apply -f - <<'EOF'
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@edutrack.example.com
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
      - http01:
          ingress:
            class: nginx
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@edutrack.example.com
    privateKeySecretRef:
      name: letsencrypt-staging-key
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
```

### 6.3 Apply the Ingress Resource

```bash
# Apply the existing ingress manifest (already defined in k8s/base/ingress/ingress.yaml)
kubectl apply -f k8s/base/ingress/ingress.yaml

# Or apply with customized domain:
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: edutrack-ingress
  namespace: edutrack
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/limit-rps: "50"
    nginx.ingress.kubernetes.io/limit-connections: "20"
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - edutrack.example.com
      secretName: edutrack-tls
  rules:
    - host: edutrack.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 3000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
EOF
```

### 6.4 Configure DNS

```bash
# Option 1: Azure DNS Zone
az network dns zone create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DNS_ZONE_NAME"

az network dns record-set a add-record \
  --resource-group "$RESOURCE_GROUP" \
  --zone-name "$DNS_ZONE_NAME" \
  --record-set-name "@" \
  --ipv4-address "$INGRESS_IP"

az network dns record-set a add-record \
  --resource-group "$RESOURCE_GROUP" \
  --zone-name "$DNS_ZONE_NAME" \
  --record-set-name "www" \
  --ipv4-address "$INGRESS_IP"

# Option 2: If using external DNS provider, create an A record pointing to $INGRESS_IP

# Verify DNS propagation
nslookup edutrack.example.com

# Verify TLS certificate issuance
kubectl get certificate -n edutrack
kubectl describe certificate edutrack-tls -n edutrack
```

---

## Step 7: Monitoring and Logging

### 7.1 Enable Azure Monitor for Containers

Azure Monitor was enabled during cluster creation (via `--enable-addons monitoring`). Verify it:

```bash
# Check that the monitoring addon is enabled
az aks show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --query "addonProfiles.omsagent.enabled"

# If not enabled, enable it now:
az aks enable-addons \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --addons monitoring
```

### 7.2 Set Up Log Analytics Workspace

```bash
# Create a dedicated Log Analytics workspace (if not auto-created)
az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$LOG_ANALYTICS_WORKSPACE" \
  --location "$LOCATION" \
  --retention-time 90 \
  --tags Environment=Production Project=EduTrack

LOG_ANALYTICS_ID=$(az monitor log-analytics workspace show \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$LOG_ANALYTICS_WORKSPACE" \
  --query id -o tsv)

# Link the workspace to the AKS cluster
az aks enable-addons \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --addons monitoring \
  --workspace-resource-id "$LOG_ANALYTICS_ID"
```

### 7.3 Configure Container Insights Data Collection

```bash
# Create a ConfigMap for Container Insights agent settings
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: container-azm-ms-agentconfig
  namespace: kube-system
data:
  schema-version: v1
  config-version: ver1
  log-data-collection-settings: |-
    [log_collection_settings]
      [log_collection_settings.stdout]
        enabled = true
        exclude_namespaces = ["kube-system","gatekeeper-system"]
      [log_collection_settings.stderr]
        enabled = true
        exclude_namespaces = ["kube-system","gatekeeper-system"]
      [log_collection_settings.env_var]
        enabled = true
  prometheus-data-collection-settings: |-
    [prometheus_data_collection_settings.cluster]
      interval = "1m"
      monitor_kubernetes_pods = true
      monitor_kubernetes_pods_namespaces = ["edutrack"]
    [prometheus_data_collection_settings.node]
      interval = "1m"
EOF
```

### 7.4 Configure Alerts

```bash
# Alert: Pod restart count > 5 in the last 15 minutes
az monitor metrics alert create \
  --name "edutrack-pod-restarts" \
  --resource-group "$RESOURCE_GROUP" \
  --scopes "$(az aks show -g $RESOURCE_GROUP -n $AKS_CLUSTER_NAME --query id -o tsv)" \
  --condition "avg node_cpu_usage_percentage > 80" \
  --description "AKS node CPU usage exceeds 80%" \
  --severity 2 \
  --window-size 5m \
  --evaluation-frequency 1m

# Alert: High memory usage
az monitor metrics alert create \
  --name "edutrack-high-memory" \
  --resource-group "$RESOURCE_GROUP" \
  --scopes "$(az aks show -g $RESOURCE_GROUP -n $AKS_CLUSTER_NAME --query id -o tsv)" \
  --condition "avg node_memory_working_set_percentage > 85" \
  --description "AKS node memory usage exceeds 85%" \
  --severity 2 \
  --window-size 5m \
  --evaluation-frequency 1m

# Create an Action Group for email notifications
az monitor action-group create \
  --resource-group "$RESOURCE_GROUP" \
  --name "edutrack-alerts-email" \
  --short-name "EdtrkAlert" \
  --action email ops-team ops-team@edutrack.example.com
```

### 7.5 Deploy Prometheus and Grafana (Optional Advanced Monitoring)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword="your-grafana-admin-password" \
  --set grafana.ingress.enabled=true \
  --set grafana.ingress.hosts[0]="grafana.edutrack.example.com" \
  --set alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage=10Gi

# Create a ServiceMonitor for EduTrack services
kubectl apply -f - <<'EOF'
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: edutrack-services
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - edutrack
  selector:
    matchLabels:
      app.kubernetes.io/part-of: edutrack
  endpoints:
    - port: http
      path: /health
      interval: 30s
EOF
```

---

## Step 8: CI/CD Pipeline

### 8.1 GitHub Actions Workflow

Create `.github/workflows/deploy-aks.yml`:

```yaml
name: Build, Test, and Deploy to AKS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AZURE_RESOURCE_GROUP: edutrack-rg
  AKS_CLUSTER_NAME: edutrack-aks
  ACR_NAME: edutrackacr
  NAMESPACE: edutrack

jobs:
  # ---- Build and Test ----
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - name: api-gateway
            context: backend/api-gateway
            port: 3000
          - name: auth-service
            context: backend/services/auth-service
            port: 3001
          - name: user-service
            context: backend/services/user-service
            port: 3002
          - name: course-service
            context: backend/services/course-service
            port: 3003
          - name: assignment-service
            context: backend/services/assignment-service
            port: 3004
          - name: meeting-service
            context: backend/services/meeting-service
            port: 3005
          - name: recording-service
            context: backend/services/recording-service
            port: 3006
          - name: ai-chat-service
            context: backend/services/ai-chat-service
            port: 3007
          - name: notification-service
            context: backend/services/notification-service
            port: 3008

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: ${{ matrix.service.context }}/package-lock.json

      - name: Install dependencies
        working-directory: ${{ matrix.service.context }}
        run: npm ci

      - name: Run linter
        working-directory: ${{ matrix.service.context }}
        run: npm run lint --if-present

      - name: Run tests
        working-directory: ${{ matrix.service.context }}
        run: npm test --if-present

      - name: Build TypeScript
        working-directory: ${{ matrix.service.context }}
        run: npm run build

  # ---- Push Docker Images ----
  push-images:
    needs: build-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - name: api-gateway
            context: backend/api-gateway
          - name: auth-service
            context: backend/services/auth-service
          - name: user-service
            context: backend/services/user-service
          - name: course-service
            context: backend/services/course-service
          - name: assignment-service
            context: backend/services/assignment-service
          - name: meeting-service
            context: backend/services/meeting-service
          - name: recording-service
            context: backend/services/recording-service
          - name: ai-chat-service
            context: backend/services/ai-chat-service
          - name: notification-service
            context: backend/services/notification-service

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Login to ACR
        run: az acr login --name ${{ env.ACR_NAME }}

      - name: Build and push image
        run: |
          ACR_SERVER=$(az acr show --name ${{ env.ACR_NAME }} --query loginServer -o tsv)
          IMAGE_TAG=${{ github.sha }}

          docker build \
            -f docker/Dockerfile.service \
            -t "${ACR_SERVER}/edutrack/${{ matrix.service.name }}:${IMAGE_TAG}" \
            -t "${ACR_SERVER}/edutrack/${{ matrix.service.name }}:latest" \
            ${{ matrix.service.context }}

          docker push "${ACR_SERVER}/edutrack/${{ matrix.service.name }}:${IMAGE_TAG}"
          docker push "${ACR_SERVER}/edutrack/${{ matrix.service.name }}:latest"

  # ---- Push Frontend Image ----
  push-frontend:
    needs: build-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Login to ACR
        run: az acr login --name ${{ env.ACR_NAME }}

      - name: Build and push frontend
        run: |
          ACR_SERVER=$(az acr show --name ${{ env.ACR_NAME }} --query loginServer -o tsv)
          IMAGE_TAG=${{ github.sha }}

          docker build \
            -f docker/Dockerfile.frontend \
            --build-arg VITE_API_BASE_URL=/api/v1 \
            -t "${ACR_SERVER}/edutrack/frontend:${IMAGE_TAG}" \
            -t "${ACR_SERVER}/edutrack/frontend:latest" \
            source/learner-navigator-ai-main

          docker push "${ACR_SERVER}/edutrack/frontend:${IMAGE_TAG}"
          docker push "${ACR_SERVER}/edutrack/frontend:latest"

  # ---- Deploy to AKS ----
  deploy:
    needs: [push-images, push-frontend]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Set AKS context
        uses: azure/aks-set-context@v4
        with:
          resource-group: ${{ env.AZURE_RESOURCE_GROUP }}
          cluster-name: ${{ env.AKS_CLUSTER_NAME }}

      - name: Update image tags for all deployments
        run: |
          ACR_SERVER=$(az acr show --name ${{ env.ACR_NAME }} --query loginServer -o tsv)
          IMAGE_TAG=${{ github.sha }}

          SERVICES="api-gateway auth-service user-service course-service assignment-service meeting-service recording-service ai-chat-service notification-service frontend"

          for svc in $SERVICES; do
            echo "Updating ${svc} to tag ${IMAGE_TAG}..."
            kubectl set image deployment/${svc} \
              ${svc}="${ACR_SERVER}/edutrack/${svc}:${IMAGE_TAG}" \
              --namespace ${{ env.NAMESPACE }} \
              --record
          done

      - name: Wait for rollout completion
        run: |
          SERVICES="api-gateway auth-service user-service course-service assignment-service meeting-service recording-service ai-chat-service notification-service frontend"

          for svc in $SERVICES; do
            echo "Waiting for ${svc} rollout..."
            kubectl rollout status deployment/${svc} \
              --namespace ${{ env.NAMESPACE }} \
              --timeout=300s
          done

      - name: Verify deployment health
        run: |
          echo "Checking pod status..."
          kubectl get pods -n ${{ env.NAMESPACE }}

          echo "Running health check..."
          kubectl run health-check --rm -it --restart=Never \
            --image=curlimages/curl -n ${{ env.NAMESPACE }} -- \
            curl -sf http://api-gateway.${{ env.NAMESPACE }}.svc.cluster.local:3000/health
```

### 8.2 Required GitHub Secrets

Configure these in your GitHub repository settings under Settings > Secrets and variables > Actions:

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `AZURE_CREDENTIALS` | Azure Service Principal JSON | `az ad sp create-for-rbac --name "edutrack-gh-actions" --role contributor --scopes /subscriptions/<SUB_ID>/resourceGroups/edutrack-rg --sdk-auth` |

```bash
# Create the Service Principal and get the JSON credentials
az ad sp create-for-rbac \
  --name "edutrack-github-actions" \
  --role contributor \
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP" \
  --sdk-auth

# Copy the JSON output and save it as the AZURE_CREDENTIALS secret in GitHub
```

---

## Step 9: Scaling and Updates

### 9.1 Horizontal Pod Autoscaler (HPA)

```bash
# Install the metrics server (if not already installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Create HPA for each service
SERVICES=("api-gateway:3000" "auth-service:3001" "user-service:3002" "course-service:3003" "assignment-service:3004" "meeting-service:3005" "recording-service:3006" "ai-chat-service:3007" "notification-service:3008" "frontend:80")

for entry in "${SERVICES[@]}"; do
  IFS=":" read -r svc port <<< "$entry"
  kubectl autoscale deployment "$svc" \
    --namespace edutrack \
    --min=2 \
    --max=10 \
    --cpu-percent=70
done

# Verify HPAs
kubectl get hpa -n edutrack
```

Advanced HPA with custom metrics:

```yaml
# k8s/overlays/production/hpa-api-gateway.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: edutrack
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
```

```bash
kubectl apply -f k8s/overlays/production/hpa-api-gateway.yaml
```

### 9.2 Rolling Update Strategy

All deployments use rolling updates by default. You can customize the strategy:

```bash
# Patch the deployment to fine-tune rolling update behavior
kubectl patch deployment api-gateway -n edutrack -p '{
  "spec": {
    "strategy": {
      "type": "RollingUpdate",
      "rollingUpdate": {
        "maxSurge": "25%",
        "maxUnavailable": 0
      }
    }
  }
}'

# Trigger a rolling update by changing the image tag
kubectl set image deployment/api-gateway \
  api-gateway="${ACR_LOGIN_SERVER}/edutrack/api-gateway:v2.0.0" \
  --namespace edutrack \
  --record

# Monitor the rollout
kubectl rollout status deployment/api-gateway -n edutrack

# Rollback if something goes wrong
kubectl rollout undo deployment/api-gateway -n edutrack

# View rollout history
kubectl rollout history deployment/api-gateway -n edutrack
```

### 9.3 Blue-Green Deployment

```bash
# Step 1: Deploy the "green" version alongside "blue" (current)
# Create a green deployment
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway-green
  namespace: edutrack
  labels:
    app: api-gateway
    version: green
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
      version: green
  template:
    metadata:
      labels:
        app: api-gateway
        version: green
    spec:
      containers:
        - name: api-gateway
          image: ${ACR_LOGIN_SERVER}/edutrack/api-gateway:v2.0.0
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: api-gateway-config
            - secretRef:
                name: edutrack-secrets
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
EOF

# Step 2: Wait for green to be ready
kubectl wait --for=condition=available deployment/api-gateway-green -n edutrack --timeout=120s

# Step 3: Switch traffic to green by updating the service selector
kubectl patch service api-gateway -n edutrack -p '{"spec":{"selector":{"version":"green"}}}'

# Step 4: Verify traffic is going to green
kubectl run curl-test --rm -it --image=curlimages/curl --restart=Never -n edutrack -- \
  curl -s http://api-gateway.edutrack.svc.cluster.local:3000/health

# Step 5: If everything is good, remove the blue deployment
kubectl delete deployment api-gateway -n edutrack

# Step 6: Rename green to be the primary
kubectl patch deployment api-gateway-green -n edutrack \
  --type='json' -p='[{"op":"replace","path":"/metadata/name","value":"api-gateway"}]'

# OR: If something went wrong, switch back to blue
# kubectl patch service api-gateway -n edutrack -p '{"spec":{"selector":{"version":"blue"}}}'
# kubectl delete deployment api-gateway-green -n edutrack
```

### 9.4 Cluster Autoscaler (Already Configured)

The cluster autoscaler was configured during AKS creation. To adjust:

```bash
# Update cluster autoscaler settings
az aks update \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_CLUSTER_NAME" \
  --update-cluster-autoscaler \
  --min-count 2 \
  --max-count 15

# Add a dedicated node pool for compute-heavy services (e.g., ai-chat-service)
az aks nodepool add \
  --resource-group "$RESOURCE_GROUP" \
  --cluster-name "$AKS_CLUSTER_NAME" \
  --name "compute" \
  --node-count 1 \
  --min-count 1 \
  --max-count 5 \
  --enable-cluster-autoscaler \
  --node-vm-size "Standard_D8s_v5" \
  --labels workload=compute \
  --node-taints workload=compute:NoSchedule
```

---

## Step 10: Troubleshooting

### 10.1 Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Pods stuck in `ImagePullBackOff` | ACR not attached to AKS, or wrong image name | Run `az aks check-acr`, verify image names with `az acr repository list` |
| Pods in `CrashLoopBackOff` | Application error, missing env vars, DB not reachable | Check logs: `kubectl logs <pod> -n edutrack` |
| Service unreachable | Wrong service selector, network policy blocking | Verify with `kubectl get endpoints -n edutrack` |
| TLS certificate not issued | cert-manager misconfigured, DNS not resolving | Check `kubectl describe certificate -n edutrack`, `kubectl logs -n cert-manager` |
| Database connection refused | Wrong DATABASE_URL, firewall rules, PostgreSQL not ready | Verify secret, test connectivity from pod |
| HPA not scaling | Metrics server not running, resource requests not set | Check `kubectl top pods -n edutrack`, verify HPA with `kubectl describe hpa` |
| Ingress 502/503 errors | Backend pods not ready, health check failing | Check readiness probes, pod logs, service endpoints |

### 10.2 Essential Debugging Commands

```bash
# --- Pod Investigation ---
# List all pods with detailed status
kubectl get pods -n edutrack -o wide

# Describe a specific pod (events, conditions, container status)
kubectl describe pod <pod-name> -n edutrack

# Get pod logs (current container)
kubectl logs <pod-name> -n edutrack

# Get pod logs (previous crashed container)
kubectl logs <pod-name> -n edutrack --previous

# Follow logs in real-time
kubectl logs -f <pod-name> -n edutrack

# Get logs from all pods of a deployment
kubectl logs -l app=api-gateway -n edutrack --all-containers

# --- Interactive Debugging ---
# Open a shell in a running pod
kubectl exec -it <pod-name> -n edutrack -- /bin/sh

# Run a temporary debug pod in the namespace
kubectl run debug --rm -it --image=nicolaka/netshoot --restart=Never -n edutrack -- /bin/bash

# Test DNS resolution from within the cluster
kubectl run dns-test --rm -it --image=busybox --restart=Never -n edutrack -- \
  nslookup auth-service.edutrack.svc.cluster.local

# Test HTTP connectivity to a service
kubectl run curl-test --rm -it --image=curlimages/curl --restart=Never -n edutrack -- \
  curl -sv http://api-gateway.edutrack.svc.cluster.local:3000/health

# --- Resource Investigation ---
# Check events in the namespace (sorted by time)
kubectl get events -n edutrack --sort-by='.lastTimestamp'

# Check resource usage
kubectl top nodes
kubectl top pods -n edutrack

# Check endpoints (verify service has backing pods)
kubectl get endpoints -n edutrack

# --- Deployment Investigation ---
# Check deployment status
kubectl rollout status deployment/<deployment-name> -n edutrack

# View rollout history
kubectl rollout history deployment/<deployment-name> -n edutrack

# Check replica set status
kubectl get rs -n edutrack

# --- Network Investigation ---
# Check ingress status
kubectl get ingress -n edutrack
kubectl describe ingress edutrack-ingress -n edutrack

# Check ingress controller logs
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx

# --- Certificate Investigation ---
kubectl get certificate -n edutrack
kubectl get certificaterequest -n edutrack
kubectl describe certificate edutrack-tls -n edutrack
kubectl logs -l app=cert-manager -n cert-manager

# --- Secret Investigation ---
# List secrets (does NOT show values)
kubectl get secrets -n edutrack

# Decode a specific secret value
kubectl get secret edutrack-secrets -n edutrack -o jsonpath='{.data.JWT_SECRET}' | base64 -d

# --- Node Investigation ---
kubectl get nodes -o wide
kubectl describe node <node-name>
kubectl get events --field-selector involvedObject.kind=Node
```

### 10.3 Log Inspection with Azure Monitor

```bash
# Query logs via Azure CLI (requires Log Analytics workspace)
az monitor log-analytics query \
  --workspace "$LOG_ANALYTICS_ID" \
  --analytics-query "
    ContainerLog
    | where Namespace_s == 'edutrack'
    | where LogEntry contains 'error'
    | project TimeGenerated, ContainerName_s, LogEntry
    | order by TimeGenerated desc
    | take 50
  " \
  --output table

# Query pod restart events
az monitor log-analytics query \
  --workspace "$LOG_ANALYTICS_ID" \
  --analytics-query "
    KubeEvents
    | where Namespace_s == 'edutrack'
    | where Reason_s == 'BackOff' or Reason_s == 'Unhealthy' or Reason_s == 'Failed'
    | project TimeGenerated, Name_s, Reason_s, Message
    | order by TimeGenerated desc
    | take 20
  " \
  --output table
```

### 10.4 Emergency Procedures

```bash
# Emergency rollback of a single service
kubectl rollout undo deployment/api-gateway -n edutrack

# Scale down a misbehaving service to zero
kubectl scale deployment/ai-chat-service --replicas=0 -n edutrack

# Cordon a problematic node (prevents new pod scheduling)
kubectl cordon <node-name>

# Drain a node for maintenance
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Force delete a stuck pod
kubectl delete pod <pod-name> -n edutrack --grace-period=0 --force

# Restart all pods in a deployment (triggers rolling restart)
kubectl rollout restart deployment/<deployment-name> -n edutrack

# Restart ALL EduTrack deployments
kubectl rollout restart deployment -n edutrack
```

---

## Appendix: Quick Reference

### Full Deployment Checklist

- [ ] Azure CLI authenticated and subscription selected
- [ ] Resource group created
- [ ] VNet and subnet created
- [ ] AKS cluster provisioned with autoscaler
- [ ] ACR created and attached to AKS
- [ ] All Docker images built and pushed to ACR
- [ ] Kubernetes namespace `edutrack` created
- [ ] Secrets created (or Key Vault integration configured)
- [ ] PostgreSQL deployed (Azure managed or in-cluster)
- [ ] Redis deployed (Azure managed or in-cluster)
- [ ] Database migrations executed successfully
- [ ] All 9 backend services + frontend deployed
- [ ] All services showing healthy pods
- [ ] NGINX Ingress Controller installed
- [ ] cert-manager installed with Let's Encrypt ClusterIssuer
- [ ] Ingress resource applied with TLS
- [ ] DNS records configured and propagated
- [ ] TLS certificate issued and valid
- [ ] Azure Monitor and Log Analytics configured
- [ ] Alerts configured for critical metrics
- [ ] HPA configured for auto-scaling
- [ ] CI/CD pipeline set up and tested
- [ ] Rollback procedure tested

### Architecture Diagram

```
                    Internet
                       |
                [Azure Load Balancer]
                       |
              [NGINX Ingress Controller]
                    /        \
          /api/*              /*
            |                  |
      [API Gateway:3000]  [Frontend:80]
            |
    +-------+-------+-------+-------+-------+-------+-------+-------+
    |       |       |       |       |       |       |       |       |
  Auth    User   Course  Assign  Meeting Record  AI-Chat  Notif
  :3001   :3002  :3003   :3004   :3005   :3006   :3007    :3008
    |       |       |       |       |       |       |       |
    +-------+-------+-------+-------+-------+-------+-------+
                    |                       |
          [PostgreSQL:5432]          [Redis:6379]
```
