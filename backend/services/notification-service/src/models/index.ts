import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'assignment' | 'meeting' | 'course' | 'system';
export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  is_read: boolean;
  metadata: Record<string, any> | null;
  created_at: Date;
}

export interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  status: EmailStatus;
  error: string | null;
  sent_at: Date | null;
  created_at: Date;
}

// ─── Database Initialization ────────────────────────────────────────────────────

export async function initializeDatabase(pool: pg.Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
        category VARCHAR(20) NOT NULL DEFAULT 'system' CHECK (category IN ('assignment', 'meeting', 'course', 'system')),
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

      CREATE TABLE IF NOT EXISTS email_logs (
        id UUID PRIMARY KEY,
        to_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
        error TEXT DEFAULT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
      CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
    `);
  } finally {
    client.release();
  }
}

// ─── Notification Operations ────────────────────────────────────────────────────

export async function createNotification(
  pool: pg.Pool,
  data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    metadata?: Record<string, any>;
  }
): Promise<Notification> {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO notifications (id, user_id, title, message, type, category, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      data.userId,
      data.title,
      data.message,
      data.type || 'info',
      data.category || 'system',
      data.metadata ? JSON.stringify(data.metadata) : null,
    ]
  );
  return result.rows[0];
}

export async function findNotificationsByUser(
  pool: pg.Pool,
  userId: string,
  options: { offset: number; limit: number; category?: NotificationCategory; isRead?: boolean }
): Promise<{ notifications: Notification[]; total: number }> {
  const conditions: string[] = ['user_id = $1'];
  const params: any[] = [userId];
  let paramIndex = 2;

  if (options.category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(options.category);
    paramIndex++;
  }

  if (options.isRead !== undefined) {
    conditions.push(`is_read = $${paramIndex}`);
    params.push(options.isRead);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, options.limit, options.offset]
  );

  return { notifications: result.rows, total };
}

export async function markAsRead(
  pool: pg.Pool,
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return result.rows[0] || null;
}

export async function markAllAsRead(
  pool: pg.Pool,
  userId: string
): Promise<number> {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return result.rowCount || 0;
}

export async function deleteOldNotifications(
  pool: pg.Pool,
  daysOld: number = 90
): Promise<number> {
  const result = await pool.query(
    `DELETE FROM notifications
     WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
    [daysOld]
  );
  return result.rowCount || 0;
}

export async function getUnreadCount(
  pool: pg.Pool,
  userId: string
): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

// ─── Email Log Operations ───────────────────────────────────────────────────────

export async function createEmailLog(
  pool: pg.Pool,
  data: { toEmail: string; subject: string; body: string }
): Promise<EmailLog> {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO email_logs (id, to_email, subject, body, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [id, data.toEmail, data.subject, data.body]
  );
  return result.rows[0];
}

export async function updateEmailStatus(
  pool: pg.Pool,
  emailId: string,
  status: EmailStatus,
  error?: string
): Promise<EmailLog | null> {
  const sentAt = status === 'sent' ? 'NOW()' : 'NULL';
  const result = await pool.query(
    `UPDATE email_logs
     SET status = $1, error = $2, sent_at = ${sentAt}
     WHERE id = $3
     RETURNING *`,
    [status, error || null, emailId]
  );
  return result.rows[0] || null;
}
