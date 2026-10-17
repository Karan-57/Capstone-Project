import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  AppShellSkeleton,
  DashboardSkeleton,
  WorkspaceSkeleton,
  PaymentsSkeleton,
  NotificationsSkeleton,
} from '../components/common/Skeleton';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAuthLoading, role } = useAuth();
  const location = useLocation();

  // While checking refresh token on initial page load / F5 refresh, render skeleton layout
  if (isAuthLoading) {
    const isWorkspace = location.pathname.includes('/workspace');
    const isPayments = location.pathname.includes('/payments') || location.pathname.includes('/earnings');
    const isNotifications = location.pathname.includes('/notifications');

    return (
      <AppShellSkeleton isWorkspace={isWorkspace}>
        {isWorkspace ? (
          <WorkspaceSkeleton />
        ) : isPayments ? (
          <PaymentsSkeleton />
        ) : isNotifications ? (
          <NotificationsSkeleton />
        ) : (
          <DashboardSkeleton />
        )}
      </AppShellSkeleton>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strict role enforcement: Freelancer/editor cannot access creator pages, and creator cannot access freelancer pages
  const isFreelancerRole = role === 'editor' || role === 'freelancer';
  const isTargetFreelancer = requiredRole === 'editor' || requiredRole === 'freelancer';

  if (requiredRole) {
    if (requiredRole === 'creator' && role !== 'creator') {
      return <Navigate to="/editor/dashboard" replace />;
    }
    if (isTargetFreelancer && !isFreelancerRole) {
      return <Navigate to="/creator/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
