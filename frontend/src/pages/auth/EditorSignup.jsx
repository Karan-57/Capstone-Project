import React from 'react';
import AuthModal from './AuthModal';

export const EditorSignup = () => {
  return (
    <AuthModal
      isOpen={true}
      isFullPage={true}
      initialMode="signup"
      initialRole="editor"
    />
  );
};

export default EditorSignup;
