import { Pool } from 'pg';
import { config } from '../config/index.js';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

// ─── Table Creation ────────────────────────────────────────────────────────────

export const createTables = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        subject VARCHAR(100),
        teacher_id UUID NOT NULL,
        grade_level VARCHAR(50),
        thumbnail_url TEXT,
        is_published BOOLEAN NOT NULL DEFAULT false,
        max_students INT DEFAULT 50,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
      CREATE INDEX IF NOT EXISTS idx_courses_grade_level ON courses(grade_level);
      CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
      CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

      CREATE TABLE IF NOT EXISTS course_enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        student_id UUID NOT NULL,
        enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
        UNIQUE(course_id, student_id)
      );

      CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON course_enrollments(student_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);

      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        content TEXT,
        order_index INT NOT NULL DEFAULT 0,
        duration INT DEFAULT 0,
        video_url TEXT,
        is_published BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(course_id, order_index);
    `);
    console.log('[course-service] Database tables ensured');
  } finally {
    client.release();
  }
};

// ─── Course Operations ─────────────────────────────────────────────────────────

export const CourseModel = {
  async create(data: {
    title: string;
    description?: string;
    subject?: string;
    teacher_id: string;
    grade_level?: string;
    thumbnail_url?: string;
    is_published?: boolean;
    max_students?: number;
  }) {
    const result = await pool.query(
      `INSERT INTO courses (title, description, subject, teacher_id, grade_level, thumbnail_url, is_published, max_students)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.title,
        data.description || null,
        data.subject || null,
        data.teacher_id,
        data.grade_level || null,
        data.thumbnail_url || null,
        data.is_published || false,
        data.max_students || 50,
      ]
    );
    return result.rows[0];
  },

  async findAll(
    page: number,
    limit: number,
    filters: { subject?: string; grade_level?: string; teacher_id?: string; is_published?: boolean }
  ) {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.subject) {
      conditions.push(`c.subject = $${paramIndex++}`);
      values.push(filters.subject);
    }
    if (filters.grade_level) {
      conditions.push(`c.grade_level = $${paramIndex++}`);
      values.push(filters.grade_level);
    }
    if (filters.teacher_id) {
      conditions.push(`c.teacher_id = $${paramIndex++}`);
      values.push(filters.teacher_id);
    }
    if (filters.is_published !== undefined) {
      conditions.push(`c.is_published = $${paramIndex++}`);
      values.push(filters.is_published);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM courses c ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const result = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.status = 'active') as enrollment_count
       FROM courses c
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );

    return { courses: result.rows, total };
  },

  async findById(id: string) {
    const result = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.status = 'active') as enrollment_count
       FROM courses c
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByTeacher(teacherId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM courses WHERE teacher_id = $1',
      [teacherId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.status = 'active') as enrollment_count
       FROM courses c
       WHERE c.teacher_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [teacherId, limit, offset]
    );

    return { courses: result.rows, total };
  },

  async update(id: string, data: {
    title?: string;
    description?: string;
    subject?: string;
    grade_level?: string;
    thumbnail_url?: string;
    is_published?: boolean;
    max_students?: number;
  }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(data.description); }
    if (data.subject !== undefined) { fields.push(`subject = $${paramIndex++}`); values.push(data.subject); }
    if (data.grade_level !== undefined) { fields.push(`grade_level = $${paramIndex++}`); values.push(data.grade_level); }
    if (data.thumbnail_url !== undefined) { fields.push(`thumbnail_url = $${paramIndex++}`); values.push(data.thumbnail_url); }
    if (data.is_published !== undefined) { fields.push(`is_published = $${paramIndex++}`); values.push(data.is_published); }
    if (data.max_students !== undefined) { fields.push(`max_students = $${paramIndex++}`); values.push(data.max_students); }

    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      `UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: string) {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM courses WHERE is_published = true) as published_courses,
        (SELECT COUNT(*) FROM course_enrollments WHERE status = 'active') as active_enrollments,
        (SELECT COUNT(*) FROM course_enrollments WHERE status = 'completed') as completed_enrollments,
        (SELECT COUNT(DISTINCT student_id) FROM course_enrollments) as total_students_enrolled,
        (SELECT COUNT(DISTINCT teacher_id) FROM courses) as total_teachers,
        (SELECT COUNT(*) FROM lessons) as total_lessons
    `);
    return result.rows[0];
  },
};

