import React from 'react';
import { Star, CheckCircle2, Film, Edit3, ExternalLink } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const Profile = () => {
  const { editorUser } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Card */}
      <div className="glass-card p-6 border border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-purple-800/20"></div>

        <div className="relative pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={editorUser.avatar}
              alt={editorUser.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-[#0F1420] shadow-xl"
            />
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{editorUser.name}</h2>
                <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  TOP RATED PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Senior Video Editor & Motion Designer • 6+ Years Experience
              </p>
            </div>
          </div>

          <Button variant="subtle" size="sm" icon={Edit3} className="self-end sm:self-auto">
            Edit Showreel
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">4.9 / 5.0</div>
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>(64 reviews)</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">₹3.48L</div>
            <div className="text-xs text-slate-400 mt-0.5">Total Earned</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">98%</div>
            <div className="text-xs text-slate-400 mt-0.5">On-Time Delivery</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">24</div>
            <div className="text-xs text-slate-400 mt-0.5">Jobs Completed</div>
          </div>
        </div>
      </div>

      {/* Software Proficiencies */}
      <div className="glass-card p-6 border border-white/[0.06] space-y-4">
        <h3 className="text-base font-semibold text-white">Software & Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {['Adobe Premiere Pro 2026', 'After Effects', 'DaVinci Resolve Studio', 'Blender 3D', 'Sound Design & iZotope', 'Color Grading (ACES / Rec.709)', 'Subtitles & Dynamic Hooks'].map(tool => (
            <span
              key={tool}
              className="px-3 py-1.5 rounded-xl bg-purple-950/40 text-purple-200 border border-purple-800/30 text-xs font-medium"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Showreel Embed */}
      <div className="glass-card p-6 border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">2026 Editing Showreel</h3>
          <a
            href="https://vimeo.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-400 hover:underline flex items-center gap-1"
          >
            Watch on Vimeo <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="aspect-video w-full rounded-xl bg-slate-900/90 border border-white/[0.06] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-purple-500/40 transition-colors">
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform mb-3">
            <Film className="w-6 h-6 ml-0.5" />
          </div>
          <h4 className="text-sm font-semibold text-white">Alex Rivera — Commercial & YouTube Reel (4K)</h4>
          <p className="text-xs text-slate-400 mt-1">Runtime: 1m 45s • High Retention Fast Cuts</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
