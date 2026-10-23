import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
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
import DashboardHero from '../../components/dashboard/DashboardHero';
import { AnimatedGroup } from '../../components/core/animated-group';
import { InView } from '../../components/core/in-view';
import { InkStar } from '../../components/dashboard/CollageDecoration';

export const EditorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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

      {/* Top 3 Streamlined Stats in 1x3 Grid on Mobile & Desktop */}
      <section className="relative">
        <div className="absolute -top-3 -left-3 pointer-events-none opacity-60 hidden sm:block">
          <InkStar className="w-5 h-5 text-[#382322] dark:text-[#FFEBAA]" />
        </div>

        <AnimatedGroup
          className="grid grid-cols-3 gap-2 sm:gap-4"
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
            iconBg="bg-[#382322] text-[#B1C8EA] dark:bg-[#B1C8EA] dark:text-[#261615]"
            cardBg="bg-[#B1C8EA]/45 dark:bg-[#1A2332]"
            value={String(availableProjectsCount)}
            title="Open"
          />
          <StatsCard
            icon={FileCheck2}
            iconBg="bg-[#382322] text-[#FFEBAA] dark:bg-[#FFEBAA] dark:text-[#261615]"
            cardBg="bg-white/95 dark:bg-[#201413]"
            value={String(activeProjectsCount)}
            title="In Production"
          />
          <StatsCard
            icon={Star}
            iconBg="bg-[#382322] text-[#FDEBDE] dark:bg-[#FFEBAA] dark:text-[#261615]"
            cardBg="bg-[#FFEBAA]/60 dark:bg-[#2A1D1C]"
            value={ratingValue}
            title={ratingValue === '0' ? 'Rating' : 'Top Rated'}
          />
        </AnimatedGroup>
      </section>

      {/* Main Grid Section: In-Production Active Projects + Recommended Opportunities (Equal Height) */}
      <InView>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5.5 relative items-stretch">
          <div className="h-full flex flex-col">
            <ActiveProjects projects={editorActive} />
          </div>

          <div className="h-full flex flex-col">
            <RecommendedProjects projects={editorRecommended} />
          </div>
        </section>
      </InView>

      {/* Bottom Grid: Deliveries + Earnings Overview (Equal Height) */}
      <InView>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5.5 relative items-stretch">
          <div className="h-full flex flex-col">
            <UpcomingDeliveries projects={editorActive} />
          </div>

          <div className="h-full flex flex-col">
            <EarningsOverview earnings={editorEarnings} />
          </div>
        </section>
      </InView>
    </div>
  );
};

export default EditorDashboard;
