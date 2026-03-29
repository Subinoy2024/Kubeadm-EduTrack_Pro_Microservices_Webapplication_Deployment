import { Request, Response } from 'express';
import pg from 'pg';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import {
  createNotification,
  findNotificationsByUser,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createEmailLog,
  updateEmailStatus,
  NotificationCategory,
} from '../models/index.js';
import { config } from '../config/index.js';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Email Transporter ──────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

// ─── Controller Factory ─────────────────────────────────────────────────────────

export function createNotificationController(pool: pg.Pool) {

  // GET /notifications - Get current user's notifications (paginated)
  async function getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = { success: false, error: 'Authentication required' };
        res.status(401).json(response);
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const offset = (page - 1) * limit;
      const category = req.query.category as NotificationCategory | undefined;
      const isReadParam = req.query.is_read as string | undefined;
      const isRead = isReadParam !== undefined ? isReadParam === 'true' : undefined;

      const { notifications, total } = await findNotificationsByUser(pool, userId, {
        offset,
        limit,
        category,
        isRead,
      });

      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse = {
        success: true,
        data: notifications,
        pagination: { page, limit, total, totalPages },
      };
      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse = { success: false, error: `Failed to fetch notifications: ${message}` };
      res.status(500).json(response);
    }
  }

  // GET /notifications/unread-count - Count of unread notifications
  async function getUnreadCountHandler(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = { success: false, error: 'Authentication required' };
        res.status(401).json(response);
        return;
      }

      const count = await getUnreadCount(pool, userId);

      const response: ApiResponse = {
        success: true,
        data: { unreadCount: count },
      };
      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse = { success: false, error: `Failed to get unread count: ${message}` };
      res.status(500).json(response);
    }
  }

  // PUT /notifications/:id/read - Mark single notification as read
  async function markAsReadHandler(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = { success: false, error: 'Authentication required' };
        res.status(401).json(response);
        return;
      }

      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = { success: false, error: 'Notification ID is required' };
        res.status(400).json(response);
        return;
      }

      const notification = await markAsRead(pool, id, userId);
      if (!notification) {
        const response: ApiResponse = { success: false, error: 'Notification not found' };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: notification,
        message: 'Notification marked as read',
      };
      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse = { success: false, error: `Failed to mark notification as read: ${message}` };
      res.status(500).json(response);
    }
  }

  // PUT /notifications/read-all - Mark all as read for current user
  async function markAllAsReadHandler(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = { success: false, error: 'Authentication required' };
        res.status(401).json(response);
        return;
      }

      const count = await markAllAsRead(pool, userId);

      const response: ApiResponse = {
        success: true,
        data: { markedCount: count },
        message: `${count} notification(s) marked as read`,
      };
      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse = { success: false, error: `Failed to mark all as read: ${message}` };
      res.status(500).json(response);
    }
  }

  // POST /notifications - Internal/Admin: create notification for a user
  async function createNotificationHandler(req: Request, res: Response): Promise<void> {
    try {
      const { userId, title, message, type, category, metadata } = req.body;

      if (!userId || !title || !message) {
        const response: ApiResponse = { success: false, error: 'userId, title, and message are required' };
        res.status(400).json(response);
        return;
      }

      const notification = await createNotification(pool, {
        userId,
        title,
        message,
        type: type || 'info',
        category: category || 'system',
        metadata,
      });

      const response: ApiResponse = {
        success: true,
        data: notification,
        message: 'Notification created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse = { success: false, error: `Failed to create notification: ${errMessage}` };
      res.status(500).json(response);
    }
  }

  // POST /email/send - Internal endpoint to send email via SMTP
  async function sendEmailHandler(req: Request, res: Response): Promise<void> {
    try {
      const { to, subject, html } = req.body;

      if (!to || !subject || !html) {
        const response: ApiResponse = { success: false, error: 'to, subject, and html are required' };
        res.status(400).json(response);
        return;
      }

      // Create email log entry
      const emailLog = await createEmailLog(pool, {
        toEmail: to,
        subject,
        body: html,
      });

      try {
        await transporter.sendMail({
          from: `"EduTrack Pro" <${config.fromEmail}>`,
          to,
          subject,
          html,
        });

        await updateEmailStatus(pool, emailLog.id, 'sent');

        const response: ApiResponse = {
          success: true,
          data: { emailId: emailLog.id },
          message: 'Email sent successfully',
        };
        res.status(200).json(response);
      } catch (sendError) {
        const errorMessage = sendError instanceof Error ? sendError.message : 'Failed to send email';
        await updateEmailStatus(pool, emailLog.id, 'failed', errorMessage);

        const response: ApiResponse = { success: false, error: `Email send failed: ${errorMessage}` };
        res.status(502).json(response);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse = { success: false, error: `Email operation failed: ${message}` };
      res.status(500).json(response);
    }
  }

  // POST /notifications/broadcast - Admin: send notification to all users of a role
  async function broadcastNotificationHandler(req: Request, res: Response): Promise<void> {
    try {
      const callerRole = req.user?.role;
      if (callerRole !== 'admin') {
        const response: ApiResponse = { success: false, error: 'Access denied. Admin role required.' };
        res.status(403).json(response);
        return;
      }

      const { userIds, title, message, type, category, metadata } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        const response: ApiResponse = { success: false, error: 'userIds array is required and must not be empty' };
        res.status(400).json(response);
        return;
      }

      if (!title || !message) {
        const response: ApiResponse = { success: false, error: 'title and message are required' };
        res.status(400).json(response);
        return;
      }

      const notifications = await Promise.all(
        userIds.map((uid: string) =>
          createNotification(pool, {
            userId: uid,
            title,
            message,
            type: type || 'info',
            category: category || 'system',
            metadata,
          })
        )
      );

      const response: ApiResponse = {
        success: true,
        data: { count: notifications.length },
        message: `Broadcast notification sent to ${notifications.length} user(s)`,
      };
      res.status(201).json(response);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse = { success: false, error: `Failed to broadcast notification: ${errMessage}` };
      res.status(500).json(response);
    }
  }

  return {
    getNotifications,
    getUnreadCount: getUnreadCountHandler,
    markAsRead: markAsReadHandler,
    markAllAsRead: markAllAsReadHandler,
    createNotification: createNotificationHandler,
    sendEmail: sendEmailHandler,
    broadcastNotification: broadcastNotificationHandler,
  };
}
