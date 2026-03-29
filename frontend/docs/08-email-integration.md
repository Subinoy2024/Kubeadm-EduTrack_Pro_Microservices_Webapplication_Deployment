# 8. Email / Gmail Integration

The application currently uses admin-managed accounts, so email verification is not sent by default. Email can be configured for password reset and future notification features.

## Current Email Configuration

| Feature | Status |
|---------|--------|
| Authentication emails | Disabled (admin auto-confirms accounts) |
| Notification emails | Not yet implemented |
| Password reset emails | Not yet configured |

## Option A: Supabase Built-in SMTP (Default)

Supabase provides a built-in email service:

- **3 emails per hour** on free plan
- Suitable for development and small user bases
- **No configuration needed** — works out of the box
- Sender: `noreply@mail.app.supabase.io`

## Option B: Custom SMTP with Gmail

For higher volume and branded emails (`noreply@dccloud.in.net`):

### Step 1: Create a Gmail App Password

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords**
4. Select **"Mail"** and your device
5. Click **Generate**
6. Copy the **16-character app password**

### Step 2: Configure in Supabase

1. Go to Supabase Dashboard → **Authentication → Email Templates**
2. Go to Supabase Dashboard → **Project Settings → Auth → SMTP Settings**
3. Enable **Custom SMTP**
4. Enter the following:

| Setting | Value |
|---------|-------|
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `your-email@gmail.com` (or `your-email@dccloud.in.net`) |
| Password | The 16-character app password from Step 1 |
| Sender email | `noreply@dccloud.in.net` |
| Sender name | `EduTrack Pro` |

### Step 3: Test

Trigger a password reset email from the app's Settings page to verify delivery.

## Option C: Google Workspace SMTP

If using Google Workspace with `dccloud.in.net`:

| Setting | Value |
|---------|-------|
| Host | `smtp-relay.gmail.com` |
| Port | `587` |
| Username | `noreply@dccloud.in.net` |
| Password | App password or OAuth2 |

## Future Email Features (Planned)

- Password reset emails
- Welcome email on account creation
- Assignment notification emails
- Weekly progress report emails to parents
- Live class reminder emails (30 min before)
- Monthly performance summary for parents

---

© 2026 dccloud.in.net — EduTrack Pro
