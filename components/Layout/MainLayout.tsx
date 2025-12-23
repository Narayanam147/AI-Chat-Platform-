'use client';

import Image from 'next/image';
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Menu, Moon, Sun, Sparkles, LogOut, Settings, Plus, MessageSquare, Search, X, Trash2, Pin, Edit3, Share2, ChevronDown } from 'lucide-react';
import { ChatHistoryDropdown } from '@/components/ChatHistoryDropdown';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  activeTitle?: string | null;
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
  chatTitle?: string;
  isChatActive?: boolean;
}

export function MainLayout({ 
  children, 
  title = 'AI Chat',
  activeTitle = null,
  onNewChat,
  chatHistory = [],
  onSelectChat,
  onDeleteChat,
  onPinChat,
  onRenameChat,
  onShareChat,
  selectedChatId,
  onOpenSettings,
  isMobile: isMobileProp,
  chatTitle,
  isChatActive,
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
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

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
    if (initialTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  // Set a CSS variable with the header height so mobile sidebar can align exactly beneath it
  useEffect(() => {
    const setHeaderHeight = () => {
      const h = headerRef.current?.getBoundingClientRect().height || 64;
      try {
        document.documentElement.style.setProperty('--app-header-height', `${h}px`);
      } catch (e) {
        // Ignore (some environments may restrict)
      }
    };
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
    return () => window.removeEventListener('resize', setHeaderHeight);
  }, []);

  // Listen for theme changes from settings
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ theme: 'light' | 'dark' }>) => {
      setTheme(e.detail.theme);
    };
    window.addEventListener('themeChange' as any, handleThemeChange);
    return () => window.removeEventListener('themeChange' as any, handleThemeChange);
  }, []);

  // Toggle theme and persist
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try { localStorage.setItem('theme', newTheme); } catch (e) {}
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  };

  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email[0].toUpperCase();
    }
    return 'U';
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

  // Close actions menu on outside click
  useEffect(() => {
    const handleClickOutsideActions = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutsideActions);
      return () => document.removeEventListener('mousedown', handleClickOutsideActions);
    }
  }, [showActionsMenu]);

  const filteredHistory = searchQuery.trim()
    ? chatHistory.filter(chat => 
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.preview?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatHistory;

  const selectedChat = chatHistory.find(c => String(c.id) === String(selectedChatId)) || null;
  const isSelectedPinned = Boolean(selectedChat?.pinned);
  // Determine which chat id to use for header actions: prefer selectedChatId, otherwise try to match activeTitle, fallback to first chat
  const headerChatId = selectedChatId
    || (activeTitle ? (chatHistory.find(c => c.title === activeTitle)?.id as string | undefined) : undefined)
    || (chatHistory.length > 0 ? String(chatHistory[0].id) : undefined);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Top Navbar - single header with left controls, centered chat title + actions, and right profile */}
      <header ref={headerRef} className="sticky top-0 z-[100] px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="relative flex items-center justify-between">
          {/* Left: hamburger + Ace */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ace</span>
            </div>
          </div>

          {/* Center: absolutely centered title with actions (keeps perfect center) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative" ref={actionsMenuRef}>
              {(activeTitle || selectedChatId) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowActionsMenu(prev => !prev); }}
                  className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 pointer-events-auto"
                  aria-expanded={showActionsMenu}
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[48vw]">
                    {activeTitle || title || 'Untitled Chat'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              )}
              {showActionsMenu && headerChatId && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[150] overflow-hidden">
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => { onPinChat?.(String(headerChatId)); setShowActionsMenu(false); }}>
                    <Pin className="w-4 h-4" />
                    <span>{isSelectedPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => { onRenameChat?.(String(headerChatId)); setShowActionsMenu(false); }}>
                    <Edit3 className="w-4 h-4" />
                    <span>Rename</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => { onShareChat?.(String(headerChatId)); setShowActionsMenu(false); }}>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => { onDeleteChat?.(String(headerChatId)); setShowActionsMenu(false); }}>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: theme toggle + profile/login */}
          <div className="flex items-center gap-3">
            <button onClick={(e) => { e.stopPropagation(); handleThemeToggle(); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onOpenSettings?.(); if (isMobile) setIsSidebarOpen(false); }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Settings"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="relative" ref={profileMenuRef}>
              {!session ? (
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setAuthMode('login'); setShowAuthModal(true); setAuthError(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Log In</button>
                  <button onClick={(e) => { e.stopPropagation(); setAuthMode('signup'); setShowAuthModal(true); setAuthError(''); }} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Sign Up</button>
                </div>
              ) : (
                <>
                  <div onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }} className="cursor-pointer">
                    {session?.user?.image ? (
                      <Image src={session.user.image as string} alt="User" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                      </div>
                    )}
                  </div>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100] overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{session?.user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{session?.user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"> <LogOut className="w-4 h-4 inline-block mr-2"/> Sign out</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

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
          style={isMobile ? { top: 'var(--app-header-height)' } : undefined}
          className={`
            ${isMobile ? 'fixed left-0 bottom-0' : 'relative flex-shrink-0'}
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
        {/* Keep main container overflow-hidden so inner views manage scrolling (single scrollbar) */}
        <main className="flex-1 min-w-0 overflow-hidden bg-white dark:bg-gray-900 transition-all duration-300">
          {children}
        </main>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div ref={authModalRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{authMode === 'login' ? 'Log In' : 'Sign Up'}</h2>
              <button onClick={() => { setShowAuthModal(false); setAuthError(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{authError}</p>
                </div>
              )}
              
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/chat' })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300"
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
                  className="w-full px-4 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with email</span>
                </div>
              </div>
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your name" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="your.email@example.com" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required minLength={6} />
              </div>
              <button type="submit" disabled={authLoading} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium">
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
