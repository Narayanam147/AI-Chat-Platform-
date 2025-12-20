'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutContainerProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function LayoutContainer({ children, showSidebar = true }: LayoutContainerProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="main-container">
      {showSidebar && (
        <>
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[55]" onClick={() => setSidebarOpen(false)} />
          )}

          <div className={`fixed lg:relative h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[60] shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'} ${isMobile ? 'w-72' : 'w-64'}`}>
            <Sidebar userId={user?.email ?? null} onCloseMobile={() => isMobile && setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="main-content">
        {isMobile && (
          <div className="sidebar-header-mobile">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="Toggle sidebar">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">AI Chat</h1>
            <div className="w-6" />
          </div>
        )}

        <div className="chat-area">{children}</div>
      </div>
    </div>
  );
}
