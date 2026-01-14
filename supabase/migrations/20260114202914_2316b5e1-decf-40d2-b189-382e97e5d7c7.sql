-- Add featured column for homepage display
ALTER TABLE courses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;