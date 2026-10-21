import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import CreatorLayout from '../layouts/CreatorLayout';
import EditorLayout from '../layouts/EditorLayout';

// Route Guard Middleware
import ProtectedRoute from './ProtectedRoute';

// Common Components
import StickyMobileCTA from '../components/common/StickyMobileCTA';

// Core Public & Legal Pages (Statically imported for zero latency & instant tab rendering)
import LandingPage from '../pages/LandingPage';
import PrivacyPolicy from '../pages/legal/PlatformPrivacy';
import TermsAndConditions from '../pages/legal/TermsAndConditions';
import NotFound from '../pages/NotFound';

import {
  AppShellSkeleton,
  DashboardSkeleton,
  WorkspaceSkeleton,
  PaymentsSkeleton,
  NotificationsSkeleton,
} from '../components/common/Skeleton';

// Page Loader Fallback (renders full AppShellSkeleton inside app routes for seamless chunk loading)
const PageLoader = () => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isProtectedApp = path.startsWith('/creator') || path.startsWith('/editor');

  if (isProtectedApp) {
    const isWorkspace = path.includes('/workspace');
    const isPayments = path.includes('/payments') || path.includes('/earnings');
    const isNotifications = path.includes('/notifications');
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

  return (
    <div className="min-h-screen bg-[#FFF7F1] dark:bg-[#19100F] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-[#FFEBAA] border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#382322] border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="text-xs font-bold font-mono uppercase tracking-widest text-[#261615] dark:text-[#FDEBDE]">Loading studio...</span>
    </div>
  );
};

// Lazy-loaded Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const Signup = lazy(() => import('../pages/auth/Signup'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Lazy-loaded Creator Pages
const CreatorDashboard = lazy(() => import('../pages/creator/Dashboard'));
const CreatorProjects = lazy(() => import('../pages/creator/Projects'));
const ProjectDetails = lazy(() => import('../pages/creator/ProjectDetails'));
const CreateProject = lazy(() => import('../pages/creator/CreateProject'));
const CreatorApplications = lazy(() => import('../pages/creator/Applications'));
const CreatorAnalytics = lazy(() => import('../pages/creator/Analytics'));
const CreatorPayments = lazy(() => import('../pages/creator/Payments'));
const CreatorHistory = lazy(() => import('../pages/creator/History'));
const CreatorNotifications = lazy(() => import('../pages/creator/Notifications'));
const CreatorProfile = lazy(() => import('../pages/creator/Profile'));
const CreatorEditProfile = lazy(() => import('../pages/creator/EditProfile'));
const CreatorSettings = lazy(() => import('../pages/creator/Settings'));
const CreatorMessages = lazy(() => import('../pages/creator/Messages'));

// Lazy-loaded Editor Pages
const EditorDashboard = lazy(() => import('../pages/editor/Dashboard'));
const BrowseProjects = lazy(() => import('../pages/editor/BrowseProjects'));
const MyApplications = lazy(() => import('../pages/editor/MyApplications'));
const EditorActiveProjects = lazy(() => import('../pages/editor/ActiveProjects'));
const EditorEarnings = lazy(() => import('../pages/editor/Earnings'));
const EditorNotifications = lazy(() => import('../pages/editor/Notifications'));
const EditorProfile = lazy(() => import('../pages/editor/Profile'));
const EditorEditProfile = lazy(() => import('../pages/editor/EditProfile'));
const EditorSettings = lazy(() => import('../pages/editor/Settings'));
const EditorMessages = lazy(() => import('../pages/editor/Messages'));

// Lazy-loaded Workspace Page
const Workspace = lazy(() => import('../pages/workspace/Workspace'));

// Lazy-loaded Search and Public Profile Pages
const SearchPage = lazy(() => import('../pages/common/SearchPage'));
const PublicProfilePage = lazy(() => import('../pages/common/PublicProfilePage'));

const RootSearchRedirect = () => {
  const { role } = useAuth();
  return <Navigate to={role === 'creator' ? '/creator/search' : '/editor/search'} replace />;
};

const RootProfileRedirect = () => {
  const { userId } = useParams();
  const { role } = useAuth();
  return <Navigate to={role === 'creator' ? `/creator/profile/${userId}` : `/editor/profile/${userId}`} replace />;
};

export const AppRoutes = () => {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing & Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />

          {/* Root Search & Profile Shortcuts */}
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <RootSearchRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <RootProfileRedirect />
              </ProtectedRoute>
            }
          />

          {/* Unified Auth Routes with ?role=creator | ?role=editor */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Redirect legacy paths directly to unified query-based routes */}
          <Route path="/auth/creator-login" element={<Navigate to="/login?role=creator" replace />} />
          <Route path="/auth/creator-signup" element={<Navigate to="/signup?role=creator" replace />} />
          <Route path="/auth/editor-login" element={<Navigate to="/login?role=editor" replace />} />
          <Route path="/auth/editor-signup" element={<Navigate to="/signup?role=editor" replace />} />

          {/* Creator Protected Routes */}
          <Route
            path="/creator"
            element={
              <ProtectedRoute requiredRole="creator">
                <CreatorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/creator/dashboard" replace />} />
            <Route path="dashboard" element={<CreatorDashboard />} />
            <Route path="search" element={<SearchPage role="creator" />} />
            <Route path="projects" element={<CreatorProjects />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
            <Route path="create-project" element={<CreateProject />} />
            <Route path="applications" element={<CreatorApplications />} />
            <Route path="workspace" element={<Workspace role="creator" />} />
            <Route path="messages" element={<CreatorMessages />} />
            <Route path="analytics" element={<CreatorAnalytics />} />
            <Route path="payments" element={<CreatorPayments />} />
            <Route path="history" element={<CreatorHistory />} />
            <Route path="notifications" element={<CreatorNotifications />} />
            <Route path="profile" element={<CreatorProfile />} />
            <Route path="profile/:userId" element={<PublicProfilePage role="creator" />} />
            <Route path="edit-profile" element={<CreatorEditProfile />} />
            <Route path="settings" element={<CreatorSettings />} />
          </Route>

          {/* Editor Protected Routes */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute requiredRole="editor">
                <EditorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/editor/dashboard" replace />} />
            <Route path="dashboard" element={<EditorDashboard />} />
            <Route path="search" element={<SearchPage role="editor" />} />
            <Route path="browse" element={<BrowseProjects />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="active-projects" element={<EditorActiveProjects />} />
            <Route path="workspace" element={<Workspace role="editor" />} />
            <Route path="messages" element={<EditorMessages />} />
            <Route path="earnings" element={<EditorEarnings />} />
            <Route path="notifications" element={<EditorNotifications />} />
            <Route path="profile" element={<EditorProfile />} />
            <Route path="profile/:userId" element={<PublicProfilePage role="editor" />} />
            <Route path="edit-profile" element={<EditorEditProfile />} />
            <Route path="create-showreel" element={<EditorEditProfile />} />
            <Route path="settings" element={<EditorSettings />} />
          </Route>

          {/* Custom 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <StickyMobileCTA />
    </>
  );
};

export default AppRoutes;

