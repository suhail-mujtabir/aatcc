-- Migration: Add certificate_templates table for automatic certificate distribution
-- This eliminates the need for manual Google Sheets configuration per event

-- Create certificate_templates table
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slides_template_id TEXT NOT NULL,
  email_subject_template TEXT NOT NULL,
  email_body_doc_id TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default template exists at a time
CREATE UNIQUE INDEX idx_one_default_template 
  ON certificate_templates (is_default) 
  WHERE is_default = true;

-- Add comment for clarity
COMMENT ON TABLE certificate_templates IS 'Stores certificate template configurations. Email subject and body support {{name}}, {{event}}, {{date}} placeholders.';
COMMENT ON COLUMN certificate_templates.slides_template_id IS 'Google Slides template ID from URL: docs.google.com/presentation/d/{THIS_ID}/edit';
COMMENT ON COLUMN certificate_templates.email_body_doc_id IS 'Optional Google Docs ID for email body. If NULL, inline HTML template will be used.';
COMMENT ON COLUMN certificate_templates.is_default IS 'Only one template can be marked as default. Used for all events unless overridden.';

-- Seed default template (Update these values with your actual template IDs)
-- Get slides_template_id from: https://docs.google.com/presentation/d/YOUR_ID_HERE/edit
-- Get email_body_doc_id from: https://docs.google.com/document/d/YOUR_ID_HERE/edit (optional)
INSERT INTO certificate_templates (
  name, 
  description,
  slides_template_id, 
  email_subject_template, 
  email_body_doc_id,
  is_default
) VALUES (
  'Default Event Certificate',
  'Standard certificate template used for all events',
  '1__fQ2Nt-FlBzb0xsabGEZRm0HxhVLBlN0JqorT3msnY', -- Replace with your Slides template ID
  'Certificate of Completion: {{event}}', -- {{event}} will be replaced with actual event name
  NULL, -- Set to your Google Docs ID if you have an email template, or leave NULL for inline HTML
  true
);

-- Grant access to authenticated users (admin only in practice via RLS)
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can read templates (service role for API)
CREATE POLICY "Allow service role to read certificate templates"
  ON certificate_templates
  FOR SELECT
  TO service_role
  USING (true);

-- Verify the default template was created
DO $$
DECLARE
  template_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO template_count FROM certificate_templates WHERE is_default = true;
  IF template_count = 0 THEN
    RAISE EXCEPTION 'Default certificate template was not created!';
  END IF;
  RAISE NOTICE 'Certificate templates table created successfully with % default template(s)', template_count;
END $$;