// ─── Enrollment Operations ─────────────────────────────────────────────────────

export const EnrollmentModel = {
  async enroll(courseId: string, studentId: string) {
    const result = await pool.query(
      `INSERT INTO course_enrollments (course_id, student_id, status, progress)
       VALUES ($1, $2, 'active', 0)
       ON CONFLICT (course_id, student_id) DO UPDATE SET status = 'active', enrolled_at = NOW()
       RETURNING *`,
      [courseId, studentId]
    );
    return result.rows[0];
  },

  async unenroll(courseId: string, studentId: string) {
    const result = await pool.query(
      `UPDATE course_enrollments SET status = 'dropped'
       WHERE course_id = $1 AND student_id = $2
       RETURNING *`,
      [courseId, studentId]
    );
    return result.rows[0] || null;
  },

  async findByStudent(studentId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM course_enrollments WHERE student_id = $1 AND status != $2',
      [studentId, 'dropped']
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT ce.*, c.title, c.description, c.subject, c.grade_level, c.thumbnail_url, c.teacher_id
       FROM course_enrollments ce
       JOIN courses c ON c.id = ce.course_id
       WHERE ce.student_id = $1 AND ce.status != 'dropped'
       ORDER BY ce.enrolled_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
    );

    return { enrollments: result.rows, total };
  },

  async updateProgress(courseId: string, studentId: string, progress: number) {
    const status = progress >= 100 ? 'completed' : 'active';
    const result = await pool.query(
      `UPDATE course_enrollments SET progress = $1, status = $2
       WHERE course_id = $3 AND student_id = $4
       RETURNING *`,
      [progress, status, courseId, studentId]
    );
    return result.rows[0] || null;
  },

  async findEnrollment(courseId: string, studentId: string) {
    const result = await pool.query(
      'SELECT * FROM course_enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );
    return result.rows[0] || null;
  },

  async getEnrollmentCount(courseId: string) {
    const result = await pool.query(
      "SELECT COUNT(*) FROM course_enrollments WHERE course_id = $1 AND status = 'active'",
      [courseId]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

// ─── Lesson Operations ─────────────────────────────────────────────────────────

export const LessonModel = {
  async create(data: {
    course_id: string;
    title: string;
    description?: string;
    content?: string;
    order_index?: number;
    duration?: number;
    video_url?: string;
    is_published?: boolean;
  }) {
    // Auto-calculate order_index if not provided
    let orderIndex = data.order_index;
    if (orderIndex === undefined) {
      const maxResult = await pool.query(
        'SELECT COALESCE(MAX(order_index), -1) + 1 as next_index FROM lessons WHERE course_id = $1',
        [data.course_id]
      );
      orderIndex = maxResult.rows[0].next_index;
    }

    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, description, content, order_index, duration, video_url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.course_id,
        data.title,
        data.description || null,
        data.content || null,
        orderIndex,
        data.duration || 0,
        data.video_url || null,
        data.is_published || false,
      ]
    );
    return result.rows[0];
  },

  async findByCourse(courseId: string) {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [courseId]
    );
    return result.rows;
  },

  async findById(lessonId: string) {
    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [lessonId]);
    return result.rows[0] || null;
  },

  async update(lessonId: string, data: {
    title?: string;
    description?: string;
    content?: string;
    order_index?: number;
    duration?: number;
    video_url?: string;
    is_published?: boolean;
  }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(data.description); }
    if (data.content !== undefined) { fields.push(`content = $${paramIndex++}`); values.push(data.content); }
    if (data.order_index !== undefined) { fields.push(`order_index = $${paramIndex++}`); values.push(data.order_index); }
    if (data.duration !== undefined) { fields.push(`duration = $${paramIndex++}`); values.push(data.duration); }
    if (data.video_url !== undefined) { fields.push(`video_url = $${paramIndex++}`); values.push(data.video_url); }
    if (data.is_published !== undefined) { fields.push(`is_published = $${paramIndex++}`); values.push(data.is_published); }

    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');
    values.push(lessonId);

    const result = await pool.query(
      `UPDATE lessons SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(lessonId: string) {
    const result = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING *', [lessonId]);
    return result.rows[0] || null;
  },
};

export { pool };
