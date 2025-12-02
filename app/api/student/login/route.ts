import { NextRequest, NextResponse } from 'next/server';
import { loginStudent, setStudentSession } from '@/lib/student-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, password } = body;

    if (!studentId || !password) {
      return NextResponse.json(
        { error: 'Student ID and password are required' },
        { status: 400 }
      );
    }

    // Attempt login
    const session = await loginStudent(studentId, password);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid student ID or password' },
        { status: 401 }
      );
    }

    // Set session cookie
    await setStudentSession(session);

    return NextResponse.json({
      success: true,
      student: {
        id: session.studentId,
        name: session.name
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
