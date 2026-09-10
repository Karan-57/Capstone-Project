import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  DollarSign,
  Users,
  Star
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import ActiveProjects from '../../components/creator/ActiveProjects';
import RecentApplications from '../../components/creator/RecentApplications';
import ReviewsAndRating from '../../components/creator/ReviewsAndRating';
import EarningsOverview from '../../components/creator/EarningsOverview';
import UpcomingDeadlines from '../../components/creator/UpcomingDeadlines';
import QuickActions from '../../components/creator/QuickActions';
import MessageCard from '../../components/common/MessageCard';
import Button from '../../components/common/Button';
import { useDashboardData } from '../../hooks/useDashboardData';

export const CreatorDashboard = () => {
  const navigate = useNavigate();
  const {
    creatorProjects,
    applications,
    messages,
    handleApplicationStatus
  } = useDashboardData();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* SECTION 1: Top Quick Stats (4 cards matching the reference image) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          icon={FolderKanban}
          iconBg="bg-blue-600/20 text-blue-400 border border-blue-500/25"
          value="12"
          title="Total Projects"
          trend="20%"
          isPositive={true}
        />
        <StatsCard
          icon={DollarSign}
          iconBg="bg-emerald-600/20 text-emerald-400 border border-emerald-500/25"
          value="3"
          title="Active Projects"
          trend="15%"
          isPositive={true}
        />
        <StatsCard
          icon={Users}
          iconBg="bg-purple-600/20 text-purple-400 border border-purple-500/25"
          value="8"
          title="Applications"
          trend="25%"
          isPositive={true}
        />
        <StatsCard
          icon={Star}
          iconBg="bg-amber-600/20 text-amber-400 border border-amber-500/25"
          value="4.8"
          title="Avg Rating"
          trend="0.3"
          isPositive={true}
        />
      </section>

      {/* Quick Action Shortcuts Banner */}
      <QuickActions />

      {/* SECTION 2 & 4: Middle Grid (Recent Projects + My Applications) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Reviews & Rating */}
        <div className="h-full">
          <ReviewsAndRating />
        </div>

        {/* Center: Messages Preview */}
        <div className="glass-card p-6 flex flex-col justify-between h-full">
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

            <div className="space-y-1.5">
              {messages.slice(0, 3).map((msg) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  onClick={() => navigate('/creator/messages')}
                />
              ))}
            </div>
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

        {/* Right: Earnings Overview */}
        <div className="h-full">
          <EarningsOverview />
        </div>
      </section>

      {/* SECTION 3: Upcoming Deadlines section */}
      <section className="mt-6">
        <UpcomingDeadlines />
      </section>
    </div>
  );
};

export default CreatorDashboard;
