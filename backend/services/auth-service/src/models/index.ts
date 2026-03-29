// ─── Table Creation Queries ────────────────────────────────────────────────────

export const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

export const createProfilesTable = `
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_profiles_user UNIQUE (user_id)
  );

  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NOT NULL DEFAULT '';

  CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
`;

export const createUserRolesTable = `
  CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_role UNIQUE (user_id, role)
  );

  CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
`;

export const createRefreshTokensTable = `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(1024) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked BOOLEAN DEFAULT false
  );

  ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS revoked BOOLEAN DEFAULT false;

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
`;

// ─── User Queries ──────────────────────────────────────────────────────────────

export const findUserByEmail = `
  SELECT u.id, u.email, u.password_hash, u.is_active, u.is_email_verified,
         u.created_at, u.updated_at,
         p.first_name, p.last_name, p.phone, p.avatar_url,
         ur.role
  FROM users u
  LEFT JOIN profiles p ON p.user_id = u.id
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  WHERE u.email = $1;
`;

export const findUserById = `
  SELECT u.id, u.email, u.is_active, u.is_email_verified,
         u.created_at, u.updated_at,
         p.first_name, p.last_name, p.phone, p.avatar_url,
         ur.role
  FROM users u
  LEFT JOIN profiles p ON p.user_id = u.id
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  WHERE u.id = $1;
`;

export const createUser = `
  INSERT INTO users (email, password_hash)
  VALUES ($1, $2)
  RETURNING id, email, is_active, is_email_verified, created_at, updated_at;
`;

export const createProfile = `
  INSERT INTO profiles (user_id, first_name, last_name, full_name, phone)
  VALUES ($1, $2, $3, CONCAT($2, ' ', $3), $4)
  RETURNING id, user_id, first_name, last_name, full_name, phone, avatar_url, created_at;
`;

export const createUserRole = `
  INSERT INTO user_roles (user_id, role)
  VALUES ($1, $2)
  RETURNING id, user_id, role, assigned_at;
`;

export const updateUserPassword = `
  UPDATE users
  SET password_hash = $2, updated_at = NOW()
  WHERE id = $1
  RETURNING id, email, updated_at;
`;

// ─── Refresh Token Queries ─────────────────────────────────────────────────────

export const createRefreshToken = `
  INSERT INTO refresh_tokens (user_id, token, expires_at)
  VALUES ($1, $2, $3)
  RETURNING id, user_id, token, expires_at, created_at;
`;

export const findRefreshTokenByToken = `
  SELECT rt.id, rt.user_id, rt.token, rt.expires_at, rt.created_at, rt.revoked,
         u.email, u.is_active,
         ur.role
  FROM refresh_tokens rt
  JOIN users u ON u.id = rt.user_id
  LEFT JOIN user_roles ur ON ur.user_id = rt.user_id
  WHERE rt.token = $1 AND rt.revoked = false;
`;

export const deleteRefreshTokenByToken = `
  UPDATE refresh_tokens
  SET revoked = true
  WHERE token = $1;
`;

export const deleteAllRefreshTokensForUser = `
  UPDATE refresh_tokens
  SET revoked = true
  WHERE user_id = $1;
`;
