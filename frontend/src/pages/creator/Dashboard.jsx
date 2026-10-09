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
import RecentApplications from '../../components/creator/RecentApplications';
import ReviewsAndRating from '../../components/creator/ReviewsAndRating';
import EarningsOverview from '../../components/creator/EarningsOverview';
import UpcomingDeadlines from '../../components/creator/UpcomingDeadlines';
import QuickActions from '../../components/creator/QuickActions';
import UploadAssetModal from '../../components/creator/UploadAssetModal';
import MessageCard from '../../components/common/MessageCard';
import Button from '../../components/common/Button';
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
    messages,
    handleApplicationStatus
  } = useDashboardData();

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

      {/* SECTION 2 & 4: Middle Grid (Recent Projects + My Applications) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5.5">
        {/* Left: Recent Projects (Col 5) */}
        <div className="lg:col-span-5">
          <ActiveProjects projects={creatorProjects} />
        </div>

        {/* Right: My Applications (Col 7) */}
        <div className="lg:col-span-7">
          <RecentApplications
            applications={applications}
            onStatusChange={handleApplicationStatus}
          />
        </div>
      </section>

      {/* SECTION 8, 5, 6: Bottom Grid (Reviews & Rating + Messages + Earnings Overview) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5.5">
        {/* Left: Reviews & Rating */}
        <div className="h-full">
          <ReviewsAndRating />
        </div>

        {/* Center: Messages Preview */}
        <div className="glass-card p-5.5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-semibold text-white tracking-tight">
                Messages
              </h3>
              <button
                onClick={() => navigate('/creator/messages')}
                className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                View all
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active conversations
              </div>
            ) : (
              <div className="space-y-1.5">
                {messages.slice(0, 3).map((msg) => (
                  <MessageCard
                    key={msg.id}
                    message={msg}
                    onClick={() => navigate('/creator/messages')}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04]">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/creator/messages')}
              className="w-full py-2.5 text-xs font-semibold"
            >
              Go to Messages
            </Button>
          </div>
        </div>

        {/* Right: Earnings Overview (Payment exception) */}
        <div className="h-full">
          <EarningsOverview />
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
