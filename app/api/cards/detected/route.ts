import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * ESP32 reports detected card UID
 * POST /api/cards/detected
 * 
 * No authentication required for card detection
 * 
 * Request body:
 * {
 *   "uid": "AA:BB:CC:DD:EE:FF:00",
 *   "deviceId": "esp32-001" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "pollingId": "AA:BB:CC:DD:EE:FF:00",
 *   "message": "Card detected, waiting for activation"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, deviceId } = body;

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json(
        { error: 'Card UID is required' },
        { status: 400 }
      );
    }

    // Validate UID format (hex bytes separated by colons)
    if (!/^[0-9A-Fa-f:]+$/.test(uid)) {
      return NextResponse.json(
        { error: 'Invalid UID format' },
        { status: 400 }
      );
    }

    const formattedUid = uid.toUpperCase();
    const supabase = createAdminClient();

    // Check if card already activated
    const { data: existingCard } = await supabase
      .from('students')
      .select('name, student_id')
      .eq('card_uid', formattedUid)
      .single();

    if (existingCard) {
      return NextResponse.json({
        error: 'Card already activated',
        student: existingCard
      }, { status: 409 });
    }

    // Insert into pending_cards (or update if exists)
    const { error } = await supabase
      .from('pending_cards')
      .upsert({
        uid: formattedUid,
        device_id: deviceId || 'unknown',
        detected_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }, {
        onConflict: 'uid'
      });

    if (error) {
      console.error('[Card Detection] Insert error:', {
        uid: formattedUid,
        deviceId,
        error: error.message
      });
      return NextResponse.json(
        { error: 'Failed to register card detection' },
        { status: 500 }
      );
    }

    // Supabase Realtime will automatically push this INSERT to subscribed clients

    return NextResponse.json({
      success: true,
      pollingId: formattedUid,
      message: 'Card detected, waiting for activation'
    });

  } catch (error) {
    console.error('[Card Detection] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Use Edge runtime for better performance and lower cost
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
