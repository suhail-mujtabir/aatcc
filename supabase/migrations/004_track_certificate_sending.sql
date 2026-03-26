-- Migration: Track certificate sending status
-- Add timestamp to track when certificates were sent to attendees

-- Add certificate_sent_at column to attendance table
ALTER TABLE attendance
ADD COLUMN certificates_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for faster queries
CREATE INDEX idx_attendance_certificates_sent 
  ON attendance (event_id, certificates_sent_at);

-- Add comment
COMMENT ON COLUMN attendance.certificates_sent_at IS 
  'Timestamp when certificate was sent to this attendee. NULL means not sent yet.';

-- Query to check certificate sending status for an event
-- Example: SELECT student_id, certificates_sent_at IS NOT NULL as certificate_sent FROM attendance WHERE event_id = 'event-uuid';
