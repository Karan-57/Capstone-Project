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
    <div className="space-y-6 w-full pb-16 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title={`${creatorUser?.name || 'Creator'} - Profile`}
        description={`Creator profile for ${creatorUser?.name || 'video creator'} on Collabo.`}
      />

      {/* Creator Profile Banner Card */}
      <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-[#FFEBAA] dark:bg-[#2D1C1B] border-b-2 border-[#382322] dark:border-[#FDEBDE]/20 z-0" />

        <div className="relative z-10 pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={creatorUser?.profileImage || creatorUser?.avatar || DEFAULT_PFP}
              alt={creatorUser?.name ? `${creatorUser.name} profile photo` : 'Creator profile photo'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#382322] dark:border-[#FFEBAA] shadow-[3px_3px_0_#382322] bg-[#FAF0E6]"
            />
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                  {creatorUser?.name || 'unknown'}
                </h2>
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-mono mt-0.5">
                @{creatorUser?.username || 'unknown'} • {creatorUser?.bio || 'Creator Studio'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Edit3}
            onClick={() => navigate('/creator/edit-profile')}
            className="self-end sm:self-auto"
          >
            Edit Profile
          </Button>
        </div>

        {/* Real Stats Grid from DB */}
        <div className="mt-7 pt-5 border-t-2 border-[#382322]/15 dark:border-[#FDEBDE]/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-xl font-black font-mono text-[#261615] dark:text-[#FDEBDE]">{totalProjects}</div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Total Projects</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">₹{totalSpent.toLocaleString('en-IN')}</div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Paid to Editors</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-300">{ratingVal === 0 ? '0 / 5.0' : `${ratingVal} / 5.0`}</div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Creator Rating</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
            <div className="text-xl font-black font-mono text-[#261615] dark:text-[#FFEBAA]">{reviewCount}</div>
            <div className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Real Account Details from User Schema */}
      <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 sm:p-7 space-y-4">
        <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Profile Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFEBAA] border border-[#382322] flex items-center justify-center text-[#261615] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold">Email Address</span>
              <span className="text-[#261615] dark:text-[#FDEBDE] font-bold font-mono">{creatorUser?.email || 'unknown'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B1C8EA] border border-[#382322] flex items-center justify-center text-[#261615] shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold">Username</span>
              <span className="text-[#261615] dark:text-[#FDEBDE] font-bold font-mono">@{creatorUser?.username || 'unknown'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFEBAA] border border-[#382322] flex items-center justify-center text-[#261615] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold">Location</span>
              <span className="text-[#261615] dark:text-[#FDEBDE] font-bold">{creatorUser?.location || 'unknown'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B1C8EA] border border-[#382322] flex items-center justify-center text-[#261615] shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold">Phone</span>
              <span className="text-[#261615] dark:text-[#FDEBDE] font-bold font-mono">{creatorUser?.phone || 'unknown'}</span>
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

