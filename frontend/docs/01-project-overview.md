# 1. Project Overview

## About EduTrack Pro

EduTrack Pro is a production-grade EdTech platform dedicated exclusively to CBSE Class 9 and 10 students, focusing on Mathematics and Science mastery. Branded under **dccloud.in.net** with the tagline *"Smart Learning. Measurable Progress."*

## Key Features

- Role-based access control (Admin, Teacher, Student)
- Live class scheduling with Google Meet integration
- Recorded class library with YouTube video embedding
- AI-powered doubt solving chatbot
- Chapter-wise content for Math, Physics, Chemistry, Biology
- Admin dashboard for user and content management
- Student dashboard with progress tracking
- Teacher dashboard with class and recording management

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | Component-based UI |
| Build Tool | Vite 5 | Fast dev server and production builds |
| Styling | Tailwind CSS 3.4 | Utility-first CSS framework |
| UI Components | shadcn/ui (Radix primitives) | Accessible, customizable components |
| Routing | React Router DOM 6 | Client-side routing with SPA |
| State/Data Fetching | TanStack React Query 5 | Server state management and caching |
| Animations | Framer Motion 12 | Production-grade motion library |
| Database | PostgreSQL (via Supabase) | Relational database with RLS |
| Authentication | Supabase Auth | JWT-based authentication |
| Backend Functions | Supabase Edge Functions (Deno) | Serverless API endpoints |
| AI Integration | dccloud AI Gateway | AI chatbot without separate API key |

## User Roles

| Role | Access Level | Key Capabilities |
|------|-------------|-----------------|
| Admin | Full access | Manage users, assign roles, manage recordings, schedule meetings, view analytics |
| Teacher | Content management | Add/edit recordings, schedule live classes, view student list |
| Student | Learning access | Watch recordings, join live classes, use AI chat, view assignments |

## Project Structure

```
edutrack-pro/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Dashboard layout (sidebar, header)
│   │   ├── student/     # Student dashboard widgets
│   │   ├── teacher/     # Teacher dashboard widgets
│   │   └── ui/          # shadcn/ui base components
│   ├── contexts/        # React context providers (AuthContext)
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Supabase client and types (auto-generated)
│   ├── pages/           # Route-level page components
│   ├── lib/             # Utility functions
│   └── index.css        # Global styles and design tokens
├── supabase/
│   ├── functions/       # Edge Functions (Deno runtime)
│   │   └── admin-users/ # User management API
│   ├── migrations/      # Database migration SQL files
│   └── config.toml      # Supabase project configuration
├── docs/                # Project documentation (this folder)
├── public/              # Static assets (favicon, robots.txt)
├── vite.config.ts       # Vite build configuration
├── tailwind.config.ts   # Tailwind theme configuration
└── index.html           # HTML entry point
```

## Theme & Branding

The platform uses a **Saffron, White, and Red** academic color palette:

- **Primary (Saffron):** Highlights, active tabs, icons, buttons
- **Background (White):** Cards, readability, clean academic feel
- **Accent (Red):** CTA emphasis, notifications, important highlights

---

© 2026 dccloud.in.net — EduTrack Pro
