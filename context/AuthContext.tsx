'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Define the shape of a user profile
type Profile = {
  full_name: string;
  student_id: string;
};

// The context shape remains the same
type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  supabase: SupabaseClient;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Use useCallback to memoize the data fetching function.
  // This is a React best practice that ensures the function identity is stable.
  const fetchUserAndProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;
    
    setUser(currentUser ?? null);

    if (currentUser) {
      const { data: userProfile } = await supabase
        .from('Profiles')
        .select('full_name, student_id')
        .eq('id', currentUser.id)
        .single();
      setProfile(userProfile ?? null);
    } else {
      setProfile(null);
    }
    
    setLoading(false);
  }, [supabase]);

  // This single useEffect handles both the initial load and any auth changes.
  useEffect(() => {
    // Fetch the user on initial component mount
    fetchUserAndProfile();

    // Set up a listener for any changes in auth state (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // When auth state changes, re-fetch the profile as well
      fetchUserAndProfile(); 
    });

    // Cleanup the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserAndProfile, supabase.auth]);

  const value = {
    user,
    profile,
    loading,
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

