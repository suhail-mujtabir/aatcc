// app/auth/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Force complete refresh to clear all client state including AuthContext
  revalidatePath('/', 'layout')
  redirect('/?timestamp=' + Date.now()) // Add timestamp to bypass cache
}