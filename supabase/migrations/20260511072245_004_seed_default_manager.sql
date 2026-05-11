/*
  # Seed default manager if table is empty

  1. Data
    - Insert default admin manager: username "admin", password "admin123"
    - Only inserted if managers table has zero rows
    - Ensures manager login works on fresh deployments

  2. Security
    - No RLS changes
    - Default credentials should be changed after first login

  3. Important Notes
    1) This seed is idempotent — only runs when table is empty
    2) Password is stored as plaintext matching the current auth flow
       (the app uses password_hash field with direct comparison)
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM managers LIMIT 1) THEN
    INSERT INTO managers (username, password_hash, display_name)
    VALUES ('admin', 'admin123', 'Admin');
  END IF;
END $$;
