// app/actions/auth-actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';


export async function loginUser(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = formData.get('userId') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'true';

    // Input validation
    if (!userId || !password) {
      return { error: 'User ID and password are required' };
    }

    // Sanitize user ID - allow alphanumeric AND hyphens
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    
    // More flexible validation for different ID formats
    if (sanitizedUserId.length < 3 || sanitizedUserId.length > 50) {
      return { error: 'Invalid User ID format' };
    }

    // Construct email server-side
    const emailDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'yourschool.com';
    const email = `${sanitizedUserId}@${emailDomain}`;

    // Create Supabase client for server-side
    const supabase = await createClient();

    // Attempt login
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return { error: 'Invalid User ID or Password' };
    }

    console.log('✅ Server action: Login successful for user:', data.user?.id);

    // Force revalidation of all auth-related paths
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard');
    revalidatePath('/login');

    return { success: true };

  } catch (error: any) {
    console.error('Server action error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}