import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyDeviceAuth } from '@/lib/device-auth';

/**
 * GET /api/events/active
 * ESP32 device retrieves currently active event information
 * 
 * Requires device authentication via X-Device-API-Key header
 * 
 * Headers: X-Device-API-Key
 * 
 * Returns: Active event details, or null if no active event
 */
export async function GET(request: NextRequest) {
  // Verify device authentication
  const authError = verifyDeviceAuth(request);
  if (authError) {
    return authError;
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
      console.error('[Active Event] Query error:', {
        error: eventError.message
      });
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // No active event
    if (!event) {
      return NextResponse.json({ event: null });
    }

    // Return event details (no counts needed for ESP32)
    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time
      }
    });

  } catch (error) {
    console.error('[Active Event] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Use Edge runtime for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
