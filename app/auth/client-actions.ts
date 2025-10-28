// Create a new file: app/auth/client-actions.ts
'use client'

import { createClient } from '@/lib/supabase/client'

export function clientSignOut() {
  const supabase = createClient()
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Force refresh to ensure all state is cleared
    window.location.href = '/'
  }

  return handleSignOut
}