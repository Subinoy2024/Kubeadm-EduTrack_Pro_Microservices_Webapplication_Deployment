import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText, Server, Database, Users, Youtube, Video, Mail,
  Shield, Key, Bug, Rocket, Cloud, Terminal, Globe, BookOpen,
} from "lucide-react";

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono my-3 border border-border">
    <code>{children}</code>
  </pre>
);

const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <Card className="mb-6">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-3 text-lg">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="prose prose-sm max-w-none text-foreground">{children}</CardContent>
  </Card>
);

export default function AdminDocs() {
  return (
    <DashboardLayout role="admin" title="Documentation">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Project Documentation 📚</h2>
          <p className="text-muted-foreground">Complete guide for deployment, backend, user management, and integrations</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="database" className="text-xs">Database</TabsTrigger>
            <TabsTrigger value="local" className="text-xs">Local Setup</TabsTrigger>
            <TabsTrigger value="azure" className="text-xs">Azure Deploy</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">User Management</TabsTrigger>
            <TabsTrigger value="youtube" className="text-xs">YouTube</TabsTrigger>
            <TabsTrigger value="meet" className="text-xs">Google Meet</TabsTrigger>
            <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
            <TabsTrigger value="env" className="text-xs">Env Vars</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW ===== */}
          <TabsContent value="overview" className="mt-6">
            <SectionCard icon={FileText} title="1. Project Overview">
              <p>EduTrack Pro is a production-grade EdTech platform dedicated exclusively to CBSE Class 9 and 10 students, focusing on Mathematics and Science mastery. Branded under <strong>dccloud.in.net</strong>.</p>

              <h4 className="font-semibold mt-4 mb-2">Key Features</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Role-based access control (Admin, Teacher, Student)</li>
                <li>Live class scheduling with Google Meet integration</li>
                <li>Recorded class library with YouTube video embedding</li>
                <li>AI-powered doubt solving chatbot</li>
                <li>Chapter-wise content for Math, Physics, Chemistry, Biology</li>
                <li>Admin dashboard for user and content management</li>
                <li>Student dashboard with progress tracking</li>
                <li>Teacher dashboard with class and recording management</li>
              </ul>

              <h4 className="font-semibold mt-4 mb-2">Architecture</h4>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Layer</TableHead><TableHead>Technology</TableHead><TableHead>Purpose</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Frontend</TableCell><TableCell>React 18 + TypeScript + Vite 5</TableCell><TableCell>Component-based SPA</TableCell></TableRow>
                  <TableRow><TableCell>Styling</TableCell><TableCell>Tailwind CSS 3.4 + shadcn/ui</TableCell><TableCell>Utility-first CSS with accessible components</TableCell></TableRow>
                  <TableRow><TableCell>Routing</TableCell><TableCell>React Router DOM 6</TableCell><TableCell>Client-side routing</TableCell></TableRow>
                  <TableRow><TableCell>State</TableCell><TableCell>TanStack React Query 5</TableCell><TableCell>Server state management and caching</TableCell></TableRow>
                  <TableRow><TableCell>Animations</TableCell><TableCell>Framer Motion 12</TableCell><TableCell>Production-grade motion library</TableCell></TableRow>
                  <TableRow><TableCell>Database</TableCell><TableCell>PostgreSQL (via Supabase)</TableCell><TableCell>Relational DB with Row-Level Security</TableCell></TableRow>
                  <TableRow><TableCell>Auth</TableCell><TableCell>Supabase Auth</TableCell><TableCell>JWT-based authentication</TableCell></TableRow>
                  <TableRow><TableCell>Backend</TableCell><TableCell>Supabase Edge Functions (Deno)</TableCell><TableCell>Serverless API endpoints</TableCell></TableRow>
                  <TableRow><TableCell>AI</TableCell><TableCell>dccloud AI Gateway</TableCell><TableCell>AI chatbot (no separate API key)</TableCell></TableRow>
                </TableBody>
              </Table>

              <h4 className="font-semibold mt-4 mb-2">User Roles</h4>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Role</TableHead><TableHead>Access</TableHead><TableHead>Capabilities</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell><Badge variant="destructive">Admin</Badge></TableCell><TableCell>Full access</TableCell><TableCell>Manage users, roles, recordings, meetings, analytics</TableCell></TableRow>
                  <TableRow><TableCell><Badge className="bg-primary/10 text-primary">Teacher</Badge></TableCell><TableCell>Content management</TableCell><TableCell>Add/edit recordings, schedule live classes</TableCell></TableRow>
                  <TableRow><TableCell><Badge className="bg-green-100 text-green-800">Student</Badge></TableCell><TableCell>Learning access</TableCell><TableCell>Watch recordings, join classes, AI chat, assignments</TableCell></TableRow>
                </TableBody>
              </Table>

              <h4 className="font-semibold mt-4 mb-2">Project Structure</h4>
              <CodeBlock>{`edutrack-pro/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Supabase client and types
│   ├── pages/           # Route-level page components
│   ├── lib/             # Utility functions
│   └── index.css        # Global styles and design tokens
├── supabase/
│   ├── functions/       # Edge Functions (Deno)
│   └── config.toml      # Supabase project configuration
├── public/              # Static assets
├── vite.config.ts       # Vite build configuration
└── tailwind.config.ts   # Tailwind theme configuration`}</CodeBlock>
            </SectionCard>
          </TabsContent>

          {/* ===== DATABASE ===== */}
          <TabsContent value="database" className="mt-6">
            <SectionCard icon={Database} title="2. Database Schema & Backend">
              <p>The application uses PostgreSQL via Supabase with Row-Level Security (RLS) enabled on all tables.</p>

              <Accordion type="multiple" className="mt-4">
                <AccordionItem value="profiles">
                  <AccordionTrigger className="font-semibold">profiles table</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Stores user profile information linked to auth.users.</p>
                    <Table>
                      <TableHeader><TableRow><TableHead>Column</TableHead><TableHead>Type</TableHead><TableHead>Default</TableHead></TableRow></TableHeader>
                      <TableBody>
                        <TableRow><TableCell>id</TableCell><TableCell>uuid (PK)</TableCell><TableCell>gen_random_uuid()</TableCell></TableRow>
                        <TableRow><TableCell>user_id</TableCell><TableCell>uuid</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>full_name</TableCell><TableCell>text (nullable)</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>avatar_url</TableCell><TableCell>text (nullable)</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>created_at</TableCell><TableCell>timestamptz</TableCell><TableCell>now()</TableCell></TableRow>
                        <TableRow><TableCell>updated_at</TableCell><TableCell>timestamptz</TableCell><TableCell>now()</TableCell></TableRow>
                      </TableBody>
                    </Table>
                    <p className="mt-2 text-sm text-muted-foreground">RLS: Users can view all profiles, insert/update only their own.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="user_roles">
                  <AccordionTrigger className="font-semibold">user_roles table</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Stores user roles. Enum: admin, teacher, student.</p>
                    <Table>
                      <TableHeader><TableRow><TableHead>Column</TableHead><TableHead>Type</TableHead><TableHead>Default</TableHead></TableRow></TableHeader>
                      <TableBody>
                        <TableRow><TableCell>id</TableCell><TableCell>uuid (PK)</TableCell><TableCell>gen_random_uuid()</TableCell></TableRow>
                        <TableRow><TableCell>user_id</TableCell><TableCell>uuid</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>role</TableCell><TableCell>app_role (enum)</TableCell><TableCell>—</TableCell></TableRow>
                      </TableBody>
                    </Table>
                    <p className="mt-2 text-sm text-muted-foreground">RLS: Admins have full CRUD; users can view their own role.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="recordings">
                  <AccordionTrigger className="font-semibold">recordings table</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Stores class recording metadata with YouTube video IDs.</p>
                    <Table>
                      <TableHeader><TableRow><TableHead>Column</TableHead><TableHead>Type</TableHead><TableHead>Default</TableHead></TableRow></TableHeader>
                      <TableBody>
                        <TableRow><TableCell>id</TableCell><TableCell>uuid (PK)</TableCell><TableCell>gen_random_uuid()</TableCell></TableRow>
                        <TableRow><TableCell>title</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>subject</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>teacher</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>duration</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>youtube_id</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>date</TableCell><TableCell>date</TableCell><TableCell>CURRENT_DATE</TableCell></TableRow>
                        <TableRow><TableCell>created_by</TableCell><TableCell>uuid</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>created_at</TableCell><TableCell>timestamptz</TableCell><TableCell>now()</TableCell></TableRow>
                      </TableBody>
                    </Table>
                    <p className="mt-2 text-sm text-muted-foreground">RLS: Anyone authenticated can view; admins/teachers can insert/update/delete.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="meetings">
                  <AccordionTrigger className="font-semibold">meetings table</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Stores live class/meeting schedule with Google Meet links.</p>
                    <Table>
                      <TableHeader><TableRow><TableHead>Column</TableHead><TableHead>Type</TableHead><TableHead>Default</TableHead></TableRow></TableHeader>
                      <TableBody>
                        <TableRow><TableCell>id</TableCell><TableCell>uuid (PK)</TableCell><TableCell>gen_random_uuid()</TableCell></TableRow>
                        <TableRow><TableCell>title</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>teacher</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>date</TableCell><TableCell>date</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>time</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>duration</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>meet_link</TableCell><TableCell>text</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>status</TableCell><TableCell>text</TableCell><TableCell>'upcoming'</TableCell></TableRow>
                        <TableRow><TableCell>students_count</TableCell><TableCell>integer</TableCell><TableCell>0</TableCell></TableRow>
                        <TableRow><TableCell>created_by</TableCell><TableCell>uuid</TableCell><TableCell>—</TableCell></TableRow>
                        <TableRow><TableCell>created_at</TableCell><TableCell>timestamptz</TableCell><TableCell>now()</TableCell></TableRow>
                      </TableBody>
                    </Table>
                    <p className="mt-2 text-sm text-muted-foreground">RLS: Anyone authenticated can view; admins/teachers can insert/update/delete.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <h4 className="font-semibold mt-6 mb-2">Database Functions</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">has_role(_user_id uuid, _role app_role)</p>
                  <p className="text-sm text-muted-foreground">Security definer function that checks if a user has a specific role. Used in RLS policies to prevent recursive lookups.</p>
                </div>
                <div>
                  <p className="font-medium">handle_new_user()</p>
                  <p className="text-sm text-muted-foreground">Trigger function (on auth.users INSERT) that auto-creates a profile and assigns a role from user metadata.</p>
                </div>
              </div>

              <h4 className="font-semibold mt-6 mb-2">Edge Functions</h4>
              <div>
                <p className="font-medium">admin-users</p>
                <p className="text-sm text-muted-foreground">Serverless function for admin user management — GET (list users), POST (create user), PUT (update role). All operations require admin authentication.</p>
              </div>
            </SectionCard>
          </TabsContent>

          {/* ===== LOCAL SETUP ===== */}
          <TabsContent value="local" className="mt-6">
            <SectionCard icon={Terminal} title="3. Local Development Setup">
              <h4 className="font-semibold mb-2">Prerequisites</h4>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Node.js 18+ (recommended: 20 LTS)</li>
                <li>npm, pnpm, or bun package manager</li>
                <li>Git</li>
                <li>A Supabase project (cloud or local via Docker)</li>
                <li>Code editor (VS Code recommended)</li>
              </ul>

              <Accordion type="multiple">
                <AccordionItem value="step1">
                  <AccordionTrigger>Step 1: Clone the Repository</AccordionTrigger>
                  <AccordionContent>
                    <CodeBlock>{`git clone https://github.com/your-org/edutrack-pro.git
cd edutrack-pro`}</CodeBlock>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step2">
                  <AccordionTrigger>Step 2: Install Dependencies</AccordionTrigger>
                  <AccordionContent>
                    <CodeBlock>{`npm install
# Or using bun:
bun install`}</CodeBlock>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step3">
                  <AccordionTrigger>Step 3: Configure Environment Variables</AccordionTrigger>
                  <AccordionContent>
                    <p>Create a <code>.env</code> file in the project root:</p>
                    <CodeBlock>{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id`}</CodeBlock>
                    <p className="text-sm text-muted-foreground mt-2">Find these in Supabase Dashboard → Settings → API.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step4">
                  <AccordionTrigger>Step 4: Set Up Database</AccordionTrigger>
                  <AccordionContent>
                    <p>Run these SQL commands in your Supabase SQL Editor:</p>
                    <CodeBlock>{`-- 1. Create the app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create recordings table
CREATE TABLE public.recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, subject text NOT NULL,
  teacher text NOT NULL, duration text NOT NULL,
  youtube_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- 5. Create meetings table
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, teacher text NOT NULL,
  date date NOT NULL, time text NOT NULL,
  duration text NOT NULL, meet_link text NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  students_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- 6. Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid, _role app_role
) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7. Create handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::app_role, 'student'));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`}</CodeBlock>
                    <p className="text-sm text-muted-foreground mt-2">Then add RLS policies as described in the Database tab.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step5">
                  <AccordionTrigger>Step 5: Create First Admin User</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to Supabase Dashboard → Authentication → Users</li>
                      <li>Click "Add User" → "Create new user"</li>
                      <li>Enter email and password</li>
                      <li>Check "Auto Confirm User"</li>
                      <li>In User Metadata, add: <code>{`{"full_name": "Admin Name", "role": "admin"}`}</code></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step6">
                  <AccordionTrigger>Step 6: Deploy Edge Functions</AccordionTrigger>
                  <AccordionContent>
                    <CodeBlock>{`npm install -g supabase
