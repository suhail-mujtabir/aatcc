// context/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Define the context shape
type AuthContextType = {
  user: User | null;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value = {
    user,
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

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};