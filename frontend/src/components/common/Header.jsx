import React from 'react';
import { Search, Bell, Plus, Film } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onSearchChange }) => {
  const { role, currentUser, toggleRole } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (role === 'creator') {
      navigate('/creator/projects');
    } else {
      navigate('/editor/browse');
    }
  };

  return (
    <header className="flex flex-row items-center justify-end gap-4 py-6 px-8 bg-[#07090E] border-b border-white/[0.06]">
      {/* Right Controls */}
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Search input */}
        <div className="relative hidden lg:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={role === 'creator' ? "Search projects, editors..." : "Search gigs, clients..."}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-64 pl-9 pr-4 py-2 text-xs rounded-xl bg-[#0F1420] text-slate-200 placeholder-slate-500 border border-white/[0.08] focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Primary CTA Button */}
        {role === 'creator' ? (
          <button
            onClick={() => navigate('/creator/create-project')}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 border border-purple-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {/* Shimmer light bar effect */}
            <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <span className="absolute -left-[100%] top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000" />
            </span>
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
            <span className="tracking-wide">Create New Project</span>
          </button>
        ) : (
          <button
            onClick={handleCtaClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md shadow-purple-900/30 active:scale-[0.98]"
          >
            <Film className="w-4 h-4 stroke-[2.5]" />
            <span>Find New Gigs</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => navigate(role === 'creator' ? '/creator/notifications' : '/editor/notifications')}
          className="relative p-2.5 rounded-xl bg-[#0F1420] text-slate-300 hover:text-white border border-white/[0.08] hover:border-purple-500/30 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
            {currentUser.unreadNotifications || 3}
          </span>
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={() => navigate(role === 'creator' ? '/creator/profile' : '/editor/profile')}
          className="flex items-center gap-2.5 cursor-pointer pl-1 group"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-purple-500/40 ring-2 ring-purple-600/20 group-hover:ring-purple-500 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#07090E]"></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
