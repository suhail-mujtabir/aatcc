import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

// GET /api/admin/events - List all events (with optional status filter)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'upcoming' | 'active' | 'completed' | null (all)

    const supabase = createAdminClient();

    let query = supabase
      .from('events')
      .select('id, name, description, start_time, end_time, status, created_at')
      .is('deleted_at', null)
      .order('start_time', { ascending: false });

    if (status && ['upcoming', 'active', 'completed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in GET /api/admin/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

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

    // If creating an active event, deactivate all other active events
    if (status === 'active') {
      await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('status', 'active')
        .is('deleted_at', null);
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        name,
        description: description || null,
        start_time,
        end_time,
        status,
        created_by: session.id,
      })
      .select('id, name, description, start_time, end_time, status, created_at')
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in POST /api/admin/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
