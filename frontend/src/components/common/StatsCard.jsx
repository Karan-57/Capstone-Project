import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({
  icon: Icon,
  iconBg = 'bg-blue-500/20 text-blue-400',
  title,
  value,
  trend,
  isPositive = true,
  subtitle = 'this month'
}) => {
  return (
    <div className="glass-card p-5 sm:p-6 flex items-center gap-4 hover:border-purple-500/30 transition-all duration-200 group">
      {/* Icon Badge */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} group-hover:scale-105 transition-transform duration-200`}>
        {Icon && (React.isValidElement(Icon) ? (
          Icon
        ) : typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null) ? (
          <Icon className="w-6 h-6" />
        ) : (
          <span className="text-xl font-bold">{Icon}</span>
        ))}
      </div>

      {/* Metric & Label */}
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-white tracking-tight leading-tight">
          {value}
        </div>
        <div className="text-xs font-medium text-slate-400 mt-0.5 truncate">
          {title}
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-400">
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{trend}</span>
            <span className="text-slate-500 font-normal">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
