export const initialApplicationsData = [
  {
    id: 'app-1',
    name: 'Rahul Verma',
    role: 'Full Stack & Motion Editor',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    price: '₹18,000',
    duration: '25 days',
    rating: 4.8,
    status: 'pending', // 'pending' | 'accepted' | 'rejected'
    appliedFor: 'E-Commerce Website',
    appliedDate: '2 hours ago',
  },
  {
    id: 'app-2',
    name: 'Priya Mehta',
    role: 'Video Specialist & Colorist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    price: '₹20,000',
    duration: '28 days',
    rating: 4.9,
    status: 'pending',
    appliedFor: 'Social Media App',
    appliedDate: '5 hours ago',
  },
  {
    id: 'app-3',
    name: 'Aditya Joshi',
    role: 'Shorts & VFX Artist',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    price: '₹17,000',
    duration: '22 days',
    rating: 4.7,
    status: 'pending',
    appliedFor: 'Portfolio Website',
    appliedDate: '1 day ago',
  },
  {
    id: 'app-4',
    name: 'Siddharth Nair',
    role: 'Documentary Storyteller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    price: '₹25,000',
    duration: '18 days',
    rating: 5.0,
    status: 'accepted',
    appliedFor: 'YouTube 4K Documentary Cut',
    appliedDate: '3 days ago',
  },
  {
    id: 'app-5',
    name: 'Aanya Sharma',
    role: 'Motion Designer & 3D',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    price: '₹30,000',
    duration: '30 days',
    rating: 4.6,
    status: 'accepted',
    appliedFor: 'Brand Identity Reel',
    appliedDate: '4 days ago',
  },
  {
    id: 'app-6',
    name: 'Kabir Patel',
    role: 'Sound Designer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    price: '₹12,000',
    duration: '14 days',
    rating: 4.5,
    status: 'accepted',
    appliedFor: 'Podcast Video Series',
    appliedDate: '5 days ago',
  },
  {
    id: 'app-7',
    name: 'Vikram Seth',
    role: 'Generalist Editor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    price: '₹15,000',
    duration: '20 days',
    rating: 4.2,
    status: 'rejected',
    appliedFor: 'E-Commerce Website',
    appliedDate: '1 week ago',
  },
  {
    id: 'app-8',
    name: 'Devika Ray',
    role: 'Thumbnails & Color',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    price: '₹22,000',
    duration: '25 days',
    rating: 4.9,
    status: 'accepted',
    appliedFor: 'Masterclass Course Cut',
    appliedDate: '1 week ago',
  }
];

import api from './api';

export const applicationService = {
  getApplications: async () => {
    try {
      // 1. If creator, fetch their projects first to get real applications
      const projectsRes = await api.get('/api/creator/projects');
      const projects = projectsRes.data?.projects;
      if (Array.isArray(projects) && projects.length > 0) {
        const appsPromises = projects.slice(0, 5).map((p) =>
          api
            .get(`/api/creator/projects/${p._id}/applications`)
            .then((r) =>
              (r.data?.applications || []).map((app) => ({
                id: app._id,
                name: app.editorId?.name || 'Applicant Editor',
                role: app.editorId?.bio || 'Video Editor',
                avatar: app.editorId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                price: `₹${app.bidAmount || 15000}`,
                duration: `${app.estimatedDeliveryDays || 7} days`,
                rating: app.editorId?.rating || 4.8,
                status: app.status || 'pending',
                appliedFor: p.title,
                appliedDate: new Date(app.createdAt).toLocaleDateString(),
              }))
            )
            .catch(() => [])
        );
        const nestedApps = await Promise.all(appsPromises);
        const flatApps = nestedApps.flat();
        if (flatApps.length > 0) return flatApps;
      }
      return initialApplicationsData;
    } catch (err) {
      console.warn('[applicationService] Failed to fetch real applications, fallback to initial data:', err.message);
      return initialApplicationsData;
    }
  },
  getMyApplications: async () => {
    try {
      const res = await api.get('/api/application/my');
      if (res.data?.applications && Array.isArray(res.data.applications)) {
        return res.data.applications;
      }
      return [];
    } catch (err) {
      return [];
    }
  },
};
