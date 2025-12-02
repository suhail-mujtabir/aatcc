import { cookies } from 'next/headers';
import { createAdminClient } from './supabase';
import bcrypt from 'bcryptjs';

export interface AdminSession {
  adminId: string;
  name: string;
}

/**
 * Verify admin credentials and create session
 * @param adminId - Admin username
 * @param password - Plain text password
 * @returns AdminSession or null if invalid
 */
export async function loginAdmin(adminId: string, password: string): Promise<AdminSession | null> {
  const supabase = createAdminClient();
  
  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, admin_id, password_hash, name')
    .eq('admin_id', adminId)
    .single();

  if (error || !admin) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, admin.password_hash);
  
  if (!isValidPassword) {
    return null;
  }

  return {
    adminId: admin.admin_id,
    name: admin.name
  };
}

/**
 * Set admin session cookie
 * @param session - Admin session data
 */
export async function setAdminSession(session: AdminSession) {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

/**
 * Get current admin session from cookie
 * @returns AdminSession or null if not logged in
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Clear admin session cookie (logout)
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

/**
 * Middleware to protect admin routes
 * Throws error if not authenticated
 * @returns AdminSession if authenticated
 * @throws Error if not authenticated
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
