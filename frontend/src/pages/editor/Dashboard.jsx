import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
  PlaySquare,
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
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAuth } from '../../context/AuthContext';

export const EditorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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
      {/* Top Stats for Editor (Real dynamic counts & rating) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
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
          icon={PlaySquare}
          iconBg="bg-emerald-600/20 text-emerald-400 border border-emerald-500/25"
          value={String(activeProjectsCount)}
          title="Production Tracks"
          trend="Accepted"
          isPositive={true}
        />
        <StatsCard
          icon={Star}
          iconBg="bg-amber-600/20 text-amber-400 border border-amber-500/25"
          value={ratingValue}
          title="Editor Rating"
          trend={ratingValue === '0' ? 'No reviews yet' : 'Top Rated'}
          isPositive={true}
        />
      </section>

      {/* Main Grid Section: In-Production Active Projects + Recommended Opportunities */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5.5">
        {/* Active Projects in production (Col 6) */}
        <div className="lg:col-span-6">
          <ActiveProjects projects={editorActive} />
        </div>

        {/* Recommended Projects (Col 6) */}
        <div className="lg:col-span-6">
          <RecommendedProjects projects={editorRecommended} />
        </div>
      </section>

      {/* Bottom Grid: Deliveries + Earnings Overview + Real Messages */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5.5">
        {/* Upcoming Deliveries */}
        <div className="h-full">
          <UpcomingDeliveries projects={editorActive} />
        </div>

        {/* Earnings & Escrow Overview (Payment exception) */}
        <div className="h-full">
          <EarningsOverview earnings={editorEarnings} />
        </div>

        {/* Real Messages & Conversations */}
        <div className="glass-card p-5.5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Messages
              </h3>
              <button
                onClick={() => navigate('/editor/messages')}
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
                    onClick={() => navigate('/editor/messages')}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04]">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/editor/messages')}
              className="w-full py-2.5 text-xs font-semibold"
            >
              Go to Messages
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditorDashboard;
