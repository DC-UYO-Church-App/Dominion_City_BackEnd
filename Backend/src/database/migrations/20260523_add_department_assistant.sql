ALTER TABLE departments ADD COLUMN IF NOT EXISTS assistant_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_departments_assistant ON departments(assistant_id);
