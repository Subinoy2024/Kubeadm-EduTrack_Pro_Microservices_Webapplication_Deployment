-- Seed admin user
-- Password: Admin@123456 (hashed with scrypt)
INSERT INTO users (id, email, password_hash, is_active, is_email_verified)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@edutrack.com',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855:admin_placeholder',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, full_name)
VALUES ('a0000000-0000-0000-0000-000000000001', 'System Admin')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT (user_id) DO NOTHING;
