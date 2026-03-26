'use client';

import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  status: string;
  start_time: string;
}

interface ImportResult {
  success: number;
  errors: Array<{ line: number; student_id: string; error: string }>;
  totalErrors: number;
  skipped: number;
  eventName?: string;
}

export default function ImportRegistrationsPage() {
  const { admin } = useAdmin();
  const [file, setFile] = useState<File | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Fetch upcoming and active events with React Query (5-minute cache)
  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ['admin-events-for-registration'],
    queryFn: async () => {
      const res = await fetch('/api/admin/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      // Filter to upcoming and active events only
      return {
        events: data.events.filter(
          (e: Event) => e.status === 'upcoming' || e.status === 'active'
        ),
      };
    },
  });

  const events: Event[] = eventsData?.events || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file extension instead of MIME type (more reliable for CSV)
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.csv')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        alert('Please select a valid CSV file');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!selectedEventId) {
      alert('Please select an event');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', selectedEventId);

      const response = await fetch('/api/admin/registrations/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to import registrations');
        return;
      }

      setResult(data);
      setFile(null);
      setSelectedEventId('');
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Import error:', error);
      alert('An error occurred during import');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Import Registrations
              </h1>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {admin?.name}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                CSV File Requirements
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>
                  Your CSV file must contain a <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">student_id</code> column.
                  Additional columns (name, email) are allowed and will be ignored.
                </p>
                <div className="mt-3">
                  <p className="font-medium mb-1">Example CSV format:</p>
                  <pre className="bg-white dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`student_id,name,email
23-01-001,John Doe,john@example.com
23-01-002,Jane Smith,jane@example.com
23-01-003,Bob Wilson,bob@example.com`}
                  </pre>
                </div>
                <ul className="list-disc list-inside space-y-1 mt-3">
                  <li>Maximum 500 registrations per import</li>
                  <li>Students must already exist in the database</li>
                  <li>Duplicate registrations will be skipped automatically</li>
                  <li>Works with direct Google Forms CSV exports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upload Registration CSV
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Event *
              </label>
              {loadingEvents ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading events...
                </div>
              ) : events.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming or active events available. Please create an event first.
                </div>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                  required
                  disabled={uploading}
                >
                  <option value="">-- Select an event --</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.status}) - {new Date(event.start_time).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CSV File *
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {file ? file.name : 'Click to upload CSV file'}
                    </span>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !file || !selectedEventId || events.length === 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Importing...' : 'Import Registrations'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import Results
            </h2>

            {result.totalErrors === 0 ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Successfully imported {result.success} registration{result.success !== 1 ? 's' : ''} for{' '}
                      <strong>{result.eventName}</strong>
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {result.skipped} duplicate registration{result.skipped !== 1 ? 's were' : ' was'} skipped
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Import completed with {result.totalErrors} error{result.totalErrors !== 1 ? 's' : ''}
                    </p>
                    {result.success > 0 && (
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                        {result.success} registration{result.success !== 1 ? 's were' : ' was'} imported successfully
                      </p>
                    )}
                    <div className="mt-2">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Errors (showing first 10):
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index} className="font-mono text-xs">
                            Line {error.line}: {error.student_id} - {error.error}
                          </li>
                        ))}
                      </ul>
                      {result.totalErrors > 10 && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                          ...and {result.totalErrors - 10} more error{result.totalErrors - 10 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
