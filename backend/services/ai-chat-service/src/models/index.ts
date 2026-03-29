export const CREATE_CHAT_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) DEFAULT 'New Chat',
    subject VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

export const CREATE_CHAT_MESSAGES_TABLE = `
  CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

export const queries = {
  createSession: `
    INSERT INTO chat_sessions (id, user_id, title, subject)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,

  getSessionsByUser: `
    SELECT cs.*,
      (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count,
      (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM chat_sessions cs
    WHERE cs.user_id = $1
    ORDER BY cs.updated_at DESC
    LIMIT $2 OFFSET $3`,

  getSessionById: `
    SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2`,

  addMessage: `
    INSERT INTO chat_messages (id, session_id, role, content)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,

  getMessagesBySession: `
    SELECT * FROM chat_messages
    WHERE session_id = $1
    ORDER BY created_at ASC
    LIMIT $2 OFFSET $3`,

  deleteSession: `
    DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id`,

  updateSessionTitle: `
    UPDATE chat_sessions SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,

  updateSessionSubject: `
    UPDATE chat_sessions SET subject = $1, updated_at = NOW() WHERE id = $2`,

  countUserSessions: `
    SELECT COUNT(*) FROM chat_sessions WHERE user_id = $1`,
};
