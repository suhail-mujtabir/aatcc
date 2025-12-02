import { NextRequest, NextResponse } from 'next/server';
import { requireStudent } from '@/lib/student-auth';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await requireStudent();

    // Fetch full student profile
    const supabase = createAdminClient();
    const { data: student, error } = await supabase
      .from('students')
      .select('id, student_id, name, bio')
      .eq('id', session.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      console.error('Session ID:', session.id);
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireStudent();

    const body = await request.json();
    const { name, bio } = body;

    // Validate required fields (student_id cannot be changed)
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length === 0 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 1-100 characters' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be max 500 characters' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Update student profile (student_id is NOT updated)
    const { data: updated, error } = await supabase
      .from('students')
      .update({
        name: name.trim(),
        bio: bio ? bio.trim() : '',
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      student: updated
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
