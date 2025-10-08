// app/auth/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()

  // These ensure the user is fully logged out and redirected.
  revalidatePath('/', 'layout')
  redirect('/')
}