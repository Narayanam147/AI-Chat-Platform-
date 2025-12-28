'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Feedback {
  id: string;
  feedback: string;
  user_email: string;
  timestamp: string;
  status: string;
  created_at: string;
}

// Add admin emails here
const ADMIN_EMAILS = [
  'sarvanmdubey@gmail.com',
  // Add more admin emails as needed
];

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!session?.user?.email) return;
      
      try {
        const res = await fetch('/api/feedback');
        if (!res.ok) {
          throw new Error('Failed to fetch feedback');
        }
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchFeedback();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#131314] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#131314] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-[#C4C7C5] mb-4">Please sign in to access this page.</p>
          <Link href="/" className="text-blue-600 hover:underline">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#131314] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">Admin Access Required</h1>
          <p className="text-gray-600 dark:text-[#C4C7C5] mb-4">You do not have permission to view this page.</p>
          <Link href="/chat" className="text-blue-600 hover:underline">Go to Chat</Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#131314]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] shadow-sm border-b border-gray-200 dark:border-[#333537]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-[#333537] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-[#C4C7C5]" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-[#E3E3E3]">Admin - User Feedback</h1>
            </div>
            <span className="text-sm text-gray-500 dark:text-[#C4C7C5]">
              {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-[#E3E3E3] mb-2">No feedback yet</h3>
            <p className="text-gray-500 dark:text-[#C4C7C5]">User feedback will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div 
                key={fb.id} 
                className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-[#333537] p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {fb.user_email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-[#E3E3E3]">{fb.user_email}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-[#C4C7C5]">
                        <Clock className="w-3 h-3" />
                        {new Date(fb.created_at || fb.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(fb.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fb.status)}`}>
                      {fb.status || 'pending'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-[#E3E3E3] whitespace-pre-wrap">{fb.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


