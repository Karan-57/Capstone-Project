import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

export const CreatorLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, setRole } = useAuth();
  const location = useLocation();

  const isWorkspace = location.pathname.includes('/workspace') || location.pathname.includes('/messages');

  useEffect(() => {
    if (role !== 'creator') {
      setRole('creator');
    }
  }, [role, setRole]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#07090E] text-slate-100 overflow-hidden">
      {/* Left Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        role="creator"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          role="creator"
          onSearchChange={setSearchQuery}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        {isWorkspace ? (
          /* Workspace: no padding, no max-width — fills all remaining space flush */
          <main className="flex-1 overflow-hidden">
            <Outlet context={{ searchQuery }} />
          </main>
        ) : (
          /* All other pages: normal padded constrained layout */
          <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 overflow-y-auto max-w-7xl mx-auto w-full">
            <Outlet context={{ searchQuery }} />
          </main>
        )}
      </div>
    </div>
  );
};

export default CreatorLayout;
