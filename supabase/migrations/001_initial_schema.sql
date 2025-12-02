-- ============================================================
-- NFC Attendance System - Initial Database Schema
-- Migration: 001
-- Created: December 2, 2025
-- ============================================================

-- ============================================================
-- 1. STUDENTS TABLE
-- ============================================================
-- Students table (main user accounts)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL, -- Format: YY-SS-NNN (e.g., "23-01-002")
  name TEXT NOT NULL,
  email TEXT UNIQUE, -- Optional, for password reset
  password_hash TEXT NOT NULL, -- Managed by Supabase Auth
  card_uid TEXT UNIQUE, -- NFC card UID (assigned during activation)
  bio TEXT DEFAULT '', -- Student-editable profile bio
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast card UID lookups during check-in
CREATE INDEX idx_students_card_uid ON students(card_uid);

-- Index for student_id lookups during login
CREATE INDEX idx_students_student_id ON students(student_id);

-- Trigger function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on students table
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. ADMINS TABLE
-- ============================================================
-- Admins table (separate credentials for admin access)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT UNIQUE NOT NULL, -- Admin username (e.g., "admin001")
  password_hash TEXT NOT NULL, -- Hashed password
  name TEXT NOT NULL, -- Admin's full name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Default admin account should be created via API route with proper password hashing
-- Never store plaintext passwords in SQL files

-- ============================================================
-- 3. EVENTS TABLE
-- ============================================================
-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')),
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL, -- Admin who created it
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes for querying events
CREATE INDEX idx_events_status ON events(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_start_time ON events(start_time) WHERE deleted_at IS NULL;

-- Ensure only one active event at a time (business rule)
CREATE UNIQUE INDEX idx_one_active_event ON events(status) 
  WHERE status = 'active' AND deleted_at IS NULL;

-- ============================================================
-- 4. REGISTRATIONS TABLE
-- ============================================================
-- Event registrations (who signed up for which event)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, event_id) -- Prevent duplicate registrations
);

-- Composite index for fast lookups
CREATE INDEX idx_registrations_student_event ON registrations(student_id, event_id);

-- ============================================================
-- 5. ATTENDANCE TABLE
-- ============================================================
-- Attendance records (who checked in to which event)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, event_id) -- Prevent duplicate check-ins
);

-- Composite index for fast lookups
CREATE INDEX idx_attendance_student_event ON attendance(student_id, event_id);
CREATE INDEX idx_attendance_event ON attendance(event_id); -- For counting attendees per event

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable Row Level Security on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Students Table Policies
-- ============================================================
-- Students can only read/update their own data
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Note: Admins can view all students via service role key (bypasses RLS)

-- ============================================================
-- Events Table Policies
-- ============================================================
-- Anyone can view non-deleted events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (deleted_at IS NULL);

-- Note: Only admins can insert/update/delete events (via service role key)

-- ============================================================
-- Registrations Table Policies
-- ============================================================
-- Students can view their own registrations
CREATE POLICY "Students can view own registrations"
  ON registrations FOR SELECT
  USING (auth.uid()::text = student_id::text);

-- Students can register themselves for events
CREATE POLICY "Students can create own registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid()::text = student_id::text);

-- Students can delete their own registrations
CREATE POLICY "Students can delete own registrations"
  ON registrations FOR DELETE
  USING (auth.uid()::text = student_id::text);

-- ============================================================
-- Attendance Table Policies
-- ============================================================
-- Students can view their own attendance
CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  USING (auth.uid()::text = student_id::text);

-- Note: Attendance records are created via API routes using service role key
-- (to prevent spoofing - only NFC device can create attendance records)

-- ============================================================
-- ADMIN TABLE POLICIES
-- ============================================================
-- Admins table is only accessible via service role key
-- No policies needed - service role bypasses RLS

-- ============================================================
-- END OF MIGRATION
-- ============================================================
