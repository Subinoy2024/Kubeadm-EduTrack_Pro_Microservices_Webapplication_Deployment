CREATE TYPE meeting_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES users(id),
  teacher_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  meet_link TEXT NOT NULL,
  max_students INT DEFAULT 100,
  status meeting_status NOT NULL DEFAULT 'upcoming',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_teacher ON meetings(teacher_id);
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_meetings_status ON meetings(status);

CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON meetings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
