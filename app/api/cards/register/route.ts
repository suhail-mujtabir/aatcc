import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase';

/**
 * Admin endpoint to activate a card (link to student)
 * POST /api/cards/register
 * 
 * Request body:
 * {
 *   "studentId": "23-01-002",
 *   "cardUid": "AA:BB:CC:DD:EE:FF:00"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "name": "John Doe",
 *   "studentId": "23-01-002",
 *   "cardUid": "AA:BB:CC:DD:EE:FF:00"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
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

    const body = await request.json();
    const { studentId, cardUid } = body;

    if (!studentId || !cardUid) {
      return NextResponse.json(
        { error: 'Student ID and card UID are required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const normalizedCardUid = cardUid.toUpperCase();

    // Check if student exists
    const { data: student, error: studentError } = await adminSupabase
      .from('students')
      .select('id, name, student_id, card_uid')
      .eq('student_id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student ID not found in database' },
        { status: 404 }
      );
    }

    // Check if student already has a card
    if (student.card_uid) {
      return NextResponse.json(
        { error: `Student already has a card assigned (${student.card_uid})` },
        { status: 400 }
      );
    }

    // Check if card UID already assigned to another student
    const { data: existingCard } = await adminSupabase
      .from('students')
      .select('name, student_id')
      .eq('card_uid', normalizedCardUid)
      .single();

    if (existingCard) {
      return NextResponse.json(
        { 
          error: `Card already assigned to ${existingCard.name} (${existingCard.student_id})` 
        },
        { status: 409 }
      );
    }

    // Update student with card UID
    const { error: updateError } = await adminSupabase
      .from('students')
      .update({ card_uid: normalizedCardUid })
      .eq('id', student.id);

    if (updateError) {
      console.error('Update student error:', updateError);
      return NextResponse.json(
        { error: 'Failed to activate card' },
        { status: 500 }
      );
    }

    // Remove from pending_cards (Supabase Realtime will push DELETE event)
    const { error: deleteError } = await adminSupabase
      .from('pending_cards')
      .delete()
      .eq('uid', normalizedCardUid);

    if (deleteError) {
      console.error('Delete pending card error:', deleteError);
      // Non-critical error - card is activated, cleanup failed
    }

    return NextResponse.json({
      success: true,
      name: student.name,
      studentId: student.student_id,
      cardUid: normalizedCardUid
    });

  } catch (error) {
    console.error('Card registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
