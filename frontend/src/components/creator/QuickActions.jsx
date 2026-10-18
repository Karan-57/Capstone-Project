import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, UploadCloud, CreditCard, Sparkles } from 'lucide-react';

export const QuickActions = ({ onUploadAssets }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Hire',
      desc: 'Browse talent & review candidates',
      icon: UserPlus,
      action: () => navigate('/creator/applications'),
      badge: 'Talent',
    },
    {
      title: 'Upload Assets',
      desc: 'Sync B-Roll & raw 4K footage',
      icon: UploadCloud,
      action: () => onUploadAssets ? onUploadAssets() : navigate('/workspace'),
      badge: 'Media',
    },
    {
      title: 'Release Payment',
      desc: 'Approve milestones & payout',
      icon: CreditCard,
      action: () => navigate('/creator/payments'),
      badge: 'Escrow',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-2">
      {actions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            onClick={item.action}
            className="p-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#E5E0D7] hover:border-[#DDD9CE] hover:-translate-y-0.5 shadow-[0_1px_3px_rgba(60,36,21,0.03)] hover:shadow-[0_4px_12px_rgba(60,36,21,0.06)] text-left transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#F0EDE5] text-[#3C2415] flex items-center justify-center border border-[#DDD9CE] group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#77736D] bg-[#F0EDE5] px-2 py-0.5 rounded-full border border-[#DDD9CE]">
                {item.badge}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#3C2415] transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-[#77736D] mt-0.5 line-clamp-1">
              {item.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
