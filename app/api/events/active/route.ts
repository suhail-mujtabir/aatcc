import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyDeviceAuth } from '@/lib/device-auth';

/**
 * GET /api/events/active
 * ESP32 device retrieves currently active event information
 * 
 * Headers: X-Device-API-Key
 * 
 * Returns: Active event with registration/attendance counts, or null if no active event
 */
export async function GET(request: NextRequest) {
  // Verify device authentication
  if (!verifyDeviceAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized device' },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Find active event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, description, start_time, end_time')
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

    // No active event
    if (!event) {
      return NextResponse.json({ event: null });
    }

    // Get registration and attendance counts
    const [
      { count: registeredCount },
      { count: attendedCount }
    ] = await Promise.all([
      supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id),
      supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
    ]);

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        registeredCount: registeredCount || 0,
        attendedCount: attendedCount || 0
      }
    });

  } catch (error) {
    console.error('Active event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
