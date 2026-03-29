import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { queries } from '../models/index.js';
import { getBuiltInResponse, detectTopic, suggestedQuestions } from '../utils/ai-engine.js';

const createSessionSchema = Joi.object({
  title: Joi.string().max(255).default('New Chat'),
  subject: Joi.string().max(100).allow('', null),
});

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
});

export function createChatController(pool: Pool) {
  return {
    async createSession(req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = createSessionSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const user = (req as any).user;
        const id = uuidv4();
        const result = await pool.query(queries.createSession, [
          id,
          user.userId,
          value.title,
          value.subject || null,
        ]);

        // Add initial system/assistant welcome message
        const welcomeId = uuidv4();
        const welcomeContent = getBuiltInResponse('hello');
        await pool.query(queries.addMessage, [welcomeId, id, 'assistant', welcomeContent.content]);

        res.status(201).json({ success: true, data: result.rows[0] });
      } catch (err) {
        next(err);
      }
    },

    async getSessions(req: Request, res: Response, next: NextFunction) {
      try {
        const user = (req as any).user;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
        const offset = (page - 1) * limit;

        const countResult = await pool.query(queries.countUserSessions, [user.userId]);
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(queries.getSessionsByUser, [user.userId, limit, offset]);

        res.json({
          success: true,
          data: result.rows,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      } catch (err) {
        next(err);
      }
    },

    async getSessionMessages(req: Request, res: Response, next: NextFunction) {
      try {
        const user = (req as any).user;
        const { id } = req.params;

        // Verify session belongs to user
        const session = await pool.query(queries.getSessionById, [id, user.userId]);
        if (session.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Session not found' });
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const offset = (page - 1) * limit;

        const result = await pool.query(queries.getMessagesBySession, [id, limit, offset]);

        res.json({ success: true, data: result.rows });
      } catch (err) {
        next(err);
      }
    },

    async sendMessage(req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = sendMessageSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const user = (req as any).user;
        const { id: sessionId } = req.params;

        // Verify session belongs to user
        const session = await pool.query(queries.getSessionById, [sessionId, user.userId]);
        if (session.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Save user message
        const userMsgId = uuidv4();
        const userMsg = await pool.query(queries.addMessage, [
          userMsgId,
          sessionId,
          'user',
          value.content,
        ]);

        // Generate AI response using built-in engine
        const aiResponse = getBuiltInResponse(value.content);

        // Save AI response
        const aiMsgId = uuidv4();
        const aiMsg = await pool.query(queries.addMessage, [
          aiMsgId,
          sessionId,
          'assistant',
          aiResponse.content,
        ]);

        // Update session subject if detected
        const topic = detectTopic(value.content);
        if (topic && aiResponse.subject) {
          await pool.query(queries.updateSessionSubject, [aiResponse.subject, sessionId]);
        }

        // Auto-title the session based on first user message
        if (session.rows[0].title === 'New Chat') {
          const title = value.content.substring(0, 60) + (value.content.length > 60 ? '...' : '');
          await pool.query(queries.updateSessionTitle, [title, sessionId]);
        }

        res.json({
          success: true,
          data: {
            userMessage: userMsg.rows[0],
            assistantMessage: aiMsg.rows[0],
          },
        });
      } catch (err) {
        next(err);
      }
    },

    async deleteSession(req: Request, res: Response, next: NextFunction) {
      try {
        const user = (req as any).user;
        const { id } = req.params;

        const result = await pool.query(queries.deleteSession, [id, user.userId]);
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Session not found' });
        }

        res.json({ success: true, message: 'Session deleted' });
      } catch (err) {
        next(err);
      }
    },

    async getSuggestedQuestions(_req: Request, res: Response) {
      res.json({ success: true, data: suggestedQuestions });
    },
  };
}
