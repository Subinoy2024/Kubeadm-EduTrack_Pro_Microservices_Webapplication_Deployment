CREATE TABLE IF NOT EXISTS recording_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  watch_duration INT DEFAULT 0
);

CREATE INDEX idx_recording_views_recording ON recording_views(recording_id);
CREATE INDEX idx_recording_views_student ON recording_views(student_id);
