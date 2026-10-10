import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { applicationService } from '../services/applicationService';
import { paymentService } from '../services/paymentService';
import { messageService } from '../services/messageService';
import api from '../services/api';

export const useDashboardData = () => {
  const { role, isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creatorProjects, setCreatorProjects] = useState([]);
  const [editorRecommended, setEditorRecommended] = useState([]);
  const [editorActive, setEditorActive] = useState([]);
  const [applications, setApplications] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [editorEarnings, setEditorEarnings] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (isAuthLoading) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (role === 'creator') {
          const [cProj, apps, earn, msgs] = await Promise.all([
            projectService.getCreatorProjects().catch(() => []),
            applicationService.getApplications().catch(() => []),
            paymentService.getEarningsChart('thisMonth').catch(() => null),
            messageService.getMessages().catch(() => []),
          ]);
          if (isMounted) {
            setCreatorProjects(cProj || []);
            setApplications(apps || []);
            setEarningsData(earn);
            setMessages(msgs || []);
          }
        } else if (role === 'editor') {
          const [eRec, eAct, eEarn, msgs] = await Promise.all([
            projectService.getEditorRecommended().catch(() => []),
            projectService.getEditorActive().catch(() => []),
            paymentService.getEditorEarnings().catch(() => null),
            messageService.getMessages().catch(() => []),
          ]);
          if (isMounted) {
            setEditorRecommended(eRec || []);
            setEditorActive(eAct || []);
            setEditorEarnings(eEarn);
            setMessages(msgs || []);
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
  }, [role, isAuthLoading]);

  const handleApplicationStatus = async (appId, newStatus) => {
    try {
      if (newStatus === 'accepted') {
        await api.post(`/api/application/${appId}/accept`);
      } else if (newStatus === 'rejected') {
        await api.post(`/api/application/${appId}/reject`);
      }
      setApplications(prev =>
        prev.map(app => (app.id === appId ? { ...app, status: newStatus } : app))
      );
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
