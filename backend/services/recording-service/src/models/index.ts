import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { createDbPool, logger } from '@edutrack/shared';
import { config } from '../config/index.js';

// ─── Database Pool ────────────────────────────────────────────────────────────

const pool: pg.Pool = createDbPool(config.databaseUrl);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Recording {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher_name: string;
  teacher_id: string;
  date: string;
  duration: number;
  youtube_id: string;
  thumbnail_url: string;
  views_count: number;
  is_published: boolean;
  course_id: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface RecordingView {
  id: string;
  recording_id: string;
  student_id: string;
  viewed_at: Date;
  watch_duration: number;
}

// ─── Schema Initialization ────────────────────────────────────────────────────

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS recordings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT DEFAULT '',
        subject VARCHAR(100) NOT NULL,
        teacher_name VARCHAR(255) NOT NULL,
        teacher_id UUID NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        duration INTEGER NOT NULL DEFAULT 0,
        youtube_id VARCHAR(50) NOT NULL,
        thumbnail_url VARCHAR(1000) DEFAULT '',
        views_count INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN NOT NULL DEFAULT false,
        course_id UUID,
        created_by UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recording_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
        student_id UUID NOT NULL,
        viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        watch_duration INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_recordings_subject ON recordings(subject);
      CREATE INDEX IF NOT EXISTS idx_recordings_teacher_id ON recordings(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_recordings_course_id ON recordings(course_id);
      CREATE INDEX IF NOT EXISTS idx_recordings_is_published ON recordings(is_published);
      CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at);
      CREATE INDEX IF NOT EXISTS idx_recording_views_recording_id ON recording_views(recording_id);
      CREATE INDEX IF NOT EXISTS idx_recording_views_student_id ON recording_views(student_id);
    `);
    logger.info('Recording database tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database tables', { error });
    throw error;
  } finally {
    client.release();
  }
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function createRecording(data: {
  title: string;
  description?: string;
  subject: string;
  teacher_name: string;
  teacher_id: string;
  date?: string;
  duration: number;
  youtube_id: string;
  thumbnail_url?: string;
  is_published?: boolean;
  course_id?: string | null;
  created_by: string;
}): Promise<Recording> {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO recordings (id, title, description, subject, teacher_name, teacher_id, date, duration, youtube_id, thumbnail_url, is_published, course_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      id,
      data.title,
      data.description || '',
      data.subject,
      data.teacher_name,
      data.teacher_id,
      data.date || new Date().toISOString().split('T')[0],
      data.duration,
      data.youtube_id,
      data.thumbnail_url || `https://img.youtube.com/vi/${data.youtube_id}/hqdefault.jpg`,
      data.is_published ?? false,
      data.course_id || null,
      data.created_by,
    ]
  );
  return result.rows[0];
}

