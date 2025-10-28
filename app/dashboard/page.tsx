// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/auth/actions';
import { Calendar, Bell, User, Book, LogOut, Key } from 'react-feather'; // Added Key icon
import { clientSignOut } from '@/app/auth/client-actions';


export default function DashboardPage() {
  // Get all necessary data from the hook
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const handleSignOut = clientSignOut()
  // This effect handles redirecting if the user logs out or isn't logged in
  useEffect(() => {
    // Only check for redirection after the initial loading is done
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show a loading spinner while the AuthContext is fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading Dashboard...</p>
      </div>
    );
  }

  // Fallback in case the redirect hasn't fired yet
  if (!user || !profile) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Welcome, {profile.full_name}!
            </h1>
            <p className="mt-1 text-md text-gray-500 dark:text-gray-400">
              Student ID: {profile.student_id.split('@')[0]}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => router.push('/change-password')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              <Key size={18} />
              <span>Change Password</span>
            </button>
            <form action={signOut}>
              <button
  onClick={handleSignOut}
  className="cursor-pointer flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </header>

        {/* Dashboard Cards Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Calendar className="text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
            </div>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="border-l-4 border-blue-500 pl-3"><strong>Oct 15:</strong> Midterm Project Deadline</li>
              <li className="border-l-4 border-blue-500 pl-3"><strong>Oct 22:</strong> Guest Lecture on Textiles</li>
              <li className="border-l-4 border-blue-500 pl-3"><strong>Nov 5:</strong> Annual Student BBQ</li>
            </ul>
          </div>
          
          {/* Card 2: Announcements */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Bell className="text-green-600 dark:text-green-300" />
              </div>
              <h2 className="text-xl font-semibold">Recent Announcements</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Scholarship applications for the next semester are now open. Please visit the main office for more details.
            </p>
          </div>
          
          {/* Card 3: My Profile */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <User className="text-purple-600 dark:text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold">My Profile</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Review and update your personal information and contact details.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
              View Profile
            </button>
          </div>
          
          {/* Card 4: Resources */}
          <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <Book className="text-yellow-600 dark:text-yellow-300" />
              </div>
              <h2 className="text-xl font-semibold">Student Resources</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <a href="#" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Syllabus</a>
              <a href="#" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Library</a>
              <a href="#" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Forms</a>
              <a href="#" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Contact</a>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}