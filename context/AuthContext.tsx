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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthContext: Initializing auth...');
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        console.log('🔄 AuthContext: Session found?', !!session?.user);
        
        if (session?.user) {
          setUser(session.user);
          console.log('🔄 AuthContext: User set, fetching profile...');
          // Fetch profile
          const { data: userProfile, error } = await supabase
            .from('Profiles')
            .select('full_name, student_id')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('🔄 AuthContext: Profile fetch error:', error);
          } else {
            console.log('🔄 AuthContext: Profile fetched:', userProfile);
          }
          
          setProfile(userProfile ?? null);
        } else {
          setUser(null);
          setProfile(null);
          console.log('🔄 AuthContext: No session, user cleared');
        }
      } catch (error) {
        console.error('🔄 AuthContext: Initialization error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('🔄 AuthContext: Loading complete');
        }
      }
    };

    initializeAuth();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 AuthContext: Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          console.log('🔄 AuthContext: User updated from auth change');
          // Fetch profile on sign in
          if (event === 'SIGNED_IN') {
            const { data: userProfile, error } = await supabase
              .from('Profiles')
              .select('full_name, student_id')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              console.error('🔄 AuthContext: Profile fetch error on SIGNED_IN:', error);
            } else {
              console.log('🔄 AuthContext: Profile updated on SIGNED_IN:', userProfile);
            }
            
            setProfile(userProfile ?? null);
          }
        } else {
          setUser(null);
          setProfile(null);
          console.log('🔄 AuthContext: User cleared from auth change');
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

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