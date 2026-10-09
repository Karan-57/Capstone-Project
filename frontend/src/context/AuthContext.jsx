import React, { createContext, useContext, useState, useEffect } from 'react';
import { refreshAccessToken, setAccessToken } from '../services/api';

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
  const [isAuthLoading, setIsAuthLoading] = useState(() => {
    return localStorage.getItem('collabo_auth') === 'true';
  });

  const [creatorUser, setCreatorUser] = useState(() => {
    const defaultCreator = {
      name: 'Jason Vance',
      role: 'creator',
      email: 'creator@collabo.io',
      channel: 'Tech & Lifestyle',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    const saved = localStorage.getItem('collabo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'creator') {
          return {
            ...defaultCreator,
            ...parsed,
            avatar: parsed.profileImage || parsed.avatar || defaultCreator.avatar,
          };
        }
      } catch (e) {}
    }
    return defaultCreator;
  });

  const [editorUser, setEditorUser] = useState(() => {
    const defaultEditor = {
      name: 'Alex Rivera',
      role: 'editor',
      email: 'editor@collabo.io',
      title: 'Senior Motion & Video Editor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };
    const saved = localStorage.getItem('collabo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'editor') {
          return {
            ...defaultEditor,
            ...parsed,
            avatar: parsed.profileImage || parsed.avatar || defaultEditor.avatar,
          };
        }
      } catch (e) {}
    }
    return defaultEditor;
  });

  // Silent refresh on mount / tab reload
  useEffect(() => {
    let isMounted = true;

    async function silentRefreshOnMount() {
      const hasAuth = localStorage.getItem('collabo_auth') === 'true';

      // If user is completely unauthenticated, nothing to refresh
      if (!hasAuth) {
        if (isMounted) setIsAuthLoading(false);
        return;
      }

      try {
        const data = await refreshAccessToken();
        if (data?.accessToken && isMounted) {
          setIsAuthenticated(true);
          localStorage.setItem('collabo_auth', 'true');

          if (data.user) {
            const userWithAvatar = {
              ...data.user,
              avatar: data.user.profileImage || data.user.avatar,
            };
            if (data.user.role) {
              setRole(data.user.role);
              localStorage.setItem('collabo_role', data.user.role);
            }
            if (data.user.role === 'creator') {
              setCreatorUser((prev) => ({ ...prev, ...userWithAvatar }));
            } else {
              setEditorUser((prev) => ({ ...prev, ...userWithAvatar }));
            }
            localStorage.setItem('collabo_user', JSON.stringify(userWithAvatar));
          }
        }
      } catch (err) {
        if (isMounted) {
          // If refresh token was rejected (401 / 403), session is dead
          if (err.response?.status === 401 || err.response?.status === 403) {
            setAccessToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('collabo_auth');
            localStorage.removeItem('collabo_user');
          }
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
      const userPayload = {
        ...userData,
        avatar: userData.profileImage || userData.avatar,
      };
      if (selectedRole === 'creator') {
        setCreatorUser((prev) => ({ ...prev, ...userPayload }));
      } else {
        setEditorUser((prev) => ({ ...prev, ...userPayload }));
      }
      localStorage.setItem('collabo_user', JSON.stringify(userPayload));
    }
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('collabo_auth');
    localStorage.removeItem('collabo_user');
    localStorage.removeItem('collabo_role');
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
