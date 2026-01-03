import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/admin/events/[id]/attendance
 * Fetch attendance records for an event with student details
 * 
 * Used for:
 * - Viewing attendee list in admin dashboard
 * - Downloading CSV reports
 * - Preparing data for certificate sending
 * 
 * Returns: Array of attendees with name, email, student_id, checked_in_at
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const { id: eventId } = await params;

    // Validate event ID format (UUID)
    if (!eventId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, description, start_time, end_time, status')
      .eq('id', eventId)
      .is('deleted_at', null)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 2. Fetch attendance records with student details
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        id,
        checked_in_at,
        students (
          id,
          student_id,
          name,
          email
        )
      `)
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: true });

    if (attendanceError) {
      console.error('[Attendance] Query error:', {
        eventId,
        error: attendanceError.message
      });
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    // 3. Format response
    const attendees = (attendance || []).map((record: any) => ({
      id: record.id,
      studentId: record.students.student_id,
      name: record.students.name,
      email: record.students.email || null,
      checkedInAt: record.checked_in_at
    }));

    // 4. Return data
    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        status: event.status
      },
      attendees,
      totalAttendees: attendees.length
    });

  } catch (error) {
    console.error('[Attendance] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
