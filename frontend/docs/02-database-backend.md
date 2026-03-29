# 2. Database Schema & Backend

The application uses PostgreSQL via Supabase with Row-Level Security (RLS) enabled on all tables.

## Tables

### profiles

Stores user profile information linked to `auth.users`.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | gen_random_uuid() |
| user_id | uuid | No | — |
| full_name | text | Yes | — |
| avatar_url | text | Yes | — |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |

**RLS Policies:**
- Users can view all profiles (SELECT)
- Users can insert/update only their own profile

### user_roles

Stores user roles. Enum values: `admin`, `teacher`, `student`.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | gen_random_uuid() |
| user_id | uuid | No | — |
| role | app_role (enum) | No | — |

**Unique constraint:** `(user_id, role)`

**RLS Policies:**
- Admins have full CRUD access
- Users can view their own role only

### recordings

Stores class recording metadata with YouTube video IDs.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | gen_random_uuid() |
| title | text | No | — |
| subject | text | No | — |
| teacher | text | No | — |
| duration | text | No | — |
| youtube_id | text | No | — |
| date | date | No | CURRENT_DATE |
| created_by | uuid | No | — |
| created_at | timestamptz | No | now() |

**RLS Policies:**
- Anyone authenticated can view (SELECT)
- Admins and teachers can insert/update/delete

### meetings

Stores live class/meeting schedule with Google Meet links.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid (PK) | No | gen_random_uuid() |
| title | text | No | — |
| teacher | text | No | — |
| date | date | No | — |
| time | text | No | — |
| duration | text | No | — |
| meet_link | text | No | — |
| status | text | No | 'upcoming' |
| students_count | integer | No | 0 |
| created_by | uuid | No | — |
| created_at | timestamptz | No | now() |

**RLS Policies:**
- Anyone authenticated can view (SELECT)
- Admins and teachers can insert/update/delete

## Database Functions

### has_role(_user_id uuid, _role app_role) → boolean

Security definer function that checks if a user has a specific role. Used in RLS policies to prevent recursive lookups.

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

### handle_new_user() → trigger

Trigger function fired on `auth.users` INSERT. Automatically creates a profile row and assigns a role from user metadata.

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
```

### update_updated_at_column() → trigger

Updates the `updated_at` timestamp on row modification.

## Edge Functions

### admin-users

Serverless function for admin user management. Located at `supabase/functions/admin-users/index.ts`.

**Endpoints:**
- **GET** — List all users with profiles, roles, and auth data
- **POST** — Create new user with email, password, name, and role
- **PUT** — Update a user's role

**Security:** All operations require admin authentication, verified via `has_role()` function.

**How it works:**
1. Receives request with Authorization header (JWT token)
2. Validates the caller is an admin using `has_role()`
3. Uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations
4. Returns JSON response

---

© 2026 dccloud.in.net — EduTrack Pro
