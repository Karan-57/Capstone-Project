import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, UploadCloud, CreditCard } from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create Project',
      desc: 'Post new gig with budget & brief',
      icon: PlusCircle,
      action: () => navigate('/creator/create-project'),
      color: 'from-purple-600/20 to-indigo-600/20 text-purple-300 border-purple-500/30 hover:border-purple-400',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Invite Editor',
      desc: 'Browse verified video creators',
      icon: UserPlus,
      action: () => navigate('/creator/applications'),
      color: 'from-blue-600/20 to-cyan-600/20 text-blue-300 border-blue-500/30 hover:border-blue-400',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Upload Assets',
      desc: 'Sync B-Roll & raw 4K footage',
      icon: UploadCloud,
      action: () => alert('Opening Collabo Cloud Vault file uploader...'),
      color: 'from-emerald-600/20 to-teal-600/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-400',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Release Payment',
      desc: 'Approve milestones & payout',
      icon: CreditCard,
      action: () => navigate('/creator/payments'),
      color: 'from-amber-600/20 to-orange-600/20 text-amber-300 border-amber-500/30 hover:border-amber-400',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-2">
      {actions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            onClick={item.action}
            className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border text-left transition-all duration-200 hover:-translate-y-0.5 group`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${item.iconColor} group-hover:scale-110 transition-transform`} />
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Quick</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {item.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
