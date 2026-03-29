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
      CREATE TABLE IF NOT EXISTS assignments (
        id UUID PRIMARY KEY,
        course_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(100),
        due_date TIMESTAMP NOT NULL,
        max_score INTEGER NOT NULL DEFAULT 100,
        is_published BOOLEAN NOT NULL DEFAULT false,
        priority VARCHAR(10) NOT NULL DEFAULT 'medium'
          CHECK (priority IN ('high', 'medium', 'low')),
        created_by UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY,
        assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        student_id UUID NOT NULL,
        content TEXT,
        file_url VARCHAR(512),
        submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
        score INTEGER,
        feedback TEXT,
        graded_by UUID,
        graded_at TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'submitted', 'graded', 'late')),
        UNIQUE (assignment_id, student_id)
      );

      CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
      CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
      CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    `);
    console.log('[assignment-service] Database tables initialised');
  } finally {
    client.release();
  }
};

// ──────────────────────────────────────────────
// Assignment operations
// ──────────────────────────────────────────────

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  subject?: string;
  due_date: Date;
  max_score: number;
  is_published: boolean;
  priority: 'high' | 'medium' | 'low';
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content?: string;
  file_url?: string;
  submitted_at: Date;
  score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
  status: 'pending' | 'submitted' | 'graded' | 'late';
}

// ── Assignments ─────────────────────────────

export const createAssignment = async (data: Omit<Assignment, 'created_at' | 'updated_at'>): Promise<Assignment> => {
  const { rows } = await pool.query(
    `INSERT INTO assignments (id, course_id, title, description, subject, due_date, max_score, is_published, priority, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [data.id, data.course_id, data.title, data.description, data.subject, data.due_date, data.max_score, data.is_published, data.priority, data.created_by],
  );
  return rows[0];
};

export const getAllAssignments = async (filters: {
  page: number;
  limit: number;
  subject?: string;
  status?: string;
  course_id?: string;
}): Promise<{ assignments: Assignment[]; total: number }> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.subject) {
    conditions.push(`a.subject = $${paramIndex++}`);
    values.push(filters.subject);
  }
  if (filters.course_id) {
    conditions.push(`a.course_id = $${paramIndex++}`);
    values.push(filters.course_id);
  }
  if (filters.status === 'published') {
    conditions.push(`a.is_published = $${paramIndex++}`);
    values.push(true);
  } else if (filters.status === 'draft') {
    conditions.push(`a.is_published = $${paramIndex++}`);
    values.push(false);
  } else if (filters.status === 'overdue') {
    conditions.push(`a.due_date < NOW() AND a.is_published = $${paramIndex++}`);
    values.push(true);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM assignments a ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  values.push(filters.limit, offset);

  const { rows } = await pool.query(
    `SELECT a.* FROM assignments a ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    values,
  );

  return { assignments: rows, total };
};

export const getAssignmentById = async (id: string): Promise<(Assignment & { submission_count: number }) | null> => {
  const { rows } = await pool.query(
    `SELECT a.*,
            (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id)::int AS submission_count
     FROM assignments a
     WHERE a.id = $1`,
    [id],
  );
  return rows[0] || null;
};

export const updateAssignment = async (
  id: string,
  data: Partial<Omit<Assignment, 'id' | 'created_by' | 'created_at' | 'updated_at'>>,
): Promise<Assignment | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedKeys: (keyof typeof data)[] = [
    'course_id', 'title', 'description', 'subject', 'due_date',
    'max_score', 'is_published', 'priority',
  ];

  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return getAssignmentById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE assignments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );
  return rows[0] || null;
};

export const deleteAssignment = async (id: string): Promise<boolean> => {
  const { rowCount } = await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
};

export const getAssignmentsByCourse = async (courseId: string): Promise<Assignment[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM assignments WHERE course_id = $1 ORDER BY due_date ASC',
    [courseId],
  );
  return rows;
};

export const getAssignmentsByTeacher = async (teacherId: string): Promise<Assignment[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM assignments WHERE created_by = $1 ORDER BY created_at DESC',
    [teacherId],
  );
  return rows;
};

export const getOverdueAssignments = async (): Promise<Assignment[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM assignments
     WHERE due_date < NOW() AND is_published = true
     ORDER BY due_date DESC`,
  );
  return rows;
};

// ── Submissions ─────────────────────────────

export const createSubmission = async (data: Omit<Submission, 'submitted_at' | 'score' | 'feedback' | 'graded_by' | 'graded_at'>): Promise<Submission> => {
  const { rows } = await pool.query(
    `INSERT INTO submissions (id, assignment_id, student_id, content, file_url, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.id, data.assignment_id, data.student_id, data.content, data.file_url, data.status],
  );
  return rows[0];
};

export const getSubmissionsByAssignment = async (assignmentId: string): Promise<Submission[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM submissions WHERE assignment_id = $1 ORDER BY submitted_at DESC',
    [assignmentId],
  );
  return rows;
};

export const getSubmissionsByStudent = async (studentId: string): Promise<Submission[]> => {
  const { rows } = await pool.query(
    `SELECT s.*, a.title AS assignment_title, a.due_date, a.max_score
     FROM submissions s
     JOIN assignments a ON a.id = s.assignment_id
     WHERE s.student_id = $1
     ORDER BY s.submitted_at DESC`,
    [studentId],
  );
  return rows;
};

export const getSubmissionById = async (id: string): Promise<Submission | null> => {
  const { rows } = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
  return rows[0] || null;
};

export const gradeSubmission = async (
  id: string,
  score: number,
  feedback: string,
  gradedBy: string,
): Promise<Submission | null> => {
  const { rows } = await pool.query(
    `UPDATE submissions
     SET score = $1, feedback = $2, graded_by = $3, graded_at = NOW(), status = 'graded'
     WHERE id = $4
     RETURNING *`,
    [score, feedback, gradedBy, id],
  );
  return rows[0] || null;
};

export const getSubmissionStats = async (): Promise<{
  total_assignments: number;
  total_submissions: number;
  graded_submissions: number;
  pending_submissions: number;
  overdue_assignments: number;
  average_score: number | null;
}> => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM assignments)::int AS total_assignments,
      (SELECT COUNT(*) FROM submissions)::int AS total_submissions,
      (SELECT COUNT(*) FROM submissions WHERE status = 'graded')::int AS graded_submissions,
      (SELECT COUNT(*) FROM submissions WHERE status IN ('pending', 'submitted'))::int AS pending_submissions,
      (SELECT COUNT(*) FROM assignments WHERE due_date < NOW() AND is_published = true)::int AS overdue_assignments,
      (SELECT ROUND(AVG(score), 2) FROM submissions WHERE score IS NOT NULL) AS average_score
  `);
  return result.rows[0];
};

export default pool;
