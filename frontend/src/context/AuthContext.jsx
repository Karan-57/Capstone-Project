import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { refreshAccessToken, setAccessToken } from '../services/api';
import { DEFAULT_PFP } from '../constants/assets';

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

  const resolveAvatar = (userObj) => {
    const img = userObj?.profileImage || userObj?.avatar;
    if (!img) return DEFAULT_PFP;
    if (img === 'https://ik.imagekit.io/karan57/default-pfp-png.webp' || img.includes('unsplash.com')) {
      return DEFAULT_PFP;
    }
    return img;
  };

  const [creatorUser, setCreatorUser] = useState(() => {
    const defaultCreator = {
      name: 'Jason Vance',
      role: 'creator',
      email: 'creator@collabo.io',
      channel: 'Tech & Lifestyle',
      avatar: DEFAULT_PFP,
    };
    const saved = localStorage.getItem('collabo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'creator') {
          return {
            ...defaultCreator,
            ...parsed,
            avatar: resolveAvatar(parsed),
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
      avatar: DEFAULT_PFP,
    };
    const saved = localStorage.getItem('collabo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'editor') {
          return {
            ...defaultEditor,
            ...parsed,
            avatar: resolveAvatar(parsed),
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
              avatar: resolveAvatar(data.user),
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
        avatar: resolveAvatar(userData),
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

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await api.patch('/api/users/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = res.data?.profileImage || res.data?.user?.profileImage;
      if (newUrl) {
        const updater = (prev) => ({
          ...prev,
          profileImage: newUrl,
          avatar: newUrl,
        });
        if (role === 'creator') {
          setCreatorUser(updater);
        } else {
          setEditorUser(updater);
        }
        const saved = localStorage.getItem('collabo_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            localStorage.setItem(
              'collabo_user',
              JSON.stringify({ ...parsed, profileImage: newUrl, avatar: newUrl })
            );
          } catch (e) {}
        }
        return newUrl;
      }
    } catch (err) {
      console.warn('[AuthContext] Upload profile image error:', err.message);
      const localUrl = URL.createObjectURL(file);
      const updater = (prev) => ({
        ...prev,
        profileImage: localUrl,
        avatar: localUrl,
      });
      if (role === 'creator') {
        setCreatorUser(updater);
      } else {
        setEditorUser(updater);
      }
      return localUrl;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const res = await api.patch('/api/users/me', updates);
      const updatedUser = res.data?.user;
      if (updatedUser) {
        const userWithAvatar = {
          ...updatedUser,
          avatar: resolveAvatar(updatedUser),
        };
        if (role === 'creator') {
          setCreatorUser((prev) => ({ ...prev, ...userWithAvatar }));
        } else {
          setEditorUser((prev) => ({ ...prev, ...userWithAvatar }));
        }
        localStorage.setItem('collabo_user', JSON.stringify(userWithAvatar));
        return userWithAvatar;
      }
    } catch (err) {
      console.warn('[AuthContext] Update user profile error:', err.message);
      throw err;
    }
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
        uploadProfilePicture,
        updateUserProfile,
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
