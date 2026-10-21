import React from 'react';
import AuthModal from './AuthModal';

export const EditorLogin = () => {
  return (
    <AuthModal
      isOpen={true}
      isFullPage={true}
      initialMode="login"
      initialRole="editor"
    />
  );
};

export default EditorLogin;
