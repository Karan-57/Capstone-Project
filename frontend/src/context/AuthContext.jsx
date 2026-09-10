import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 'creator' or 'editor'
  const [role, setRole] = useState(() => {
    return localStorage.getItem('collabo_role') || 'creator';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem('collabo_auth');
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to true for initial frictionless explore, or false if previously logged out
    return true;
  });

  const [creatorUser, setCreatorUser] = useState({
    name: 'Jason Vance',
    role: 'creator',
    email: 'jason@studio.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    channel: 'Tech & Lifestyle',
    unreadNotifications: 3,
  });

  const [editorUser, setEditorUser] = useState({
    name: 'Alex Rivera',
    role: 'editor',
    email: 'alex@motioncraft.co',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Motion & Video Editor',
    unreadNotifications: 4,
  });

  const toggleRole = () => {
    setRole((prev) => {
      const nextRole = prev === 'creator' ? 'editor' : 'creator';
      localStorage.setItem('collabo_role', nextRole);
      return nextRole;
    });
  };

  const login = (selectedRole = 'creator', userData = null, token = null) => {
    setRole(selectedRole);
    localStorage.setItem('collabo_role', selectedRole);
    setIsAuthenticated(true);
    localStorage.setItem('collabo_auth', 'true');
    if (token) {
      localStorage.setItem('collabo_token', token);
    }
    if (userData) {
      if (selectedRole === 'creator') {
        setCreatorUser((prev) => ({ ...prev, ...userData }));
      } else {
        setEditorUser((prev) => ({ ...prev, ...userData }));
      }
      localStorage.setItem('collabo_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('collabo_auth', 'false');
    localStorage.removeItem('collabo_token');
    localStorage.removeItem('collabo_user');
  };

  const currentUser = role === 'creator' ? creatorUser : editorUser;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        setRole: (r) => {
          setRole(r);
          localStorage.setItem('collabo_role', r);
          setIsAuthenticated(true);
          localStorage.setItem('collabo_auth', 'true');
        },
        toggleRole,
        login,
        logout,
        currentUser,
        creatorUser,
        setCreatorUser,
        editorUser,
        setEditorUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
