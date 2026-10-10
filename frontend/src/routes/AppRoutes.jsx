import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CreatorLayout from '../layouts/CreatorLayout';
import EditorLayout from '../layouts/EditorLayout';

// Route Guard Middleware
import ProtectedRoute from './ProtectedRoute';

// Common Components
import StickyMobileCTA from '../components/common/StickyMobileCTA';

// Page Loader Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-4">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 animate-pulse blur-md opacity-40" />
      <div className="w-10 h-10 rounded-xl bg-[#0B0E17] border border-purple-500/30 flex items-center justify-center relative">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
    <span className="text-xs font-medium text-slate-400 tracking-wider">Loading...</span>
  </div>
);

// Core Public & Legal Pages (Statically imported to ensure 100% reliable direct tab loads)
import LandingPage from '../pages/LandingPage';
import About from '../pages/About';
import PrivacyPolicy from '../pages/legal/PrivacyPolicy';
import TermsAndConditions from '../pages/legal/TermsAndConditions';
import NotFound from '../pages/NotFound';

// Lazy-loaded Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const Signup = lazy(() => import('../pages/auth/Signup'));

// Lazy-loaded Creator Pages
const CreatorDashboard = lazy(() => import('../pages/creator/Dashboard'));
const CreatorProjects = lazy(() => import('../pages/creator/Projects'));
const CreateProject = lazy(() => import('../pages/creator/CreateProject'));
const CreatorApplications = lazy(() => import('../pages/creator/Applications'));
const CreatorAnalytics = lazy(() => import('../pages/creator/Analytics'));
const CreatorPayments = lazy(() => import('../pages/creator/Payments'));
const CreatorNotifications = lazy(() => import('../pages/creator/Notifications'));
const CreatorProfile = lazy(() => import('../pages/creator/Profile'));
const CreatorEditProfile = lazy(() => import('../pages/creator/EditProfile'));

// Lazy-loaded Editor Pages
const EditorDashboard = lazy(() => import('../pages/editor/Dashboard'));
const BrowseProjects = lazy(() => import('../pages/editor/BrowseProjects'));
const MyApplications = lazy(() => import('../pages/editor/MyApplications'));
const EditorActiveProjects = lazy(() => import('../pages/editor/ActiveProjects'));
const EditorEarnings = lazy(() => import('../pages/editor/Earnings'));
const EditorNotifications = lazy(() => import('../pages/editor/Notifications'));
const EditorProfile = lazy(() => import('../pages/editor/Profile'));
const EditorEditProfile = lazy(() => import('../pages/editor/EditProfile'));

// Lazy-loaded Workspace Page
const Workspace = lazy(() => import('../pages/workspace/Workspace'));

export const AppRoutes = () => {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing & Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />

          {/* Unified Auth Routes with ?role=creator | ?role=editor */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />

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
            <Route path="projects" element={<CreatorProjects />} />
            <Route path="create-project" element={<CreateProject />} />
            <Route path="applications" element={<CreatorApplications />} />
            <Route path="workspace" element={<Workspace role="creator" />} />
            <Route path="messages" element={<Workspace role="creator" />} />
            <Route path="analytics" element={<CreatorAnalytics />} />
            <Route path="payments" element={<CreatorPayments />} />
            <Route path="notifications" element={<CreatorNotifications />} />
            <Route path="profile" element={<CreatorProfile />} />
            <Route path="edit-profile" element={<CreatorEditProfile />} />
            <Route path="settings" element={<CreatorEditProfile />} />
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
            <Route path="browse" element={<BrowseProjects />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="active-projects" element={<EditorActiveProjects />} />
            <Route path="workspace" element={<Workspace role="editor" />} />
            <Route path="messages" element={<Workspace role="editor" />} />
            <Route path="earnings" element={<EditorEarnings />} />
            <Route path="notifications" element={<EditorNotifications />} />
            <Route path="profile" element={<EditorProfile />} />
            <Route path="edit-profile" element={<EditorEditProfile />} />
            <Route path="create-showreel" element={<EditorEditProfile />} />
            <Route path="settings" element={<EditorEditProfile />} />
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
