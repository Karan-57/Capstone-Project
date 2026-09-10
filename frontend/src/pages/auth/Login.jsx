import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthModal from './AuthModal';

export const Login = ({ initialRole }) => {
  const [searchParams] = useSearchParams();
  const paramRole = searchParams.get('role');
  const role = initialRole || (paramRole === 'editor' || paramRole === 'creator' ? paramRole : 'creator');

  return (
    <AuthModal
      key={`login-${role}`}
      isOpen={true}
      isFullPage={true}
      initialMode="login"
      initialRole={role}
    />
  );
};

export default Login;
