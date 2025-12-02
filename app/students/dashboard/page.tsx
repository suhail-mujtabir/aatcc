'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AttendanceRecord {
  id: string;
  event_name: string;
  check_in_time: string;
  check_out_time: string | null;
}

interface StudentProfile {
  id: string;
  student_id: string;
  name: string;
  batch: string;
  department: string;
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    fetchAttendance();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      setProfile(data.student);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/student/attendance');
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendance || []);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/student/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile?.student_id} • {profile?.department} • Batch {profile?.batch}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/students/dashboard/edit"
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
              >
                Edit Profile
              </Link>
              <Link
                href="/students/dashboard/change-password"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Attendance History
          </h2>
          
          {attendance.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No attendance records found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Check In
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Check Out
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {record.event_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(record.check_in_time).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {record.check_out_time
                          ? new Date(record.check_out_time).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
