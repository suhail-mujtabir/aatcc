// context/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Define the shape of a user profile
type Profile = {
  full_name: string;
  student_id: string;
};

// Update the context shape to include the profile
type AuthContextType = {
  user: User | null;
  profile: Profile | null; // <-- ADD THIS
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // <-- ADD THIS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // If there's a user, fetch their profile
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('Profiles') // Use your case-sensitive table name
          .select('full_name, student_id')
          .eq('id', session.user.id)
          .single(); // .single() fetches one record
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        // Also fetch the profile on auth changes
        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('Profiles')
            .select('full_name, student_id')
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile);
        } else {
          setProfile(null); // Clear profile on logout
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, supabase.auth]);

  const value = {
    user,
    profile, // <-- ADD THIS
    signOut: async () => {
      await supabase.auth.signOut();
    },
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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