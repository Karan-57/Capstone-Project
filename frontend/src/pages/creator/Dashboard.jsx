import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  DollarSign,
  Users,
  Star,
  MessageSquare,
  UploadCloud
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import ActiveProjects from '../../components/creator/ActiveProjects';
import ReviewsAndRating from '../../components/creator/ReviewsAndRating';
import SpendingsOverview from '../../components/creator/SpendingsOverview';
import UpcomingDeadlines from '../../components/creator/UpcomingDeadlines';
import QuickActions from '../../components/creator/QuickActions';
import UploadAssetModal from '../../components/creator/UploadAssetModal';
import MessageCard from '../../components/common/MessageCard';
import Button from '../../components/common/Button';
import ProfileCompletionBanner from '../../components/common/ProfileCompletionBanner';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAuth } from '../../context/AuthContext';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.name || currentUser?.displayName || 'Creator';

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
      className="space-y-6 pb-12 animate-fade-in relative min-h-[calc(100vh-100px)]"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-4 border-dashed border-[#3C2415] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
          <div className="p-5 rounded-3xl bg-[#F0EDE5] border border-[#DDD9CE] mb-4 animate-bounce">
            <UploadCloud className="w-16 h-16 text-[#3C2415]" />
          </div>
          <h3 className="text-2xl font-bold text-[#3C2415] tracking-tight">Drop Media to Upload to Workspace</h3>
          <p className="text-sm text-[#77736D] mt-1">Select project destination upon drop</p>
        </div>
      )}

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
      <ProfileCompletionBanner role="creator" />

      {/* SECTION 1: Top Quick Stats (Calculated from real state & user) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatsCard
          icon={FolderKanban}
          iconBg="bg-[#F0EDE5] text-[#3C2415] border border-[#DDD9CE]"
          value={String(totalProjectsCount)}
          title="Total Projects"
          trend={`${totalProjectsCount} Total`}
          isPositive={true}
        />
        <StatsCard
          icon={DollarSign}
          iconBg="bg-[#EAECE7] text-[#55745C] border border-[#D5D9CF]"
          value={String(activeProjectsCount)}
          title="Active Projects"
          trend="In Production"
          isPositive={true}
        />
        <StatsCard
          icon={Users}
          iconBg="bg-[#F0EDE5] text-[#77736D] border border-[#DDD9CE]"
          value={String(pendingApplicationsCount)}
          title="Applications"
          trend="Candidates"
          isPositive={true}
        />
        <StatsCard
          icon={Star}
          iconBg="bg-[#FBF6EE] text-[#A17A43] border border-[#F0E6D2]"
          value={ratingValue}
          title="Avg Rating"
          trend={ratingValue === '0' ? 'No reviews yet' : 'Top Creator'}
          isPositive={true}
        />
      </section>

      {/* Quick Action Shortcuts Banner */}
      <QuickActions
        onUploadAssets={() => {
          setDroppedFile(null);
          setIsUploadModalOpen(true);
        }}
      />

      {/* SECTION 3: Upcoming Deadlines (Moved ABOVE Recent Projects as requested) */}
      <section>
        <UpcomingDeadlines projects={creatorProjects} />
      </section>

      {/* SECTION 2: Recent Projects (Full Width) */}
      <section>
        <ActiveProjects projects={creatorProjects} />
      </section>

      {/* SECTION: Bottom Grid (Reviews & Rating + Spendings Overview) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 sm:gap-5.5">
        {/* Left: Reviews & Rating */}
        <div className="h-full min-w-0">
          <ReviewsAndRating />
        </div>

        {/* Right: Spendings Overview with real ledger values and dynamic graph */}
        <div className="h-full min-w-0">
          <SpendingsOverview />
        </div>
      </section>

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
