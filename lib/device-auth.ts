import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify ESP32 device authentication using API key
 * @param request - Next.js request object
 * @returns NextResponse with 401 error if invalid, null if valid
 */
export function verifyDeviceAuth(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get('X-Device-API-Key');
  
  if (!process.env.DEVICE_API_KEY) {
    console.error('DEVICE_API_KEY not configured in environment variables');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }
  
  if (apiKey !== process.env.DEVICE_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized device' },
      { status: 401 }
    );
  }
  
  return null; // Valid authentication
}
