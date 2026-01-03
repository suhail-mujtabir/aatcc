import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * POST /api/admin/events/[id]/send-certificates
 * Trigger Google Apps Script webhook to send certificates to all attendees
 * 
 * Workflow:
 * 1. Verify admin authentication
 * 2. Fetch event and attendee details
 * 3. Call Google Apps Script webhook with attendee data
 * 4. Apps Script generates certificates and sends emails
 * 5. Return results to admin
 * 
 * Environment Variables Required:
 * - GOOGLE_APPS_SCRIPT_WEBHOOK_URL: Apps Script web app URL
 * - GOOGLE_APPS_SCRIPT_API_KEY: Secret key for webhook authentication
 */

// Environment variables
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
const GOOGLE_APPS_SCRIPT_KEY = process.env.GOOGLE_APPS_SCRIPT_API_KEY;

// Request timeout (5 minutes for large batches)
const REQUEST_TIMEOUT = 300000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify admin authentication (CRITICAL!)
    await requireAdmin();

    const { id: eventId } = await params;

    // 2. Verify webhook configuration
    if (!GOOGLE_APPS_SCRIPT_URL || !GOOGLE_APPS_SCRIPT_KEY) {
      console.error('[Send Certificates] Missing Google Apps Script configuration');
      return NextResponse.json(
        { 
          error: 'Certificate service not configured',
          details: 'Contact system administrator to set up Google Apps Script webhook'
        },
        { status: 503 }
      );
    }

    const supabase = createAdminClient();

    // 3. Get event details with validation
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status, start_time, end_time')
      .eq('id', eventId)
      .is('deleted_at', null)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 4. Only allow for completed events (business rule)
    if (event.status !== 'completed') {
      return NextResponse.json(
        { 
          error: 'Certificates can only be sent for completed events',
          currentStatus: event.status
        },
        { status: 400 }
      );
    }

    // 5. Get all attendees with email addresses
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        checked_in_at,
        students!inner (
          name,
          email,
          student_id
        )
      `)
      .eq('event_id', eventId)
      .not('students.email', 'is', null); // Only students with valid emails

    if (attendanceError) {
      console.error('[Send Certificates] Database error:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendees' },
        { status: 500 }
      );
    }

    if (!attendance || attendance.length === 0) {
      return NextResponse.json(
        { error: 'No attendees with email addresses found for this event' },
        { status: 404 }
      );
    }

    // 6. Fetch default certificate template from database
    const { data: template, error: templateError } = await supabase
      .from('certificate_templates')
      .select('slides_template_id, email_subject_template, email_body_doc_id')
      .eq('is_default', true)
      .single();

    if (templateError || !template) {
      console.error('[Send Certificates] Template not found:', templateError);
      return NextResponse.json(
        { 
          error: 'Certificate template not configured',
          details: 'No default certificate template found. Please configure a template in the database.',
          hint: 'Run migration 003_certificate_templates.sql and update with your template IDs'
        },
        { status: 503 }
      );
    }

    console.log(`[Send Certificates] ✅ Using automatic template from database: ${template.slides_template_id}`);

    // 7. Prepare email subject with event name interpolation
    const emailSubject = template.email_subject_template
      .replace(/\{\{event\}\}/g, event.name)
      .replace(/\{\{eventName\}\}/g, event.name);

    // 8. Format and validate attendee data
    const attendees = attendance
      .map((a: any) => ({
        name: a.students.name?.trim(),
        email: a.students.email?.toLowerCase().trim(),
        studentId: a.students.student_id,
        checkedInAt: a.checked_in_at
      }))
      .filter(a => a.name && a.email && a.email.includes('@')); // Extra validation

    if (attendees.length === 0) {
      return NextResponse.json(
        { error: 'No valid attendees found (missing names or invalid emails)' },
        { status: 400 }
      );
    }

    console.log(`[Send Certificates] Processing ${attendees.length} certificates for event: ${event.name}`);

    // 9. Call Google Apps Script webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const webhookResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: GOOGLE_APPS_SCRIPT_KEY,
          eventId: event.id,
          eventName: event.name,
          eventDate: event.start_time,
          attendees: attendees,
          
          // Certificate configuration (eliminates need for Google Sheets Config)
          certificateConfig: {
            slidesTemplateId: template.slides_template_id,
            emailSubject: emailSubject,
            emailBodyDocId: template.email_body_doc_id || null,
            // Inline HTML body if no doc ID specified
            emailBodyHtml: template.email_body_doc_id ? null : generateDefaultEmailBody(event.name)
          },
          
          origin: request.headers.get('origin') || 'https://aatcc.vercel.app',
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 10. Parse webhook response
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('[Send Certificates] Webhook error:', {
          status: webhookResponse.status,
          body: errorText
        });
        
        return NextResponse.json(
          { 
            error: 'Google Apps Script returned an error',
            details: `HTTP ${webhookResponse.status}`,
            hint: 'Check Apps Script logs for details'
          },
          { status: 500 }
        );
      }

      const result = await webhookResponse.json();

      if (!result.success) {
        console.error('[Send Certificates] Apps Script error:', result.error);
        return NextResponse.json(
          { 
            error: result.error || 'Failed to send certificates',
            details: result.details || 'Unknown error from Apps Script'
          },
          { status: 500 }
        );
      }

      // 11. Log success
      console.log(`[Send Certificates] Success:`, {
        event: event.name,
        sent: result.sent,
        failed: result.failed,
        total: attendees.length
      });

      // 12. Return detailed results
      return NextResponse.json({
        success: true,
        message: `Successfully sent ${result.sent} certificate${result.sent !== 1 ? 's' : ''}`,
        event: {
          id: event.id,
          name: event.name
        },
        results: {
          total: attendees.length,
          sent: result.sent,
          failed: result.failed
        },
        details: result.details || []
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.error('[Send Certificates] Request timeout after 5 minutes');
        return NextResponse.json(
          { 
            error: 'Request timeout',
            details: 'Certificate processing is taking longer than expected. This may happen with large batches. Please check your email or try again later.'
          },
          { status: 504 }
        );
      }

      console.error('[Send Certificates] Fetch error:', fetchError);
      throw fetchError;
    }

  } catch (error) {
    console.error('[Send Certificates] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send certificates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow longer execution time for certificate processing
export const maxDuration = 300; // 5 minutes (requires Vercel Pro, defaults to 10s on free tier)

/**
 * Generate default email body HTML template
 * Used when no custom email template document is configured
 */
function generateDefaultEmailBody(eventName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; font-size: 12px; color: #666; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          strong { color: #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Congratulations!</h1>
        </div>
        <div class="content">
          <p>Dear <strong>{{name}}</strong>,</p>
          
          <p>We are thrilled to inform you that you have successfully completed <strong>${eventName}</strong>!</p>
          
          <p>Your certificate of completion is attached to this email. This certificate recognizes your participation and commitment to learning and growth.</p>
          
          <p>Thank you for being an active member of the AATCC AUST Student Chapter. We look forward to seeing you at future events!</p>
          
          <div class="footer">
            <p><strong>Best regards,</strong><br>
            AATCC AUST Student Chapter</p>
            <p style="margin-top: 10px;">Student ID: <strong>{{studentId}}</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}
