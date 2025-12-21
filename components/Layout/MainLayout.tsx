'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Menu, Moon, Sun, Sparkles, LogOut, Settings, Plus, MessageSquare, Search, X, Trash2 } from 'lucide-react';
import { ChatHistoryDropdown } from '@/components/ChatHistoryDropdown';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  onNewChat?: () => void;
  chatHistory?: any[];
  onSelectChat?: (chat: any) => void;
  onDeleteChat?: (chatId: string) => void;
  onPinChat?: (chatId: string) => void;
  onRenameChat?: (chatId: string) => void;
  onShareChat?: (chatId: string) => void;
  selectedChatId?: string | null;
  onOpenSettings?: () => void;
  isMobile?: boolean;
}

export function MainLayout({ 
  children, 
  title = 'AI Chat',
  onNewChat,
  chatHistory = [],
  onSelectChat,
  onDeleteChat,
  onPinChat,
  onRenameChat,
  onShareChat,
  selectedChatId,
  onOpenSettings,
  isMobile: isMobileProp
}: MainLayoutProps) {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop, will adjust for mobile
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileState, setIsMobileState] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const authModalRef = useRef<HTMLDivElement>(null);

  // Use prop if provided, otherwise use state
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileState;

  // Detect mobile and set initial sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileState(mobile);
      // On mobile, sidebar should start closed
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Listen for toggleSidebar events from chat page
    const handleToggleSidebar = () => {
      if (isMobile) {
        setIsSidebarOpen(prev => !prev);
      } else {
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, [isMobile]);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const registerRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword, name: authName }),
        });
        if (!registerRes.ok) {
          const error = await registerRes.json();
          throw new Error(error.error || 'Registration failed');
        }
        const result = await signIn('credentials', { email: authEmail, password: authPassword, redirect: false });
        if (result?.error) throw new Error(result.error);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      } else {
        const result = await signIn('credentials', { email: authEmail, password: authPassword, redirect: false });
        if (result?.error) throw new Error(result.error);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (authModalRef.current && !authModalRef.current.contains(event.target as Node)) {
        setShowAuthModal(false);
      }
    };
    if (showProfileMenu || showAuthModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu, showAuthModal]);

  const filteredHistory = searchQuery.trim()
    ? chatHistory.filter(chat => 
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.preview?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatHistory;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900">

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay - Click to close sidebar - MUST be below sidebar z-index */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-[70] transition-opacity duration-300" 
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Sidebar - Above overlay (z-80) but below top navbar (z-100) */}
        <aside
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 top-[57px]' : 'relative flex-shrink-0'}
            z-[80]
            h-full
            bg-white dark:bg-gray-900
            border-r border-gray-200 dark:border-gray-800
            transition-all duration-300 ease-in-out
            ${isMobile 
              ? isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
              : isSidebarOpen ? 'w-64' : 'w-0'
            }
            ${isMobile && isSidebarOpen && 'shadow-2xl'}
            overflow-hidden
          `}
        >
          <div className={`h-full flex flex-col ${!isSidebarOpen && !isMobile ? 'invisible w-0' : 'visible'}`}>
            {/* Sidebar Header */}
            <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
              <button
                onClick={() => {
                  onNewChat?.();
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 scroll-smooth">
              {filteredHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No chats yet</div>
              ) : (
                <div className="space-y-1">
                  {filteredHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onSelectChat?.(chat);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`group relative px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                        selectedChatId === chat.id ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{chat.title}</p>
                          {chat.preview && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">{chat.preview}</p>}
                        </div>
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <ChatHistoryDropdown
                            chatId={chat.id}
                            isPinned={chat.pinned}
                            onPin={(id) => {
                              onPinChat?.(id);
                              if (isMobile) setIsSidebarOpen(false);
                            }}
                            onRename={(id) => {
                              onRenameChat?.(id);
                            }}
                            onShare={(id) => {
                              onShareChat?.(id);
                            }}
                            onDelete={(id) => {
                              onDeleteChat?.(id);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Button at Bottom - Always Visible */}
            <div className="flex-shrink-0 mt-auto p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={() => { 
                  onOpenSettings?.(); 
                  if (isMobile) setIsSidebarOpen(false); 
                }}
                className="w-full px-3 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 touch-manipulation active:bg-gray-200 dark:active:bg-gray-700"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Expands to 100% when sidebar closes on desktop */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-white dark:bg-gray-900 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
