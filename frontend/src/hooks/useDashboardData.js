import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { applicationService } from '../services/applicationService';
import { paymentService } from '../services/paymentService';
import { messageService } from '../services/messageService';
import api from '../services/api';

// In-memory cache to eliminate repetitive skeleton spinners during tab navigation
const dashboardCache = {
  creator: null,
  editor: null,
  timestamp: {
    creator: 0,
    editor: 0,
  },
};

const CACHE_TTL_MS = 30 * 1000; // 30 seconds fresh cache

export const useDashboardData = () => {
  const { role, isAuthenticated, isAuthLoading } = useAuth();
  const cached = role && dashboardCache[role] ? dashboardCache[role] : null;

  const [loading, setLoading] = useState(!cached);
  const [creatorProjects, setCreatorProjects] = useState(cached?.creatorProjects || []);
  const [editorRecommended, setEditorRecommended] = useState(cached?.editorRecommended || []);
  const [editorActive, setEditorActive] = useState(cached?.editorActive || []);
  const [applications, setApplications] = useState(cached?.applications || []);
  const [earningsData, setEarningsData] = useState(cached?.earningsData || null);
  const [editorEarnings, setEditorEarnings] = useState(cached?.editorEarnings || null);
  const [messages, setMessages] = useState(cached?.messages || []);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !role) {
      if (!isAuthLoading && !isAuthenticated) {
        setLoading(false);
      }
      return;
    }

    const currentCached = dashboardCache[role];
    const isCacheFresh = currentCached && (Date.now() - (dashboardCache.timestamp[role] || 0) < CACHE_TTL_MS);

    // If cache is fresh, sync state from cache immediately and skip network call
    if (isCacheFresh) {
      if (role === 'creator') {
        setCreatorProjects(currentCached.creatorProjects || []);
        setApplications(currentCached.applications || []);
        setEarningsData(currentCached.earningsData || null);
        setMessages(currentCached.messages || []);
      } else if (role === 'editor') {
        setEditorRecommended(currentCached.editorRecommended || []);
        setEditorActive(currentCached.editorActive || []);
        setEditorEarnings(currentCached.editorEarnings || null);
        setMessages(currentCached.messages || []);
      }
      setLoading(false);
      return;
    }

    // If no cache, show loading spinner; if stale cache exists, revalidate in background without spinner
    if (!currentCached) {
      setLoading(true);
    }

    let isMounted = true;
    const fetchData = async () => {
      try {
        if (role === 'creator') {
          const [cProj, apps, earn, msgs] = await Promise.all([
            projectService.getCreatorProjects().catch(() => []),
            applicationService.getApplications().catch(() => []),
            paymentService.getEarningsChart('thisMonth').catch(() => null),
            messageService.getDMs().catch(() => []),
          ]);
          if (isMounted) {
            const nextData = {
              creatorProjects: cProj || [],
              applications: apps || [],
              earningsData: earn,
              messages: msgs || [],
            };
            dashboardCache.creator = nextData;
            dashboardCache.timestamp.creator = Date.now();

            setCreatorProjects(nextData.creatorProjects);
            setApplications(nextData.applications);
            setEarningsData(nextData.earningsData);
            setMessages(nextData.messages);
          }
        } else if (role === 'editor') {
          const [eRec, eAct, eEarn, msgs] = await Promise.all([
            projectService.getEditorRecommended().catch(() => []),
            projectService.getEditorActive().catch(() => []),
            paymentService.getEditorEarnings().catch(() => null),
            messageService.getDMs().catch(() => []),
          ]);
          if (isMounted) {
            const nextData = {
              editorRecommended: eRec || [],
              editorActive: eAct || [],
              editorEarnings: eEarn,
              messages: msgs || [],
            };
            dashboardCache.editor = nextData;
            dashboardCache.timestamp.editor = Date.now();

            setEditorRecommended(nextData.editorRecommended);
            setEditorActive(nextData.editorActive);
            setEditorEarnings(nextData.editorEarnings);
            setMessages(nextData.messages);
          }
        }
      } catch (err) {
        console.warn('[useDashboardData] Failed to load dashboard data:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [role, isAuthLoading, isAuthenticated]);

  const handleApplicationStatus = async (appId, newStatus) => {
    try {
      if (newStatus === 'accepted') {
        await api.post(`/api/application/${appId}/accept`);
      } else if (newStatus === 'rejected') {
        await api.post(`/api/application/${appId}/reject`);
      }
      setApplications((prev) => {
        const updated = prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        );
        if (dashboardCache.creator) {
          dashboardCache.creator.applications = updated;
        }
        return updated;
      });
    } catch (err) {
      console.error('Failed to update application status from dashboard:', err);
    }
  };

  return {
    loading,
    creatorProjects,
    editorRecommended,
    editorActive,
    applications,
    earningsData,
    editorEarnings,
    messages,
    handleApplicationStatus,
  };
};
