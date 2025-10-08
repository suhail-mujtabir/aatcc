// app/(app)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/auth/actions';

export default function DashboardPage() {
  // Get user and the new profile object from the hook
  const { user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center px-6">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
          {/* Display the full_name from the profile */}
          Welcome, {profile.full_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Student ID: {profile.student_id}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You have successfully logged into your student dashboard.
        </p>
        
        <form action={signOut}>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}