CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  teacher_id UUID REFERENCES users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration VARCHAR(50) NOT NULL,
  youtube_id VARCHAR(20) NOT NULL,
  thumbnail_url TEXT,
  views_count INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recordings_subject ON recordings(subject);
CREATE INDEX idx_recordings_teacher ON recordings(teacher_id);
CREATE INDEX idx_recordings_course ON recordings(course_id);
CREATE INDEX idx_recordings_title_trgm ON recordings USING gin(title gin_trgm_ops);

CREATE TRIGGER recordings_updated_at BEFORE UPDATE ON recordings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
