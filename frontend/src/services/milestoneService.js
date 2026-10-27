import api from './api';

export const milestoneService = {
  /**
   * Fetch authoritative milestone list for a workspace, project, or role hiring.
   * Both creator and freelancer query this same endpoint for true single-source data.
   */
  getMilestones: async ({ workspaceId, projectId, hiringId, freelancerId } = {}) => {
    try {
      const params = {};
      if (workspaceId) params.workspaceId = workspaceId;
      if (projectId) params.projectId = projectId;
      if (hiringId) params.hiringId = hiringId;
      if (freelancerId) params.freelancerId = freelancerId;

      const res = await api.get('/api/milestones', { params });
      return res.data?.milestones || [];
    } catch (err) {
      console.warn('[milestoneService] Failed to fetch milestones:', err.message);
      return [];
    }
  },

  /**
   * Freelancer submits their video cut / preview URL for review
   */
  submitMilestoneDeliverable: async (milestoneId, { submittedUrl, submissionNotes }) => {
    const res = await api.post(`/api/milestones/${milestoneId}/submit`, {
      submittedUrl,
      submissionNotes,
    });
    return res.data;
  },
};

export default milestoneService;
