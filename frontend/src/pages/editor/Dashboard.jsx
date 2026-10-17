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

  const availableProjectsCount = editorRecommended.length;
  const activeProjectsCount = editorActive.length;
  const ratingValue = currentUser?.rating != null ? String(currentUser.rating) : '0';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Instagram-style Profile Completion Visual (checks ONLY pfp, professional title, tools) */}
      <ProfileCompletionBanner role="editor" />

      {/* Top Stats for Editor (Real dynamic counts, ledger credits & rating) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
        <StatsCard
          icon={Compass}
          iconBg="bg-blue-600/20 text-blue-400 border border-blue-500/25"
          value={String(availableProjectsCount)}
          title="Available Projects"
          trend={`${availableProjectsCount} Open`}
          isPositive={true}
        />
        <StatsCard
          icon={FileCheck2}
          iconBg="bg-purple-600/20 text-purple-400 border border-purple-500/25"
          value={String(activeProjectsCount)}
          title="Active Contracts"
          trend="In Progress"
          isPositive={true}
        />
        <StatsCard
          icon={Coins}
          iconBg="bg-emerald-600/20 text-emerald-400 border border-emerald-500/25"
          value={`₹${Number(walletBalance || 0).toLocaleString('en-IN')}`}
          title="Wallet Credits"
          trend="From Ledgers"
          isPositive={true}
        />
        <StatsCard
          icon={Star}
          iconBg="bg-amber-600/20 text-amber-400 border border-amber-500/25"
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
