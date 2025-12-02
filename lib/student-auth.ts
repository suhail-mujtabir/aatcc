import { cookies } from 'next/headers';
import { createAdminClient } from './supabase';
import bcrypt from 'bcryptjs';

export interface StudentSession {
  id: string; // UUID from database
  studentId: string; // Student ID like "23-01-002"
  name: string;
}

/**
 * Verify student credentials and create session
 * @param studentId - Student ID (e.g., "23-01-002")
 * @param password - Plain text password
 * @returns StudentSession or null if invalid
 */
export async function loginStudent(studentId: string, password: string): Promise<StudentSession | null> {
  const supabase = createAdminClient();
  
  const { data: student, error } = await supabase
    .from('students')
    .select('id, student_id, name, password_hash')
    .eq('student_id', studentId)
    .single();

  if (error || !student) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, student.password_hash);
  
  if (!isValidPassword) {
    return null;
  }

  return {
    id: student.id,
    studentId: student.student_id,
    name: student.name
  };
}

/**
 * Set student session cookie
 * @param session - Student session data
 */
export async function setStudentSession(session: StudentSession) {
  const cookieStore = await cookies();
  cookieStore.set('student_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

/**
 * Get current student session from cookie
 * @returns StudentSession or null if not logged in
 */
export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('student_session');
  
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
 * Clear student session cookie (logout)
 */
export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete('student_session');
}

/**
 * Middleware to protect student routes
 * Throws error if not authenticated
 * @returns StudentSession if authenticated
 * @throws Error if not authenticated
 */
export async function requireStudent(): Promise<StudentSession> {
  const session = await getStudentSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
