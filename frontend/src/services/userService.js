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
};

export default userService;
