'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Navbar } from '@/components/Navbar/Navbar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutContainerProps {
  children: ReactNode;
  showSidebar?: boolean;
  title?: string;
}

export function LayoutContainer({ children, showSidebar = true, title = 'AI Chat' }: LayoutContainerProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed by default for all screens
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Keep sidebar closed on mobile by default
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Global Navbar - Always Visible at Top */}
      <Navbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        showSidebarToggle={showSidebar}
        title={title}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {showSidebar && (
          <>
            {/* Overlay for mobile when sidebar is open */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-60 z-40"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar - Works on ALL screen sizes */}
            <aside
              className={`
                ${isMobile ? 'fixed' : 'relative'}
                ${isMobile ? 'z-50' : 'z-10'}
                h-full
                bg-white dark:bg-gray-900
                transition-all duration-300 ease-in-out
                ${isMobile 
                  ? sidebarOpen 
                    ? 'translate-x-0 w-72' 
                    : '-translate-x-full w-72'
                  : sidebarOpen
                    ? 'w-64'
                    : 'w-0'
                }
                ${isMobile && 'shadow-2xl'}
              `}
            >
              {/* Only render sidebar content when open OR transitioning on desktop */}
              {(sidebarOpen || (!isMobile)) && (
                <div className={`h-full ${!sidebarOpen && !isMobile ? 'invisible' : 'visible'}`}>
                  <Sidebar 
                    userId={user?.email ?? null} 
                    onCloseMobile={() => isMobile && setSidebarOpen(false)} 
                    onClose={() => setSidebarOpen(false)}
                    isOpen={sidebarOpen}
                  />
                </div>
              )}
            </aside>
          </>
        )}

        {/* Main Content - Expands when sidebar is closed */}
        <main className="flex-1 overflow-auto bg-white dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
