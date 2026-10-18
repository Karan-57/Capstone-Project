import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
  Coins,
  Star,
  MessageSquare
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import RecommendedProjects from '../../components/editor/RecommendedProjects';
import ActiveProjects from '../../components/editor/ActiveProjects';
import EarningsOverview from '../../components/editor/EarningsOverview';
import UpcomingDeliveries from '../../components/editor/UpcomingDeliveries';
import MessageCard from '../../components/common/MessageCard';
import Button from '../../components/common/Button';
import ProfileCompletionBanner from '../../components/common/ProfileCompletionBanner';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

export const EditorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { walletBalance = 0 } = useWallet();
  const {
    loading,
    editorRecommended,
    editorActive,
    editorEarnings,
    messages
  } = useDashboardData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const availableProjectsCount = editorRecommended.length;
  const activeProjectsCount = editorActive.length;
  const ratingValue = currentUser?.rating != null ? String(currentUser.rating) : '0';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.name || currentUser?.displayName || 'Editor';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Editorial Greeting Header */}
      <div className="pt-1 pb-1">
        <h1 className="font-serif italic text-3xl sm:text-4xl text-[#3C2415] tracking-tight">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-sm sm:text-base text-[#77736D] mt-1 font-normal">
          Here's where things stand with your work.
        </p>
      </div>

      {/* Profile Completion Visual */}
      <ProfileCompletionBanner role="editor" />

      {/* Top Stats for Editor (Real dynamic counts, ledger credits & rating) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
        <StatsCard
          icon={Compass}
          iconBg="bg-[#F0EDE5] text-[#3C2415] border border-[#DDD9CE]"
          value={String(availableProjectsCount)}
          title="Available Projects"
          trend={`${availableProjectsCount} Open`}
          isPositive={true}
        />
        <StatsCard
          icon={FileCheck2}
          iconBg="bg-[#EAECE7] text-[#55745C] border border-[#D5D9CF]"
          value={String(activeProjectsCount)}
          title="Active Contracts"
          trend="In Progress"
          isPositive={true}
        />
        <StatsCard
          icon={Coins}
          iconBg="bg-[#FBF6EE] text-[#A17A43] border border-[#F0E6D2]"
          value={`₹${Number(walletBalance || 0).toLocaleString('en-IN')}`}
          title="Wallet Credits"
          trend="From Ledgers"
          isPositive={true}
        />
        <StatsCard
          icon={Star}
          iconBg="bg-[#F0EDE5] text-[#77736D] border border-[#DDD9CE]"
          value={ratingValue}
          title="Freelancer Rating"
          trend={ratingValue === '0' ? 'No reviews yet' : 'Top Rated'}
          isPositive={true}
        />
      </section>

      {/* Main Grid Section: In-Production Active Projects + Recommended Opportunities */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5.5">
        {/* Active Projects in production (Col 6) */}
        <div className="lg:col-span-6">
          <ActiveProjects projects={editorActive} />
        </div>

        {/* Recommended Projects (Col 6) */}
        <div className="lg:col-span-6">
          <RecommendedProjects projects={editorRecommended} />
        </div>
      </section>

      {/* Bottom Grid: Deliveries + Earnings Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5.5">
        {/* Upcoming Deliveries */}
        <div className="h-full">
          <UpcomingDeliveries projects={editorActive} />
        </div>

        {/* Earnings & Escrow Overview */}
        <div className="h-full">
          <EarningsOverview earnings={editorEarnings} />
        </div>
      </section>
    </div>
  );
};

export default EditorDashboard;
