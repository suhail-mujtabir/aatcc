import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

// GET /api/admin/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const supabase = createAdminClient();

    const { data: event, error } = await supabase
      .from('events')
      .select('id, name, description, start_time, end_time, status, created_at')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in GET /api/admin/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { name, description, start_time, end_time, status } = body;

    // Validation
    if (!name || !start_time || !end_time || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: name, start_time, end_time, status' },
        { status: 400 }
      );
    }

    if (!['upcoming', 'active', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: upcoming, active, or completed' },
        { status: 400 }
      );
    }

    // Validate start_time < end_time
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // If updating to active status, deactivate all other active events
    if (status === 'active') {
      await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('status', 'active')
        .neq('id', id)
        .is('deleted_at', null);
    }

    const { data: event, error } = await supabase
      .from('events')
      .update({
        name,
        description: description || null,
        start_time,
        end_time,
        status,
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id, name, description, start_time, end_time, status, created_at')
      .single();

    if (error || !event) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in PUT /api/admin/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Soft delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const supabase = createAdminClient();

    // Soft delete by setting deleted_at timestamp
    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in DELETE /api/admin/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
