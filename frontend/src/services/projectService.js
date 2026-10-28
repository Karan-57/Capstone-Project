import api from './api';
import { DEFAULT_PFP } from '../constants/assets';

export const mapBackendProject = (p) => {
  const iconTypes = ['film', 'layout', 'smartphone', 'shopping-cart'];
  const iconBgs = [
    'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    'bg-orange-500/10 text-orange-400 border border-orange-500/20'
  ];
  const charCode = (p?.title || 'p').charCodeAt(0) || 0;
  const iconType = iconTypes[charCode % iconTypes.length];
  const iconBg = iconBgs[charCode % iconBgs.length];

  const statusLabel =
    p?.status === 'in_progress'
      ? 'In Progress'
      : p?.status === 'completed'
      ? 'Completed'
      : p?.status === 'assigned'
      ? 'Assigned'
      : p?.status === 'cancelled'
      ? 'Cancelled'
      : 'Open';

  const statusColor =
    p?.status === 'in_progress' || p?.status === 'assigned'
      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      : p?.status === 'completed'
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

  const formatBudget = (b) => {
    if (!b) return '999';
    if (typeof b === 'string') return b || '999';
    if (b.min && b.max) return `₹${b.min.toLocaleString()} - ₹${b.max.toLocaleString()}`;
    if (b.fixed) return `₹${b.fixed.toLocaleString()}`;
    if (typeof b === 'number') return `₹${b.toLocaleString()}`;
    return '999';
  };

  return {
    id: p?._id || p?.id || 'unknown',
    title: p?.title || 'unknown',
    tags: Array.isArray(p?.requiredSkills) && p.requiredSkills.length ? p.requiredSkills : [p?.category || 'unknown'],
    category: p?.category || 'unknown',
    iconType,
    iconBg,
    status: statusLabel,
    statusColor,
    rawStatus: p?.status || 'unknown',
    assignedEditor: p?.selectedEditorId
      ? {
          id: (p.selectedEditorId._id || p.selectedEditorId).toString(),
          _id: (p.selectedEditorId._id || p.selectedEditorId).toString(),
          name: p.selectedEditorId.name || 'Assigned Editor',
          username: p.selectedEditorId.username || '',
          avatar: p.selectedEditorId.profileImage || DEFAULT_PFP,
          profileImage: p.selectedEditorId.profileImage || DEFAULT_PFP,
          email: p.selectedEditorId.email || '',
          role: p.selectedEditorId.role || 'editor',
          rating: p.selectedEditorId.rating || 5.0,
        }
      : null,
    progress: (() => {
      if (typeof p?.progress === 'number') return p.progress;
      if (p?.status === 'completed') return 100;
      if (Array.isArray(p?.hirings) && p.hirings.length > 0) {
        let total = 0;
        let approved = 0;
        p.hirings.forEach((h) => {
          const fid = (h.hiredFreelancerId?._id || h.hiredFreelancerId?.id || h.hiredFreelancerId)?.toString();
          let mList = null;
          if (fid && p?._id) {
            try {
              const saved = localStorage.getItem(`collabo_milestones_${p._id}_${fid}`);
              if (saved) mList = JSON.parse(saved);
            } catch (e) {}
          }
          if (!mList && Array.isArray(h.milestones) && h.milestones.length > 0) {
            mList = h.milestones;
          }
          if (Array.isArray(mList) && mList.length > 0) {
            total += mList.length;
            approved += mList.filter((m) => m.status === 'completed' || m.status === 'approved' || m.status === 'released').length;
          }
        });
        if (total > 0) return Math.round((approved / total) * 100);
      }
      return 0;
    })(),
    deadline: p?.deadline ? new Date(p.deadline).toISOString().split('T')[0] : 'unknown',
    budget: formatBudget(p?.totalBudget || p?.budget),
    rawBudget: p?.totalBudget || p?.budget,
    totalBudget: p?.totalBudget || (typeof p?.budget === 'number' ? p.budget : p?.budget?.amount || 0),
    hirings: Array.isArray(p?.hirings) ? p.hirings : [],
    createdAt: p?.createdAt || 'unknown',
    description: p?.description || 'unknown',
    rawProject: p,
  };
};

