'use client';

import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { admin, loading, logout } = useAdmin();

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!admin) {
    return null; // AdminProvider will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {admin.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Import Students Card */}
            <Link
              href="/admin/import-students"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Import Students
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Upload CSV to add students
                  </p>
                </div>
              </div>
            </Link>

            {/* Placeholder for future features */}
            <div className="p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg shadow opacity-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-400 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Manage Events
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg shadow opacity-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-400 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    View Reports
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
