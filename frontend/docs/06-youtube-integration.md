# 6. YouTube Integration

EduTrack Pro uses YouTube for hosting recorded class videos. The integration is **link-based** and does **not** require a YouTube API key.

## How It Works

1. Teachers/Admins upload class recordings to YouTube
2. The YouTube **video ID** is stored in the `recordings` table
3. Students see an embedded YouTube player on the recordings page
4. Embedding URL: `https://www.youtube.com/embed/{youtube_id}`

## Step 1: Create a YouTube Channel

1. Go to [youtube.com](https://www.youtube.com) and sign in with a Google account
2. Click your profile icon → **"Create a channel"**
3. Set the channel name (e.g., **"EduTrack Pro - dccloud.in.net"**)

## Step 2: Upload a Class Recording

1. Click the **Create (+)** button → **Upload video**
2. Select your recorded class video file
3. Set title (e.g., *"Class 10 - Quadratic Equations - Chapter 4"*)
4. Set visibility to **"Unlisted"** (recommended for privacy)
5. Click **Publish**

## Step 3: Get the Video ID

From the YouTube URL, extract the video ID:

```
URL:      https://www.youtube.com/watch?v=dQw4w9WgXcQ
Video ID: dQw4w9WgXcQ

URL:      https://youtu.be/dQw4w9WgXcQ
Video ID: dQw4w9WgXcQ
```

> **Important:** Paste only the Video ID (e.g., `dQw4w9WgXcQ`), NOT the full URL.

## Step 4: Add Recording in EduTrack Pro

1. Log in as **Admin** or **Teacher**
2. Go to **Recordings** management page
3. Click **"Add Recording"**
4. Fill in:
   - **Title** — e.g., "Quadratic Equations - Part 1"
   - **Subject** — e.g., "Mathematics"
   - **Teacher** — teacher name
   - **Duration** — e.g., "45 mins"
   - **YouTube Video ID** — paste the ID (not full URL)
5. Click **Save**

## Video Privacy Recommendations

- Use **"Unlisted"** visibility — videos are accessible only via the app's embed
- Enable **"Made for Kids"** if applicable for COPPA compliance
- **Disable comments** on educational videos to avoid distractions
- Organize videos into **playlists** by subject and chapter

## Embedding Mechanism

The app uses a standard YouTube iframe embed:

```html
<iframe
  src="https://www.youtube.com/embed/{youtube_id}"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

No API key is required for embedding. This respects YouTube's Terms of Service.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Video not showing | Verify the video ID is correct (not full URL) |
| "Video unavailable" error | Check video is not set to "Private" on YouTube |
| Embed blocked | Ensure embedding is not restricted in YouTube Studio → Video details |

---

© 2026 dccloud.in.net — EduTrack Pro
