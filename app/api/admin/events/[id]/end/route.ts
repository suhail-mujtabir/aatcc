import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

// POST /api/admin/events/[id]/end - End/deactivate event (sets status to completed)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const supabase = createAdminClient();

    // Set event status to completed
    const { data: event, error } = await supabase
      .from('events')
      .update({ status: 'completed' })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id, name, description, start_time, end_time, status, created_at')
      .single();

    if (error || !event) {
      console.error('Error ending event:', error);
      return NextResponse.json(
        { error: 'Failed to end event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in POST /api/admin/events/[id]/end:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