export async function findAllRecordings(options: {
  page: number;
  limit: number;
  subject?: string;
  teacher_id?: string;
  course_id?: string;
  is_published?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ recordings: Recording[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (options.subject) {
    conditions.push(`subject = $${paramIndex++}`);
    params.push(options.subject);
  }

  if (options.teacher_id) {
    conditions.push(`teacher_id = $${paramIndex++}`);
    params.push(options.teacher_id);
  }

  if (options.course_id) {
    conditions.push(`course_id = $${paramIndex++}`);
    params.push(options.course_id);
  }

  if (options.is_published !== undefined) {
    conditions.push(`is_published = $${paramIndex++}`);
    params.push(options.is_published);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = ['title', 'subject', 'date', 'duration', 'views_count', 'created_at'];
  const sortBy = allowedSortColumns.includes(options.sortBy || '') ? options.sortBy : 'created_at';
  const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (options.page - 1) * options.limit;

  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM recordings ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].total, 10);

  const dataResult = await pool.query(
    `SELECT * FROM recordings ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, options.limit, offset]
  );

  return { recordings: dataResult.rows, total };
}

export async function findRecordingById(id: string): Promise<Recording | null> {
  const result = await pool.query('SELECT * FROM recordings WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function updateRecording(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    subject: string;
    teacher_name: string;
    date: string;
    duration: number;
    youtube_id: string;
    thumbnail_url: string;
    is_published: boolean;
    course_id: string | null;
  }>
): Promise<Recording | null> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex++}`);
      params.push(value);
    }
  }

  if (fields.length === 0) {
    return findRecordingById(id);
  }

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pool.query(
    `UPDATE recordings SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  return result.rows[0] || null;
}

export async function deleteRecording(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM recordings WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

export async function findBySubject(subject: string, limit: number = 20, offset: number = 0): Promise<Recording[]> {
  const result = await pool.query(
    'SELECT * FROM recordings WHERE subject = $1 AND is_published = true ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [subject, limit, offset]
  );
  return result.rows;
}

export async function findByTeacher(teacherId: string, limit: number = 20, offset: number = 0): Promise<Recording[]> {
  const result = await pool.query(
    'SELECT * FROM recordings WHERE teacher_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [teacherId, limit, offset]
  );
  return result.rows;
}

export async function findByCourse(courseId: string, limit: number = 20, offset: number = 0): Promise<Recording[]> {
  const result = await pool.query(
    'SELECT * FROM recordings WHERE course_id = $1 AND is_published = true ORDER BY date ASC LIMIT $2 OFFSET $3',
    [courseId, limit, offset]
  );
  return result.rows;
}

export async function searchRecordings(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ recordings: Recording[]; total: number }> {
  const searchTerm = `%${query.toLowerCase()}%`;

  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM recordings
     WHERE is_published = true
       AND (LOWER(title) LIKE $1 OR LOWER(subject) LIKE $1 OR LOWER(teacher_name) LIKE $1)`,
    [searchTerm]
  );

  const total = parseInt(countResult.rows[0].total, 10);

  const result = await pool.query(
    `SELECT * FROM recordings
     WHERE is_published = true
       AND (LOWER(title) LIKE $1 OR LOWER(subject) LIKE $1 OR LOWER(teacher_name) LIKE $1)
     ORDER BY views_count DESC, created_at DESC
     LIMIT $2 OFFSET $3`,
    [searchTerm, limit, offset]
  );

  return { recordings: result.rows, total };
}

// ─── Views ────────────────────────────────────────────────────────────────────

export async function recordView(data: {
  recording_id: string;
  student_id: string;
  watch_duration?: number;
}): Promise<RecordingView> {
  const id = uuidv4();

  const result = await pool.query(
    `INSERT INTO recording_views (id, recording_id, student_id, watch_duration)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, data.recording_id, data.student_id, data.watch_duration || 0]
  );

  return result.rows[0];
}

export async function incrementViews(recordingId: string): Promise<void> {
  await pool.query(
    'UPDATE recordings SET views_count = views_count + 1 WHERE id = $1',
    [recordingId]
  );
}

// ─── Stats / Analytics ────────────────────────────────────────────────────────

export async function getPopular(limit: number = 10): Promise<Recording[]> {
  const result = await pool.query(
    'SELECT * FROM recordings WHERE is_published = true ORDER BY views_count DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

export async function getRecent(limit: number = 10): Promise<Recording[]> {
  const result = await pool.query(
    'SELECT * FROM recordings WHERE is_published = true ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

export async function getRecordingStats(): Promise<{
  totalRecordings: number;
  publishedRecordings: number;
  totalViews: number;
  totalSubjects: number;
  topSubjects: { subject: string; count: number }[];
  topRecordings: Recording[];
}> {
  const [totalResult, publishedResult, viewsResult, subjectsResult, topSubjectsResult, topRecordingsResult] =
    await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM recordings'),
      pool.query('SELECT COUNT(*) as count FROM recordings WHERE is_published = true'),
      pool.query('SELECT COALESCE(SUM(views_count), 0) as total FROM recordings'),
      pool.query('SELECT COUNT(DISTINCT subject) as count FROM recordings'),
      pool.query(
        `SELECT subject, COUNT(*) as count FROM recordings
         GROUP BY subject ORDER BY count DESC LIMIT 5`
      ),
      pool.query(
        `SELECT * FROM recordings WHERE is_published = true
         ORDER BY views_count DESC LIMIT 5`
      ),
    ]);

  return {
    totalRecordings: parseInt(totalResult.rows[0].count, 10),
    publishedRecordings: parseInt(publishedResult.rows[0].count, 10),
    totalViews: parseInt(viewsResult.rows[0].total, 10),
    totalSubjects: parseInt(subjectsResult.rows[0].count, 10),
    topSubjects: topSubjectsResult.rows.map((row: any) => ({
      subject: row.subject,
      count: parseInt(row.count, 10),
    })),
    topRecordings: topRecordingsResult.rows,
  };
}

export { pool };
