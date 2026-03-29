# 4. Azure Cloud Deployment

EduTrack Pro can be deployed to Azure using **Azure Static Web Apps** (recommended), **Azure App Service**, or **Docker containers**.

## Option A: Azure Static Web Apps (Recommended)

### Step 1: Prerequisites

- Azure account with active subscription
- Azure CLI installed (`az --version`)
- GitHub repository with the project code

### Step 2: Create Azure Static Web App

1. Go to **Azure Portal → Create a resource → Static Web App**
2. Select your subscription and resource group
3. **Name:** `edutrack-pro`
4. **Plan:** Free or Standard
5. **Region:** Select nearest to your users (e.g., Central India)
6. **Source:** GitHub — connect your repository

### Step 3: Configure Build Settings

| Setting | Value |
|---------|-------|
| App location | `/` |
| Api location | *(leave empty)* |
| Output location | `dist` |
| Build preset | Vite |

### Step 4: Configure Environment Variables

In Azure Portal → Static Web App → **Configuration → Application Settings**, add:

```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = your-anon-key
VITE_SUPABASE_PROJECT_ID = your-project-id
```

### Step 5: Configure SPA Routing

Create `staticwebapp.config.json` in the project root:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "*.{css,js,png,jpg,ico,svg}"]
  }
}
```

### Step 6: Deploy

Push to your GitHub `main` branch. Azure Static Web Apps will automatically build and deploy via GitHub Actions.

### Step 7: Custom Domain (Optional)

1. Go to Static Web App → **Custom domains**
2. Add your domain (e.g., `app.dccloud.in.net`)
3. Create **CNAME record** at your DNS provider pointing to the Azure URL
4. Azure will automatically provision an **SSL certificate**

---

## Option B: Azure App Service

For more control over the server environment:

1. Create an **Azure App Service** (Node.js 20 LTS runtime)
2. Configure deployment from GitHub
3. Set environment variables in **App Service → Configuration**
4. Add startup command: `npx serve -s dist -l 8080`
5. Install serve: `npm install serve`

---

## Option C: Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### nginx.conf (SPA routing)

```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

### Deploy

Build and push to **Azure Container Registry**, then deploy to **Azure Container Apps** or **Azure App Service (Container)**.

```bash
# Build
docker build -t edutrack-pro .

# Tag for ACR
docker tag edutrack-pro your-acr.azurecr.io/edutrack-pro:latest

# Push
docker push your-acr.azurecr.io/edutrack-pro:latest
```

---

© 2026 dccloud.in.net — EduTrack Pro
