# 7. Google Meet Integration

EduTrack Pro uses Google Meet for live class sessions. The integration is **link-based** — no Google API credentials are required.

## How It Works

1. Teachers create Google Meet links **externally** (via Calendar or meet.google.com)
2. The Meet link is stored in the `meetings` table with schedule details
3. Students see upcoming meetings and can **join via the stored link**
4. The meeting opens in a **new browser tab**

## Setting Up Google Meet

### Google Workspace (Recommended)

For a professional setup with longer meeting durations:

1. Sign up at [workspace.google.com](https://workspace.google.com)
2. Use your domain (`dccloud.in.net`) for professional email
3. Google Workspace includes Google Meet with extended durations and admin controls

> **Free alternative:** Use a personal Gmail account (meetings limited to 60 minutes for groups of 3+).

## Creating a Meeting Link

### Option A: From Google Calendar

1. Go to [Google Calendar](https://calendar.google.com)
2. Create a new event for the class
3. Click **"Add Google Meet video conferencing"**
4. Copy the meeting link (e.g., `https://meet.google.com/abc-defg-hij`)

### Option B: From Google Meet directly

1. Go to [meet.google.com](https://meet.google.com)
2. Click **"New meeting" → "Create a meeting for later"**
3. Copy the meeting link

## Scheduling a Meeting in EduTrack Pro

1. Log in as **Admin** or **Teacher**
2. Go to **Meetings** management page
3. Click **"Schedule Meeting"**
4. Fill in:
   - **Title** — e.g., "Class 10 Physics - Light & Reflection"
   - **Teacher** — teacher name
   - **Date** — class date
   - **Time** — class start time
   - **Duration** — e.g., "1 hour"
   - **Expected Students** — approximate count
   - **Google Meet Link** — paste the full Meet URL
   - **Status** — `upcoming`, `live`, or `completed`
5. Click **Save**

## Managing Live Sessions

| Action | How |
|--------|-----|
| Class starting | Set meeting status to **"live"** — students see a "Live Now" banner |
| Student joins | Clicking "Join Now" opens Google Meet in a new tab |
| Class ended | Set meeting status to **"completed"** |
| Record for later | Record on Google Meet, then upload to YouTube |

## Best Practices

- Create **recurring meeting links** for regular weekly classes
- Share the meeting link **only through the app** (not publicly)
- Enable **waiting room** in Google Meet settings for security
- **Record** the session on Google Meet and upload to YouTube later for the recordings library
- Use Google Calendar to send automatic reminders to teachers

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Meet link not working | Verify full URL format: `https://meet.google.com/xxx-xxxx-xxx` |
| Meeting expired | Check the meeting hasn't been deleted from Google Calendar |
| Students can't join | Ensure students have Google accounts; check waiting room settings |

---

© 2026 dccloud.in.net — EduTrack Pro
