import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  DollarSign,
  Users,
  Star,
  UploadCloud
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import ActiveProjects from '../../components/creator/ActiveProjects';
import ReviewsAndRating from '../../components/creator/ReviewsAndRating';
import SpendingsOverview from '../../components/creator/SpendingsOverview';
import UpcomingDeadlines from '../../components/creator/UpcomingDeadlines';
import QuickActions from '../../components/creator/QuickActions';
import UploadAssetModal from '../../components/creator/UploadAssetModal';
import ProfileCompletionBanner from '../../components/common/ProfileCompletionBanner';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAuth } from '../../context/AuthContext';
import DashboardHero from '../../components/dashboard/DashboardHero';
import ExpandableToolbar from '../../components/dashboard/ExpandableToolbar';
import { AnimatedGroup } from '../../components/core/animated-group';
import { InView } from '../../components/core/in-view';
import { TapeSticker, InkStar, InkArrow } from '../../components/dashboard/CollageDecoration';

export const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const {
    loading,
    creatorProjects,
    applications,
    messages
  } = useDashboardData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalProjectsCount = creatorProjects.length;
  const activeProjectsCount = creatorProjects.filter(p => p.rawStatus === 'in_progress' || p.rawStatus === 'assigned' || p.status === 'In Progress' || p.status === 'Assigned').length;
  const pendingApplicationsCount = applications.filter(a => a.status === 'pending').length || applications.length;
  const ratingValue = currentUser?.rating != null ? String(currentUser.rating) : '0';

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsDraggingOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          setDroppedFile(e.dataTransfer.files[0]);
          setIsUploadModalOpen(true);
        }
      }}
      className="space-y-6 pb-20 relative min-h-[calc(100vh-100px)] selection:bg-[#FFEBAA] selection:text-[#382322]"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-[#382322]/80 backdrop-blur-md border-4 border-dashed border-[#FFEBAA] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
          <div className="p-5 rounded-3xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[4px_4px_0_#382322] mb-4 animate-bounce">
            <UploadCloud className="w-16 h-16 text-[#382322]" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#FDEBDE] tracking-tight">Drop Media to Upload to Workspace</h3>
          <p className="text-sm font-hand text-[#FFEBAA] mt-1 text-lg">Select project destination upon drop</p>
        </div>
      )}

      {/* Hero Banner with Surreal Editorial Artwork, Scoped Cursor, and Animated Greeting */}
      <DashboardHero
        userName={currentUser?.name || 'Creator'}
        role="creator"
        onPrimaryAction={() => navigate('/creator/create-project')}
      />

      {/* Profile Completion Reminder Widget */}
      <ProfileCompletionBanner role="creator" />

      {/* SECTION 1: Top Quick Stats (Calculated from real state & user) */}
      <section className="relative">
        {/* Subtle decorative ink doodle in background */}
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
            icon={FolderKanban}
            iconBg="bg-[#382322] text-[#B1C8EA]"
            cardBg="bg-[#B1C8EA]/45"
            value={String(totalProjectsCount)}
            title="Total Projects"
            trend={`${totalProjectsCount} Total`}
            isPositive={true}
          />
          <StatsCard
            icon={DollarSign}
            iconBg="bg-[#382322] text-[#FFEBAA]"
            cardBg="bg-white/90"
            value={String(activeProjectsCount)}
            title="Active Projects"
            trend="In Production"
            isPositive={true}
          />
          <StatsCard
            icon={Users}
            iconBg="bg-[#382322] text-[#FDEBDE]"
            cardBg="bg-[#B1C8EA]/40"
            value={String(pendingApplicationsCount)}
            title="Applications"
            trend="Candidates"
            isPositive={true}
          />
          <StatsCard
            icon={Star}
            iconBg="bg-[#382322] text-[#FFEBAA]"
            cardBg="bg-[#FFEBAA]/60"
            value={ratingValue}
            title="Avg Rating"
            trend={ratingValue === '0' ? 'No reviews yet' : 'Top Creator'}
            isPositive={true}
          />
        </AnimatedGroup>
      </section>

      {/* Quick Action Shortcuts Banner with Magnetic Cards */}
      <section>
        <QuickActions
          onUploadAssets={() => {
            setDroppedFile(null);
            setIsUploadModalOpen(true);
          }}
        />
      </section>

      {/* SECTION 2: Upcoming Deadlines */}
      <InView>
        <section className="relative">
          <UpcomingDeadlines projects={creatorProjects} />
        </section>
      </InView>

      {/* SECTION 3: Recent Projects (Full Width) */}
      <InView>
        <section className="relative">
          <ActiveProjects projects={creatorProjects} />
        </section>
      </InView>

      {/* SECTION 4: Bottom Grid (Reviews & Rating + Spendings Overview) */}
      <InView>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 sm:gap-5.5 relative">
          {/* Left: Reviews & Rating */}
          <div className="h-full min-w-0">
            <ReviewsAndRating />
          </div>

          {/* Right: Spendings Overview with real ledger values and dynamic graph */}
          <div className="h-full min-w-0">
            <SpendingsOverview />
          </div>
        </section>
      </InView>

      {/* Floating Dynamic Studio Action Toolbar */}
      <ExpandableToolbar role="creator" />

      {/* Upload Asset to Project Workspace Modal */}
      <UploadAssetModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setDroppedFile(null);
        }}
        initialFile={droppedFile}
        projects={creatorProjects}
      />
    </div>
  );
};

export default CreatorDashboard;
