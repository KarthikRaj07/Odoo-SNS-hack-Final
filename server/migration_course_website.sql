-- Migration to add website column to courses and duration column to lessons
ALTER TABLE courses ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '00:00:00';
