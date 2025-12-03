import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * GET /api/cards/status/[uid]
 * ESP32 device polls to check if card was activated by admin
 * 
 * No authentication required (read-only, non-sensitive data)
 * 
 * Returns:
 * - { activated: true, studentName, studentId } if card is linked
 * - { activated: false } if card is not yet linked
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid: cardUid } = await params;

    if (!cardUid) {
      return NextResponse.json(
        { error: 'Card UID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Lookup student by card UID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('student_id, name')
      .eq('card_uid', cardUid.toUpperCase())
      .maybeSingle();

    if (studentError) {
      console.error('[Card Status] Lookup error:', {
        uid: cardUid,
        error: studentError.message
      });
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!student) {
      // Card not activated yet
      return NextResponse.json({
        activated: false
      });
    }

    // Card is activated
    return NextResponse.json({
      activated: true,
      studentName: student.name,
      studentId: student.student_id
    });

  } catch (error) {
    console.error('[Card Status] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Use Edge runtime for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
