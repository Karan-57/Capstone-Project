import { CheckCircle2, Edit3 } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const Profile = () => {
  const { creatorUser } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Creator Profile Banner */}
      <div className="glass-card p-6 border border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-800/20"></div>

        <div className="relative pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={creatorUser.avatar}
              alt={creatorUser.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-[#0F1420] shadow-xl"
            />
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{creatorUser.name}</h2>
                <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tech & SaaS Storyteller • 450K Subscribers
              </p>
            </div>
          </div>

          <Button variant="subtle" size="sm" icon={Edit3} className="self-end sm:self-auto">
            Edit Profile
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">48</div>
            <div className="text-xs text-slate-400">Total Projects</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">₹6.8L</div>
            <div className="text-xs text-slate-400">Paid to Editors</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-400">4.8 / 5.0</div>
            <div className="text-xs text-slate-400">Creator Rating</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">100%</div>
            <div className="text-xs text-slate-400">Prompt Payment</div>
          </div>
        </div>
      </div>

      {/* Editing Style Guide & Brand Rules */}
      <div className="glass-card p-6 border border-white/[0.06] space-y-4">
        <h3 className="text-base font-semibold text-white">Channel Editing Guidelines & Preferences</h3>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#141A28]/60 border border-white/[0.04]">
            <strong className="text-white block mb-1">Pacing & Hooks</strong>
            Hook the audience in the first 4 seconds with high-tempo visual cuts and kinetic typography. No fluff intro.
          </div>
          <div className="p-3.5 rounded-xl bg-[#141A28]/60 border border-white/[0.04]">
            <strong className="text-white block mb-1">Audio & Music</strong>
            Clean speech ducking with -14 LUFS standard. Lofi & deep house background music from Epidemic Sound library.
          </div>
          <div className="p-3.5 rounded-xl bg-[#141A28]/60 border border-white/[0.04]">
            <strong className="text-white block mb-1">Color Grade</strong>
            Subtle modern film tone (Kodak 2383 emulation LUT), clean skin tones.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
