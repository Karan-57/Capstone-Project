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
        <div className="fixed inset-0 z-50 bg-[#07090F]/90 backdrop-blur-md border-4 border-dashed border-purple-500 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
          <div className="p-5 rounded-3xl bg-purple-600/20 border border-purple-500/40 mb-4 animate-bounce">
            <UploadCloud className="w-16 h-16 text-purple-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">Drop Media to Upload to Workspace</h3>
          <p className="text-sm text-purple-300 mt-1">Select project destination upon drop</p>
        </div>
      )}

      {/* Instagram-style Profile Completion Visual (checks ONLY pfp and category) */}
      <ProfileCompletionBanner role="creator" />

      {/* SECTION 1: Top Quick Stats (Calculated from real state & user) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatsCard
          icon={FolderKanban}
          iconBg="bg-blue-600/20 text-blue-400 border border-blue-500/25"
          value={String(totalProjectsCount)}
          title="Total Projects"
          trend={`${totalProjectsCount} Total`}
          isPositive={true}
        />
        <StatsCard
          icon={DollarSign}
          iconBg="bg-emerald-600/20 text-emerald-400 border border-emerald-500/25"
          value={String(activeProjectsCount)}
          title="Active Projects"
          trend="In Production"
          isPositive={true}
        />
        <StatsCard
          icon={Users}
          iconBg="bg-purple-600/20 text-purple-400 border border-purple-500/25"
          value={String(pendingApplicationsCount)}
          title="Applications"
          trend="Candidates"
          isPositive={true}
        />
        <StatsCard
          icon={Star}
          iconBg="bg-amber-600/20 text-amber-400 border border-amber-500/25"
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
