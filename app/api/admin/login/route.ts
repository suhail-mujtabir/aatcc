import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin, setAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { adminId, password } = await request.json();

    if (!adminId || !password) {
      return NextResponse.json(
        { error: 'Admin ID and password are required' },
        { status: 400 }
      );
    }

    const session = await loginAdmin(adminId, password);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await setAdminSession(session);

    return NextResponse.json({ success: true, admin: session });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