export const projectService = {
  getCreatorProjects: async () => {
    try {
      const res = await api.get('/api/creator/projects');
      if (res.data?.projects && Array.isArray(res.data.projects)) {
        return res.data.projects.map(mapBackendProject);
      }
      return [];
    } catch (err) {
      console.warn('[projectService] Failed to fetch creator projects from API:', err.message);
      return [];
    }
  },
  getEditorRecommended: async () => {
    try {
      const res = await api.get('/api/projects');
      if (res.data?.projects && Array.isArray(res.data.projects)) {
        const roleGigs = [];

        res.data.projects.forEach((p) => {
          const openHirings = Array.isArray(p.hirings) ? p.hirings.filter(h => h.status === 'open') : [];

          if (openHirings.length > 0) {
            // Expand each open hiring role into an individual gig card
            openHirings.forEach((h) => {
              const tags = [
                ...(Array.isArray(h.requiredSkills) ? h.requiredSkills : []),
                ...(Array.isArray(h.requiredTools) ? h.requiredTools : [])
              ];

              roleGigs.push({
                id: `${p._id}_${h._id || h.roleId}`,
                projectId: p._id,
                hiringId: h._id,
                roleId: h.roleId,
                roleTitle: h.roleTitle || 'Freelance Role',
                projectTitle: p.title || 'Untitled Project',
                title: h.roleTitle ? `${h.roleTitle} — ${p.title}` : p.title,
                description: h.description || p.description || '',
                creator: p.creatorId?.name || 'Creator Client',
                creatorAvatar: p.creatorId?.profileImage || DEFAULT_PFP,
                budget: h.budget ? `₹${Number(h.budget).toLocaleString('en-IN')}` : '999',
                rawBudget: Number(h.budget) || 0,
                deadline: h.firstDeadline
                  ? new Date(h.firstDeadline).toLocaleDateString()
                  : (p.deadline ? new Date(p.deadline).toLocaleDateString() : 'Flexible'),
                tags: tags.length ? tags : [p.category || 'Creative'],
                proposalsCount: 0,
                difficulty: p.complexity || 'Intermediate',
                verified: true,
                milestones: Array.isArray(h.milestones) ? h.milestones : [],
              });
            });
          } else {
            // Fallback for projects without granular hirings subdocuments
            const budgetVal = typeof p.budget === 'object'
              ? (p.budget?.fixed ? `₹${Number(p.budget.fixed).toLocaleString('en-IN')}` : (p.budget?.min ? `₹${Number(p.budget.min).toLocaleString('en-IN')} - ₹${Number(p.budget.max).toLocaleString('en-IN')}` : '999'))
              : (p.budget ? `₹${Number(p.budget).toLocaleString('en-IN')}` : '999');

            roleGigs.push({
              id: p._id || p.id || 'unknown',
              projectId: p._id,
              hiringId: null,
              roleId: 'video_editor',
              roleTitle: p.category || 'Video Editor',
              projectTitle: p.title || 'Untitled Project',
              title: p.title || 'Untitled Project',
              description: p.description || '',
              creator: p.creatorId?.name || 'Creator Client',
              creatorAvatar: p.creatorId?.profileImage || DEFAULT_PFP,
              budget: budgetVal,
              rawBudget: typeof p.budget === 'number' ? p.budget : (p.totalBudget || 0),
              deadline: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'Flexible',
              tags: Array.isArray(p.requiredSkills) && p.requiredSkills.length ? p.requiredSkills : [p.category || 'Video Editing'],
              proposalsCount: 0,
              difficulty: p.complexity || 'Intermediate',
              verified: true,
              milestones: [],
            });
          }
        });

        return roleGigs;
      }
      return [];
    } catch (err) {
      console.warn('[projectService] Failed to fetch open gigs from API:', err.message);
      return [];
    }
  },
  getEditorActive: async () => {
    try {
      const currentRole = localStorage.getItem('collabo_role') || 'creator';
      if (currentRole !== 'editor') {
        return [];
      }
      const res = await api.get('/api/application/my?status=accepted');
      if (res.data?.applications && Array.isArray(res.data.applications)) {
        return res.data.applications.map((app) => {
          const p = app.projectId || {};
          const projectId = p._id || app._id;
          const editorId = app.editorId?._id || app.editorId;

          // Milestone resolution: check role milestones or workspace cache
          let milestones = [];
          if (Array.isArray(p.hirings)) {
            const matchedHiring = p.hirings.find(h => 
              (app.hiringId && h._id?.toString() === app.hiringId.toString()) ||
              (app.roleId && h.roleId === app.roleId)
            );
            if (matchedHiring && Array.isArray(matchedHiring.milestones) && matchedHiring.milestones.length > 0) {
              milestones = matchedHiring.milestones;
            }
          }

          // If no milestones found in hiring, check cached workspace milestones
          if (milestones.length === 0) {
            try {
              const cached = localStorage.getItem(`collabo_milestones_${projectId}`) ||
                             localStorage.getItem(`collabo_milestones_${projectId}_${editorId}`);
              if (cached) {
                milestones = JSON.parse(cached);
              }
            } catch (e) {
              console.warn(e);
            }
          }

          // Fallback standard 3-milestone structure
          if (milestones.length === 0) {
            const isCompleted = p.status === 'completed';
            milestones = [
              { id: 'm1', title: 'Milestone 1: Rough Cut Assembly', status: isCompleted ? 'approved' : 'pending' },
              { id: 'm2', title: 'Milestone 2: Sound Design & Color Grade', status: isCompleted ? 'approved' : 'pending' },
              { id: 'm3', title: 'Milestone 3: 4K Master Export', status: isCompleted ? 'approved' : 'pending' },
            ];
          }

          const totalCount = milestones.length;
          const approvedCount = milestones.filter((m) => m.status === 'completed' || m.status === 'approved' || m.status === 'released').length;
          const progressPercent = p.status === 'completed'
            ? 100
            : totalCount > 0
            ? Math.round((approvedCount / totalCount) * 100)
            : 0;

          return {
            id: p._id || app._id || 'unknown',
            projectId: p._id,
            applicationId: app._id,
            roleTitle: app.roleTitle || 'Video Editor',
            title: p.title || 'Untitled Project',
            client: p.creatorId?.name || 'Creator Client',
            clientAvatar: p.creatorId?.profileImage || DEFAULT_PFP,
            progress: Math.min(100, Math.max(0, progressPercent)),
            totalMilestones: totalCount,
            clearedMilestones: approvedCount,
            milestones,
            dueDate: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'Ongoing',
            status: p.status === 'completed' ? 'Delivered' : 'In Production',
            budget: app.bidAmount != null ? `₹${Number(app.bidAmount).toLocaleString('en-IN')}` : '999',
            deliverableType: app.roleTitle || p.category || 'Video Editing',
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('[projectService] Failed to fetch editor active contracts:', err.message);
      return [];
    }
  },
  getProjectDetails: async (projectId) => {
    try {
      const res = await api.get(`/api/creator/projects/${projectId}`);
      if (res.data?.project) {
        const mapped = mapBackendProject(res.data.project);
        if (res.data.workspace) {
          mapped.workspace = res.data.workspace;
        }
        mapped.leadEditorHasStartedWork = Boolean(res.data.leadEditorHasStartedWork);
        mapped.roleWorkStarted = res.data.roleWorkStarted || {};
        return mapped;
      }
      return null;
    } catch (err) {
      console.warn('[projectService] Failed to fetch project details:', err.message);
      throw err;
    }
  },
  removeTeamMember: async (projectId, hiringId) => {
    try {
      const res = await api.post(`/api/creator/projects/${projectId}/hirings/${hiringId}/remove-member`);
      return res.data;
    } catch (err) {
      console.error('[projectService] Failed to remove team member:', err);
      throw err;
    }
  },
};
