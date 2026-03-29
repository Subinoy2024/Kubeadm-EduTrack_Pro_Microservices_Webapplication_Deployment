import { Pool } from 'pg';
import { config } from '../config/index.js';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

// ──────────────────────────────────────────────
// Schema initialisation
// ──────────────────────────────────────────────

export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        teacher_id UUID NOT NULL,
        teacher_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER NOT NULL DEFAULT 60,
        meet_link VARCHAR(512),
        max_students INTEGER NOT NULL DEFAULT 50,
        status VARCHAR(20) NOT NULL DEFAULT 'upcoming'
          CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
        created_by UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS meeting_attendees (
        id UUID PRIMARY KEY,
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        student_id UUID NOT NULL,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        left_at TIMESTAMP,
        UNIQUE (meeting_id, student_id)
      );

      CREATE INDEX IF NOT EXISTS idx_meetings_teacher_id ON meetings(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
      CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
      CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_meeting_attendees_student_id ON meeting_attendees(student_id);
    `);
    console.log('[meeting-service] Database tables initialised');
  } finally {
    client.release();
  }
};

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  teacher_id: string;
  teacher_name: string;
  date: string;
  time: string;
  duration: number;
  meet_link?: string;
  max_students: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  student_id: string;
  joined_at: Date;
  left_at?: Date;
}

// ──────────────────────────────────────────────
// Meeting operations
// ──────────────────────────────────────────────

export const createMeeting = async (data: Omit<Meeting, 'created_at' | 'updated_at'>): Promise<Meeting> => {
  const { rows } = await pool.query(
    `INSERT INTO meetings (id, title, description, teacher_id, teacher_name, date, time, duration, meet_link, max_students, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [data.id, data.title, data.description, data.teacher_id, data.teacher_name, data.date, data.time, data.duration, data.meet_link, data.max_students, data.status, data.created_by],
  );
  return rows[0];
};

export const getAllMeetings = async (filters: {
  page: number;
  limit: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  teacher_id?: string;
}): Promise<{ meetings: Meeting[]; total: number }> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`m.status = $${paramIndex++}`);
    values.push(filters.status);
  }
  if (filters.date_from) {
    conditions.push(`m.date >= $${paramIndex++}`);
    values.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push(`m.date <= $${paramIndex++}`);
    values.push(filters.date_to);
  }
  if (filters.teacher_id) {
    conditions.push(`m.teacher_id = $${paramIndex++}`);
    values.push(filters.teacher_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM meetings m ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  values.push(filters.limit, offset);

  const { rows } = await pool.query(
    `SELECT m.* FROM meetings m ${whereClause}
     ORDER BY m.date ASC, m.time ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    values,
  );

  return { meetings: rows, total };
};

export const getMeetingById = async (id: string): Promise<(Meeting & { attendee_count: number }) | null> => {
  const { rows } = await pool.query(
    `SELECT m.*,
            (SELECT COUNT(*) FROM meeting_attendees ma WHERE ma.meeting_id = m.id)::int AS attendee_count
     FROM meetings m
     WHERE m.id = $1`,
    [id],
  );
  return rows[0] || null;
};

export const updateMeeting = async (
  id: string,
  data: Partial<Omit<Meeting, 'id' | 'created_by' | 'created_at' | 'updated_at'>>,
): Promise<Meeting | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedKeys: (keyof typeof data)[] = [
    'title', 'description', 'teacher_id', 'teacher_name', 'date', 'time',
    'duration', 'meet_link', 'max_students', 'status',
  ];

  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return getMeetingById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE meetings SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );
  return rows[0] || null;
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
  const { rowCount } = await pool.query('DELETE FROM meetings WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
};

export const findByDate = async (date: string): Promise<Meeting[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM meetings WHERE date = $1 ORDER BY time ASC',
    [date],
  );
  return rows;
};

export const findByTeacher = async (teacherId: string): Promise<Meeting[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM meetings WHERE teacher_id = $1 ORDER BY date ASC, time ASC',
    [teacherId],
  );
  return rows;
};

export const findByStatus = async (status: string): Promise<Meeting[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM meetings WHERE status = $1 ORDER BY date ASC, time ASC',
    [status],
  );
  return rows;
};

export const findUpcoming = async (limit: number = 10): Promise<Meeting[]> => {
  const { rows } = await pool.query(
    `SELECT m.*,
            (SELECT COUNT(*) FROM meeting_attendees ma WHERE ma.meeting_id = m.id)::int AS attendee_count
     FROM meetings m
     WHERE m.status = 'upcoming' AND (m.date > CURRENT_DATE OR (m.date = CURRENT_DATE AND m.time > CURRENT_TIME))
     ORDER BY m.date ASC, m.time ASC
     LIMIT $1`,
    [limit],
  );
  return rows;
};

export const updateStatus = async (id: string, status: string): Promise<Meeting | null> => {
  const { rows } = await pool.query(
    `UPDATE meetings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id],
  );
  return rows[0] || null;
};

// ──────────────────────────────────────────────
// Attendee operations
// ──────────────────────────────────────────────

export const addAttendee = async (data: { id: string; meeting_id: string; student_id: string }): Promise<MeetingAttendee> => {
  const { rows } = await pool.query(
    `INSERT INTO meeting_attendees (id, meeting_id, student_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.id, data.meeting_id, data.student_id],
  );
  return rows[0];
};

export const removeAttendee = async (meetingId: string, studentId: string): Promise<MeetingAttendee | null> => {
  const { rows } = await pool.query(
    `UPDATE meeting_attendees SET left_at = NOW()
     WHERE meeting_id = $1 AND student_id = $2 AND left_at IS NULL
     RETURNING *`,
    [meetingId, studentId],
  );
  return rows[0] || null;
};

export const getAttendeeCount = async (meetingId: string): Promise<number> => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM meeting_attendees WHERE meeting_id = $1',
    [meetingId],
  );
  return rows[0].count;
};

export const getAttendeesByMeeting = async (meetingId: string): Promise<MeetingAttendee[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM meeting_attendees WHERE meeting_id = $1 ORDER BY joined_at ASC',
    [meetingId],
  );
  return rows;
};

export const getMeetingStats = async (): Promise<{
  total_meetings: number;
  upcoming_meetings: number;
  live_meetings: number;
  completed_meetings: number;
  cancelled_meetings: number;
  total_attendees: number;
}> => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM meetings)::int AS total_meetings,
      (SELECT COUNT(*) FROM meetings WHERE status = 'upcoming')::int AS upcoming_meetings,
      (SELECT COUNT(*) FROM meetings WHERE status = 'live')::int AS live_meetings,
      (SELECT COUNT(*) FROM meetings WHERE status = 'completed')::int AS completed_meetings,
      (SELECT COUNT(*) FROM meetings WHERE status = 'cancelled')::int AS cancelled_meetings,
      (SELECT COUNT(*) FROM meeting_attendees)::int AS total_attendees
  `);
  return result.rows[0];
};

export default pool;
