import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Menu, Coins, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { messageService } from '../../services/messageService';
import { DEFAULT_PFP } from '../../constants/assets';
import WalletTopUpModal from '../wallet/WalletTopUpModal';
import ThemeToggle from './ThemeToggle';

export const Header = ({ onSearchChange, onMenuClick }) => {
  const { role, currentUser, isAuthenticated, isAuthLoading } = useAuth();
  const { walletBalance } = useWallet();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const handleOpenSearchPage = () => {
    navigate(role === 'creator' ? '/creator/search' : '/editor/search');
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to open user search page
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate(role === 'creator' ? '/creator/search' : '/editor/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [role, navigate]);

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
      messageService.getDMs(currentUserId).then((convs) => {
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
    <header className="flex flex-row items-center justify-between gap-4 py-3.5 md:py-4 px-4 md:px-8 bg-[#FDEBDE]/95 dark:bg-[#19100F]/95 backdrop-blur-md border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 shrink-0 z-30 transition-colors">
      {/* Mobile Hamburger toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-[#382322] dark:text-[#FDEBDE] bg-white dark:bg-[#281B1A] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:bg-[#FFEBAA] dark:hover:bg-[#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap ml-auto">
        {/* Editorial User Search Trigger (Desktop/Tablet) */}
        <button
          type="button"
          onClick={handleOpenSearchPage}
          className="group relative hidden sm:flex items-center justify-between w-60 md:w-72 pl-9 pr-2.5 py-2 text-xs font-medium rounded-xl bg-white/90 dark:bg-[#281B1A]/90 hover:bg-white dark:hover:bg-[#33201F] text-[#382322]/70 dark:text-[#FDEBDE]/70 hover:text-[#382322] dark:hover:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#382322] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all cursor-pointer text-left"
          title="Search users by name or @username (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-[#382322]/60 dark:text-[#FFEBAA]/70 group-hover:text-[#382322] dark:group-hover:text-[#FFEBAA] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
          <span className="truncate">Search creators, freelancers...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#382322] bg-[#FFEBAA] border border-[#382322]/40 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={handleOpenSearchPage}
          className="sm:hidden p-2 rounded-xl bg-white dark:bg-[#281B1A] text-[#382322] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:bg-[#FFEBAA] dark:hover:bg-[#382322] transition-colors"
          title="Search users"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Primary CTA Button (Creators only: Create New Project) */}
        {role === 'creator' && (
          <button
            onClick={() => navigate('/creator/create-project')}
            title="Create New Project"
            aria-label="Create New Project"
            className="group relative inline-flex items-center justify-center p-2.5 rounded-xl text-[#FDEBDE] bg-[#382322] hover:bg-[#4e3332] dark:bg-[#FFEBAA] dark:hover:bg-[#fff0c2] dark:text-[#261615] shadow-[2.5px_2.5px_0_#FFEBAA] dark:shadow-[2.5px_2.5px_0_#000] border-2 border-[#382322] dark:border-[#FFEBAA] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-[#FFEBAA] dark:text-[#261615] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* Wallet Balance Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFEBAA] dark:bg-[#281B1A] border-2 border-[#382322] dark:border-[#FFEBAA]/50 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000]">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA] shrink-0" />
            <span className="text-xs font-bold font-mono text-[#382322] dark:text-[#FFEBAA] leading-tight">
              {walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          {role === 'creator' && (
            <button
              onClick={() => setIsTopUpOpen(true)}
              title="Top Up Credits"
              aria-label="Top Up Credits"
              className="ml-1 w-5 h-5 flex items-center justify-center rounded-md bg-[#382322] dark:bg-[#FFEBAA] hover:bg-[#4e3332] dark:hover:bg-[#fff0c2] text-[#FFEBAA] dark:text-[#261615] text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
            >
              +
            </button>
          )}
        </div>

        {/* Dark Mode Switcher (Animated Studio Toggle) */}
        <ThemeToggle />

        {/* Messages Icon */}
        <button
          onClick={() => navigate(role === 'creator' ? '/creator/messages' : '/editor/messages')}
          className="relative p-2.5 rounded-xl bg-white dark:bg-[#281B1A] hover:bg-[#FFEBAA] dark:hover:bg-[#382322] text-[#382322] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#382322] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all cursor-pointer"
          title="Direct Messages"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#382322] dark:bg-[#FFEBAA] text-[#FFEBAA] dark:text-[#261615] border border-[#FFEBAA] text-[10px] font-bold shadow-xs">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate(role === 'creator' ? '/creator/notifications' : '/editor/notifications')}
          className="relative p-2.5 rounded-xl bg-white dark:bg-[#281B1A] hover:bg-[#FFEBAA] dark:hover:bg-[#382322] text-[#382322] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#382322] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#382322] dark:bg-[#FFEBAA] text-[#FFEBAA] dark:text-[#261615] border border-[#FFEBAA] text-[10px] font-bold shadow-xs">
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
              className="w-9 h-9 rounded-full object-cover border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] group-hover:scale-105 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#FDEBDE] dark:ring-[#19100F]"></span>
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
