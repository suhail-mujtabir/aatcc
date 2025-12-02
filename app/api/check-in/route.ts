import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyDeviceAuth } from '@/lib/device-auth';

/**
 * POST /api/check-in
 * ESP32 device submits NFC card UID for attendance recording
 * 
 * Request body: { cardUid: string }
 * Headers: X-Device-API-Key
 * 
 * Flow:
 * 1. Verify device authentication
 * 2. Find active event
 * 3. Lookup student by card UID
 * 4. Verify student is registered for event
 * 5. Check for duplicate check-in
 * 6. Record attendance
 * 7. Return success with student info and counts
 */
export async function POST(request: NextRequest) {
  // 1. Verify device authentication
  if (!verifyDeviceAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized device' },
      { status: 401 }
    );
  }

  try {
    const { cardUid } = await request.json();

    // Validate input
    if (!cardUid || typeof cardUid !== 'string') {
      return NextResponse.json(
        { error: 'Card UID required' },
        { status: 400 }
      );
    }

    // Validate card UID format (uppercase hex with colons)
    if (!/^[0-9A-F:]+$/i.test(cardUid)) {
      return NextResponse.json(
        { error: 'Invalid card UID format' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 2. Find active event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('status', 'active')
      .is('deleted_at', null)
      .maybeSingle();

    if (eventError) {
      console.error('Event query error:', eventError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'No active event at this time' },
        { status: 404 }
      );
    }

    // 3. Lookup student by card UID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, student_id, name')
      .eq('card_uid', cardUid.toUpperCase())
      .maybeSingle();

    if (studentError) {
      console.error('Student lookup error:', studentError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Card not registered' },
        { status: 404 }
      );
    }

    // 4. Check if student is registered for event
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id')
      .eq('student_id', student.id)
      .eq('event_id', event.id)
      .maybeSingle();

    if (regError) {
      console.error('Registration check error:', regError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Not registered for this event' },
        { status: 403 }
      );
    }

    // 5. Check for duplicate check-in
    const { data: existing, error: existingError } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', student.id)
      .eq('event_id', event.id)
      .maybeSingle();

    if (existingError) {
      console.error('Duplicate check error:', existingError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Already checked in' },
        { status: 409 }
      );
    }

    // 6. Record attendance
    const { error: insertError } = await supabase
      .from('attendance')
      .insert({
        student_id: student.id,
        event_id: event.id
      });

    if (insertError) {
      console.error('Attendance insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }

    // 7. Get attendance counts for display
    const [
      { count: attendedCount },
      { count: registeredCount }
    ] = await Promise.all([
      supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id),
      supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
    ]);

    // 8. Success response
    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        studentId: student.student_id
      },
      event: {
        name: event.name
      },
      attendedCount: attendedCount || 0,
      registeredCount: registeredCount || 0
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
