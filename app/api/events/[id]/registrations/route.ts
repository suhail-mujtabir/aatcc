import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyDeviceAuth } from '@/lib/device-auth';

/**
 * GET /api/events/[id]/registrations
 * ESP32 device retrieves list of registered students with card UIDs for offline validation
 * 
 * Requires device authentication via X-Device-API-Key header
 * 
 * Headers: X-Device-API-Key
 * 
 * Response: Array of registered students with their card UIDs
 * 
 * Purpose: Download registration list at event start for offline attendance validation.
 * ESP32 stores UIDs in memory and validates cards locally without hitting database per tap.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify device authentication
  const authError = verifyDeviceAuth(request);
  if (authError) {
    return authError;
  }

  try {
    // Await params (Next.js 15 requirement)
    const { id: eventId } = await params;

    // Validate event ID format (UUID)
    if (!eventId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Verify event exists and is active
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', eventId)
      .is('deleted_at', null)
      .maybeSingle();

    if (eventError) {
      console.error('[Registrations] Event lookup error:', {
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
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Allow fetching registrations for active or upcoming events
    // (Admin might start device before activating event)
    if (event.status === 'completed') {
      return NextResponse.json(
        { error: 'Event has already ended' },
        { status: 400 }
      );
    }

    // 2. Fetch registered students with card UIDs
    // JOIN registrations with students to get card UIDs
    // Only return students with non-null card_uid (activated cards)
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        students (
          id,
          student_id,
          name,
          card_uid
        )
      `)
      .eq('event_id', eventId)
      .not('students.card_uid', 'is', null);

    if (regError) {
      console.error('[Registrations] Query error:', {
        eventId,
        error: regError.message
      });
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // 3. Transform data for ESP32 consumption
    // Format: Simple array with only necessary fields
    const formattedRegistrations = (registrations || [])
      .map((reg: any) => {
        const student = reg.students;
        // Skip if student data is missing (shouldn't happen due to FK constraint)
        if (!student) return null;

        return {
          studentId: student.id,
          studentNumber: student.student_id,
          name: student.name,
          cardUid: student.card_uid
        };
      })
      .filter((reg) => reg !== null); // Remove any null entries

    // 4. Return registration list
    return NextResponse.json({
      eventId: event.id,
      eventName: event.name,
      registrations: formattedRegistrations,
      totalRegistrations: formattedRegistrations.length
    });

  } catch (error) {
    console.error('[Registrations] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Use Edge runtime for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
