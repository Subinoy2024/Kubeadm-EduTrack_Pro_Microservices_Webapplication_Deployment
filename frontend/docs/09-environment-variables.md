# 9. Environment Variables Reference

## Frontend Variables (VITE_ prefix)

These are embedded at **build time** and are safe to expose in the browser.

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project API URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project reference ID | From URL: `https://<id>.supabase.co` |

## Edge Function Secrets (Server-side)

These are available **only in Edge Functions** and must never be exposed in frontend code.

| Secret | Description | Auto-configured |
|--------|-------------|-----------------|
| `SUPABASE_URL` | Internal Supabase URL for Edge Functions | Yes |
| `SUPABASE_ANON_KEY` | Anon key for Edge Functions | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (**full admin access**) | Yes |
| `SUPABASE_DB_URL` | Direct database connection URL | Yes |
| `LOVABLE_API_KEY` | dccloud AI Gateway API key | Yes (Cloud only) |

> ⚠️ **WARNING:** `SUPABASE_SERVICE_ROLE_KEY` has full admin access and bypasses all RLS policies. **Never expose it in frontend code.** It should only be used in Edge Functions.

## Setting Environment Variables

### Local Development

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Azure Static Web Apps

Azure Portal → Static Web App → **Configuration → Application Settings**

### Azure App Service

Azure Portal → App Service → **Configuration → Application Settings**

### Vercel

Vercel Dashboard → Project Settings → **Environment Variables**

### Netlify

Netlify Dashboard → Site Settings → **Build & deploy → Environment**

---

© 2026 dccloud.in.net — EduTrack Pro
