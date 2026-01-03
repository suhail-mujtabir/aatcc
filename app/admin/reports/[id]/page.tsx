'use client';

import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';
import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Mail,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Attendee {
  id: string;
  studentId: string;
  name: string;
  email: string | null;
  checkedInAt: string;
}

interface EventData {
  event: {
    id: string;
    name: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
  };
  attendees: Attendee[];
  totalAttendees: number;
}

export default function EventReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { admin } = useAdmin();
  const queryClient = useQueryClient();
  const { id: eventId } = use(params);
  
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // Fetch event attendance data
  const { data, isLoading, error } = useQuery<EventData>({
    queryKey: ['event-attendance', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/events/${eventId}/attendance`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch attendance');
      }
      return res.json();
    },
  });

  // Send certificates mutation
  const handleSendCertificates = async () => {
    if (!confirm(`Send certificates to ${data?.totalAttendees} attendees?`)) {
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/send-certificates`, {
        method: 'POST',
      });

      const result = await res.json();

      if (result.success) {
        setSendResult({
          type: 'success',
          message: result.message,
          sent: result.results.sent,
          failed: result.results.failed,
        });
      } else {
        setSendResult({
          type: 'error',
          message: result.error || 'Failed to send certificates',
          details: result.details,
        });
      }
    } catch (error) {
      setSendResult({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (!data) return;

    const csvContent = [
      ['Name', 'Email', 'Student ID', 'Event', 'Checked In At'],
      ...data.attendees.map((a) => [
        a.name,
        a.email || 'N/A',
        a.studentId,
        data.event.name,
        new Date(a.checkedInAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.event.name.replace(/[^a-z0-9]/gi, '_')}_attendance_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count attendees with emails
  const attendeesWithEmail = data?.attendees.filter((a) => a.email).length || 0;
  const attendeesWithoutEmail = (data?.totalAttendees || 0) - attendeesWithEmail;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/reports"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Link>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{admin?.name}</div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error.message}</p>
          </div>
        )}

        {/* Data Loaded */}
        {!isLoading && !error && data && (
          <>
            {/* Event Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {data.event.name}
              </h1>
              {data.event.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{data.event.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(data.event.startTime)}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {data.totalAttendees} Attendees
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h2>
              <div className="flex flex-wrap gap-4">
                {/* Download CSV Button */}
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </button>

                {/* Send Certificates Button */}
                <button
                  onClick={handleSendCertificates}
                  disabled={isSending || attendeesWithEmail === 0}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Certificates ({attendeesWithEmail})
                    </>
                  )}
                </button>
              </div>

              {/* Email Warning */}
              {attendeesWithoutEmail > 0 && (
                <div className="mt-4 flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {attendeesWithoutEmail} student{attendeesWithoutEmail !== 1 ? 's' : ''} without
                    email addresses will not receive certificates
                  </p>
                </div>
              )}

              {/* Send Result */}
              {sendResult && (
                <div
                  className={`mt-4 flex items-start p-4 rounded-lg ${
                    sendResult.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {sendResult.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        sendResult.type === 'success'
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}
                    >
                      {sendResult.message}
                    </p>
                    {sendResult.type === 'success' && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Sent: {sendResult.sent} | Failed: {sendResult.failed}
                      </p>
                    )}
                    {sendResult.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {sendResult.details}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Attendance List ({data.totalAttendees})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Checked In
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.attendees.map((attendee, index) => (
                      <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {attendee.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {attendee.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {attendee.email || (
                            <span className="text-red-500">No email</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(attendee.checkedInAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
