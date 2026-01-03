import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyDeviceAuth } from '@/lib/device-auth';

/**
 * POST /api/check-in
 * ESP32 device bulk uploads attendance records after event (offline mode)
 * 
 * Requires device authentication via X-Device-API-Key header
 * 
 * Headers: X-Device-API-Key
 * 
 * Request body: { 
 *   eventId: string, 
 *   uids: string[],
 *   deviceId?: string 
 * }
 * 
 * Flow:
 * 1. Validate event ID (ensure event is still active)
 * 2. Lookup all students by card UIDs (batch query)
 * 3. Verify students are registered for event (batch query)
 * 4. Bulk insert attendance records with duplicate handling
 * 5. Return detailed results (inserted/skipped/failed per UID)
 * 
 * Note: This endpoint is idempotent - safe to retry on network failure.
 * Duplicates are automatically skipped via database unique constraint.
 */

interface AttendanceDetail {
  uid: string;
  status: 'inserted' | 'skipped' | 'failed';
  studentName?: string;
  reason?: string;
}

const MAX_UIDS_PER_REQUEST = 500;

export async function POST(request: NextRequest) {
  // Verify device authentication
  const authError = verifyDeviceAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const { eventId, uids, deviceId } = await request.json();

    // Validate input
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Event ID required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(uids)) {
      return NextResponse.json(
        { error: 'UIDs must be an array' },
        { status: 400 }
      );
    }

    if (uids.length === 0) {
      return NextResponse.json(
        { error: 'UIDs array is empty' },
        { status: 400 }
      );
    }

    if (uids.length > MAX_UIDS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_UIDS_PER_REQUEST} UIDs per request` },
        { status: 400 }
      );
    }

    // Validate and format all UIDs
    const formattedUids = uids.map((uid) => {
      if (typeof uid !== 'string') {
        throw new Error('All UIDs must be strings');
      }
      // Validate format (uppercase hex with colons)
      if (!/^[0-9A-F:]+$/i.test(uid)) {
        throw new Error(`Invalid UID format: ${uid}`);
      }
      return uid.toUpperCase();
    });

    const supabase = createAdminClient();

    // 1. Verify event exists and is active
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .maybeSingle();

    if (eventError) {
      console.error('[Bulk Check-in] Event validation error:', {
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
        { error: 'Event not found or not active' },
        { status: 404 }
      );
    }

    // 2. Lookup all students by UIDs in a single query
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, student_id, name, card_uid')
      .in('card_uid', formattedUids);

    if (studentError) {
      console.error('[Bulk Check-in] Student lookup error:', {
        error: studentError.message
      });
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Create UID -> Student mapping
    const uidToStudent = new Map(
      (students || []).map((s: any) => [s.card_uid, s])
    );

    // 3. Get all student IDs that were found
    const foundStudentIds = Array.from(uidToStudent.values()).map((s: any) => s.id);

    if (foundStudentIds.length === 0) {
      // None of the UIDs matched any students
      const details: AttendanceDetail[] = formattedUids.map((uid) => ({
        uid,
        status: 'failed',
        reason: 'Student not found'
      }));

      return NextResponse.json({
        success: true,
        eventId: event.id,
        eventName: event.name,
        results: {
          total: formattedUids.length,
          inserted: 0,
          skipped: 0,
          failed: formattedUids.length
        },
        details
      });
    }

    // 4. Check which students are registered for this event (batch query)
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('student_id')
      .eq('event_id', event.id)
      .in('student_id', foundStudentIds);

    if (regError) {
      console.error('[Bulk Check-in] Registration check error:', {
        error: regError.message
      });
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Create Set of registered student IDs for O(1) lookup
    const registeredStudentIds = new Set(
      (registrations || []).map((r: any) => r.student_id)
    );

    // 5. Prepare attendance records for bulk insert
    const attendanceRecords: { student_id: string; event_id: string }[] = [];
    const details: AttendanceDetail[] = [];

    for (const uid of formattedUids) {
      const student = uidToStudent.get(uid);

      if (!student) {
        // Student not found
        details.push({
          uid,
          status: 'failed',
          reason: 'Student not found'
        });
        continue;
      }

      if (!registeredStudentIds.has(student.id)) {
        // Student not registered for event
        details.push({
          uid,
          status: 'failed',
          studentName: student.name,
          reason: 'Not registered for event'
        });
        continue;
      }

      // Valid - prepare for insert
      attendanceRecords.push({
        student_id: student.id,
        event_id: event.id
      });

      // Pre-mark as inserted (will update if duplicate)
      details.push({
        uid,
        status: 'inserted',
        studentName: student.name
      });
    }

    // 6. Bulk insert attendance records with upsert
    // ignoreDuplicates: true handles already checked-in students
    let insertedCount = 0;
    let skippedCount = 0;

    if (attendanceRecords.length > 0) {
      const { data: insertedRecords, error: insertError } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,event_id',
          ignoreDuplicates: true
        })
        .select('student_id');

      if (insertError) {
        console.error('[Bulk Check-in] Attendance insert error:', {
          error: insertError.message
        });
        return NextResponse.json(
          { error: 'Failed to record attendance' },
          { status: 500 }
        );
      }

      // Count actual inserts vs skipped duplicates
      insertedCount = insertedRecords?.length || 0;
      skippedCount = attendanceRecords.length - insertedCount;

      // Update details for skipped records (duplicates)
      if (skippedCount > 0) {
        const insertedStudentIds = new Set(
          (insertedRecords || []).map((r: any) => r.student_id)
        );

        details.forEach((detail) => {
          if (detail.status === 'inserted') {
            const student = uidToStudent.get(detail.uid);
            if (student && !insertedStudentIds.has(student.id)) {
              detail.status = 'skipped';
              detail.reason = 'Already checked in';
            }
          }
        });
      }
    }

    const failedCount = details.filter((d) => d.status === 'failed').length;

    // 7. Log bulk operation
    console.log('[Bulk Check-in] Operation completed:', {
      eventId: event.id,
      eventName: event.name,
      deviceId: deviceId || 'unknown',
      total: formattedUids.length,
      inserted: insertedCount,
      skipped: skippedCount,
      failed: failedCount
    });

    // 8. Return detailed results
    return NextResponse.json({
      success: true,
      eventId: event.id,
      eventName: event.name,
      results: {
        total: formattedUids.length,
        inserted: insertedCount,
        skipped: skippedCount,
        failed: failedCount
      },
      details
    });

  } catch (error) {
    console.error('[Bulk Check-in] Unexpected error:', error);
    
    // Handle validation errors with more specific messages
    if (error instanceof Error && error.message.includes('UID')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Use Edge runtime for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
