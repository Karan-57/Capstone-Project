import React from 'react';
import AuthModal from './AuthModal';

export const CreatorSignup = () => {
  return (
    <AuthModal
      isOpen={true}
      isFullPage={true}
      initialMode="signup"
      initialRole="creator"
    />
  );
};

export default CreatorSignup;
