import { NextRequest, NextResponse } from 'next/server';
import { clearStudentSession } from '@/lib/student-auth';

export async function POST(request: NextRequest) {
  try {
    await clearStudentSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Student logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
