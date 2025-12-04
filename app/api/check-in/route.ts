import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * POST /api/check-in
 * ESP32 device submits NFC card UID for attendance recording
 * 
 * No authentication required (public endpoint for ESP32)
 * 
 * Request body: { uid: string, eventId: string, deviceId?: string }
 * 
 * Flow:
 * 1. Validate event ID (ensure event is still active)
 * 2. Lookup student by card UID
 * 3. Verify student is registered for event
 * 4. Check for duplicate check-in
 * 5. Record attendance
 * 6. Return success with student info
 */
export async function POST(request: NextRequest) {
  try {
    const { uid, eventId, deviceId } = await request.json();

    // Validate input
    if (!uid || typeof uid !== 'string') {
      return NextResponse.json(
        { error: 'Card UID required' },
        { status: 400 }
      );
    }

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Event ID required' },
        { status: 400 }
      );
    }

    // Validate card UID format (uppercase hex with colons)
    if (!/^[0-9A-F:]+$/i.test(uid)) {
      return NextResponse.json(
        { error: 'Invalid card UID format' },
        { status: 400 }
      );
    }

    const formattedUid = uid.toUpperCase();
    const supabase = createAdminClient();

    // 1. Verify event is still active (quick validation)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .maybeSingle();

    if (eventError) {
      console.error('[Check-in] Event validation error:', {
        eventId,
        error: eventError.message
      });
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or no longer active' },
        { status: 404 }
      );
    }

    // 2. Lookup student by card UID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, student_id, name')
      .eq('card_uid', formattedUid)
      .maybeSingle();

    if (studentError) {
      console.error('[Check-in] Student lookup error:', {
        uid: formattedUid,
        error: studentError.message
      });
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

    // 3. Check if student is registered for event
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id')
      .eq('student_id', student.id)
      .eq('event_id', event.id)
      .maybeSingle();

    if (regError) {
      console.error('[Check-in] Registration check error:', {
        studentId: student.id,
        eventId: event.id,
        error: regError.message
      });
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

    // 4. Check for duplicate check-in
    const { data: existing, error: existingError } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', student.id)
      .eq('event_id', event.id)
      .maybeSingle();

    if (existingError) {
      console.error('[Check-in] Duplicate check error:', {
        studentId: student.id,
        eventId: event.id,
        error: existingError.message
      });
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

    // 5. Record attendance
    const { error: insertError } = await supabase
      .from('attendance')
      .insert({
        student_id: student.id,
        event_id: event.id
      });

    if (insertError) {
      console.error('[Check-in] Attendance insert error:', {
        studentId: student.id,
        eventId: event.id,
        error: insertError.message
      });
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }

    // Success response - ESP32 only needs student info
    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        studentId: student.student_id
      },
      event: {
        name: event.name
      }
    });

  } catch (error) {
    console.error('[Check-in] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Use Edge runtime for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