supabase login
supabase link --project-ref your-project-id
supabase functions deploy admin-users`}</CodeBlock>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step7">
                  <AccordionTrigger>Step 7: Start Dev Server</AccordionTrigger>
                  <AccordionContent>
                    <CodeBlock>{`npm run dev
# App available at http://localhost:8080`}</CodeBlock>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step8">
                  <AccordionTrigger>Step 8: Build for Production</AccordionTrigger>
                  <AccordionContent>
                    <CodeBlock>{`npm run build
# Output in dist/ folder`}</CodeBlock>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SectionCard>
          </TabsContent>

          {/* ===== AZURE ===== */}
          <TabsContent value="azure" className="mt-6">
            <SectionCard icon={Cloud} title="4. Azure Cloud Deployment">
              <Accordion type="multiple">
                <AccordionItem value="swa">
                  <AccordionTrigger className="font-semibold">Option A: Azure Static Web Apps (Recommended)</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Go to Azure Portal → Create a resource → Static Web App</li>
                      <li>Select subscription and resource group</li>
                      <li>Name: <code>edutrack-pro</code></li>
                      <li>Plan: Free or Standard</li>
                      <li>Region: Central India (or nearest)</li>
                      <li>Source: GitHub → connect your repository</li>
                    </ol>

                    <h5 className="font-medium mt-4 mb-2">Build Settings</h5>
                    <Table>
                      <TableHeader><TableRow><TableHead>Setting</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                      <TableBody>
                        <TableRow><TableCell>App location</TableCell><TableCell>/</TableCell></TableRow>
                        <TableRow><TableCell>Api location</TableCell><TableCell>(leave empty)</TableCell></TableRow>
                        <TableRow><TableCell>Output location</TableCell><TableCell>dist</TableCell></TableRow>
                        <TableRow><TableCell>Build preset</TableCell><TableCell>Vite</TableCell></TableRow>
                      </TableBody>
                    </Table>

                    <h5 className="font-medium mt-4 mb-2">Environment Variables</h5>
                    <p>In Azure Portal → Static Web App → Configuration → Application Settings:</p>
                    <CodeBlock>{`VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = your-anon-key
VITE_SUPABASE_PROJECT_ID = your-project-id`}</CodeBlock>

                    <h5 className="font-medium mt-4 mb-2">SPA Routing</h5>
                    <p>Create <code>staticwebapp.config.json</code> in project root:</p>
                    <CodeBlock>{`{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "*.{css,js,png,jpg,ico,svg}"]
  }
}`}</CodeBlock>

                    <h5 className="font-medium mt-4 mb-2">Custom Domain (Optional)</h5>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to Static Web App → Custom domains</li>
                      <li>Add your domain (e.g., app.dccloud.in.net)</li>
                      <li>Create CNAME record at your DNS provider</li>
                      <li>SSL certificate is provisioned automatically</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="appservice">
                  <AccordionTrigger className="font-semibold">Option B: Azure App Service</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Create Azure App Service (Node.js 20 LTS runtime)</li>
                      <li>Configure deployment from GitHub</li>
                      <li>Set environment variables in Configuration</li>
                      <li>Add startup command: <code>npx serve -s dist -l 8080</code></li>
                      <li>Install serve: <code>npm install serve</code></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="docker">
                  <AccordionTrigger className="font-semibold">Option C: Docker Deployment</AccordionTrigger>
                  <AccordionContent>
                    <p>Create a <code>Dockerfile</code>:</p>
                    <CodeBlock>{`FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80`}</CodeBlock>
                    <p>Create <code>nginx.conf</code> for SPA routing:</p>
                    <CodeBlock>{`server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}`}</CodeBlock>
                    <p className="text-sm text-muted-foreground">Deploy to Azure Container Registry + Container Apps.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SectionCard>
          </TabsContent>

          {/* ===== USER MANAGEMENT ===== */}
          <TabsContent value="users" className="mt-6">
            <SectionCard icon={Users} title="5. User Access Management">
              <p>EduTrack Pro uses a <strong>closed, admin-managed</strong> authentication model. Self-registration and social login are disabled.</p>

              <h4 className="font-semibold mt-4 mb-2">Authentication Model</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Method:</strong> Email + Password via Supabase Auth</li>
                <li><strong>Self-registration:</strong> Disabled (admin-only)</li>
                <li><strong>Social login:</strong> Disabled for security</li>
                <li><strong>Sessions:</strong> JWT-based with automatic refresh</li>
              </ul>

              <h4 className="font-semibold mt-4 mb-2">Creating User Accounts</h4>
              <Accordion type="multiple">
                <AccordionItem value="via-dashboard">
                  <AccordionTrigger>Via Admin Dashboard (Recommended)</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Log in as Admin</li>
                      <li>Navigate to Admin Dashboard → User Management</li>
                      <li>Click "Add User" button</li>
                      <li>Fill in: Full Name, Email, Password, Role</li>
                      <li>Click "Create User"</li>
                    </ol>
                    <p className="mt-2 text-sm text-muted-foreground">The system automatically creates the auth user with confirmed email, a profile entry, and assigns the selected role.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="via-supabase">
                  <AccordionTrigger>Via Supabase Dashboard (Alternative)</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to Supabase Dashboard → Authentication → Users</li>
                      <li>Click "Add User" → "Create new user"</li>
                      <li>Enter email and password, check "Auto Confirm"</li>
                      <li>Add metadata: <code>{`{"full_name": "Name", "role": "student"}`}</code></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <h4 className="font-semibold mt-4 mb-2">Changing User Roles</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Log in as Admin → User Management</li>
                <li>Find the user and use the role dropdown</li>
                <li>Change takes effect on next login</li>
              </ol>

              <h4 className="font-semibold mt-4 mb-2">Route Protection</h4>
              <Table>
                <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Role Required</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow><TableCell>/admin/*</TableCell><TableCell>admin</TableCell><TableCell>Admin dashboard and management</TableCell></TableRow>
                  <TableRow><TableCell>/teacher/*</TableCell><TableCell>teacher</TableCell><TableCell>Teacher dashboard and tools</TableCell></TableRow>
                  <TableRow><TableCell>/student/*</TableCell><TableCell>student</TableCell><TableCell>Student dashboard and learning</TableCell></TableRow>
                  <TableRow><TableCell>/settings</TableCell><TableCell>any authenticated</TableCell><TableCell>User settings</TableCell></TableRow>
                </TableBody>
              </Table>
            </SectionCard>
          </TabsContent>

          {/* ===== YOUTUBE ===== */}
          <TabsContent value="youtube" className="mt-6">
            <SectionCard icon={Youtube} title="6. YouTube Integration">
              <p>EduTrack Pro uses YouTube for hosting recorded class videos. The integration is <strong>link-based</strong> — no YouTube API key is needed.</p>

              <h4 className="font-semibold mt-4 mb-2">How It Works</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Teachers/Admins upload class recordings to YouTube</li>
                <li>The YouTube video ID is stored in the <code>recordings</code> table</li>
                <li>Students see an embedded YouTube player on the recordings page</li>
                <li>Embedding URL: <code>https://www.youtube.com/embed/{'{youtube_id}'}</code></li>
              </ul>

              <Accordion type="multiple" className="mt-4">
                <AccordionItem value="channel">
                  <AccordionTrigger>Step 1: Create a YouTube Channel</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to youtube.com and sign in with Google</li>
                      <li>Click profile icon → "Create a channel"</li>
                      <li>Set channel name (e.g., "EduTrack Pro - dccloud.in.net")</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="upload">
                  <AccordionTrigger>Step 2: Upload a Class Recording</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Click Create (+) → Upload video</li>
                      <li>Select your recorded class video</li>
                      <li>Set title (e.g., "Class 10 - Quadratic Equations")</li>
                      <li>Set visibility to <strong>Unlisted</strong> (recommended)</li>
                      <li>Click Publish</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="videoid">
                  <AccordionTrigger>Step 3: Get the Video ID</AccordionTrigger>
                  <AccordionContent>
                    <p>Extract the ID from the YouTube URL:</p>
                    <CodeBlock>{`URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Video ID: dQw4w9WgXcQ

URL: https://youtu.be/dQw4w9WgXcQ
Video ID: dQw4w9WgXcQ`}</CodeBlock>
                    <p className="text-sm text-muted-foreground">Paste only the Video ID (not the full URL) when adding a recording.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="add">
                  <AccordionTrigger>Step 4: Add Recording in EduTrack Pro</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Log in as Admin or Teacher</li>
                      <li>Go to Recordings management page</li>
                      <li>Click "Add Recording"</li>
                      <li>Fill in: Title, Subject, Teacher, Duration</li>
                      <li>Paste the YouTube Video ID</li>
                      <li>Click Save</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <h4 className="font-semibold mt-4 mb-2">Privacy Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use "Unlisted" visibility — accessible only via the app</li>
                <li>Enable "Made for Kids" if applicable</li>
                <li>Disable comments on educational videos</li>
                <li>Organize into playlists by subject and chapter</li>
              </ul>
            </SectionCard>
          </TabsContent>

          {/* ===== GOOGLE MEET ===== */}
          <TabsContent value="meet" className="mt-6">
            <SectionCard icon={Video} title="7. Google Meet Integration">
              <p>EduTrack Pro uses Google Meet for live classes. The integration is <strong>link-based</strong> — no Google API credentials required.</p>

              <h4 className="font-semibold mt-4 mb-2">How It Works</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Teachers create Google Meet links externally</li>
                <li>The Meet link is stored in the <code>meetings</code> table with schedule</li>
                <li>Students see upcoming meetings and join via the link</li>
                <li>Meeting opens in a new browser tab</li>
              </ul>

              <Accordion type="multiple" className="mt-4">
                <AccordionItem value="workspace">
                  <AccordionTrigger>Google Workspace Setup (Recommended)</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Sign up at workspace.google.com</li>
                      <li>Use your domain (dccloud.in.net) for professional email</li>
                      <li>Google Workspace includes Meet with longer durations</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">Free alternative: Gmail account (60-min limit for groups).</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="create-link">
                  <AccordionTrigger>Creating a Meeting Link</AccordionTrigger>
                  <AccordionContent>
                    <p className="font-medium">Option A: From Google Calendar</p>
                    <ol className="list-decimal pl-5 space-y-1 mb-3">
                      <li>Create an event → "Add Google Meet video conferencing"</li>
                      <li>Copy the link (e.g., https://meet.google.com/abc-defg-hij)</li>
                    </ol>
                    <p className="font-medium">Option B: From meet.google.com</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Click "New meeting" → "Create a meeting for later"</li>
                      <li>Copy the meeting link</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="schedule">
                  <AccordionTrigger>Schedule in EduTrack Pro</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Log in as Admin or Teacher</li>
                      <li>Go to Meetings management page</li>
                      <li>Click "Schedule Meeting"</li>
                      <li>Fill in: Title, Teacher, Date, Time, Duration, Students</li>
                      <li>Paste the Google Meet link</li>
                      <li>Set status: upcoming / live / completed</li>
                      <li>Click Save</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <h4 className="font-semibold mt-4 mb-2">Managing Live Sessions</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Set status to <strong>"live"</strong> when class starts — students see a "Live Now" banner</li>
                <li>Set status to <strong>"completed"</strong> after class ends</li>
                <li>Enable waiting room in Meet settings for security</li>
                <li>Record on Google Meet, then upload to YouTube later</li>
              </ul>
            </SectionCard>
          </TabsContent>

          {/* ===== EMAIL ===== */}
          <TabsContent value="email" className="mt-6">
            <SectionCard icon={Mail} title="8. Gmail / Email Integration">
              <p>Currently, the app uses admin-managed accounts — email verification is not sent. You can configure email for password reset and notifications.</p>

              <h4 className="font-semibold mt-4 mb-2">Current Configuration</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Auth emails: Disabled (admin auto-confirms accounts)</li>
                <li>Notifications: Not yet implemented</li>
                <li>Password reset: Manual via admin</li>
              </ul>

              <Accordion type="multiple" className="mt-4">
                <AccordionItem value="builtin">
                  <AccordionTrigger>Option A: Supabase Built-in SMTP (Default)</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>3 emails/hour on free plan</li>
                      <li>Good for development and small user bases</li>
                      <li>No configuration needed — works out of the box</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="gmail">
                  <AccordionTrigger>Option B: Custom SMTP with Gmail</AccordionTrigger>
                  <AccordionContent>
                    <p className="font-medium">Step 1: Create Gmail App Password</p>
                    <ol className="list-decimal pl-5 space-y-1 mb-3">
                      <li>Go to myaccount.google.com/security</li>
                      <li>Enable 2-Step Verification</li>
                      <li>Go to App Passwords → select "Mail"</li>
                      <li>Generate and copy the 16-character password</li>
                    </ol>
                    <p className="font-medium">Step 2: Configure in Supabase</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Supabase Dashboard → Project Settings → Auth → SMTP</li>
                      <li>Enable Custom SMTP</li>
                    </ol>
                    <Table>
                      <TableHeader><TableRow><TableHead>Setting</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                      <TableBody>
                        <TableRow><TableCell>Host</TableCell><TableCell>smtp.gmail.com</TableCell></TableRow>
                        <TableRow><TableCell>Port</TableCell><TableCell>587</TableCell></TableRow>
                        <TableRow><TableCell>Username</TableCell><TableCell>your-email@gmail.com</TableCell></TableRow>
                        <TableRow><TableCell>Password</TableCell><TableCell>16-char app password</TableCell></TableRow>
                        <TableRow><TableCell>Sender email</TableCell><TableCell>noreply@dccloud.in.net</TableCell></TableRow>
                        <TableRow><TableCell>Sender name</TableCell><TableCell>EduTrack Pro</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <h4 className="font-semibold mt-4 mb-2">Future Email Features</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Password reset emails</li>
                <li>Welcome email on account creation</li>
                <li>Assignment notifications</li>
                <li>Weekly progress reports to parents</li>
                <li>Live class reminders</li>
              </ul>
            </SectionCard>
          </TabsContent>

          {/* ===== ENV VARS ===== */}
          <TabsContent value="env" className="mt-6">
            <SectionCard icon={Key} title="9. Environment Variables Reference">
              <h4 className="font-semibold mb-2">Frontend Variables (VITE_ prefix)</h4>
              <Table>
                <TableHeader><TableRow><TableHead>Variable</TableHead><TableHead>Description</TableHead><TableHead>Where to Find</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow><TableCell><code>VITE_SUPABASE_URL</code></TableCell><TableCell>Supabase project API URL</TableCell><TableCell>Supabase → Settings → API</TableCell></TableRow>
                  <TableRow><TableCell><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></TableCell><TableCell>Supabase anon/public key</TableCell><TableCell>Supabase → Settings → API</TableCell></TableRow>
                  <TableRow><TableCell><code>VITE_SUPABASE_PROJECT_ID</code></TableCell><TableCell>Project reference ID</TableCell><TableCell>From URL: https://&lt;id&gt;.supabase.co</TableCell></TableRow>
                </TableBody>
              </Table>

              <h4 className="font-semibold mt-6 mb-2">Edge Function Secrets (Server-side)</h4>
              <Table>
                <TableHeader><TableRow><TableHead>Secret</TableHead><TableHead>Description</TableHead><TableHead>Auto-set</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow><TableCell><code>SUPABASE_URL</code></TableCell><TableCell>Internal Supabase URL</TableCell><TableCell>Yes</TableCell></TableRow>
                  <TableRow><TableCell><code>SUPABASE_ANON_KEY</code></TableCell><TableCell>Anon key for functions</TableCell><TableCell>Yes</TableCell></TableRow>
                  <TableRow><TableCell><code>SUPABASE_SERVICE_ROLE_KEY</code></TableCell><TableCell>Full admin access key</TableCell><TableCell>Yes</TableCell></TableRow>
                  <TableRow><TableCell><code>SUPABASE_DB_URL</code></TableCell><TableCell>Direct database URL</TableCell><TableCell>Yes</TableCell></TableRow>
                  <TableRow><TableCell><code>LOVABLE_API_KEY</code></TableCell><TableCell>dccloud AI Gateway key</TableCell><TableCell>Yes (Cloud only)</TableCell></TableRow>
                </TableBody>
              </Table>

              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive">⚠️ SUPABASE_SERVICE_ROLE_KEY has full admin access. Never expose it in frontend code. Use only in Edge Functions.</p>
              </div>
            </SectionCard>
          </TabsContent>

          {/* ===== SECURITY ===== */}
          <TabsContent value="security" className="mt-6">
            <SectionCard icon={Shield} title="10. Security Best Practices">
              <ul className="list-disc pl-5 space-y-2">
                <li>Never expose <code>SUPABASE_SERVICE_ROLE_KEY</code> in frontend code</li>
                <li>Always use Row-Level Security (RLS) on all tables</li>
                <li>Validate admin role <strong>server-side</strong> in Edge Functions, never client-side</li>
                <li>Use HTTPS for all connections</li>
                <li>Set strong passwords for all user accounts</li>
                <li>Keep YouTube videos as "Unlisted" for privacy</li>
                <li>Enable Google Meet waiting rooms for live classes</li>
                <li>Regularly review user access and remove inactive accounts</li>
                <li>Keep dependencies updated for security patches</li>
                <li>Use environment variables for all sensitive configuration</li>
                <li>Implement rate limiting on Edge Functions for production</li>
                <li>Monitor logs for suspicious activity</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Troubleshooting</h4>
              <Accordion type="multiple">
                <AccordionItem value="t1">
                  <AccordionTrigger>Login fails with "Invalid credentials"</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Ensure user was created with "Auto Confirm" enabled</li>
                      <li>Verify email and password are correct</li>
                      <li>Check user exists in Authentication → Users</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t2">
                  <AccordionTrigger>YouTube video not showing</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Verify the YouTube video ID (not the full URL)</li>
                      <li>Check video is not set to "Private"</li>
                      <li>Ensure embedding is not restricted in YouTube Studio</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t3">
                  <AccordionTrigger>Edge Function returns 401/403</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Verify user is logged in with admin role</li>
                      <li>Check Edge Function is deployed</li>
                      <li>Verify SERVICE_ROLE_KEY is set correctly</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t4">
                  <AccordionTrigger>Build fails on Azure</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Ensure all VITE_ env vars are set in Azure config</li>
                      <li>Verify Node.js version is 18+</li>
                      <li>Check GitHub Actions logs for errors</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
