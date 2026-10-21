import React from 'react';
import AuthModal from './AuthModal';

export const CreatorLogin = () => {
  return (
    <AuthModal
      isOpen={true}
      isFullPage={true}
      initialMode="login"
      initialRole="creator"
    />
  );
};

export default CreatorLogin;
