import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 'creator' or 'editor'
  const [role, setRole] = useState(() => {
    return localStorage.getItem('collabo_role') || 'creator';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('collabo_auth') === 'true';
  });

  // Loading state while verifying refresh token on page mount / tab reload
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [creatorUser, setCreatorUser] = useState(() => {
    const saved = localStorage.getItem('collabo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'creator') return parsed;
      } catch (e) {}
    }
    return {
      name: 'Jason Vance',
      role: 'creator',
      email: 'creator@collabo.io',
      channel: 'Tech & Lifestyle',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
  });

  const [editorUser, setEditorUser] = useState(() => {
    const saved = localStorage.getItem('collabo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'editor') return parsed;
      } catch (e) {}
    }
    return {
      name: 'Alex Rivera',
      role: 'editor',
      email: 'editor@collabo.io',
      title: 'Senior Motion & Video Editor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };
  });

  // Silent initial boot: When tab is refreshed, check for valid httpOnly refreshToken cookie
  useEffect(() => {
    let isMounted = true;

    async function silentRefreshOnMount() {
      try {
        const { data } = await api.get('/api/auth/refresh-token');
        if (data?.accessToken && isMounted) {
          setAccessToken(data.accessToken);
          setIsAuthenticated(true);
          localStorage.setItem('collabo_auth', 'true');
        }
      } catch (err) {
        // No valid refresh token cookie exists or revoked
        if (isMounted) {
          setAccessToken(null);
          setIsAuthenticated(false);
          localStorage.setItem('collabo_auth', 'false');
          localStorage.removeItem('collabo_user');
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    silentRefreshOnMount();

    return () => {
      isMounted = false;
    };
  }, []);

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
      setAccessToken(token);
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
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.setItem('collabo_auth', 'false');
    localStorage.removeItem('collabo_user');
  };

  const currentUser = role === 'creator' ? creatorUser : editorUser;


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
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
