// app/change-password/action.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionState = {
  error?: string
  success?: string
} | null

export async function changePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Server-side validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }

  // Password strength validation
  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  if (!specialCharRegex.test(newPassword)) {
    return { error: 'Password must contain at least one special character' }
  }

  const letterRegex = /[a-zA-Z]/
  if (!letterRegex.test(newPassword)) {
    return { error: 'Password must contain at least one letter' }
  }

  // Re-authenticate with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword
  })

  if (signInError) {
    return { error: 'Current password is incorrect' }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/change-password')
  return { success: 'Password updated successfully!' }
}