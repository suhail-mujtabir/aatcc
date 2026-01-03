'use client';

import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Mail, FileText, Calendar, Users, Clock } from 'lucide-react';

type EventStatus = 'upcoming' | 'active' | 'completed';

interface Event {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: EventStatus;
  created_at: string;
}

export default function ViewReportsPage() {
  const { admin } = useAdmin();

  // Fetch completed events
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reports-events'],
    queryFn: async () => {
      const res = await fetch('/api/admin/events?status=completed');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
  });

  const events: Event[] = data?.events || [];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate duration
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = Math.abs(endDate.getTime() - startDate.getTime()) / 36e5;
    return hours < 1 ? `${Math.round(hours * 60)} minutes` : `${hours.toFixed(1)} hours`;
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
                View Reports
              </h1>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {admin?.name}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Event Reports & Certificates
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View attendance reports and send certificates for completed events
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Failed to load events. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No completed events
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Events will appear here once they are marked as completed
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && !error && events.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/admin/reports/${event.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Event Name */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {event.name}
                  </h3>

                  {/* Event Description */}
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{calculateDuration(event.start_time, event.end_time)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      <FileText className="h-3 w-3 mr-1" />
                      Completed
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      View Report →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Card */}
        {!isLoading && !error && events.length > 0 && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Certificate Distribution
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>Click on an event to:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>View detailed attendance list</li>
                    <li>Download CSV report for records</li>
                    <li>Send digital certificates via email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
