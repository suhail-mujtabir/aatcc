'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';

export default function ImportStudentsPage() {
  const { admin, loading } = useAdmin();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/students/bulk-import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: 0,
          errors: [data.error || 'Upload failed']
        });
        setUploading(false);
        return;
      }

      setResult(data);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setResult({
        success: 0,
        errors: ['Network error. Please try again.']
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
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
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Import Students from CSV
          </h1>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              CSV Format Requirements
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md font-mono text-sm">
              <div className="text-gray-700 dark:text-gray-300">
                student_id,name,pass,email<br/>
                23-01-001,Jane Smith,pass123,jane@example.com<br/>
                23-01-002,John Doe,pass456,john@example.com
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Required columns: student_id, name, pass</li>
              <li>• Optional column: email</li>
              <li>• Student ID format: YY-SS-NNN (e.g., 23-01-002)</li>
              <li>• Passwords will be securely hashed</li>
              <li>• Maximum 1000 students per upload</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select CSV File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Importing...' : 'Import Students'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.errors.length === 0
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-yellow-50 dark:bg-yellow-900/20'
            }`}>
              <h3 className={`font-medium ${
                result.errors.length === 0
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                Import Results
              </h3>
              <p className={`mt-2 text-sm ${
                result.errors.length === 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                Successfully imported: {result.success} students
              </p>
              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Errors ({result.errors.length}):
                  </p>
                  <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li>• ... and {result.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
