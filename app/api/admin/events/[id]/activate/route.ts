import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

// POST /api/admin/events/[id]/activate - Activate event (deactivates others)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const supabase = createAdminClient();

    // First, deactivate all active events
    await supabase
      .from('events')
      .update({ status: 'completed' })
      .eq('status', 'active')
      .is('deleted_at', null);

    // Then activate the target event
    const { data: event, error } = await supabase
      .from('events')
      .update({ status: 'active' })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id, name, description, start_time, end_time, status, created_at')
      .single();

    if (error || !event) {
      console.error('Error activating event:', error);
      return NextResponse.json(
        { error: 'Failed to activate event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in POST /api/admin/events/[id]/activate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
