import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

export const EditorLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { role, setRole } = useAuth();

  useEffect(() => {
    if (role !== 'editor') {
      setRole('editor');
    }
  }, [role, setRole]);

  return (
    <div className="flex min-h-screen bg-[#07090E] text-slate-100">
      {/* Left Sidebar */}
      <Sidebar role="editor" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header role="editor" onSearchChange={setSearchQuery} />
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default EditorLayout;
