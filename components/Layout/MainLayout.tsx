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
  hideHeader?: boolean; // Hide header on mobile when scrolling
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
  hideHeader = false,
}: MainLayoutProps) {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Full sidebar open state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Desktop: expanded vs collapsed (mini)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const authModalRef = useRef<HTMLDivElement>(null);

  // Check if mobile and set sidebar default
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On desktop, default sidebar open
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Listen for toggleSidebar events from chat page
    const handleToggleSidebar = () => {
      if (isMobile) {
        setIsSidebarOpen(prev => !prev);
      } else {
        setIsSidebarExpanded(prev => !prev);
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
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-900">
      {/* Top Navbar - Hidden when hideHeader is true */}
      {!hideHeader && (
        <header
          className={`sticky top-0 z-[100] flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-transform duration-300 ease-in-out ${
            hideHeader ? 'hidden' : ''
          }`}
        >
        {/* Left Section - Hamburger + Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hamburger Menu - Mobile opens sidebar, Desktop expands sidebar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) {
                setIsSidebarOpen(!isSidebarOpen);
              } else {
                setIsSidebarExpanded(!isSidebarExpanded);
              }
            }}
            className="relative z-[110] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white hidden sm:block">Chat Assistant</span>
          </div>
        </div>

        {/* Center Section - Chat Heading (shown when title is provided) */}
        <div className="flex-1 flex justify-center px-4">
          <h1 className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
            {title !== 'AI Chat' ? title : ''}
          </h1>
        </div>

        {/* Right Section - Theme Toggle + Auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleThemeToggle();
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-slate-400" />}
          </button>

          <div className="relative" ref={profileMenuRef}>
            {!session ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAuthMode('login');
                    setShowAuthModal(true);
                    setAuthError('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors touch-manipulation hidden sm:block"
                >
                  Log In
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAuthMode('signup');
                    setShowAuthModal(true);
                    setAuthError('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors touch-manipulation shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="cursor-pointer touch-manipulation"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-9 h-9 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all shadow-sm">
                      <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                    </div>
                  )}
                </div>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[100] overflow-hidden pointer-events-auto">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{session?.user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{session?.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 touch-manipulation"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex overflow-hidden relative ${hideHeader && isMobile ? 'pt-0' : ''}`}>
        {/* Overlay - Click to close sidebar on mobile */}
        {(isSidebarOpen || (isSidebarExpanded && !isMobile)) && (
          <div 
            className={`fixed inset-0 bg-black/60 z-[55] ${isMobile ? '' : 'lg:hidden'}`}
            onClick={() => {
              setIsSidebarOpen(false);
              setIsSidebarExpanded(false);
            }}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Mini Sidebar - Always visible on desktop (Gemini-style) */}
        {!isMobile && (
          <aside className="hidden lg:flex flex-col w-[72px] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full z-[50]">
            {/* AI Assistant Name - Vertical text at top */}
            <div className="py-5 px-2 border-b border-slate-200 dark:border-slate-800">
              <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => setIsSidebarExpanded(true)}
                title="Expand sidebar"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="mt-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">AI</span>
              </div>
            </div>

            {/* New Chat Button */}
            <div className="p-3">
              <button
                onClick={() => onNewChat?.()}
                className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700"
                aria-label="New chat"
                title="New chat"
              >
                <Plus className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>

            {/* Recent Chats - Click any to expand sidebar */}
            <div 
              className="flex-1 px-3 py-2 space-y-2 overflow-hidden cursor-pointer"
              onClick={() => setIsSidebarExpanded(true)}
            >
              {chatHistory.slice(0, 5).map((chat) => (
                <div
                  key={chat.id}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                    selectedChatId === chat.id
                      ? 'bg-blue-100 dark:bg-blue-900/40 shadow-sm'
                      : 'hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm bg-slate-100 dark:bg-slate-800/50'
                  }`}
                  title={chat.title}
                >
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {chat.title.substring(0, 2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Settings Button */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onOpenSettings?.()}
                className="w-11 h-11 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:shadow-sm"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </aside>
        )}

        {/* Expanded Sidebar - Opens on top of mini sidebar or as overlay on mobile */}
        <aside
          className={`
            fixed lg:fixed inset-y-0 left-0 top-0
            z-[60]
            w-72 lg:w-72
            bg-white dark:bg-slate-900
            border-r border-slate-200 dark:border-slate-800
            transition-transform duration-300 ease-in-out
            ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : (isSidebarExpanded ? 'translate-x-0' : '-translate-x-full')}
            shadow-2xl
            h-full
            flex flex-col
          `}
        >
          {/* Sidebar Header - Fixed at top */}
          <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 safe-area-inset-top">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Chat Assistant</h2>
            </div>
            <button
              onClick={() => {
                if (isMobile) {
                  setIsSidebarOpen(false);
                } else {
                  setIsSidebarExpanded(false);
                }
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="flex-shrink-0 p-3">
            <button
              onClick={() => {
                onNewChat?.();
                if (isMobile) setIsSidebarOpen(false);
                else setIsSidebarExpanded(false);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg touch-manipulation"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="flex-shrink-0 px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg touch-manipulation"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}
            </div>
          </div>

          {/* Chat History - Scrollable area that takes remaining space */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 overscroll-contain">
            {filteredHistory.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">No chats yet</p>
                {!session && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Your chats will be saved automatically
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1 pb-4">
                {filteredHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectChat?.(chat);
                      if (isMobile) setIsSidebarOpen(false);
                      else setIsSidebarExpanded(false);
                    }}
                    className={`group relative px-3 py-3 rounded-xl transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                      selectedChatId === chat.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 shadow-sm' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{chat.title}</p>
                        {chat.preview && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{chat.preview}</p>}
                      </div>
                      {/* Always visible on mobile, hover on desktop */}
                      <div className="flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <ChatHistoryDropdown
                          chatId={chat.id}
                          isPinned={chat.pinned}
                          onPin={(id) => onPinChat?.(id)}
                          onRename={(id) => onRenameChat?.(id)}
                          onShare={(id) => onShareChat?.(id)}
                          onDelete={(id) => onDeleteChat?.(id)}
                        />
                      </div>
                    </div>
                    {chat.pinned && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Button - Fixed at bottom, never scrolls */}
          <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 safe-area-inset-bottom">
            <button
              onClick={() => { 
                onOpenSettings?.(); 
                if (isMobile) setIsSidebarOpen(false);
                else setIsSidebarExpanded(false);
              }}
              className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 rounded-xl transition-colors flex items-center gap-3 touch-manipulation"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content - Accounts for mini sidebar on desktop */}
        <main className="flex-1 min-w-0 overflow-hidden bg-white dark:bg-slate-900 transition-all duration-300 relative z-[10]">
          {children}
        </main>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div ref={authModalRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{authMode === 'login' ? 'Log In' : 'Sign Up'}</h2>
              <button onClick={() => { setShowAuthModal(false); setAuthError(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-sm text-red-700 dark:text-red-400">{authError}</p>
                </div>
              )}
              
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/chat' })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium flex items-center justify-center gap-3 text-slate-700 dark:text-slate-300 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => signIn('facebook', { callbackUrl: '/chat' })}
                  className="w-full px-4 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-3 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with email</span>
                </div>
              </div>
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your name" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="your.email@example.com" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required minLength={6} />
              </div>
              <button type="submit" disabled={authLoading} className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all font-medium shadow-md">
                {authLoading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Sign Up')}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); setAuthPassword(''); }} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
