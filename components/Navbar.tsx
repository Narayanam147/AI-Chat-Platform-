'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Moon, Sun, LogOut, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export function Navbar({ onToggleSidebar, showSidebarToggle = false }: NavbarProps) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const authModalRef = useRef<HTMLDivElement>(null);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
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

  return (
    <>
      {/* Persistent Global Navbar - Always visible, never moves */}
      <nav className="fixed top-0 left-0 right-0 z-[200] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Sidebar Toggle (always show on mobile, conditional on desktop) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Always show on mobile, show on desktop when showSidebarToggle is true */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </button>
            {showSidebarToggle && (
              <button
                onClick={onToggleSidebar}
                className="hidden lg:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>
            )}
          </div>

          {/* Right: Theme Toggle + Auth - ALWAYS VISIBLE */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleThemeToggle}
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
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[201] overflow-hidden pointer-events-auto">
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
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div ref={authModalRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{authMode === 'login' ? 'Log In' : 'Sign Up'}</h2>
              <button onClick={() => { setShowAuthModal(false); setAuthError(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
    </>
  );
}
