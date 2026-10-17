import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  Bell,
  Volume2,
  Lock,
  Smartphone,
  Save,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Mail,
  Moon,
  ExternalLink,
  KeyRound,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useAlert } from '../../context/AlertContext';

export const Settings = ({ role: propRole }) => {
  const navigate = useNavigate();
  const { role: authRole, currentUser } = useAuth();
  const role = propRole || authRole || 'creator';
  const { showAlert } = useAlert();

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
    <div className="max-w-4xl mx-auto space-y-7 pb-16 animate-fade-in">
      <SEO
        title="Settings"
        description="Manage application preferences, communication privacy, and notification alerts."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/30">
              Preferences
            </span>
            <span className="text-xs text-slate-500 font-mono capitalize">
              • {role} Workspace
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Application Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure contact privacy, communication alerts, and security options.
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
        <section className="glass-card p-6 border border-white/[0.08] rounded-2xl space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Phone Number Visibility</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control who is allowed to view your phone number on Collabo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(role === 'creator' ? '/creator/edit-profile' : '/editor/edit-profile')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Edit Number</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Phone Status Banner */}
          <div className="p-3.5 rounded-xl bg-[#141A28] border border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400">Current Registered Number:</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {phoneNumber || currentUser?.phoneNumber || currentUser?.phone || 'Not provided'}
              </span>
            </div>
            {!phoneNumber && !(currentUser?.phoneNumber || currentUser?.phone) && (
              <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
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
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/40'
                      : 'bg-[#101524]/60 border-white/[0.06] hover:border-purple-500/30 hover:bg-[#121829]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{opt.title}</span>
                      {opt.recommended && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-600'
                          : 'border-white/20 bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isSelected ? 'Active Selection' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 2: NOTIFICATIONS & COMMUNICATION PREFERENCES ── */}
        <section className="glass-card p-6 border border-white/[0.08] rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage email digests, workspace push alerts, and audio cues.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/[0.06] pt-1">
            {/* Email Notifications */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white">Email Milestone Alerts</p>
                <p className="text-[11px] text-slate-400">
                  Receive email alerts when milestones are approved, deliverables submitted, or escrow released.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('emailNotifications')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  currentSettings.emailNotifications ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    currentSettings.emailNotifications ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Project / Workspace Alerts */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white">Project Activity Updates</p>
                <p className="text-[11px] text-slate-400">
                  Notify on new file uploads to Space, cut submissions, and review notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('projectAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  currentSettings.projectAlerts ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    currentSettings.projectAlerts ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Sound Alerts */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white">Sound Effects & Chimes</p>
                <p className="text-[11px] text-slate-400">
                  Play gentle chime on incoming chat messages and notification arrivals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('soundAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  currentSettings.soundAlerts ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    currentSettings.soundAlerts ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: SECURITY & ACCOUNT AUTHENTICATION ── */}
        <section className="glass-card p-6 border border-white/[0.08] rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Security & Authentication</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage escrow transaction protection and account credentials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 rounded-xl bg-[#141A28] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Registered Email</span>
                <span className="text-xs font-mono font-semibold text-white">
                  {currentUser?.email || 'user@collabo.com'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                Verified
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141A28] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Transaction Escrow PIN</span>
                <span className="text-xs font-semibold text-white">
                  {currentUser?.hasTransactionPin ? 'Active & Protected' : 'Default Sandbox PIN'}
                </span>
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 font-semibold">
                6-Digit PIN
              </span>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: APPEARANCE ── */}
        <section className="glass-card p-6 border border-white/[0.08] rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Theme & Studio Display</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current interface theme and UI rendering preference.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141A28] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-white">Studio Dark High-Contrast</p>
                <p className="text-[11px] text-slate-400">Optimized for color grading and video timeline workflows.</p>
              </div>
            </div>
            <span className="text-[11px] text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-semibold">
              Default
            </span>
          </div>
        </section>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
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
