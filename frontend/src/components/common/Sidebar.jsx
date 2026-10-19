import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FolderPlus,
  Users,
  Layers,
  Bell,
  User,
  Settings,
  LogOut,
  Compass,
  FileCheck2,
  PlaySquare,
  Wallet,
  History,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import CollaboLogo from '../../assets/logos/CollaboLogo';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ role: propRole, isOpen = false, onClose }) => {
  const { role: contextRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('collabo_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('collabo_sidebar_collapsed', String(next));
      return next;
    });
  };

  const role = propRole || (location.pathname.startsWith('/editor') ? 'editor' : (location.pathname.startsWith('/creator') ? 'creator' : contextRole));

  const creatorNavItems = [
    { label: 'Dashboard', path: '/creator/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', path: '/creator/projects', icon: FolderGit2 },
    { label: 'Create Project', path: '/creator/create-project', icon: FolderPlus },
    { label: 'Applications', path: '/creator/applications', icon: Users },
    { label: 'Workspace', path: '/creator/workspace', icon: Layers },
    { label: 'Payments', path: '/creator/payments', icon: Wallet },
    { label: 'History', path: '/creator/history', icon: History },
    { label: 'Notifications', path: '/creator/notifications', icon: Bell },
    { label: 'Profile', path: '/creator/profile', icon: User },
    { label: 'Settings', path: '/creator/settings', icon: Settings },
  ];

  const editorNavItems = [
    { label: 'Dashboard', path: '/editor/dashboard', icon: LayoutDashboard },
    { label: 'Browse Projects', path: '/editor/browse', icon: Compass },
    { label: 'My Applications', path: '/editor/applications', icon: FileCheck2 },
    { label: 'Active Projects', path: '/editor/active-projects', icon: PlaySquare },
    { label: 'Workspace', path: '/editor/workspace', icon: Layers },
    { label: 'Earnings', path: '/editor/earnings', icon: Wallet },
    { label: 'Notifications', path: '/editor/notifications', icon: Bell },
    { label: 'Profile', path: '/editor/profile', icon: User },
    { label: 'Settings', path: '/editor/settings', icon: Settings },
  ];

  const currentNavItems = role === 'creator' ? creatorNavItems : editorNavItems;

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#382322] text-[#FDEBDE] border-r-2 border-[#261615] shadow-brutal flex flex-col justify-between p-3 select-none shrink-0 z-50 overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header & Collapse Toggle */}
          <div className="flex items-center justify-between pb-4 pt-1 px-1 border-b border-white/10">
            <CollaboLogo
              className="w-8 h-8"
              textClassName="text-xl font-display italic font-bold tracking-tight text-[#FFEBAA]"
              hideText={isCollapsed}
            />

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-xl text-[#FDEBDE]/70 hover:text-[#FFEBAA] hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/15"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#FDEBDE]/70 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links with Butter Yellow Active Capsule */}
          <nav className="space-y-1.5 mt-4">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path.endsWith('/profile') || item.path.endsWith('/dashboard')}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-[#FFEBAA] text-[#382322] shadow-brutal-sm border border-[#382322] font-bold'
                        : 'text-[#FDEBDE]/80 hover:text-[#FFEBAA] hover:bg-white/[0.08]'
                    }`
                  }
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-[#B1C8EA] text-[#382322] border border-[#382322]">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on collapsed desktop view */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#261615] border border-[#FFEBAA]/40 rounded-lg text-xs font-mono font-medium text-[#FFEBAA] shadow-brutal opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                      {item.badge && <span className="ml-1.5 text-[10px] text-[#B1C8EA] font-bold">({item.badge})</span>}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2 rounded-xl text-xs font-semibold text-[#FDEBDE]/70 hover:text-[#FFEBAA] hover:bg-white/[0.08] transition-colors group relative`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#261615] border border-[#FFEBAA]/40 rounded-lg text-xs font-mono font-medium text-[#FFEBAA] shadow-brutal opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
