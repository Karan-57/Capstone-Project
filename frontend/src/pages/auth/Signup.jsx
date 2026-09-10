import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthModal from './AuthModal';

export const Signup = ({ initialRole }) => {
  const [searchParams] = useSearchParams();
  const paramRole = searchParams.get('role');
  const role = initialRole || (paramRole === 'editor' || paramRole === 'creator' ? paramRole : 'creator');

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
