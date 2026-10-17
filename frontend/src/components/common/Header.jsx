import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Menu, Coins, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { messageService } from '../../services/messageService';
import { DEFAULT_PFP } from '../../constants/assets';
import WalletTopUpModal from '../wallet/WalletTopUpModal';

export const Header = ({ onSearchChange, onMenuClick }) => {
  const { role, currentUser, isAuthenticated, isAuthLoading } = useAuth();
  const { walletBalance } = useWallet();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;

    let isMounted = true;
    notificationService.getNotifications().then((res) => {
      if (isMounted && res) {
        setUnreadCount(res.unreadCount != null ? res.unreadCount : 0);
      }
    }).catch(() => {
      if (isMounted) setUnreadCount(0);
    });

    const currentUserId = currentUser?._id || currentUser?.id;
    if (currentUserId) {
      messageService.getMessages(currentUserId).then((convs) => {
        if (isMounted && Array.isArray(convs)) {
          const unread = convs.filter((c) => c.unread).length;
          setUnreadMessagesCount(unread);
        }
      }).catch(() => {
        if (isMounted) setUnreadMessagesCount(0);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, currentUser?._id, currentUser?.id]);

  return (
    <header className="flex flex-row items-center justify-between gap-4 py-4 md:py-6 px-4 md:px-8 bg-[#07090E] border-b border-white/[0.06] shrink-0">
      {/* Mobile Hamburger toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5 flex-wrap ml-auto">
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

        {/* Primary CTA Button (Creators only: Create New Project) */}
        {role === 'creator' && (
          <button
            onClick={() => navigate('/creator/create-project')}
            title="Create New Project"
            aria-label="Create New Project"
            className="group relative inline-flex items-center justify-center p-2.5 rounded-xl text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 border border-purple-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            {/* Shimmer light bar effect */}
            <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <span className="absolute -left-[100%] top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000" />
            </span>
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* Wallet Balance Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/25 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold font-mono text-amber-300 leading-tight">
              {walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          {role === 'creator' && (
            <button
              onClick={() => setIsTopUpOpen(true)}
              title="Top Up Credits"
              aria-label="Top Up Credits"
              className="ml-1 w-5 h-5 flex items-center justify-center rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              +
            </button>
          )}
        </div>

        {/* Messages Icon */}
        <button
          onClick={() => navigate(role === 'creator' ? '/creator/messages' : '/editor/messages')}
          className="relative p-2.5 rounded-xl bg-[#0F1420] text-slate-300 hover:text-white border border-white/[0.08] hover:border-purple-500/30 transition-colors"
          title="Direct Messages"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate(role === 'creator' ? '/creator/notifications' : '/editor/notifications')}
          className="relative p-2.5 rounded-xl bg-[#0F1420] text-slate-300 hover:text-white border border-white/[0.08] hover:border-purple-500/30 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={() => navigate(role === 'creator' ? '/creator/profile' : '/editor/profile')}
          className="flex items-center gap-2.5 cursor-pointer pl-1 group"
        >
          <div className="relative">
            <img
              src={currentUser?.profileImage || currentUser?.avatar || DEFAULT_PFP}
              alt={currentUser?.name ? `${currentUser.name} avatar` : 'User profile avatar'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-9 h-9 rounded-full object-cover border border-purple-500/40 ring-2 ring-purple-600/20 group-hover:ring-purple-500 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#07090E]"></span>
          </div>
        </div>
      </div>

      {/* Wallet Top-Up Modal */}
      <WalletTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />
    </header>
  );
};

export default Header;
