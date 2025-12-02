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
        check_in_time,
        check_out_time,
        events (
          name
        )
      `)
      .eq('student_id', session.studentId)
      .order('check_in_time', { ascending: false });

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
      check_in_time: record.check_in_time,
      check_out_time: record.check_out_time
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
