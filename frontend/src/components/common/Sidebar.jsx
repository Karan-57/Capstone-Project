import React from 'react';
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
  RefreshCw
} from 'lucide-react';
import CollaboLogo from '../../assets/logos/CollaboLogo';
import { useAuth } from '../../context/AuthContext';

import { X } from 'lucide-react';

export const Sidebar = ({ role: propRole, isOpen = false, onClose }) => {
  const { role: contextRole, setRole, toggleRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = propRole || (location.pathname.startsWith('/editor') ? 'editor' : (location.pathname.startsWith('/creator') ? 'creator' : contextRole));

  const creatorNavItems = [
    { label: 'Dashboard', path: '/creator/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', path: '/creator/projects', icon: FolderGit2 },
    { label: 'Create Project', path: '/creator/create-project', icon: FolderPlus },
    { label: 'Applications', path: '/creator/applications', icon: Users },
    { label: 'Workspace', path: '/creator/workspace', icon: Layers, badge: 'Live' },
    { label: 'Notifications', path: '/creator/notifications', icon: Bell, badge: '3' },
    { label: 'Profile', path: '/creator/profile', icon: User },
    { label: 'Settings', path: '/creator/settings', icon: Settings },
  ];

  const editorNavItems = [
    { label: 'Dashboard', path: '/editor/dashboard', icon: LayoutDashboard },
    { label: 'Browse Projects', path: '/editor/browse', icon: Compass },
    { label: 'My Applications', path: '/editor/applications', icon: FileCheck2 },
    { label: 'Active Projects', path: '/editor/active-projects', icon: PlaySquare, badge: '3' },
    { label: 'Workspace', path: '/editor/workspace', icon: Layers, badge: 'Live' },
    { label: 'Earnings', path: '/editor/earnings', icon: Wallet },
    { label: 'Notifications', path: '/editor/notifications', icon: Bell },
    { label: 'Profile', path: '/editor/profile', icon: User },
    { label: 'Settings', path: '/editor/settings', icon: Settings },
  ];

  const currentNavItems = role === 'creator' ? creatorNavItems : editorNavItems;

  const handleRoleSwitch = () => {
    if (role === 'creator') {
      if (setRole) setRole('editor');
      else if (toggleRole) toggleRole();
      navigate('/editor/dashboard');
    } else {
      if (setRole) setRole('creator');
      else if (toggleRole) toggleRole();
      navigate('/creator/dashboard');
    }
  };

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
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#07090F]/95 md:bg-[#07090F]/80 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col justify-between p-4.5 select-none shrink-0 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 pt-1 px-1">
            <CollaboLogo className="w-8 h-8" textClassName="text-xl font-bold tracking-tight text-white font-mono" />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Pierre Sù Inspired Frosted Capsule Mode Switcher */}
        <div className="mb-4 p-2 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 pl-1">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] animate-pulse ${
              role === 'creator' ? 'bg-purple-400 shadow-[#C084FC]' : 'bg-blue-400 shadow-[#60A5FA]'
            }`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
              role === 'creator' ? 'text-purple-200' : 'text-blue-200'
            }`}>
              {role === 'creator' ? 'Creator Hub' : 'Editor Pro'}
            </span>
          </div>
          <button
            onClick={handleRoleSwitch}
            title={`Switch to ${role === 'creator' ? 'Editor' : 'Creator'} View`}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-xl transition-all border active:scale-95 ${
              role === 'creator'
                ? 'text-purple-300 hover:text-white bg-purple-900/40 hover:bg-purple-800/60 border-purple-500/20'
                : 'text-blue-300 hover:text-white bg-blue-900/40 hover:bg-blue-800/60 border-blue-500/20'
            }`}
          >
            <RefreshCw className="w-2.5 h-2.5" />
            Switch
          </button>
        </div>

        {/* Navigation links with Pierre Sù / Apple Capsule Hover */}
        <nav className="space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 ${
                    isActive
                      ? role === 'creator'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400/30'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${
                    role === 'creator'
                      ? 'bg-purple-500/30 text-purple-200 border-purple-400/20'
                      : 'bg-blue-500/30 text-blue-200 border-blue-400/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-3 border-t border-white/[0.05] space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  </>
);
};

export default Sidebar;
