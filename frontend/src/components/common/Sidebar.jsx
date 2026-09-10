import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FolderPlus,
  Users,
  MessageSquare,
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

export const Sidebar = ({ role: propRole }) => {
  const { role: contextRole, setRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = propRole || (location.pathname.startsWith('/editor') ? 'editor' : (location.pathname.startsWith('/creator') ? 'creator' : contextRole));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const creatorNavItems = [
    { label: 'Dashboard', path: '/creator/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', path: '/creator/projects', icon: FolderGit2 },
    { label: 'Create Project', path: '/creator/create-project', icon: FolderPlus },
    { label: 'Applications', path: '/creator/applications', icon: Users },
    { label: 'Messages', path: '/creator/messages', icon: MessageSquare, badge: '2' },
    { label: 'Notifications', path: '/creator/notifications', icon: Bell, badge: '3' },
    { label: 'Profile', path: '/creator/profile', icon: User },
    { label: 'Settings', path: '/creator/settings', icon: Settings },
  ];

  const editorNavItems = [
    { label: 'Dashboard', path: '/editor/dashboard', icon: LayoutDashboard },
    { label: 'Browse Projects', path: '/editor/browse', icon: Compass },
    { label: 'My Applications', path: '/editor/applications', icon: FileCheck2 },
    { label: 'Active Projects', path: '/editor/active-projects', icon: PlaySquare, badge: '3' },
    { label: 'Messages', path: '/editor/messages', icon: MessageSquare, badge: '1' },
    { label: 'Earnings', path: '/editor/earnings', icon: Wallet },
    { label: 'Notifications', path: '/editor/notifications', icon: Bell },
    { label: 'Profile', path: '/editor/profile', icon: User },
    { label: 'Settings', path: '/editor/settings', icon: Settings },
  ];

  const currentNavItems = role === 'creator' ? creatorNavItems : editorNavItems;

  const handleRoleSwitch = () => {
    if (role === 'creator') {
      setRole('editor');
      navigate('/editor/dashboard');
    } else {
      setRole('creator');
      navigate('/creator/dashboard');
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-[#0A0D15] border-r border-white/[0.07] flex flex-col justify-between p-5 select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 pt-1 px-1">
          <CollaboLogo className="w-8 h-8" textClassName="text-xl font-bold tracking-tight text-white" />
        </div>

        {/* Role Mode Chip Banner */}
        <div className={`mb-5 p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
          role === 'creator'
            ? 'bg-purple-950/30 border-purple-800/30'
            : 'bg-blue-950/30 border-blue-800/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              role === 'creator' ? 'bg-purple-400' : 'bg-blue-400'
            }`}></span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              role === 'creator' ? 'text-purple-200' : 'text-blue-200'
            }`}>
              {role === 'creator' ? 'Creator Space' : 'Editor Pro'}
            </span>
          </div>
          <button
            onClick={handleRoleSwitch}
            title={`Switch to ${role === 'creator' ? 'Editor' : 'Creator'} View`}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors border ${
              role === 'creator'
                ? 'text-purple-300 hover:text-white bg-purple-800/40 hover:bg-purple-700/60 border-purple-500/20'
                : 'text-blue-300 hover:text-white bg-blue-800/40 hover:bg-blue-700/60 border-blue-500/20'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            Switch
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? role === 'creator'
                        ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/30 font-semibold'
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[11px] font-semibold rounded-md border ${
                    role === 'creator'
                      ? 'bg-purple-500/30 text-purple-300 border-purple-400/20'
                      : 'bg-blue-500/30 text-blue-300 border-blue-400/20'
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
      <div className="pt-4 border-t border-white/[0.06] space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
