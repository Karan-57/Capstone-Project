import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CreatorLayout from '../layouts/CreatorLayout';
import EditorLayout from '../layouts/EditorLayout';

// Route Guard Middleware
import ProtectedRoute from './ProtectedRoute';

// Landing Pages
import LandingPage from '../pages/LandingPage';
import About from '../pages/About';

// Auth Pages (Unified and role-specific paths)
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import CreatorLogin from '../pages/auth/CreatorLogin';
import CreatorSignup from '../pages/auth/CreatorSignup';
import EditorLogin from '../pages/auth/EditorLogin';
import EditorSignup from '../pages/auth/EditorSignup';

// Creator Pages
import CreatorDashboard from '../pages/creator/Dashboard';
import CreatorProjects from '../pages/creator/Projects';
import CreatorApplications from '../pages/creator/Applications';
import CreatorMessages from '../pages/creator/Messages';
import CreatorAnalytics from '../pages/creator/Analytics';
import CreatorPayments from '../pages/creator/Payments';
import CreatorNotifications from '../pages/creator/Notifications';
import CreatorProfile from '../pages/creator/Profile';

// Editor Pages
import EditorDashboard from '../pages/editor/Dashboard';
import BrowseProjects from '../pages/editor/BrowseProjects';
import MyApplications from '../pages/editor/MyApplications';
import EditorActiveProjects from '../pages/editor/ActiveProjects';
import EditorMessages from '../pages/editor/Messages';
import EditorEarnings from '../pages/editor/Earnings';
import EditorNotifications from '../pages/editor/Notifications';
import EditorProfile from '../pages/editor/Profile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing & Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/about" element={<About />} />

      {/* Unified Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<Signup />} />

      {/* Legacy / Direct Role Auth Routes */}
      <Route path="/auth/creator-login" element={<CreatorLogin />} />
      <Route path="/auth/creator-signup" element={<CreatorSignup />} />
      <Route path="/auth/editor-login" element={<EditorLogin />} />
      <Route path="/auth/editor-signup" element={<EditorSignup />} />

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
        <Route path="create-project" element={<CreatorProjects />} />
        <Route path="applications" element={<CreatorApplications />} />
        <Route path="messages" element={<CreatorMessages />} />
        <Route path="analytics" element={<CreatorAnalytics />} />
        <Route path="payments" element={<CreatorPayments />} />
        <Route path="notifications" element={<CreatorNotifications />} />
        <Route path="profile" element={<CreatorProfile />} />
        <Route path="settings" element={<CreatorProfile />} />
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
        <Route path="messages" element={<EditorMessages />} />
        <Route path="earnings" element={<EditorEarnings />} />
        <Route path="notifications" element={<EditorNotifications />} />
        <Route path="profile" element={<EditorProfile />} />
        <Route path="settings" element={<EditorProfile />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
