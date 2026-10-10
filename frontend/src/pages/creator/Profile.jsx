import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Star, Edit3, Mail, MapPin, Phone, User, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Footer from '../../components/common/Footer';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { DEFAULT_PFP } from '../../constants/assets';

export const Profile = () => {
  const navigate = useNavigate();
  const { creatorUser } = useAuth();
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    projectService.getCreatorProjects().then((projs) => {
      setTotalProjects(projs.length);
      const spent = projs.reduce((sum, p) => {
        const val = typeof p.budget === 'number' ? p.budget : parseInt(String(p.budget).replace(/[^0-9]/g, ''), 10) || 0;
        return (p.rawStatus === 'completed' || p.rawStatus === 'assigned' || p.rawStatus === 'in_progress') ? sum + val : sum;
      }, 0);
      setTotalSpent(spent);
    }).catch(() => {
      setTotalProjects(0);
      setTotalSpent(0);
    });
  }, []);

  const ratingVal = creatorUser?.rating != null ? creatorUser.rating : 0;
  const reviewCount = creatorUser?.totalReviews != null ? creatorUser.totalReviews : 0;

  return (
    <div className="space-y-6 max-w-4xl pb-8 animate-fade-in">
      <SEO
        title={`${creatorUser?.name || 'Creator'} - Profile`}
        description={`Creator profile for ${creatorUser?.name || 'video creator'} on Collabo.`}
      />

      {/* Creator Profile Banner */}
      <div className="glass-card p-6 border border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-800/20"></div>

        <div className="relative pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={creatorUser?.profileImage || creatorUser?.avatar || DEFAULT_PFP}
              alt={creatorUser?.name ? `${creatorUser.name} profile photo` : 'Creator profile photo'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-[#0F1420] shadow-xl"
            />
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{creatorUser?.name || 'unknown'}</h2>
                <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                @{creatorUser?.username || 'unknown'} • {creatorUser?.bio || 'unknown'}
              </p>
            </div>
          </div>

          <Button
            variant="subtle"
            size="sm"
            icon={Edit3}
            onClick={() => navigate('/creator/edit-profile')}
            className="self-end sm:self-auto"
          >
            Edit Profile
          </Button>
        </div>

        {/* Real Stats Grid from DB */}
        <div className="mt-6 pt-5 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">{totalProjects}</div>
            <div className="text-xs text-slate-400">Total Projects</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">₹{totalSpent.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Paid to Editors</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-400">{ratingVal === 0 ? '0 / 5.0' : `${ratingVal} / 5.0`}</div>
            <div className="text-xs text-slate-400">Creator Rating</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{reviewCount}</div>
            <div className="text-xs text-slate-400">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Real Account Details from User Schema */}
      <div className="glass-card p-6 border border-white/[0.06] space-y-4">
        <h3 className="text-base font-semibold text-white">Profile Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex items-center gap-3">
            <Mail className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Email Address</span>
              <span className="text-white font-semibold">{creatorUser?.email || 'unknown'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex items-center gap-3">
            <User className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Username</span>
              <span className="text-white font-semibold">@{creatorUser?.username || 'unknown'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex items-center gap-3">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Location</span>
              <span className="text-white font-semibold">{creatorUser?.location || 'unknown'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex items-center gap-3">
            <Phone className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Phone</span>
              <span className="text-white font-semibold">{creatorUser?.phone || 'unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      <Footer />
    </div>
  );
};

export default Profile;
