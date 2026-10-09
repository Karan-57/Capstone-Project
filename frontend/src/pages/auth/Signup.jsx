import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';

export const Signup = ({ initialRole }) => {
  const { isAuthenticated, role: userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const paramRole = searchParams.get('role');
  const role = initialRole || (paramRole === 'editor' || paramRole === 'creator' ? paramRole : userRole || 'creator');

  if (isAuthenticated) {
    return <Navigate to={userRole === 'editor' ? '/editor/dashboard' : '/creator/dashboard'} replace />;
  }

  return (
    <AuthModal
      key={`signup-${role}`}
      isOpen={true}
      isFullPage={true}
      initialMode="signup"
      initialRole={role}
    />
  );
};

export default Signup;
