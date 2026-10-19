import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UploadCloud, CreditCard, ArrowUpRight } from 'lucide-react';
import { Magnetic } from '../core/magnetic';

export const QuickActions = ({ onUploadAssets }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Hire Talent',
      desc: 'Browse verified editors & review candidates',
      badge: 'TALENT',
      icon: UserPlus,
      action: () => navigate('/creator/applications'),
      bg: 'bg-[#B1C8EA]/70 hover:bg-[#B1C8EA]',
      iconBg: 'bg-[#382322] text-[#B1C8EA]',
    },
    {
      title: 'Upload Assets',
      desc: 'Sync B-Roll & raw 4K project footage',
      badge: 'MEDIA',
      icon: UploadCloud,
      action: () => onUploadAssets ? onUploadAssets() : navigate('/workspace'),
      bg: 'bg-[#FFEBAA]/80 hover:bg-[#FFEBAA]',
      iconBg: 'bg-[#382322] text-[#FFEBAA]',
    },
    {
      title: 'Release Payment',
      desc: 'Approve delivered milestones & instant payout',
      badge: 'ESCROW',
      icon: CreditCard,
      action: () => navigate('/creator/payments'),
      bg: 'bg-white/90 hover:bg-[#FDEBDE]',
      iconBg: 'bg-[#382322] text-[#FDEBDE]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-2">
      {actions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Magnetic key={idx} intensity={0.15}>
            <button
              onClick={item.action}
              className={`w-full p-4.5 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] hover:shadow-[4px_4px_0_#382322] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] text-left transition-all duration-200 group relative overflow-hidden cursor-pointer ${item.bg}`}
            >
              {/* Top Row: Icon + Editorial Tag */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] group-hover:scale-105 transition-transform ${item.iconBg}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-md bg-[#382322] text-[#FFEBAA] border border-[#382322]">
                    {item.badge}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#382322] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="text-sm font-bold text-[#382322] tracking-tight group-hover:underline decoration-2 underline-offset-2">
                {item.title}
              </h4>
              <p className="text-xs text-[#382322]/75 mt-0.5 line-clamp-1 font-sans">
                {item.desc}
              </p>
            </button>
          </Magnetic>
        );
      })}
    </div>
  );
};

export default QuickActions;

