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
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL DEFAULT '',
        avatar_url TEXT,
        bio TEXT,
        phone VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        assigned_by UUID
      );

      CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
    `);
    console.log('[user-service] Database tables ensured');
  } finally {
    client.release();
  }
};

// ─── Profile Operations ────────────────────────────────────────────────────────

export const ProfileModel = {
  async findByUserId(userId: string) {
    const result = await pool.query(
      `SELECT p.*, ur.role
       FROM profiles p
       LEFT JOIN user_roles ur ON ur.user_id = p.user_id
       WHERE p.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async findAll(page: number, limit: number, sortBy = 'created_at', sortOrder = 'desc') {
    const offset = (page - 1) * limit;
    const allowedSorts = ['created_at', 'full_name', 'updated_at'];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await pool.query('SELECT COUNT(*) FROM profiles');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT p.*, ur.role
       FROM profiles p
       LEFT JOIN user_roles ur ON ur.user_id = p.user_id
       ORDER BY p.${safeSort} ${safeOrder}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { profiles: result.rows, total };
  },

  async update(userId: string, data: { full_name?: string; avatar_url?: string; bio?: string; phone?: string }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.full_name !== undefined) {
      fields.push(`full_name = $${paramIndex++}`);
      values.push(data.full_name);
    }
    if (data.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(data.avatar_url);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await pool.query(
      `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async getStats() {
    const result = await pool.query(
      `SELECT
         COUNT(*) as total_users,
         COUNT(*) FILTER (WHERE ur.role = 'admin') as admin_count,
         COUNT(*) FILTER (WHERE ur.role = 'teacher') as teacher_count,
         COUNT(*) FILTER (WHERE ur.role = 'student') as student_count
       FROM profiles p
       LEFT JOIN user_roles ur ON ur.user_id = p.user_id`
    );
    return result.rows[0];
  },

  async search(query: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM profiles p
       WHERE p.full_name ILIKE $1`,
      [searchPattern]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT p.*, ur.role
       FROM profiles p
       LEFT JOIN user_roles ur ON ur.user_id = p.user_id
       WHERE p.full_name ILIKE $1
       ORDER BY p.full_name ASC
       LIMIT $2 OFFSET $3`,
      [searchPattern, limit, offset]
    );

    return { profiles: result.rows, total };
  },

  async create(userId: string, fullName: string) {
    const result = await pool.query(
      `INSERT INTO profiles (user_id, full_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId, fullName]
    );
    return result.rows[0] || null;
  },

  async softDelete(userId: string) {
    const result = await pool.query(
      `UPDATE profiles SET full_name = '[deleted]', avatar_url = NULL, bio = NULL, phone = NULL, updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [userId]
    );
    return result.rows[0] || null;
  },
};

// ─── User Role Operations ──────────────────────────────────────────────────────

export const UserRoleModel = {
  async findByUserId(userId: string) {
    const result = await pool.query(
      'SELECT * FROM user_roles WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  async update(userId: string, role: string, assignedBy?: string) {
    const result = await pool.query(
      `INSERT INTO user_roles (user_id, role, assigned_by, assigned_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET role = $2, assigned_by = $3, assigned_at = NOW()
       RETURNING *`,
      [userId, role, assignedBy || null]
    );
    return result.rows[0] || null;
  },
};

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

export const DashboardModel = {
  async getTotalUsers() {
    const result = await pool.query('SELECT COUNT(*) FROM profiles');
    return parseInt(result.rows[0].count, 10);
  },

  async getUsersByRole() {
    const result = await pool.query(
      `SELECT ur.role, COUNT(*) as count
       FROM user_roles ur
       GROUP BY ur.role
       ORDER BY ur.role`
    );
    return result.rows;
  },

  async getRecentUsers(limit = 10) {
    const result = await pool.query(
      `SELECT p.*, ur.role
       FROM profiles p
       LEFT JOIN user_roles ur ON ur.user_id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};

export { pool };
