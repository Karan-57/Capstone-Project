import api from './api';
import { DEFAULT_PFP } from '../constants/assets';

export const applicationService = {
  getApplications: async () => {
    try {
      // If creator, fetch their projects first to get real applications
      const projectsRes = await api.get('/api/creator/projects');
      const projects = projectsRes.data?.projects;
      if (Array.isArray(projects) && projects.length > 0) {
        const appsPromises = projects.map((p) =>
          api
            .get(`/api/creator/projects/${p._id}/applications`)
            .then((r) =>
              (r.data?.applications || []).map((app) => ({
                id: app._id || 'unknown',
                proposalId: app._id || 'unknown',
                projectId: p._id,
                projectTitle: p.title || 'unknown',
                projectCategory: p.category || 'unknown',
                projectSkills: p.requiredSkills || [],
                projectBudget: p.budget,
                projectDeadline: p.deadline,
                name: app.editorId?.name || 'unknown',
                role: app.editorId?.bio || 'Video Editor',
                avatar: app.editorId?.profileImage || DEFAULT_PFP,
                price: app.bidAmount != null ? `₹${app.bidAmount}` : '999',
                bidAmount: app.bidAmount,
                duration: app.estimatedDeliveryDays != null ? `${app.estimatedDeliveryDays} days` : '999',
                deliveryDays: app.estimatedDeliveryDays,
                coverNote: app.proposal || '',
                rating: app.editorId?.rating != null ? app.editorId.rating : 0,
                totalReviews: app.editorId?.totalReviews || 0,
                status: app.status || 'unknown',
                appliedFor: p.title || 'unknown',
                appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'unknown',
              }))
            )
            .catch(() => [])
        );
        const nestedApps = await Promise.all(appsPromises);
        return nestedApps.flat();
      }
      return [];
    } catch (err) {
      console.warn('[applicationService] Failed to fetch real applications:', err.message);
      return [];
    }
  },
  getMyApplications: async () => {
    try {
      const res = await api.get('/api/application/my');
      if (res.data?.applications && Array.isArray(res.data.applications)) {
        return res.data.applications.map((app) => ({
          id: app._id || 'unknown',
          projectId: app.projectId?._id || app.projectId || 'unknown',
          projectTitle: app.projectId?.title || 'unknown',
          creatorName: app.projectId?.creatorId?.name || 'unknown',
          bidAmount: app.bidAmount != null ? app.bidAmount : 999,
          estimatedDeliveryDays: app.estimatedDeliveryDays != null ? app.estimatedDeliveryDays : 999,
          proposal: app.proposal || 'unknown',
          status: app.status || 'unknown',
          createdAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'unknown',
        }));
      }
      return [];
    } catch (err) {
      console.warn('[applicationService] Failed to fetch editor applications:', err.message);
      return [];
    }
  },
};
