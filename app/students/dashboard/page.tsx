import { redirect } from 'next/navigation';
import { requireStudent } from '@/lib/student-auth';
import { createAdminClient } from '@/lib/supabase';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';

export default async function StudentDashboardPage() {
  let session;
  
  try {
    session = await requireStudent();
  } catch (error) {
    console.error('Session error:', error);
    redirect('/login');
  }

  const supabase = createAdminClient();
  
  // Fetch all data in parallel for optimal performance
  const [
    { data: student, error: studentError },
    { data: attendanceRecords, error: attendanceError },
    { data: upcomingEvents, error: upcomingError },
    { count: attendanceCount },
    { data: allEvents, error: allEventsError }
  ] = await Promise.all([
    // 1. Student profile
    supabase
      .from('students')
      .select('name, student_id, bio')
      .eq('id', session.id)
      .single(),
    
    // 2. Recent attendance history (last 10)
    supabase
      .from('attendance')
      .select(`
        id,
        checked_in_at,
        events!inner (
          name,
          description,
          status
        )
      `)
      .eq('student_id', session.id)
      .order('checked_in_at', { ascending: false })
      .limit(10),
    
    // 3. Upcoming/Active events student is registered for
    supabase
      .from('registrations')
      .select(`
        id,
        events!inner (
          id,
          name,
          description,
          start_time,
          end_time,
          status,
          deleted_at
        )
      `)
      .eq('student_id', session.id)
      .or('status.eq.upcoming,status.eq.active', { foreignTable: 'events' })
      .is('events.deleted_at', null),
    
    // 4. Total attendance count
    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', session.id),
    
    // 5. All upcoming/active events (not filtered by registration)
    supabase
      .from('events')
      .select('id, name, description, start_time, end_time, status')
      .in('status', ['upcoming', 'active'])
      .is('deleted_at', null)
      .order('start_time', { ascending: true })
  ]);

  if (studentError || !student) {
    console.error('Database error:', studentError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading profile</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {studentError?.message || 'Student record not found'}
          </div>
        </div>
      </div>
    );
  }

  const totalAttended = attendanceCount || 0;
  const recentAttendance = attendanceRecords || [];
  const registeredEvents = upcomingEvents || [];
  const availableEvents = allEvents || [];
  
  // Find active event student is registered for
  const activeEventReg = registeredEvents.find((reg: any) => reg.events?.status === 'active');
  const activeEvent = activeEventReg?.events;
  
  // Get registered event IDs for comparison
  const registeredEventIds = new Set(registeredEvents.map((reg: any) => reg.events?.id));

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.completed}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logout */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Student Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {process.env.NEXT_PUBLIC_ORG_NAME || 'Student Organization'}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Active Event Banner */}
        {activeEvent && typeof activeEvent === 'object' && 'name' in activeEvent && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">
                  🎉 {String(activeEvent.name)} is Active Now!
                </h3>
                <p className="text-sm text-green-50 mt-1">
                  Don't forget to check in with your NFC card to mark your attendance.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Student ID: {student.student_id}
                </p>
              </div>
              <Link
                href="/students/dashboard/edit"
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md transition-colors"
              >
                Edit Profile
              </Link>
            </div>
            
            {student.bio && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </h3>
                <p className="text-gray-900 dark:text-gray-100 text-sm">
                  {student.bio}
                </p>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Events Attended
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalAttended}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/students/dashboard/change-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Change Password →
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* All Upcoming/Active Events */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
            </div>

            {availableEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No upcoming events at the moment.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  Check back later for new events!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableEvents.map((event: any) => {
                  const isRegistered = registeredEventIds.has(event.id);
                  return (
                    <div
                      key={event.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {event.name}
                          </h3>
                          {isRegistered && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              ✓ Registered
                            </span>
                          )}
                        </div>
                        <StatusBadge status={event.status} />
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {event.description.slice(0, 80)}
                          {event.description.length > 80 && '...'}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(event.start_time)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* My Registered Events */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Registered Events
              </h2>
            </div>

            {registeredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  You haven't registered for any events yet.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  Contact your admin to register for events.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {registeredEvents.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {reg.events.name}
                      </h3>
                      <StatusBadge status={reg.events.status} />
                    </div>
                    {reg.events.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {reg.events.description.slice(0, 80)}
                        {reg.events.description.length > 80 && '...'}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(reg.events.start_time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Attendance History */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Attendance History
            </h2>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No attendance records yet.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                Check in at events using your NFC card to start tracking!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentAttendance.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {record.events?.name || 'Unknown Event'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(record.checked_in_at)}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
