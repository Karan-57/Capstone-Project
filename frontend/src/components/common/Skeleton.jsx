import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03] bg-[length:200%_100%] ${rounded} ${className}`}
      {...props}
    />
  );
};

export const SkeletonText = ({ lines = 2, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`glass-card p-5 border border-white/[0.06] space-y-4 rounded-2xl ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-4.5" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  );
};

export const SkeletonProjectCard = () => {
  return (
    <div className="p-4 rounded-2xl bg-[#0F1422]/60 border border-white/[0.06] space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 w-3/4">
          <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-4/5 h-4" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-2 rounded-full" />
      </div>
    </div>
  );
};

export const SkeletonRow = ({ count = 3 }) => {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl bg-[#101524]/60 border border-white/[0.04] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="w-1/3 h-3.5" />
              <Skeleton className="w-1/4 h-2.5" />
            </div>
          </div>
          <Skeleton className="w-20 h-6 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonProfile = () => {
  return (
    <div className="glass-card p-6 border border-white/[0.06] space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
        <div className="space-y-2.5 flex-1">
          <Skeleton className="w-1/3 h-6" />
          <Skeleton className="w-1/2 h-3.5" />
          <Skeleton className="w-1/4 h-3" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.05]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.02] space-y-2">
            <Skeleton className="w-12 h-5 mx-auto" />
            <Skeleton className="w-20 h-3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
