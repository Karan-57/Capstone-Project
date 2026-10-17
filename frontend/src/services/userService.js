import api from './api';

export const userService = {
  /**
   * Get current user profile details
   */
  getMe: async () => {
    const res = await api.get('/api/users/me');
    return res.data?.user;
  },

  /**
   * Update profile fields (name, bio, location, phone/phoneNumber, category, title, tools, skills, subRoles)
   */
  updateProfile: async (updates) => {
    const res = await api.patch('/api/users/me', updates);
    return res.data?.user;
  },

  /**
   * Get current user app settings
   */
  getSettings: async () => {
    const res = await api.get('/api/users/me/settings');
    return res.data;
  },

  /**
   * Update app settings (phoneVisibility, emailNotifications, projectAlerts, soundAlerts, theme, etc.)
   */
  updateSettings: async (settings) => {
    const res = await api.patch('/api/users/me/settings', settings);
    return res.data;
  },

  /**
   * Search users by username or name
   */
  searchUsers: async (q) => {
    const res = await api.get('/api/users/search', { params: { q } });
    return res.data?.users || [];
  },

  /**
   * Get public profile of a user by ID
   */
  getUserProfile: async (userId) => {
    const res = await api.get(`/api/users/${userId}`);
    return res.data?.user;
  },

  /**
   * Get reviews and metrics for a user
   */
  getUserReviews: async (userId, page = 1) => {
    const res = await api.get(`/api/users/${userId}/get-review`, { params: { page } });
    return res.data;
  },

  /**
   * Check if authenticated user has collaborated on any project with target user
   */
  getCollaborationStatus: async (userId) => {
    const res = await api.get(`/api/users/${userId}/collaboration-status`);
    return res.data;
  },

  /**
   * Submit a rating and review for a collaborator
   */
  rateUser: async (userId, reviewData) => {
    const res = await api.post(`/api/users/${userId}/rate`, reviewData);
    return res.data;
  },
};

export default userService;
