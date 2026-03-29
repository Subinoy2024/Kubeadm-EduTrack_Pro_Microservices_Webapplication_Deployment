import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const createMeetingSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).allow('', null),
  teacher_name: Joi.string().max(255).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time: Joi.string().max(20).required(),
  duration: Joi.string().max(50).required(),
  meet_link: Joi.string().uri().required(),
  max_students: Joi.number().integer().min(1).max(1000).default(100),
  status: Joi.string().valid('upcoming', 'live', 'completed', 'cancelled').default('upcoming'),
});

const updateMeetingSchema = Joi.object({
  title: Joi.string().min(3).max(255),
  description: Joi.string().max(1000).allow('', null),
  teacher_name: Joi.string().max(255),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  time: Joi.string().max(20),
  duration: Joi.string().max(50),
  meet_link: Joi.string().uri(),
  max_students: Joi.number().integer().min(1).max(1000),
  status: Joi.string().valid('upcoming', 'live', 'completed', 'cancelled'),
}).min(1);

export function createMeetingController(pool: Pool) {
  return {
    async createMeeting(req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = createMeetingSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const user = (req as any).user;
        const id = uuidv4();
        const result = await pool.query(
          `INSERT INTO meetings (id, title, description, teacher_id, teacher_name, date, time, duration, meet_link, max_students, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *`,
          [id, value.title, value.description || null, user.userId, value.teacher_name, value.date, value.time, value.duration, value.meet_link, value.max_students, value.status, user.userId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
      } catch (err) {
        next(err);
      }
    },

    async getAllMeetings(req: Request, res: Response, next: NextFunction) {
      try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
        const offset = (page - 1) * limit;
        const status = req.query.status as string;
        const teacher_id = req.query.teacher_id as string;

        let whereClause = '';
        const params: any[] = [];
        const conditions: string[] = [];

        if (status) {
          params.push(status);
          conditions.push(`status = $${params.length}`);
        }
        if (teacher_id) {
          params.push(teacher_id);
          conditions.push(`teacher_id = $${params.length}`);
        }

        if (conditions.length > 0) {
          whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const countResult = await pool.query(`SELECT COUNT(*) FROM meetings ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);

        params.push(limit, offset);
        const result = await pool.query(
          `SELECT m.*, (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id) as attendee_count
           FROM meetings m ${whereClause}
           ORDER BY m.date ASC, m.time ASC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        res.json({
          success: true,
          data: result.rows,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      } catch (err) {
        next(err);
      }
    },

    async getMeetingById(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const result = await pool.query(
          `SELECT m.*, (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id) as attendee_count
           FROM meetings m WHERE m.id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        res.json({ success: true, data: result.rows[0] });
      } catch (err) {
        next(err);
      }
    },

    async updateMeeting(req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = updateMeetingSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const { id } = req.params;
        const user = (req as any).user;

        const existing = await pool.query('SELECT * FROM meetings WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        if (user.role === 'teacher' && existing.rows[0].teacher_id !== user.userId) {
          return res.status(403).json({ success: false, error: 'You can only update your own meetings' });
        }

        const fields = Object.keys(value);
        const setClauses = fields.map((f, i) => `${f} = $${i + 2}`);
        const values = fields.map((f) => value[f]);

        const result = await pool.query(
          `UPDATE meetings SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
          [id, ...values]
        );

        res.json({ success: true, data: result.rows[0] });
      } catch (err) {
        next(err);
      }
    },

    async deleteMeeting(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM meetings WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        res.json({ success: true, message: 'Meeting deleted' });
      } catch (err) {
        next(err);
      }
    },

    async updateMeetingStatus(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['upcoming', 'live', 'completed', 'cancelled'].includes(status)) {
          return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const result = await pool.query(
          'UPDATE meetings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [status, id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        res.json({ success: true, data: result.rows[0] });
      } catch (err) {
        next(err);
      }
    },

    async joinMeeting(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const user = (req as any).user;

        const meeting = await pool.query('SELECT * FROM meetings WHERE id = $1', [id]);
        if (meeting.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        if (meeting.rows[0].status !== 'live' && meeting.rows[0].status !== 'upcoming') {
          return res.status(400).json({ success: false, error: 'Meeting is not active' });
        }

        await pool.query(
          `INSERT INTO meeting_attendees (id, meeting_id, student_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (meeting_id, student_id) DO UPDATE SET joined_at = NOW(), left_at = NULL`,
          [uuidv4(), id, user.userId]
        );

        res.json({ success: true, message: 'Joined meeting', data: { meet_link: meeting.rows[0].meet_link } });
      } catch (err) {
        next(err);
      }
    },

    async leaveMeeting(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const user = (req as any).user;

        await pool.query(
          'UPDATE meeting_attendees SET left_at = NOW() WHERE meeting_id = $1 AND student_id = $2',
          [id, user.userId]
        );

        res.json({ success: true, message: 'Left meeting' });
      } catch (err) {
        next(err);
      }
    },

    async getUpcomingMeetings(req: Request, res: Response, next: NextFunction) {
      try {
        const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
        const result = await pool.query(
          `SELECT m.*, (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id) as attendee_count
           FROM meetings m
           WHERE m.status IN ('upcoming', 'live')
           ORDER BY m.date ASC, m.time ASC
           LIMIT $1`,
          [limit]
        );

        res.json({ success: true, data: result.rows });
      } catch (err) {
        next(err);
      }
    },

    async getMeetingStats(req: Request, res: Response, next: NextFunction) {
      try {
        const stats = await pool.query(`
          SELECT
            COUNT(*) as total_meetings,
            COUNT(*) FILTER (WHERE status = 'upcoming') as upcoming,
            COUNT(*) FILTER (WHERE status = 'live') as live,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
          FROM meetings
        `);

        res.json({ success: true, data: stats.rows[0] });
      } catch (err) {
        next(err);
      }
    },
  };
}
