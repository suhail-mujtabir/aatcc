import { NextRequest, NextResponse } from 'next/server';
import { requireStudent } from '@/lib/student-auth';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await requireStudent();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full student profile
    const supabase = createAdminClient();
    const { data: student, error } = await supabase
      .from('students')
      .select('id, student_id, name, batch, department, created_at')
      .eq('id', session.studentId)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireStudent();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, student_id, batch, department } = body;

    // Validate required fields
    if (!name || !student_id || !batch || !department) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if new student_id is already taken by another student
    const supabase = createAdminClient();
    
    if (student_id !== session.id) {
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', student_id)
        .neq('id', session.studentId)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 409 }
        );
      }
    }

    // Update student profile
    const { data: updated, error } = await supabase
      .from('students')
      .update({
        name,
        student_id,
        batch,
        department,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.studentId)
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
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
