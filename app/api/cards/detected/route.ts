import { NextRequest, NextResponse } from 'next/server';
import { verifyDeviceAuth } from '@/lib/device-auth';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * ESP32 reports detected card UID
 * POST /api/cards/detected
 * 
 * Request body:
 * {
 *   "cardUid": "AA:BB:CC:DD:EE:FF:00"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Card detection recorded"
 * }
 */

// Store detected cards in memory (in production, use Redis or database)
const detectedCards = new Map<string, { timestamp: number }>();

// Clean up old detections (older than 5 minutes)
function cleanupOldDetections() {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  for (const [cardUid, data] of detectedCards.entries()) {
    if (data.timestamp < fiveMinutesAgo) {
      detectedCards.delete(cardUid);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify device authentication
    const authError = verifyDeviceAuth(request);
    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { cardUid } = body;

    if (!cardUid || typeof cardUid !== 'string') {
      return NextResponse.json(
        { error: 'Card UID is required' },
        { status: 400 }
      );
    }

    // Format UID to uppercase with colons
    const formattedUid = cardUid.toUpperCase();

    // Store detection
    detectedCards.set(formattedUid, {
      timestamp: Date.now()
    });

    // Cleanup old detections
    cleanupOldDetections();

    return NextResponse.json({
      success: true,
      message: 'Card detection recorded',
      cardUid: formattedUid
    });

  } catch (error) {
    console.error('Error recording card detection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get pending detected cards (for admin UI polling)
 * GET /api/cards/detected
 * 
 * Response:
 * {
 *   "cards": [
 *     {
 *       "cardUid": "AA:BB:CC:DD:EE:FF:00",
 *       "timestamp": 1234567890
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cleanup old detections first
    cleanupOldDetections();

    // Get all pending cards
    const cards = Array.from(detectedCards.entries()).map(([cardUid, data]) => ({
      cardUid,
      timestamp: data.timestamp
    }));

    // Sort by most recent first
    cards.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      cards
    });

  } catch (error) {
    console.error('Error fetching detected cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Remove a card from detected list (after activation or dismissal)
 * DELETE /api/cards/detected?cardUid=AA:BB:CC:DD:EE:FF:00
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin auth
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const cardUid = searchParams.get('cardUid');

    if (!cardUid) {
      return NextResponse.json(
        { error: 'Card UID is required' },
        { status: 400 }
      );
    }

    detectedCards.delete(cardUid.toUpperCase());

    return NextResponse.json({
      success: true,
      message: 'Card removed from detected list'
    });

  } catch (error) {
    console.error('Error removing detected card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
