'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Users, RefreshCw } from 'lucide-react';

interface PendingCard {
  uid: string;
  detected_at: string;
  device_id: string;
}

interface ActivatedCard {
  uid: string;
  name: string;
  studentId: string;
  activatedAt: string;
}

export default function ActivateCardsPage() {
  const [pendingCards, setPendingCards] = useState<PendingCard[]>([]);
  const [recentActivations, setRecentActivations] = useState<ActivatedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalActivated, setTotalActivated] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const supabase = createClient();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (process.env.NODE_ENV === 'development') {
      console.log('Current user:', user);
    }
    setIsAuthenticated(!!user);
    if (!user) {
      setError('Not logged in. Please log in as admin first.');
    }
  };

  // Fetch initial pending cards and setup realtime subscription
  useEffect(() => {
    fetchPendingCards();
    fetchTotalActivated();

    // Subscribe to pending_cards table changes
    const channel = supabase
      .channel('pending_cards_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_cards'
        },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('New card detected:', payload.new);
          }
          setPendingCards((prev) => [payload.new as PendingCard, ...prev]);
          // Audio notification (optional)
          playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'pending_cards'
        },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Card removed:', payload.old);
          }
          setPendingCards((prev) => prev.filter((card) => card.uid !== (payload.old as PendingCard).uid));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingCards = async () => {
    const { data, error } = await supabase
      .from('pending_cards')
      .select('*')
      .order('detected_at', { ascending: false });

    if (!error && data) {
      setPendingCards(data);
    }
  };

  const fetchTotalActivated = async () => {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .not('card_uid', 'is', null);

    if (!error && count !== null) {
      setTotalActivated(count);
    }
  };

  const playNotificationSound = () => {
    // Optional: Play a beep sound when new card detected
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {}); // Ignore errors if audio not available
    } catch {}
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !studentId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/cards/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: studentId.trim(),
          cardUid: selectedCard
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Activation failed');
        setLoading(false);
        return;
      }

      // Success!
      setSuccess(`✓ Activated! ${data.name} (${data.studentId})`);
      
      // Add to recent activations
      setRecentActivations((prev) => [
        {
          uid: data.cardUid,
          name: data.name,
          studentId: data.studentId,
          activatedAt: new Date().toISOString()
        },
        ...prev.slice(0, 9) // Keep last 10
      ]);

      setTotalActivated((prev) => prev + 1);

      // Clear form
      setSelectedCard(null);
      setStudentId('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Dashboard
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Activated: <span className="font-bold">{totalActivated}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Card Activation Station
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Pending Cards */}
          <div className="space-y-6">
            
            {/* Pending Cards List */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Pending Cards ({pendingCards.length})
                </h2>
                <button
                  onClick={fetchPendingCards}
                  className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {pendingCards.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No pending cards</p>
                  <p className="text-sm mt-2">Tap a card on the ESP32 device</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingCards.map((card) => (
                    <button
                      key={card.uid}
                      onClick={() => {
                        setSelectedCard(card.uid);
                        setError('');
                        setSuccess('');
                      }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedCard === card.uid
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                            {card.uid}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Detected: {formatTime(card.detected_at)}
                          </p>
                        </div>
                        {selectedCard === card.uid && (
                          <span className="text-blue-600 dark:text-blue-400 text-xl">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Instructions:
              </h3>
              <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Student taps their NFC card on ESP32 device</li>
                <li>Card appears in "Pending Cards" list automatically</li>
                <li>Click the card to select it (turns blue)</li>
                <li>Enter student ID and click "Activate"</li>
                <li>Success message shows, ready for next card!</li>
              </ol>
            </div>
          </div>

          {/* Right Column: Activation Form */}
          <div className="space-y-6">
            
            {/* Activation Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Activate Selected Card
              </h2>

              {selectedCard ? (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                    Selected Card:
                  </p>
                  <p className="font-mono text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                    {selectedCard}
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ← Select a card from the list
                  </p>
                </div>
              )}

              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="23-01-002"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={!selectedCard || loading}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedCard || !studentId || loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? 'Activating...' : 'Activate Card'}
                </button>
              </form>
            </div>

            {/* Recent Activations */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Activations
                </h2>
              </div>

              {recentActivations.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No activations yet
                </p>
              ) : (
                <div className="space-y-2">
                  {recentActivations.map((activation, index) => (
                    <div
                      key={`${activation.uid}-${index}`}
                      className="flex items-start justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-200">
                          {activation.name}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {activation.studentId}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
