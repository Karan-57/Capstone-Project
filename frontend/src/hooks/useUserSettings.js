import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export const useUserSettings = () => {
  const { currentUser, setCreatorUser, setEditorUser, role } = useAuth();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    phoneVisibility: 'hired',
    emailNotifications: true,
    projectAlerts: true,
    soundAlerts: true,
    theme: 'dark',
  });
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber || currentUser?.phone || ''
  );

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getSettings();
      if (data?.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      if (data?.phoneNumber !== undefined) {
        setPhoneNumber(data.phoneNumber);
      }
    } catch (err) {
      console.warn('[useUserSettings] Could not load settings:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettingsPartial) => {
    try {
      setSaving(true);
      const merged = { ...settings, ...newSettingsPartial };
      const res = await userService.updateSettings(merged);
      if (res?.settings) {
        setSettings(res.settings);
      }
      // Update local storage and auth context if user object returned
      if (res?.user) {
        const updater = (prev) => ({ ...prev, ...res.user });
        if (role === 'creator') {
          setCreatorUser(updater);
        } else {
          setEditorUser(updater);
        }
      }
      showAlert('Settings updated successfully!', 'success');
      return true;
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update settings', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePhoneVisibility = async (visibility) => {
    return saveSettings({ phoneVisibility: visibility });
  };

  return {
    loading,
    saving,
    settings,
    setSettings,
    phoneNumber,
    setPhoneNumber,
    fetchSettings,
    saveSettings,
    updatePhoneVisibility,
  };
};

export default useUserSettings;
