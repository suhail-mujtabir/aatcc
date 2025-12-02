import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * POST /api/cards/register
 * Admin links NFC card UID to student account (orientation day)
 * 
 * Request body: { studentId: string, cardUid: string }
 * Headers: Cookie (admin session)
 * 
 * Flow:
 * 1. Verify admin authentication
 * 2. Validate inputs
 * 3. Check if card already assigned
 * 4. Assign card to student
 * 5. Return updated student record
 */
export async function POST(request: NextRequest) {
  // 1. Verify admin authentication
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { studentId, cardUid } = await request.json();

    // 2. Validate inputs
    if (!studentId || !cardUid) {
      return NextResponse.json(
        { error: 'Student ID and card UID required' },
        { status: 400 }
      );
    }

    // Validate card UID format (hex with colons)
    if (!/^[0-9A-F:]+$/i.test(cardUid)) {
      return NextResponse.json(
        { error: 'Invalid card UID format. Expected format: AA:BB:CC:DD:EE:FF:00' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const normalizedCardUid = cardUid.toUpperCase();

    // 3. Check if card already assigned to another student
    const { data: existingCard, error: existingError } = await supabase
      .from('students')
      .select('student_id, name')
      .eq('card_uid', normalizedCardUid)
      .maybeSingle();

    if (existingError) {
      console.error('Card check error:', existingError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingCard) {
      return NextResponse.json(
        { 
          error: `Card already assigned to ${existingCard.name} (${existingCard.student_id})` 
        },
        { status: 409 }
      );
    }

    // 4. Assign card to student
    const { data: student, error: updateError } = await supabase
      .from('students')
      .update({ card_uid: normalizedCardUid })
      .eq('student_id', studentId)
      .select('id, student_id, name, card_uid')
      .maybeSingle();

    if (updateError) {
      console.error('Card assignment error:', updateError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // 5. Success response
    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        studentId: student.student_id,
        name: student.name,
        cardUid: student.card_uid
      }
    });

  } catch (error) {
    console.error('Card registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
