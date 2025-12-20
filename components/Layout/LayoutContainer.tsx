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
            <div className="mobile-overlay visible" onClick={() => setSidebarOpen(false)} />
          )}

          <div className={`sidebar-container transition-smooth ${isMobile && !sidebarOpen ? 'hidden' : 'open'}`}>
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
