'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentProfile {
  id: string;
  student_id: string;
  name: string;
  bio: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
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
      setFormData({
        name: data.student.name,
        student_id: data.student.student_id,
        bio: data.student.bio || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/students/dashboard');
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h1>
            <Link
              href="/students/dashboard"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Profile updated successfully! Redirecting...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Student ID
              </label>
              <input
                id="student_id"
                type="text"
                disabled
                value={formData.student_id}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                title="Student ID cannot be changed"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Student ID cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/students/dashboard"
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
