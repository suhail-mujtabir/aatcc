'use client';

import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';
import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Users } from 'lucide-react';

interface ActivationResult {
  success: boolean;
  student?: {
    name: string;
    studentId: string;
    cardUid: string;
  };
  error?: string;
}

interface RecentActivation {
  studentId: string;
  name: string;
  cardUid: string;
  timestamp: string;
}

export default function CardActivationPage() {
  const { admin } = useAdmin();
  const [studentId, setStudentId] = useState('');
  const [cardUid, setCardUid] = useState('');
  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [recentActivations, setRecentActivations] = useState<RecentActivation[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim() || !cardUid.trim()) {
      setResult({
        success: false,
        error: 'Both Student ID and Card UID are required'
      });
      return;
    }

    setActivating(true);
    setResult(null);

    try {
      const response = await fetch('/api/cards/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId.trim(),
          cardUid: cardUid.trim().toUpperCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || 'Failed to activate card'
        });
        return;
      }

      // Success
      setResult({
        success: true,
        student: {
          name: data.student.name,
          studentId: data.student.studentId,
          cardUid: data.student.cardUid
        }
      });

      // Add to recent activations
      const newActivation: RecentActivation = {
        studentId: data.student.studentId,
        name: data.student.name,
        cardUid: data.student.cardUid,
        timestamp: new Date().toISOString()
      };
      setRecentActivations(prev => [newActivation, ...prev].slice(0, 10));

      // Clear form
      setStudentId('');
      setCardUid('');
      
      // Auto-focus student ID field for next card
      setTimeout(() => {
        document.getElementById('student-id-input')?.focus();
      }, 100);

    } catch (error) {
      console.error('Activation error:', error);
      setResult({
        success: false,
        error: 'An error occurred during activation'
      });
    } finally {
      setActivating(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
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
                Card Activation
              </h1>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {admin?.name}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Instructions Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Card Activation Instructions
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>
                  <strong>Current Mode:</strong> Manual Activation (before ESP32 hardware arrives)
                </p>
                <ul className="list-disc list-inside space-y-1 mt-3">
                  <li>Read the NFC card UID using a separate NFC reader or phone</li>
                  <li>Enter the student ID (format: YY-SS-NNN, e.g., 23-01-002)</li>
                  <li>Enter the card UID (format: AA:BB:CC:DD:EE:FF:00)</li>
                  <li>Click "Activate Card" to link them</li>
                  <li>Each card can only be assigned to one student</li>
                </ul>
                <p className="mt-3 text-xs">
                  <strong>Note:</strong> Once ESP32 device is ready, this page will automatically detect cards in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Activation Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activate New Card
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student ID Input */}
              <div>
                <label 
                  htmlFor="student-id-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Student ID *
                </label>
                <input
                  id="student-id-input"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="23-01-002"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                  disabled={activating}
                  autoFocus
                />
              </div>

              {/* Card UID Input */}
              <div>
                <label 
                  htmlFor="card-uid-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Card UID *
                </label>
                <input
                  id="card-uid-input"
                  type="text"
                  value={cardUid}
                  onChange={(e) => setCardUid(e.target.value)}
                  placeholder="AA:BB:CC:DD:EE:FF:00"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                  disabled={activating}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Format: Uppercase hex with colons (e.g., AA:BB:CC:DD:EE:FF:00)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={activating}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activating ? 'Activating...' : 'Activate Card'}
              </button>
            </form>

            {/* Result Display */}
            {result && (
              <div className="mt-6">
                {result.success ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Card Activated Successfully!
                        </p>
                        {result.student && (
                          <div className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                            <p><strong>Name:</strong> {result.student.name}</p>
                            <p><strong>Student ID:</strong> {result.student.studentId}</p>
                            <p><strong>Card UID:</strong> <span className="font-mono">{result.student.cardUid}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Activation Failed
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {result.error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activations Sidebar */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activations
              </h2>
            </div>

            {recentActivations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No activations yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Recent activations will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivations.map((activation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activation.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ID: {activation.studentId}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1 truncate">
                          {activation.cardUid}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {formatTimestamp(activation.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {recentActivations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Activated (session): {recentActivations.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
