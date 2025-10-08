'use client'; // This must be a Client Component to use hooks

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Make sure this path is correct
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  // Get user session and signOut function from the AuthContext
  const { user, signOut } = useAuth();
  const router = useRouter();

  // This hook protects the route
  useEffect(() => {
    // If the user is not logged in, redirect them to the login page
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // While checking for a user, you can show a loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If a user is logged in, show the dashboard
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">
          {/* We display the user ID by splitting the "fake" email */}
          Welcome, {user.email?.split('@')[0]}
        </h1>
        <p className="text-gray-600 mb-6">
          You have successfully logged into your student dashboard.
        </p>
        
        {/* The logout button now calls the signOut function */}
        <button
          onClick={async () => {
            await signOut();
            router.refresh();
            router.push('/login'); // Redirect to login after signing out
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}