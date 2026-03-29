-- ==============================================
-- TEACHERS
-- ==============================================
INSERT INTO users (id, email, password_hash, is_active, is_email_verified) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'teacher1@edutrack.com', 'placeholder_hash:teacher1', true, true),
  ('b0000000-0000-0000-0000-000000000002', 'teacher2@edutrack.com', 'placeholder_hash:teacher2', true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, full_name) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Ms. Anderson'),
  ('b0000000-0000-0000-0000-000000000002', 'Mr. Sharma')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'teacher'),
  ('b0000000-0000-0000-0000-000000000002', 'teacher')
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- STUDENTS
-- ==============================================
INSERT INTO users (id, email, password_hash, is_active, is_email_verified) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'student1@edutrack.com', 'placeholder_hash:student1', true, true),
  ('c0000000-0000-0000-0000-000000000002', 'student2@edutrack.com', 'placeholder_hash:student2', true, true),
  ('c0000000-0000-0000-0000-000000000003', 'student3@edutrack.com', 'placeholder_hash:student3', true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, full_name, grade_level) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Alice Johnson', '10'),
  ('c0000000-0000-0000-0000-000000000002', 'Bob Smith', '9'),
  ('c0000000-0000-0000-0000-000000000003', 'Charlie Brown', '10')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'student'),
  ('c0000000-0000-0000-0000-000000000002', 'student'),
  ('c0000000-0000-0000-0000-000000000003', 'student')
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- COURSES
-- ==============================================
INSERT INTO courses (id, title, description, subject, teacher_id, grade_level, is_published, max_students) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Mathematics', 'Complete Grade 10 Mathematics covering algebra, geometry, trigonometry, and statistics.', 'Mathematics', 'b0000000-0000-0000-0000-000000000001', '10', true, 50),
  ('d0000000-0000-0000-0000-000000000002', 'Physics', 'Fundamentals of physics including mechanics, thermodynamics, waves, and optics.', 'Physics', 'b0000000-0000-0000-0000-000000000002', '10', true, 40),
  ('d0000000-0000-0000-0000-000000000003', 'Chemistry', 'Inorganic and organic chemistry fundamentals for Grade 10.', 'Chemistry', 'b0000000-0000-0000-0000-000000000001', '10', true, 35),
  ('d0000000-0000-0000-0000-000000000004', 'English Literature', 'Shakespeare, poetry analysis, essay writing, and critical thinking.', 'English', 'b0000000-0000-0000-0000-000000000002', '10', true, 45)
ON CONFLICT DO NOTHING;

-- ==============================================
-- LESSONS (2 per course)
-- ==============================================
INSERT INTO lessons (id, course_id, title, description, order_index, duration, is_published) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Introduction to Quadratic Equations', 'Learn the standard form and methods to solve quadratic equations.', 1, '45 min', true),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Trigonometry Basics', 'SOH-CAH-TOA and trigonometric identities.', 2, '50 min', true),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Newton''s Laws of Motion', 'First, second, and third laws with real-world examples.', 1, '45 min', true),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'Electricity and Circuits', 'Ohm''s law, series and parallel circuits.', 2, '50 min', true),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'Chemical Bonding', 'Ionic, covalent, and metallic bonding explained.', 1, '40 min', true),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'Acids, Bases and pH', 'Understanding the pH scale and neutralization reactions.', 2, '40 min', true),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000004', 'Shakespeare''s Themes', 'Major themes across Shakespeare''s works.', 1, '45 min', true),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000004', 'Essay Writing Techniques', 'Structure, argumentation, and style in academic essays.', 2, '45 min', true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- ENROLLMENTS
-- ==============================================
INSERT INTO course_enrollments (course_id, student_id, progress, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 72, 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 58, 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 85, 'active'),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 45, 'active'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 60, 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 30, 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 90, 'active')
ON CONFLICT DO NOTHING;

-- ==============================================
-- ASSIGNMENTS
-- ==============================================
INSERT INTO assignments (id, course_id, title, description, subject, due_date, max_score, priority, created_by) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Quadratic Equations Problem Set', 'Solve 10 quadratic equations using factoring and the quadratic formula.', 'Mathematics', '2026-04-01', 100, 'high', 'b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Newton''s Laws Lab Report', 'Write a lab report based on the Newton''s laws experiment.', 'Physics', '2026-04-03', 100, 'medium', 'b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Chemical Bonding Worksheet', 'Complete the chemical bonding identification worksheet.', 'Chemistry', '2026-04-05', 50, 'low', 'b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'Essay: Shakespeare''s Themes', 'Write a 500-word essay on a major theme in any Shakespeare play.', 'English', '2026-03-28', 100, 'high', 'b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'Trigonometry Practice', 'Complete exercises on trigonometric ratios and identities.', 'Mathematics', '2026-04-07', 80, 'medium', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ==============================================
-- MEETINGS
-- ==============================================
INSERT INTO meetings (id, title, description, teacher_id, teacher_name, date, time, duration, meet_link, max_students, status, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Physics Live Session', 'Covering Newton''s laws with practice problems.', 'b0000000-0000-0000-0000-000000000002', 'Mr. Sharma', '2026-03-25', '10:00 AM', '60 min', 'https://meet.google.com/abc-def-ghi', 40, 'upcoming', 'a0000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Math Doubt Clearing', 'Open session for quadratic equation doubts.', 'b0000000-0000-0000-0000-000000000001', 'Ms. Anderson', '2026-03-21', '2:00 PM', '45 min', 'https://meet.google.com/jkl-mno-pqr', 50, 'live', 'a0000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Chemistry Revision', 'Revision session for chemical bonding chapter.', 'b0000000-0000-0000-0000-000000000001', 'Ms. Anderson', '2026-03-18', '11:00 AM', '45 min', 'https://meet.google.com/stu-vwx-yza', 35, 'completed', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ==============================================
-- RECORDINGS (using common educational YouTube videos)
-- ==============================================
INSERT INTO recordings (id, title, description, subject, teacher_name, teacher_id, duration, youtube_id, is_published, course_id, created_by) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Introduction to Quadratic Equations', 'Complete lesson on solving quadratic equations.', 'Mathematics', 'Ms. Anderson', 'b0000000-0000-0000-0000-000000000001', '45 min', 'HKGcGhON5KI', true, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Newton''s Laws Explained', 'Visual explanation of all three laws of motion.', 'Physics', 'Mr. Sharma', 'b0000000-0000-0000-0000-000000000002', '38 min', 'kKKM8Y-u7ds', true, 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Chemical Bonding Masterclass', 'Ionic, covalent, and metallic bonding in detail.', 'Chemistry', 'Ms. Anderson', 'b0000000-0000-0000-0000-000000000001', '42 min', 'CGA8sRwqIFg', true, 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000004', 'Shakespeare''s Greatest Plays', 'Overview of major themes in Shakespeare.', 'English', 'Mr. Sharma', 'b0000000-0000-0000-0000-000000000002', '35 min', 'VjXFoZOBGsk', true, 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
