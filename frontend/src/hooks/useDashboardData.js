import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { applicationService, initialApplicationsData } from '../services/applicationService';
import { paymentService } from '../services/paymentService';
import { messageService } from '../services/messageService';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [creatorProjects, setCreatorProjects] = useState([]);
  const [editorRecommended, setEditorRecommended] = useState([]);
  const [editorActive, setEditorActive] = useState([]);
  const [applications, setApplications] = useState(initialApplicationsData);
  const [earningsData, setEarningsData] = useState(null);
  const [editorEarnings, setEditorEarnings] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cProj, eRec, eAct, apps, earn, eEarn, msgs] = await Promise.all([
          projectService.getCreatorProjects(),
          projectService.getEditorRecommended(),
          projectService.getEditorActive(),
          applicationService.getApplications(),
          paymentService.getEarningsChart('thisMonth'),
          paymentService.getEditorEarnings(),
          messageService.getMessages(),
        ]);
        setCreatorProjects(cProj);
        setEditorRecommended(eRec);
        setEditorActive(eAct);
        setApplications(apps);
        setEarningsData(earn);
        setEditorEarnings(eEarn);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApplicationStatus = (appId, newStatus) => {
    setApplications(prev =>
      prev.map(app => (app.id === appId ? { ...app, status: newStatus } : app))
    );
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
