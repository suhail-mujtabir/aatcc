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

    const supabase = createAdminClient();

    // Fetch attendance records with event names
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        id,
        checked_in_at,
        checked_out_at,
        events (
          name
        )
      `)
      .eq('student_id', session.studentId)
      .order('checked_in_at', { ascending: false });

    if (error) {
      console.error('Attendance fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch attendance' },
        { status: 500 }
      );
    }

    // Transform data to include event_name
    const formattedAttendance = attendance?.map((record: any) => ({
      id: record.id,
      event_name: record.events?.name || 'Unknown Event',
      checked_in_at: record.checked_in_at,
      checked_out_at: record.checked_out_at
    })) || [];

    return NextResponse.json({
      attendance: formattedAttendance
    });
  } catch (error) {
    console.error('Attendance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
