# 10. Security Best Practices & Troubleshooting

## Security Checklist

- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- [ ] Always use Row-Level Security (RLS) on all database tables
- [ ] Validate admin role **server-side** in Edge Functions, never client-side
- [ ] Use HTTPS for all connections
- [ ] Set strong passwords for all user accounts (min 8 characters)
- [ ] Keep YouTube videos as **"Unlisted"** for privacy
- [ ] Enable **Google Meet waiting rooms** for live classes
- [ ] Regularly review user access and remove inactive accounts
- [ ] Keep npm dependencies updated for security patches
- [ ] Use environment variables for all sensitive configuration
- [ ] Implement rate limiting on Edge Functions for production
- [ ] Monitor Supabase logs for suspicious activity
- [ ] Disable self-registration — admin-only account creation
- [ ] Never store roles on the profile table — use separate `user_roles` table
- [ ] Never check admin status using `localStorage` or hardcoded credentials

## Troubleshooting

### Login fails with "Invalid credentials"

- Ensure the user was created with **"Auto Confirm"** enabled
- Verify email and password are correct
- Check if user exists in Supabase Dashboard → Authentication → Users
- Clear browser cache and try again

### User gets 404 on dashboard routes

- Verify user has a **role assigned** in the `user_roles` table
- Check that `ProtectedRoute` component matches the expected role
- Verify the route exists in `App.tsx`
- Clear browser cache and re-login

### Recordings don't show YouTube video

- Verify the YouTube **video ID** is correct (not the full URL)
- Check that the video is not set to **"Private"** on YouTube
- Ensure embed is not restricted in YouTube Studio → Video details → Embedding

### Google Meet link doesn't work

- Verify the full meet link format: `https://meet.google.com/xxx-xxxx-xxx`
- Check that the meeting has not been deleted from Google Calendar
- Ensure students have Google accounts to join

### Edge Function returns 401 or 403

- Verify the user is logged in and has **admin role**
- Check that the Edge Function is **deployed** (`supabase functions deploy`)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check Edge Function logs in Supabase Dashboard

### Build fails on Azure

- Ensure all `VITE_` environment variables are set in Azure configuration
- Verify Node.js version is **18+**
- Check GitHub Actions logs for specific error messages
- Ensure `staticwebapp.config.json` is present for SPA routing

### Profile/Settings page not saving

- Verify the user is authenticated (check browser dev tools → Network)
- Check RLS policies allow the user to update their own profile
- Look for errors in browser console

### Password change fails

- Password must be at least 6 characters
- Both password fields must match
- User must be authenticated (session not expired)

---

© 2026 dccloud.in.net — EduTrack Pro
