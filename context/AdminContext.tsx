'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AdminSession {
  adminId: string;
  name: string;
}

interface AdminContextType {
  admin: AdminSession | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Session cache (shared across all admin pages)
let sessionCache: {
  data: AdminSession | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = async (skipCache = false) => {
    const now = Date.now();
    
    // Use cache if valid and not skipping
    if (!skipCache && sessionCache.data && now - sessionCache.timestamp < CACHE_TTL) {
      setAdmin(sessionCache.data);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/session', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Clear cache on auth failure
        sessionCache.data = null;
        sessionCache.timestamp = 0;
        setAdmin(null);
        
        // Redirect to login if on protected page
        if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        return;
      }

      const data = await response.json();
      
      // Update cache
      sessionCache.data = data.admin;
      sessionCache.timestamp = now;
      
      setAdmin(data.admin);
    } catch (error) {
      console.error('Session check failed:', error);
      sessionCache.data = null;
      sessionCache.timestamp = 0;
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear cache
      sessionCache.data = null;
      sessionCache.timestamp = 0;
      
      setAdmin(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshSession = async () => {
    await checkSession(true); // Skip cache
  };

  useEffect(() => {
    checkSession();
  }, []);

  const value = {
    admin,
    loading,
    logout,
    refreshSession
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
