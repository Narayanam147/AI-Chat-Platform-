'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Search, ArrowLeft } from 'lucide-react';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          title: 'How to start a new chat?',
          content: 'Simply type your message in the input field and press Enter or click the Send button. The AI will respond to your query within seconds.'
        },
        {
          title: 'How do I create an account?',
          content: 'Click the "Sign Up" button in the top right corner. Enter your name, email, and password, or use Google/Facebook OAuth for quick signup.'
        },
        {
          title: 'Can I use the app without signing up?',
          content: 'Yes! You can chat as a guest without signing up. However, your chat history won\'t be saved. Sign up to save and access your chats across devices.'
        }
      ]
    },
    {
      id: 'chat-features',
      title: 'Chat Features',
      icon: '💬',
      articles: [
        {
          title: 'What are shorthand commands?',
          content: 'Shorthand commands let you quickly ask the AI to do specific tasks. Type / to see available commands like /sum (summarize), /explain, /code, /tldr, etc.'
        },
        {
          title: 'How do I pin a chat?',
          content: 'Open the chat, click the three-dot menu at the top, and select "Pin". Pinned chats appear at the top of your chat history.'
        },
        {
          title: 'How can I rename a chat?',
          content: 'Click the three-dot menu on a chat and select "Rename". Enter the new title and save.'
        },
        {
          title: 'Can I share a chat with others?',
          content: 'Yes! Click the three-dot menu and select "Share" to get a shareable link of that conversation.'
        },
        {
          title: 'How do I export my chat?',
          content: 'Click the export button (download icon) to save your chat as a Word document (.docx) or PDF.'
        }
      ]
    },
    {
      id: 'search-filters',
      title: 'Search & Filters',
      icon: '🔍',
      articles: [
        {
          title: 'How do I search my chat history?',
          content: 'Use the search bar in the sidebar to find chats by keywords. Results update in real-time as you type.'
        },
        {
          title: 'What do the filter buttons do?',
          content: 'Use "All" to see all chats, "Today" to see today\'s chats, and "Pinned" to see only pinned conversations.'
        },
        {
          title: 'How can I organize my chats?',
          content: 'Use the pin feature to keep important chats at the top, rename them for easy identification, and use filters to find them quickly.'
        }
      ]
    },
    {
      id: 'ai-capabilities',
      title: 'AI Capabilities',
      icon: '🤖',
      articles: [
        {
          title: 'What can the AI do?',
          content: 'The AI can answer questions, write code, summarize text, explain concepts, generate ideas, analyze information, and much more.'
        },
        {
          title: 'Does it search the web?',
          content: 'Yes! The AI automatically searches the web for real-time information when needed to provide accurate, up-to-date answers.'
        },
        {
          title: 'Can it generate code?',
          content: 'Absolutely! Use the /code command or ask directly. The AI can generate, debug, and explain code in multiple programming languages.'
        },
        {
          title: 'Is my chat data private?',
          content: 'Your conversations are stored securely. We never use your data for training. You can delete chats anytime.'
        }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      icon: '⚙️',
      articles: [
        {
          title: 'How do I change my password?',
          content: 'Log in to your account, go to settings, and select "Change Password". Enter your current password and the new password.'
        },
        {
          title: 'How do I delete my account?',
          content: 'Go to Settings > Account > Delete Account. This will permanently delete your account and all associated chat history.'
        },
        {
          title: 'Can I switch between light and dark mode?',
          content: 'Yes! Click the theme toggle button (sun/moon icon) in the top right corner to switch between light and dark modes.'
        },
        {
          title: 'How do I sign out?',
          content: 'Click your profile icon in the top right corner and select "Sign Out". You\'ll be logged out of your account.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      articles: [
        {
          title: 'Why isn\'t the AI responding?',
          content: 'Check your internet connection. If the issue persists, try refreshing the page. If you\'re still experiencing issues, contact support.'
        },
        {
          title: 'My chats aren\'t saving',
          content: 'Make sure you\'re logged in. Guest users\' chats aren\'t saved. Sign up to enable chat history.'
        },
        {
          title: 'The app is running slowly',
          content: 'Try clearing your browser cache, disabling browser extensions, or using a different browser.'
        },
        {
          title: 'I forgot my password',
          content: 'Click "Forgot Password" on the login screen and follow the instructions to reset your password via email.'
        }
      ]
    }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || searchQuery === '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Help Center</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{category.title}</h2>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedCategory === category.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="p-6 space-y-4">
                      {category.articles.map((article, idx) => (
                        <div key={idx} className="pb-4 last:pb-0 last:border-0 border-b border-gray-200 dark:border-gray-600">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{article.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No articles found matching your search.</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Still need help?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Can't find what you're looking for? Contact our support team.</p>
          <a href="mailto:support@ai-chat.enginner" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Contact Support
          </a>
        </div>

        {/* Related Documents */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Related Documents:</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Chat Platform</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Owner: Narayanam Dubey</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Email: <a href="mailto:support@ai-chat.enginner" className="text-blue-600 dark:text-blue-400 hover:underline">support@ai-chat.enginner</a></p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Website: <a href="https://www.ai-chat.enginner" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.ai-chat.enginner</a></p>
        </div>
      </div>
    </div>
  );
}
