// ─── Base Layout ────────────────────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduTrack Pro</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7fa;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.85);
      margin: 8px 0 0;
      font-size: 14px;
    }
    .content {
      padding: 32px 24px;
    }
    .content h2 {
      color: #1e293b;
      font-size: 20px;
      margin: 0 0 16px;
    }
    .content p {
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 16px;
    }
    .info-box {
      background-color: #f0f7ff;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
    }
    .info-box p {
      margin: 4px 0;
      color: #1e40af;
      font-size: 14px;
    }
    .info-box strong {
      color: #1e293b;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #ffffff;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      margin: 16px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      color: #94a3b8;
      font-size: 12px;
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="container">
      <div class="header">
        <h1>EduTrack Pro</h1>
        <p>Your Learning Management Platform</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} EduTrack Pro. All rights reserved.</p>
        <p>This is an automated notification. Please do not reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Welcome Email ──────────────────────────────────────────────────────────────

export function welcomeEmail(userName: string): { subject: string; html: string } {
  const content = `
    <h2>Welcome to EduTrack Pro!</h2>
    <p>Hi <strong>${escapeHtml(userName)}</strong>,</p>
    <p>We're thrilled to have you on board. EduTrack Pro is designed to make your educational journey seamless and productive.</p>
    <div class="info-box">
      <p><strong>Getting Started:</strong></p>
      <p>&#8226; Complete your profile to personalize your experience</p>
      <p>&#8226; Browse available courses and enroll</p>
      <p>&#8226; Check your assignments dashboard regularly</p>
      <p>&#8226; Join scheduled meetings with your instructors</p>
    </div>
    <p>If you have any questions, don't hesitate to reach out to your instructor or our support team.</p>
    <p>Happy learning!</p>
  `;

  return {
    subject: 'Welcome to EduTrack Pro!',
    html: baseLayout(content),
  };
}

// ─── Assignment Due Email ───────────────────────────────────────────────────────

export function assignmentDueEmail(
  userName: string,
  assignmentTitle: string,
  dueDate: string
): { subject: string; html: string } {
  const content = `
    <h2>Assignment Due Reminder</h2>
    <p>Hi <strong>${escapeHtml(userName)}</strong>,</p>
    <p>This is a reminder that you have an upcoming assignment deadline.</p>
    <div class="info-box">
      <p><strong>Assignment:</strong> ${escapeHtml(assignmentTitle)}</p>
      <p><strong>Due Date:</strong> ${escapeHtml(dueDate)}</p>
    </div>
    <p>Make sure to submit your work before the deadline. Late submissions may not be accepted or may receive a reduced grade.</p>
    <p>If you need help or an extension, please contact your instructor as soon as possible.</p>
  `;

  return {
    subject: `Reminder: "${assignmentTitle}" is due soon`,
    html: baseLayout(content),
  };
}

// ─── Meeting Reminder Email ─────────────────────────────────────────────────────

export function meetingReminderEmail(
  userName: string,
  meetingTitle: string,
  meetingDate: string,
  meetingLink: string
): { subject: string; html: string } {
  const content = `
    <h2>Meeting Reminder</h2>
    <p>Hi <strong>${escapeHtml(userName)}</strong>,</p>
    <p>You have an upcoming meeting scheduled. Please make sure to attend on time.</p>
    <div class="info-box">
      <p><strong>Meeting:</strong> ${escapeHtml(meetingTitle)}</p>
      <p><strong>Date &amp; Time:</strong> ${escapeHtml(meetingDate)}</p>
    </div>
    <p style="text-align: center;">
      <a href="${escapeHtml(meetingLink)}" class="btn">Join Meeting</a>
    </p>
    <p>Please test your audio and video before the meeting starts. If you cannot attend, inform your instructor in advance.</p>
  `;

  return {
    subject: `Meeting Reminder: ${meetingTitle}`,
    html: baseLayout(content),
  };
}

// ─── Grade Notification Email ───────────────────────────────────────────────────

export function gradeNotificationEmail(
  userName: string,
  assignmentTitle: string,
  score: string,
  feedback: string
): { subject: string; html: string } {
  const content = `
    <h2>Grade Posted</h2>
    <p>Hi <strong>${escapeHtml(userName)}</strong>,</p>
    <p>Your assignment has been graded. Here are the details:</p>
    <div class="info-box">
      <p><strong>Assignment:</strong> ${escapeHtml(assignmentTitle)}</p>
      <p><strong>Score:</strong> ${escapeHtml(score)}</p>
    </div>
    ${feedback ? `
    <h3 style="color: #1e293b; font-size: 16px; margin: 20px 0 8px;">Instructor Feedback:</h3>
    <p style="background-color: #fafafa; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; font-style: italic;">
      ${escapeHtml(feedback)}
    </p>
    ` : ''}
    <p>Keep up the great work! If you have questions about your grade, please reach out to your instructor.</p>
  `;

  return {
    subject: `Grade Posted: ${assignmentTitle}`,
    html: baseLayout(content),
  };
}

// ─── Utility ────────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
