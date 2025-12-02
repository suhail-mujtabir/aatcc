import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/student-auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const session = await getStudentSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      student: {
        id: session.studentId,
        name: session.name
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
