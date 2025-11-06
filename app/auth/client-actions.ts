// app/auth/client-actions.ts
'use client'

import { createClient } from '@/lib/supabase/client'

export function clientSignOut() {
  const handleSignOut = async () => {
    const supabase = createClient()
    try {
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
      
      // Force complete page reload to clear all state
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: force reload anyway
      window.location.href = '/'
    }
  }

  return handleSignOut
}