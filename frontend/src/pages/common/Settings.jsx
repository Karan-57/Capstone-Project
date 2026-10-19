import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Bell,
  Smartphone,
  Save,
  ArrowRight,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';

export const Settings = ({ role: propRole }) => {
  const navigate = useNavigate();
  const { role: authRole, currentUser } = useAuth();
  const role = propRole || authRole || 'creator';
  const { showAlert } = useAlert();
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  const {
    loading,
    saving,
    settings,
    phoneNumber,
    saveSettings,
  } = useUserSettings();

  const [localSettings, setLocalSettings] = useState(null);

  // Sync initial local settings once loaded
  const currentSettings = localSettings || settings;

  const handleToggle = (key) => {
    setLocalSettings((prev) => ({
      ...(prev || settings),
      [key]: !((prev || settings)[key]),
    }));
  };

  const handlePhoneVisibilityChange = (visibility) => {
    setLocalSettings((prev) => ({
      ...(prev || settings),
      phoneVisibility: visibility,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const success = await saveSettings(currentSettings);
    if (success) {
      setLocalSettings(null);
    }
  };

  const phoneVisibilityOptions = [
    {
      id: 'hired',
      title: role === 'creator' ? 'Hired Freelancers Only' : 'Contracted Creators Only',
      desc: role === 'creator'
        ? 'Only freelancers you have actively hired for a project can see your phone number.'
        : 'Only creators you are actively working with or hired by can see your phone number.',
      recommended: true,
    },
    {
      id: 'public',
      title: 'Public to Everyone',
      desc: 'Anyone viewing your public profile can see your phone number.',
      recommended: false,
    },
    {
      id: 'private',
      title: 'Private (Hidden)',
      desc: 'Completely hidden from everyone. Only visible to you in your account settings.',
      recommended: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-16 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title="Settings"
        description="Manage application preferences, communication privacy, and notification alerts."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#261615] bg-[#FFEBAA] px-2.5 py-0.5 rounded-md border-2 border-[#382322] shadow-[2px_2px_0_#382322]">
              Studio Preferences
            </span>
            <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-mono capitalize">
              • {role} Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
            Application Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
            Configure contact privacy, communication alerts, security credentials, and studio theme.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || loading}
          variant="primary"
          icon={Save}
          className="self-start sm:self-auto cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── SECTION 1: PHONE NUMBER & CONTACT PRIVACY ── */}
        <section className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Phone Number Visibility</h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                  Control who is allowed to view your direct phone number on Collabo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(role === 'creator' ? '/creator/edit-profile' : '/editor/edit-profile')}
              className="text-xs font-mono font-bold text-[#261615] dark:text-[#FFEBAA] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Phone Status Banner */}
          <div className="p-3.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8]">Current Registered Number:</span>
              <span className="text-xs font-mono font-black text-[#261615] dark:text-[#FDEBDE]">
                {phoneNumber || currentUser?.phoneNumber || currentUser?.phone || 'Not provided'}
              </span>
            </div>
            {!phoneNumber && !(currentUser?.phoneNumber || currentUser?.phone) && (
              <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-600/30">
                Add in Edit Profile
              </span>
            )}
          </div>

          {/* Visibility Options Radio Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {phoneVisibilityOptions.map((opt) => {
              const isSelected = currentSettings.phoneVisibility === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handlePhoneVisibilityChange(opt.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FFEBAA] dark:bg-[#2D1C1B] border-[#382322] dark:border-[#FFEBAA] shadow-[3px_3px_0_#382322]'
                      : 'bg-white dark:bg-[#1A1110] border-[#382322]/20 dark:border-[#FDEBDE]/20 hover:border-[#382322] shadow-[2px_2px_0_#382322]/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black font-serif text-[#261615] dark:text-[#FDEBDE]">{opt.title}</span>
                      {opt.recommended && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#261615] bg-[#B1C8EA] px-1.5 py-0.5 rounded border border-[#382322]">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] leading-relaxed">{opt.desc}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#382322] bg-[#382322] dark:border-[#FFEBAA] dark:bg-[#FFEBAA]'
                          : 'border-[#382322]/40 bg-transparent'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFEBAA] dark:bg-[#261615]" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8]">
                      {isSelected ? 'Active Selection' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 2: NOTIFICATIONS & COMMUNICATION PREFERENCES ── */}
        <section className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B1C8EA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Notifications & Alerts</h3>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                Manage email digests, workspace milestone push alerts, and audio cues.
              </p>
            </div>
          </div>

          <div className="divide-y-2 divide-[#382322]/10 dark:divide-[#FDEBDE]/10 pt-1">
            {/* Email Notifications */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE]">Email Milestone Alerts</p>
                <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">
                  Receive email alerts when milestones are approved, deliverables submitted, or escrow released.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('emailNotifications')}
                className={`w-12 h-6.5 rounded-full border-2 border-[#382322] transition-colors relative cursor-pointer ${
                  currentSettings.emailNotifications
                    ? 'bg-[#FFEBAA] shadow-[2px_2px_0_#382322]'
                    : 'bg-[#FAF0E6] dark:bg-[#19100F]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border border-[#382322] absolute top-0.5 transition-transform ${
                    currentSettings.emailNotifications
                      ? 'left-6 bg-[#382322] dark:bg-[#382322]'
                      : 'left-1 bg-[#5C3A38] dark:bg-[#D4B8A8]'
                  }`}
                />
              </button>
            </div>

            {/* Project / Workspace Alerts */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE]">Project Activity Updates</p>
                <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">
                  Notify on new file uploads to Space, cut submissions, and review notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('projectAlerts')}
                className={`w-12 h-6.5 rounded-full border-2 border-[#382322] transition-colors relative cursor-pointer ${
                  currentSettings.projectAlerts
                    ? 'bg-[#FFEBAA] shadow-[2px_2px_0_#382322]'
                    : 'bg-[#FAF0E6] dark:bg-[#19100F]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border border-[#382322] absolute top-0.5 transition-transform ${
                    currentSettings.projectAlerts
                      ? 'left-6 bg-[#382322] dark:bg-[#382322]'
                      : 'left-1 bg-[#5C3A38] dark:bg-[#D4B8A8]'
                  }`}
                />
              </button>
            </div>

            {/* Sound Alerts */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE]">Sound Effects & Chimes</p>
                <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">
                  Play gentle chime on incoming chat messages and notification arrivals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('soundAlerts')}
                className={`w-12 h-6.5 rounded-full border-2 border-[#382322] transition-colors relative cursor-pointer ${
                  currentSettings.soundAlerts
                    ? 'bg-[#FFEBAA] shadow-[2px_2px_0_#382322]'
                    : 'bg-[#FAF0E6] dark:bg-[#19100F]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border border-[#382322] absolute top-0.5 transition-transform ${
                    currentSettings.soundAlerts
                      ? 'left-6 bg-[#382322] dark:bg-[#382322]'
                      : 'left-1 bg-[#5C3A38] dark:bg-[#D4B8A8]'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: SECURITY & ACCOUNT AUTHENTICATION ── */}
        <section className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-700/40 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shadow-[2px_2px_0_#382322] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Security & Authentication</h3>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                Manage escrow transaction protection and account security credentials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] block">Registered Email</span>
                <span className="text-xs font-mono font-black text-[#261615] dark:text-[#FDEBDE]">
                  {currentUser?.email || 'user@collabo.com'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-600/30">
                Verified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] block">Transaction Escrow PIN</span>
                <span className="text-xs font-mono font-black text-[#261615] dark:text-[#FDEBDE]">
                  {currentUser?.hasTransactionPin ? 'Active & Protected' : 'Default Sandbox PIN'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#261615] bg-[#FFEBAA] px-2 py-0.5 rounded-md border border-[#382322]">
                6-Digit PIN
              </span>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: APPEARANCE & THEME SWITCHER ── */}
        <section className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Theme & Studio Display</h3>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                Switch between Warm Neutral Editorial canvas and Darkroom Studio midnight espresso.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Light Mode Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                theme === 'light'
                  ? 'bg-[#FFEBAA] border-[#382322] text-[#261615] shadow-[3px_3px_0_#382322]'
                  : 'bg-[#FAF0E6] dark:bg-[#19100F] border-[#382322]/20 dark:border-[#FDEBDE]/20 hover:border-[#382322]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-400 border border-[#382322] flex items-center justify-center text-[#261615]">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black font-serif text-[#261615]">Warm Editorial Paper</p>
                  <p className="text-[11px] text-[#5C3A38]">Creamy beige canvas with chocolate typography</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  theme === 'light' ? 'border-[#382322] bg-[#382322]' : 'border-[#382322]/40'
                }`}
              >
                {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-[#FFEBAA]" />}
              </div>
            </div>

            {/* Dark Mode Card */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#2D1C1B] border-[#FFEBAA] text-[#FDEBDE] shadow-[3px_3px_0_#000]'
                  : 'bg-[#FAF0E6] dark:bg-[#19100F] border-[#382322]/20 dark:border-[#FDEBDE]/20 hover:border-[#382322]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#19100F] border border-[#FFEBAA]/40 flex items-center justify-center text-[#FFEBAA]">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Darkroom Studio</p>
                  <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">Midnight espresso with butter accents</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  theme === 'dark' ? 'border-[#FFEBAA] bg-[#FFEBAA]' : 'border-[#382322]/40'
                }`}
              >
                {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-[#261615]" />}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8]">
            Settings persist automatically to your backend profile.
          </span>
          <Button
            type="submit"
            disabled={saving || loading}
            variant="primary"
            icon={Save}
            className="px-6 py-2.5 cursor-pointer"
          >
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

