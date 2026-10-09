import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
  PlaySquare,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import RecommendedProjects from '../../components/editor/RecommendedProjects';
import ActiveProjects from '../../components/editor/ActiveProjects';
import EarningsOverview from '../../components/editor/EarningsOverview';
import UpcomingDeliveries from '../../components/editor/UpcomingDeliveries';
import MessageCard from '../../components/common/MessageCard';
import Button from '../../components/common/Button';
import { useDashboardData } from '../../hooks/useDashboardData';

export const EditorDashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    editorRecommended,
    editorActive,
    editorEarnings,
    messages
  } = useDashboardData();

  const dailyTasks = [
    { id: 1, title: 'Export Color Grading LUT for Nexus Media Cut', time: '11:00 AM', done: true },
    { id: 2, title: 'Sync Subtitle Timestamps for Chloe Adams Reel', time: '2:30 PM', done: false },
    { id: 3, title: 'Upload Draft v1 for SaaS Product Walkthrough', time: '5:00 PM', done: false },
  ];

  const availableProjectsCount = editorRecommended.length;
  const activeProjectsCount = editorActive.length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Stats for Editor (Real dynamic counts) */}
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
          title="Applied Projects"
          trend="Submitted"
          isPositive={true}
        />
        <StatsCard
          icon={PlaySquare}
          iconBg="bg-emerald-600/20 text-emerald-400 border border-emerald-500/25"
          value={String(activeProjectsCount)}
          title="Active Projects"
          trend="In Production"
          isPositive={true}
        />
        <StatsCard
          icon={Star}
          iconBg="bg-amber-600/20 text-amber-400 border border-amber-500/25"
          value="4.9"
          title="Editor Rating"
          trend="Top Rated"
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

      {/* Bottom Grid: Deliveries + Earnings Overview + Daily Tasks & Messages */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5.5">
        {/* Upcoming Deliveries */}
        <div className="h-full">
          <UpcomingDeliveries />
        </div>

        {/* Earnings & Escrow Overview */}
        <div className="h-full">
          <EarningsOverview earnings={editorEarnings} />
        </div>

        {/* Daily Tasks & Client Feedback Preview */}
        <div className="glass-card p-5.5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Today's Milestones
              </h3>
              <span className="text-[11px] text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-800/30">
                1/3 Completed
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                    task.done
                      ? 'bg-white/[0.02] border-white/[0.04] text-slate-500 line-through'
                      : 'bg-[#141A28]/60 border-white/[0.05] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      defaultChecked={task.done}
                      className="rounded bg-slate-800 border-white/20 text-purple-600 focus:ring-purple-500 shrink-0"
                    />
                    <span className="truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {task.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Client feedback snippet */}
            <div className="p-3 rounded-xl bg-purple-900/15 border border-purple-800/25">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-200">Latest Creator Note</span>
              </div>
              <p className="text-xs text-slate-300 italic">
                "Loved the opening hook on version 1! Just punch up the sound effects around 01:20."
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                — Nexus Media Corp • 2h ago
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/editor/messages')}
              className="w-full text-xs"
            >
              Open Client Messenger
            </Button>
          </div>
        </div>
      </section>

      {/* Editor Productivity & Achievement Center */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5.5">
        <div className="glass-panel p-5.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Client Satisfaction</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">99.2%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[99.2%]" />
          </div>
          <p className="text-[11px] text-slate-400">Based on 64 rated YouTube and commercial deliverables.</p>
        </div>

        <div className="glass-panel p-5.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">On-Time Delivery Rate</span>
            <span className="text-xs font-mono text-purple-400 font-bold">98%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full w-[98%]" />
          </div>
          <p className="text-[11px] text-slate-400">Average delivery happens 6 hours before contract deadline.</p>
        </div>

        <div className="glass-panel p-5.5 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Badges Unlocked</span>
            <span className="text-xs text-purple-300 font-medium mt-1 block">Level 3 Pro Editor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold" title="5 Star Rated">★ Top Pro</span>
            <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold" title="24h Turnaround">⚡ Fast Cut</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditorDashboard;
