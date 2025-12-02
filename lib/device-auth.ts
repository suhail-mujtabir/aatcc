import { NextRequest } from 'next/server';

/**
 * Verify ESP32 device authentication using API key
 * @param request - Next.js request object
 * @returns boolean - true if valid device API key
 */
export function verifyDeviceAuth(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Device-API-Key');
  
  if (!process.env.DEVICE_API_KEY) {
    console.error('DEVICE_API_KEY not configured in environment variables');
    return false;
  }
  
  return apiKey === process.env.DEVICE_API_KEY;
}
