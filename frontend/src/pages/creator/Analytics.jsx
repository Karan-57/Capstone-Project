import React, { useState, useEffect } from 'react';
import { Video, Clock, Users, CheckCircle2, FolderKanban } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import { projectService } from '../../services/projectService';
import { applicationService } from '../../services/applicationService';

export const Analytics = () => {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projs, apps] = await Promise.all([
          projectService.getCreatorProjects(),
          applicationService.getApplications(),
        ]);
        setProjects(projs);
        setApplications(apps);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.rawStatus === 'in_progress' || p.rawStatus === 'assigned').length;
  const completedProjects = projects.filter(p => p.rawStatus === 'completed').length;
  const totalApps = applications.length;

  const funnelStages = [
    { stage: 'Total Projects Created', count: totalProjects, color: 'from-purple-600 to-indigo-600' },
    { stage: 'Applications Received', count: totalApps, color: 'from-indigo-600 to-blue-500' },
    { stage: 'In Production / Assigned', count: inProgressProjects, color: 'from-blue-500 to-cyan-400' },
    { stage: 'Completed Deliveries', count: completedProjects, color: 'from-emerald-500 to-teal-400' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Channel & Production Intelligence</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time analytics on video projects, editor hiring, and deliverable pipelines
        </p>
      </div>

      {/* Real Intelligence Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatsCard icon={FolderKanban} title="Total Projects" value={String(totalProjects)} trend={`${totalProjects} Total`} isPositive={true} />
        <StatsCard icon={Video} title="In Production" value={String(inProgressProjects)} trend="Active" isPositive={true} />
        <StatsCard icon={Users} title="Applications Received" value={String(totalApps)} trend="Candidates" isPositive={true} />
        <StatsCard icon={CheckCircle2} title="Completed Projects" value={String(completedProjects)} trend="Delivered" isPositive={true} />
      </div>

      {/* Production Pipeline Funnel & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5.5">
        {/* Real Production Funnel */}
        <div className="lg:col-span-6 glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Production Pipeline Funnel</h3>
            <p className="text-xs text-slate-400 mb-5">Current status distribution across your video projects</p>

            <div className="space-y-3.5">
              {funnelStages.map((item, idx) => {
                const percent = totalProjects > 0 ? Math.round((item.count / totalProjects) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">{item.stage}</span>
                      <span className="font-mono text-white font-bold">{item.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real Project Status Breakdown */}
        <div className="lg:col-span-6 glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Project Status Breakdown</h3>
            <p className="text-xs text-slate-400 mb-5">Status summary of all logged projects</p>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/30">
                <span className="text-xs text-blue-300 block font-medium">Open Briefs</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {projects.filter(p => p.rawStatus === 'open').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30">
                <span className="text-xs text-purple-300 block font-medium">Assigned</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {projects.filter(p => p.rawStatus === 'assigned').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30">
                <span className="text-xs text-amber-300 block font-medium">In Progress</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {projects.filter(p => p.rawStatus === 'in_progress').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                <span className="text-xs text-emerald-300 block font-medium">Completed</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {completedProjects}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
