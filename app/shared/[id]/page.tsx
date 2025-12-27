'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/components/Layout/MainLayout';
import ReactMarkdown from 'react-markdown';
import { Share2, Copy, Check, Calendar, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface SharedChatData {
  id: string;
  title?: string;
  messages?: Array<{
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
  }>;
  prompt?: string;
  response?: string;
  created_at: string;
}

export default function SharedChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [chatData, setChatData] = useState<SharedChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const id = params?.id as string;
  const token = searchParams?.get('t');

  useEffect(() => {
    async function fetchSharedChat() {
      if (!id || !token) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/share/${id}?t=${token}`);
        
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to load shared chat');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setChatData(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared chat:', err);
        setError('Failed to load shared chat');
        setLoading(false);
      }
    }

    fetchSharedChat();
  }, [id, token]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MainLayout
        onNewChat={() => {}}
        chatHistory={[]}
        onSelectChat={() => {}}
        onDeleteChat={() => {}}
        onPinChat={() => {}}
        onRenameChat={() => {}}
        onShareChat={() => {}}
        selectedChatId={null}
        onOpenSettings={() => {}}
        isMobile={false}
        chatTitle="Loading..."
        isChatActive={false}
      >
        <div className="flex items-center justify-center h-screen bg-white dark:bg-[#0E2F29]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading shared chat...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !chatData) {
    return (
      <MainLayout
        onNewChat={() => {}}
        chatHistory={[]}
        onSelectChat={() => {}}
        onDeleteChat={() => {}}
        onPinChat={() => {}}
        onRenameChat={() => {}}
        onShareChat={() => {}}
        selectedChatId={null}
        onOpenSettings={() => {}}
        isMobile={false}
        chatTitle="Error"
        isChatActive={false}
      >
        <div className="flex items-center justify-center h-screen bg-white dark:bg-[#0E2F29]">
          <div className="text-center max-w-md px-4">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Share2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Unable to Load Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'This shared link may have expired or is invalid.'}
            </p>
            <button
              onClick={() => window.location.href = '/chat'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Chat
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      onNewChat={() => window.location.href = '/chat'}
      chatHistory={[]}
      onSelectChat={() => {}}
      onDeleteChat={() => {}}
      onPinChat={() => {}}
      onRenameChat={() => {}}
      onShareChat={() => {}}
      selectedChatId={null}
      onOpenSettings={() => {}}
      isMobile={false}
      chatTitle="Shared Chat"
      isChatActive={true}
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#0E2F29]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#1a4a42] bg-white dark:bg-[#16423C] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shared Chat
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(chatData.created_at)}
                </div>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#0E2F29] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a4a42] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Display messages array or fallback to prompt/response */}
            {chatData.messages && chatData.messages.length > 0 ? (
              // New format: messages array
              chatData.messages.map((message, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    {message.sender === 'user' ? (
                      session?.user?.image ? (
                        <Image 
                          src={session.user.image} 
                          alt="User" 
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">U</span>
                        </div>
                      )
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gray-100 dark:bg-[#16423C]'
                        : 'bg-white dark:bg-[#16423C] border border-gray-200 dark:border-[#1a4a42]'
                    }`}>
                      {message.sender === 'ai' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {message.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Legacy format: prompt and response
              <>
                {chatData.prompt && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {session?.user?.image ? (
                        <Image 
                          src={session.user.image} 
                          alt="User" 
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">U</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-[#16423C] rounded-2xl px-4 py-3">
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {chatData.prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {chatData.response && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-[#16423C] rounded-2xl px-4 py-3 border border-gray-200 dark:border-[#1a4a42]">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{chatData.response}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {!session && (
          <div className="border-t border-gray-200 dark:border-[#1a4a42] bg-gray-50 dark:bg-[#16423C] px-6 py-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Want to create your own chats? Sign up for free!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/chat'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
