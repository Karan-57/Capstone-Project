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
    <header className="flex flex-row items-center justify-between gap-4 py-3.5 md:py-4 px-4 md:px-8 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E0D7] shrink-0 sticky top-0 z-30">
      {/* Mobile Hamburger toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-[#77736D] hover:text-[#3C2415] bg-[#F0EDE5] border border-[#E5E0D7] transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5 flex-wrap ml-auto">
        {/* Instagram-style User Search Trigger (Desktop/Tablet) */}
        <button
          type="button"
          onClick={handleOpenSearchPage}
          className="group relative hidden sm:flex items-center justify-between w-60 md:w-72 pl-9 pr-2.5 py-2 text-xs rounded-xl bg-[#F0EDE5] hover:bg-[#EAE6DF] text-[#77736D] hover:text-[#3C2415] border border-[#E5E0D7] hover:border-[#DDD9CE] transition-all cursor-pointer shadow-none text-left"
          title="Search users by name or @username (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-[#77736D] group-hover:text-[#3C2415] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
          <span className="truncate">Search creators, freelancers...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#77736D] bg-[#FFFFFF] border border-[#E5E0D7] rounded">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={handleOpenSearchPage}
          className="sm:hidden p-2.5 rounded-xl bg-[#F0EDE5] text-[#77736D] hover:text-[#3C2415] border border-[#E5E0D7] transition-colors"
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
            className="group relative inline-flex items-center justify-center p-2.5 rounded-xl text-[#F7F5F0] bg-[#3C2415] hover:bg-[#2B1810] shadow-sm border border-[#3C2415] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* Wallet Balance Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] shadow-none">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#A17A43] shrink-0" />
            <span className="text-xs font-bold font-mono text-[#3C2415] leading-tight">
              {walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          {role === 'creator' && (
            <button
              onClick={() => setIsTopUpOpen(true)}
              title="Top Up Credits"
              aria-label="Top Up Credits"
              className="ml-1 w-5 h-5 flex items-center justify-center rounded-lg bg-[#DDD9CE] hover:bg-[#C7B9A7] text-[#3C2415] border border-[#DDD9CE] text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              +
            </button>
          )}
        </div>

        {/* Messages Icon */}
        <button
          onClick={() => navigate(role === 'creator' ? '/creator/messages' : '/editor/messages')}
          className="relative p-2.5 rounded-xl bg-[#FFFFFF] text-[#77736D] hover:text-[#3C2415] hover:bg-[#F0EDE5] border border-[#E5E0D7] transition-colors cursor-pointer"
          title="Direct Messages"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3C2415] text-[10px] font-bold text-[#F7F5F0] shadow-sm">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate(role === 'creator' ? '/creator/notifications' : '/editor/notifications')}
          className="relative p-2.5 rounded-xl bg-[#FFFFFF] text-[#77736D] hover:text-[#3C2415] hover:bg-[#F0EDE5] border border-[#E5E0D7] transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#A34F45] text-[10px] font-bold text-white shadow-sm">
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
              className="w-9 h-9 rounded-full object-cover border border-[#E5E0D7] ring-2 ring-[#F0EDE5] group-hover:ring-[#DDD9CE] transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#55745C] ring-2 ring-[#FFFFFF]"></span>
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
