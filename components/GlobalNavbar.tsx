"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu, Sun, Moon, Sparkles, LogOut } from 'lucide-react';

export default function GlobalNavbar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = saved || (prefersDark ? 'dark' : 'light');
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            onClick={() => window.dispatchEvent(new Event('toggleSidebar'))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Ace</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!session ? (
            <>
              <button onClick={() => signIn()} className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">Log in</button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {session.user?.image ? (
                <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">{(session.user?.name || session.user?.email || 'U').toString().slice(0,2).toUpperCase()}</div>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Sign out">
                <LogOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
