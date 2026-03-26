import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyDeviceAuth } from '@/lib/device-auth';

/**
 * Batch card detection endpoint for ESP32
 * POST /api/cards/batch
 * 
 * Requires device authentication via X-Device-API-Key header
 * 
 * Headers: X-Device-API-Key
 * 
 * Request body:
 * {
 *   "cards": [
 *     { "uid": "AA:BB:CC:DD" },
 *     { "uid": "11:22:33:44" }
 *   ],
 *   "deviceId": "esp32-001" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": 2,
 *   "duplicates": 1,
 *   "failed": 0,
 *   "results": [
 *     { "uid": "AA:BB:CC:DD", "status": "created" },
 *     { "uid": "11:22:33:44", "status": "duplicate" }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  // Verify device authentication
  const authError = verifyDeviceAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const { cards, deviceId } = body;

    // Validate request
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'Cards array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (cards.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 cards per batch' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const deviceIdStr = deviceId || 'unknown';
    
    let successCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const results: Array<{ uid: string; status: string; error?: string; student?: any }> = [];

    // Process each card
    for (const cardData of cards) {
      const { uid } = cardData;

      // Validate UID
      if (!uid || typeof uid !== 'string') {
        failedCount++;
        results.push({ 
          uid: uid || 'unknown', 
          status: 'failed',
          error: 'Invalid UID format'
        });
        continue;
      }

      // Validate UID format (hex bytes separated by colons)
      if (!/^[0-9A-Fa-f:]+$/.test(uid)) {
        failedCount++;
        results.push({ 
          uid, 
          status: 'failed',
          error: 'Invalid UID characters'
        });
        continue;
      }

      const formattedUid = uid.toUpperCase();

      try {
        // Check if card already activated
        const { data: existingCard } = await supabase
          .from('students')
          .select('name, student_id')
          .eq('card_uid', formattedUid)
          .single();

        if (existingCard) {
          duplicateCount++;
          results.push({ 
            uid: formattedUid, 
            status: 'duplicate',
            student: existingCard
          });
          continue;
        }

        // Insert into pending_cards (or update if exists)
        const { error } = await supabase
          .from('pending_cards')
          .upsert({
            uid: formattedUid,
            device_id: deviceIdStr,
            detected_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          }, {
            onConflict: 'uid'
          });

        if (error) {
          console.error('[Batch Detection] Insert error:', {
            uid: formattedUid,
            error: error.message
          });
          failedCount++;
          results.push({ 
            uid: formattedUid, 
            status: 'failed',
            error: error.message
          });
          continue;
        }

        successCount++;
        results.push({ 
          uid: formattedUid, 
          status: 'created'
        });

      } catch (error) {
        console.error('[Batch Detection] Processing error:', {
          uid: formattedUid,
          error
        });
        failedCount++;
        results.push({ 
          uid: formattedUid, 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log batch summary
    console.log('[Batch Detection] Summary:', {
      total: cards.length,
      success: successCount,
      duplicates: duplicateCount,
      failed: failedCount,
      deviceId: deviceIdStr
    });

    // Return summary response
    return NextResponse.json({
      success: successCount,
      duplicates: duplicateCount,
      failed: failedCount,
      results
    });

  } catch (error) {
    console.error('[Batch Detection] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Use Edge runtime for better performance and lower cost
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
