-- Add settings column to lessons table for storing quiz configuration (rewards, etc.)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
