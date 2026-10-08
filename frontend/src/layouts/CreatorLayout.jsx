import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

export const CreatorLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { role, setRole } = useAuth();
  const location = useLocation();

  const isWorkspace = location.pathname.includes('/workspace') || location.pathname.includes('/messages');

  useEffect(() => {
    if (role !== 'creator') {
      setRole('creator');
    }
  }, [role, setRole]);

  return (
    <div className="flex h-screen bg-[#07090E] text-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar role="creator" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header role="creator" onSearchChange={setSearchQuery} />
        {isWorkspace ? (
          /* Workspace: no padding, no max-width — fills all remaining space flush */
          <main className="flex-1 overflow-hidden">
            <Outlet context={{ searchQuery }} />
          </main>
        ) : (
          /* All other pages: normal padded constrained layout */
          <main className="flex-1 px-6 md:px-8 py-6 md:py-8 overflow-y-auto max-w-7xl mx-auto w-full">
            <Outlet context={{ searchQuery }} />
          </main>
        )}
      </div>
    </div>
  );
};

export default CreatorLayout;
