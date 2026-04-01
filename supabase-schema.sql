-- Bible Daily - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  notification_times TEXT[] DEFAULT ARRAY['morning', 'evening'],
  ntfy_topic TEXT NOT NULL,
  timezone TEXT DEFAULT 'America/Chicago',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reading log table
CREATE TABLE IF NOT EXISTS reading_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  reference TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  day_number INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Unique constraint: one entry per user per date
  UNIQUE(user_id, date)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_log_user_id ON reading_log(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_log_date ON reading_log(date);
CREATE INDEX IF NOT EXISTS idx_reading_log_user_date ON reading_log(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_log ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings (allow users to manage their own settings)
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (true);

-- Policies for reading_log
CREATE POLICY "Users can view their own reading log" ON reading_log
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reading log" ON reading_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reading log" ON reading_log
  FOR UPDATE USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
