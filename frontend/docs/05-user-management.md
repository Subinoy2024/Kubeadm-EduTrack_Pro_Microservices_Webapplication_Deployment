# 5. User Access Management

EduTrack Pro uses a **closed, admin-managed** authentication model. Self-registration and social login are disabled to ensure strictly controlled access.

## Authentication Model

| Feature | Configuration |
|---------|--------------|
| Method | Email + Password via Supabase Auth |
| Self-registration | **Disabled** (admin-only account creation) |
| Social login | **Disabled** for security |
| Session management | JWT-based with automatic token refresh |
| Email confirmation | Auto-confirmed by admin at creation |

## Creating User Accounts

### Via Admin Dashboard (Recommended)

1. Log in as **Admin**
2. Navigate to **Admin Dashboard → User Management**
3. Click **"Add User"** button
4. Fill in:
   - **Full Name** — student or teacher name
   - **Email** — login email address
   - **Password** — initial password
   - **Role** — Student, Teacher, or Admin
5. Click **"Create User"**

The system automatically:
- Creates the auth user with confirmed email
- Creates a profile entry with the full name
- Assigns the selected role in the `user_roles` table

### Via Supabase Dashboard (Alternative)

1. Go to Supabase Dashboard → **Authentication → Users**
2. Click **"Add User" → "Create new user"**
3. Enter email and password
4. Check **"Auto Confirm User"**
5. In **User Metadata**, add:
   ```json
   {"full_name": "Student Name", "role": "student"}
   ```

## Changing User Roles

1. Log in as Admin → **User Management**
2. Find the user in the list
3. Use the **role dropdown** to change their role
4. The change takes effect on their **next login**

## Route Protection

The application uses a `ProtectedRoute` component that:
- Checks if user is authenticated
- Verifies the user has the required role
- Redirects to login if not authenticated
- Redirects to appropriate dashboard if role mismatch

| Route Pattern | Required Role | Description |
|--------------|---------------|-------------|
| `/admin/*` | admin | Admin dashboard and management |
| `/teacher/*` | teacher | Teacher dashboard and tools |
| `/student/*` | student | Student dashboard and learning |
| `/settings` | any authenticated | User settings |

## Password Management

### User Self-Service (Settings Page)

Users can change their own password:
1. Go to **Settings → Change Password**
2. Enter new password (min 6 characters)
3. Confirm new password
4. Click **"Update Password"**

### Admin Password Reset

For locked-out users, admins can reset passwords via:
1. Supabase Dashboard → Authentication → Users
2. Click on the user → **Reset password**
3. Or create a temporary Edge Function for bulk resets

## Security Notes

- Roles are stored in a **separate `user_roles` table** (not on the profile)
- Role checks use the **`has_role()` security definer function** to prevent RLS recursion
- Admin operations are **validated server-side** in Edge Functions
- Never check admin status using client-side storage

---

© 2026 dccloud.in.net — EduTrack Pro
