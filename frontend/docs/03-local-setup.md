# 3. Local Development Setup

## Prerequisites

- **Node.js 18+** (recommended: 20 LTS)
- **npm**, **pnpm**, or **bun** package manager
- **Git**
- A **Supabase project** (cloud or local via Docker)
- Code editor (**VS Code** recommended)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/edutrack-pro.git
cd edutrack-pro
```

## Step 2: Install Dependencies

```bash
npm install
# Or using bun:
bun install
```

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the **Project URL** → `VITE_SUPABASE_URL`
4. Copy the **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
5. The project ID is in the URL: `https://<project-id>.supabase.co`

## Step 4: Set Up Database

Run these SQL commands in your Supabase **SQL Editor** in order:

### a) Create the app_role enum

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');
```

### b) Create the profiles table

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### c) Create the user_roles table

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### d) Create the recordings table

```sql
CREATE TABLE public.recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  teacher text NOT NULL,
  duration text NOT NULL,
  youtube_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
```

### e) Create the meetings table

```sql
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  teacher text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  duration text NOT NULL,
  meet_link text NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  students_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
```

### f) Create the has_role function

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### g) Create the handle_new_user trigger

```sql
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
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### h) Create RLS Policies

See [02-database-backend.md](./02-database-backend.md) for the complete list of RLS policies per table.

## Step 5: Create the First Admin User

In Supabase Dashboard → **Authentication → Users**:

1. Click **"Add User" → "Create new user"**
2. Enter email and password
3. Check **"Auto Confirm User"**
4. In **User Metadata**, add:
   ```json
   {"full_name": "Admin Name", "role": "admin"}
   ```

## Step 6: Deploy Edge Functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-id
supabase functions deploy admin-users
```

## Step 7: Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:8080**

## Step 8: Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready for deployment.

---

© 2026 dccloud.in.net — EduTrack Pro
