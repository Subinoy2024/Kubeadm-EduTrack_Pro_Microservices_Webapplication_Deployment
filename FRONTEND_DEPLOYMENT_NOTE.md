# Frontend Deployment Note

This package includes the current frontend codebase as uploaded.

## Current status

The frontend can be installed, built, and served as a UI application, but core auth and several data pages still rely on Supabase in the current codebase.

That means:
- backend kubeadm deployment is validated
- frontend source is included and ready for the next phase
- full frontend login against the kubeadm backend is **not** fully migrated in this package

## What is already present

- `frontend/src/lib/api.ts` contains backend API client work
- the backend kubeadm deployment is healthy and can serve as the target backend
- frontend pages and layout can be run locally with Vite

## Current frontend data/auth source

The current frontend still uses Supabase in important places such as:
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- some meetings / recordings / admin pages

## Local frontend run

From the `frontend/` folder:

```bash
npm install
npm run dev
```

To build a production bundle:

```bash
npm install
npm run build
npm run preview
```

## Recommended next migration order

1. Replace frontend login to use backend `/auth/login`
2. Replace `AuthContext` to use backend token + `/auth/me`
3. Migrate showcase pages first:
   - courses
   - meetings
   - recordings
4. Keep non-critical pages on Supabase temporarily if needed for demo

## Honest MVP statement

This zip is suitable as the current handoff baseline for frontend continuation. It packages the current frontend code together with the working backend-oriented repository state, but it does **not** claim that frontend auth/data migration away from Supabase is already complete.
