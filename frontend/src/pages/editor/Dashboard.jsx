import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
  Coins,
  Star
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import RecommendedProjects from '../../components/editor/RecommendedProjects';
import ActiveProjects from '../../components/editor/ActiveProjects';
import EarningsOverview from '../../components/editor/EarningsOverview';
import UpcomingDeliveries from '../../components/editor/UpcomingDeliveries';
import ProfileCompletionBanner from '../../components/common/ProfileCompletionBanner';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import DashboardHero from '../../components/dashboard/DashboardHero';
import ExpandableToolbar from '../../components/dashboard/ExpandableToolbar';
import { AnimatedGroup } from '../../components/core/animated-group';
import { InView } from '../../components/core/in-view';
import { InkStar } from '../../components/dashboard/CollageDecoration';

export const EditorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { walletBalance = 0 } = useWallet();
  const {
    loading,
    editorRecommended,
    editorActive,
    editorEarnings,
  } = useDashboardData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const availableProjectsCount = editorRecommended.length;
  const activeProjectsCount = editorActive.length;
  const ratingValue = currentUser?.rating != null ? String(currentUser.rating) : '0';

  return (
    <div className="space-y-6 pb-20 relative min-h-[calc(100vh-100px)] selection:bg-[#FFEBAA] selection:text-[#382322]">
      {/* Hero Banner with Surreal Editorial Artwork, Scoped Cursor, and Animated Greeting */}
      <DashboardHero
        userName={currentUser?.name || 'Freelancer'}
        role="editor"
        onPrimaryAction={() => navigate('/editor/browse')}
      />

      {/* Profile Completion Reminder Widget */}
      <ProfileCompletionBanner role="editor" />

      {/* Top Stats for Editor (Real dynamic counts, ledger credits & rating) */}
      <section className="relative">
        <div className="absolute -top-3 -left-3 pointer-events-none opacity-60 hidden sm:block">
          <InkStar className="w-5 h-5 text-[#382322]" />
        </div>

        <AnimatedGroup
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            },
            item: {
              hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { type: 'spring', bounce: 0.25, duration: 0.6 },
              },
            },
          }}
        >
          <StatsCard
            icon={Compass}
            iconBg="bg-[#382322] text-[#B1C8EA]"
            cardBg="bg-[#B1C8EA]/45"
            value={String(availableProjectsCount)}
            title="Available Gigs"
            trend={`${availableProjectsCount} Open`}
            isPositive={true}
          />
          <StatsCard
            icon={FileCheck2}
            iconBg="bg-[#382322] text-[#FFEBAA]"
            cardBg="bg-white/90"
            value={String(activeProjectsCount)}
            title="Active Contracts"
            trend="In Production"
            isPositive={true}
          />
          <StatsCard
            icon={Coins}
            iconBg="bg-[#382322] text-[#FFEBAA]"
            cardBg="bg-[#FFEBAA]/60"
            value={`₹${Number(walletBalance || 0).toLocaleString('en-IN')}`}
            title="Wallet Credits"
            trend="From Ledgers"
            isPositive={true}
          />
          <StatsCard
            icon={Star}
            iconBg="bg-[#382322] text-[#FDEBDE]"
            cardBg="bg-[#B1C8EA]/40"
            value={ratingValue}
            title="Creator Rating"
            trend={ratingValue === '0' ? 'No reviews yet' : 'Top Rated'}
            isPositive={true}
          />
        </AnimatedGroup>
      </section>

      {/* Main Grid Section: In-Production Active Projects + Recommended Opportunities */}
      <InView>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5.5 relative">
          {/* Active Projects in production (Col 6) */}
          <div className="lg:col-span-6">
            <ActiveProjects projects={editorActive} />
          </div>

          {/* Recommended Projects (Col 6) */}
          <div className="lg:col-span-6">
            <RecommendedProjects projects={editorRecommended} />
          </div>
        </section>
      </InView>

      {/* Bottom Grid: Deliveries + Earnings Overview */}
      <InView>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5.5 relative">
          {/* Upcoming Deliveries */}
          <div className="h-full">
            <UpcomingDeliveries projects={editorActive} />
          </div>

          {/* Earnings & Escrow Overview */}
          <div className="h-full">
            <EarningsOverview earnings={editorEarnings} />
          </div>
        </section>
      </InView>

      {/* Floating Dynamic Studio Action Toolbar */}
      <ExpandableToolbar role="editor" />
    </div>
  );
};

export default EditorDashboard;
