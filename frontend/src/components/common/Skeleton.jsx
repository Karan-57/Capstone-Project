import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#382322]/5 via-[#382322]/15 to-[#382322]/5 bg-[length:200%_100%] ${rounded} ${className}`}
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
    <div className={`p-5 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-4.5" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <div className="pt-3 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  );
};

export const SkeletonProjectCard = () => {
  return (
    <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 space-y-3.5">
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
      <div className="pt-3 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-2 rounded-full" />
      </div>
    </div>
  );
};

export const SkeletonRow = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl bg-white/70 dark:bg-[#201413]/70 border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 flex items-center justify-between gap-4"
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
    <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
        <div className="space-y-2.5 flex-1">
          <Skeleton className="w-1/3 h-6" />
          <Skeleton className="w-1/2 h-3.5" />
          <Skeleton className="w-1/4 h-3" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] space-y-2">
            <Skeleton className="w-12 h-5 mx-auto" />
            <Skeleton className="w-20 h-3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   SIDEBAR SKELETON
   Matches Sidebar.jsx dimensions, icons, and layout
───────────────────────────────────────────────────── */
export const SidebarSkeleton = ({ className = '' }) => {
  return (
    <aside
      className={`h-screen w-64 bg-[#FFF7F1] dark:bg-[#1A1110] border-r-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex flex-col justify-between p-3 shrink-0 select-none ${className}`}
    >
      <div>
        {/* Brand header placeholder */}
        <div className="flex items-center justify-between pb-4 pt-1 px-1">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-24 h-5 rounded-lg" />
          </div>
          <Skeleton className="w-6 h-6 rounded-lg" />
        </div>

        {/* Nav items list placeholder */}
        <div className="space-y-1.5 mt-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-[#382322]/10 dark:border-white/[0.03]"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-4 h-4 rounded-md shrink-0" />
                <Skeleton className={`h-3 rounded-md ${i % 3 === 0 ? 'w-24' : i % 2 === 0 ? 'w-28' : 'w-20'}`} />
              </div>
              {i === 3 && <Skeleton className="w-5 h-4 rounded-md" />}
            </div>
          ))}
        </div>
      </div>

      {/* Footer logout placeholder */}
      <div className="pt-3 border-t border-[#382322]/10 dark:border-white/[0.05]">
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/40 dark:bg-white/[0.01]">
          <Skeleton className="w-4 h-4 rounded-md shrink-0" />
          <Skeleton className="w-16 h-3 rounded-md" />
        </div>
      </div>
    </aside>
  );
};

/* ─────────────────────────────────────────────────────
   HEADER SKELETON
   Matches Header.jsx top bar
───────────────────────────────────────────────────── */
export const HeaderSkeleton = () => {
  return (
    <header className="flex flex-row items-center justify-between gap-4 py-4 md:py-6 px-4 md:px-8 bg-[#FFF7F1] dark:bg-[#1A1110] border-b-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shrink-0">
      <div className="flex items-center gap-2 md:hidden">
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>

      <div className="flex items-center gap-3.5 ml-auto">
        {/* Search input placeholder */}
        <Skeleton className="hidden lg:block w-64 h-9 rounded-xl" />
        {/* New project / action CTA */}
        <Skeleton className="w-9 h-9 rounded-xl" />
        {/* Wallet pill placeholder */}
        <Skeleton className="w-24 h-8 rounded-xl" />
        {/* Notification bell */}
        <Skeleton className="w-9 h-9 rounded-xl" />
        {/* Avatar circle */}
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    </header>
  );
};

/* ─────────────────────────────────────────────────────
   DASHBOARD SKELETON
   Used when dashboard data is loading or page refreshed
───────────────────────────────────────────────────── */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 pb-12 animate-fade-in w-full">
      {/* Small Profile completion banner skeleton */}
      <div className="p-3.5 rounded-2xl bg-white/80 border-2 border-[#382322]/20 shadow-[2px_2px_0_#382322]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="space-y-1">
            <Skeleton className="w-36 h-3 rounded-md" />
            <Skeleton className="w-48 h-2.5 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-20 h-6 rounded-lg" />
      </div>

      {/* 4 Stats Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white/80 border-2 border-[#382322]/20 shadow-[2px_2px_0_#382322]/20 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-16 h-4 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="w-20 h-7 rounded-lg" />
              <Skeleton className="w-28 h-3 rounded-md" />
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions banner skeleton */}
      <div className="p-4 rounded-2xl bg-white/60 border-2 border-[#382322]/20 shadow-[2px_2px_0_#382322]/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-44 h-4 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-28 h-8 rounded-xl" />
          <Skeleton className="w-28 h-8 rounded-xl" />
        </div>
      </div>

      {/* Active Projects / Recent Projects row */}
      <div className="p-5 rounded-2xl bg-white/80 border-2 border-[#382322]/20 shadow-[2px_2px_0_#382322]/20 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-36 h-5 rounded-md" />
          <Skeleton className="w-20 h-6 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      </div>

      {/* Bottom 2-col Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 border-2 border-[#382322]/20 shadow-[2px_2px_0_#382322]/20 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-32 h-5 rounded-md" />
            <Skeleton className="w-16 h-4 rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="w-24 h-3.5 rounded-md" />
                    <Skeleton className="w-16 h-2.5 rounded-md" />
                  </div>
                </div>
                <Skeleton className="w-12 h-4 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-36 h-5 rounded-md" />
            <Skeleton className="w-20 h-4 rounded-md" />
          </div>
          <Skeleton className="w-full h-44 rounded-xl" />
        </div>
      </section>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   WORKSPACE SKELETON
   Left list + Right panel view for Workspace.jsx
───────────────────────────────────────────────────── */
export const WorkspaceSidebarSkeleton = () => {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/70 dark:bg-[#201413]/70 border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15"
        >
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="w-3/5 h-3.5 rounded-md" />
              <Skeleton className="w-12 h-4 rounded-full" />
            </div>
            <Skeleton className="w-full h-1.5 rounded-full" />
            <div className="flex items-center gap-1.5 pt-0.5">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-14 h-2.5 rounded-md ml-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const WorkspaceContentSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF0E6] dark:bg-[#19100F] overflow-hidden">
      {/* Workspace Header */}
      <div className="p-4 md:p-5 border-b-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 bg-[#FFF7F1] dark:bg-[#1A1110] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="w-40 h-4 rounded-md" />
            <Skeleton className="w-24 h-3 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-8 rounded-xl" />
          <Skeleton className="w-24 h-8 rounded-xl" />
        </div>
      </div>

      {/* Tabs Row */}
      <div className="px-5 py-2.5 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 bg-[#FFF7F1]/80 dark:bg-[#1A1110]/80 flex items-center gap-2">
        <Skeleton className="w-20 h-7 rounded-xl" />
        <Skeleton className="w-24 h-7 rounded-xl" />
        <Skeleton className="w-20 h-7 rounded-xl" />
      </div>

      {/* Workspace Body / File Grid / Chat placeholder */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Upload dropzone skeleton */}
        <div className="p-8 rounded-2xl border-2 border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 bg-white/40 dark:bg-white/[0.02] flex flex-col items-center justify-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="w-48 h-4 rounded-md" />
          <Skeleton className="w-32 h-3 rounded-md" />
        </div>

        {/* Files grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 space-y-2.5"
            >
              <Skeleton className="w-full h-24 rounded-lg" />
              <Skeleton className="w-3/4 h-3 rounded-md" />
              <div className="flex justify-between items-center pt-1">
                <Skeleton className="w-12 h-2.5 rounded-md" />
                <Skeleton className="w-8 h-2.5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const WorkspaceChatSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF0E6] dark:bg-[#19100F] p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`flex items-end gap-2.5 max-w-[80%] ${
            i % 2 === 1 ? 'ml-auto flex-row-reverse' : ''
          }`}
        >
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="space-y-1">
            <Skeleton
              className={`p-3 rounded-2xl ${
                i % 2 === 1 ? 'w-48 h-12 rounded-br-none' : 'w-56 h-14 rounded-bl-none'
              }`}
            />
            <Skeleton className="w-12 h-2 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const WorkspaceSkeleton = () => {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#FAF0E6] dark:bg-[#19100F]">
      <aside className="w-full lg:w-80 xl:w-96 border-r-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 bg-[#FFF7F1] dark:bg-[#1A1110] flex flex-col shrink-0">
        <div className="p-4 border-b-2 border-[#382322]/20 dark:border-[#FDEBDE]/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="w-24 h-4 rounded-md" />
            </div>
            <Skeleton className="w-14 h-5 rounded-full" />
          </div>
          <Skeleton className="w-full h-8 rounded-xl" />
        </div>
        <WorkspaceSidebarSkeleton />
      </aside>
      <div className="hidden lg:flex flex-1">
        <WorkspaceContentSkeleton />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   PAYMENTS / EARNINGS SKELETON
   Used in Creator Payments & Freelancer Earnings
───────────────────────────────────────────────────── */
export const PaymentsSkeleton = () => {
  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="w-48 h-6 rounded-lg" />
          <Skeleton className="w-72 h-3.5 rounded-md" />
        </div>
        <Skeleton className="w-36 h-9 rounded-xl" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-28 h-3.5 rounded-md" />
              <Skeleton className="w-6 h-6 rounded-lg" />
            </div>
            <Skeleton className="w-32 h-8 rounded-xl" />
            <Skeleton className="w-full h-3 rounded-md" />
            {i === 0 && <Skeleton className="w-full h-9 rounded-xl mt-2" />}
          </div>
        ))}
      </div>

      {/* Middle Escrow / Project Pipeline container */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-5 rounded-md" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#FAF0E6]/50 dark:bg-white/[0.02] border border-[#382322]/10 dark:border-white/[0.04] space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-36 h-4 rounded-md" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="w-20 h-3 rounded-md" />
                <Skeleton className="w-20 h-3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Rows */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-44 h-5 rounded-md" />
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white/70 dark:bg-[#201413]/70 border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="w-36 h-3.5 rounded-md" />
                  <Skeleton className="w-24 h-2.5 rounded-md" />
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="w-16 h-4 rounded-md ml-auto" />
                <Skeleton className="w-12 h-3 rounded-md ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   NOTIFICATIONS SKELETON
   Used in Creator & Editor Notifications pages
───────────────────────────────────────────────────── */
export const NotificationsSkeleton = () => {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-36 h-6 rounded-lg" />
          <Skeleton className="w-64 h-3.5 rounded-md" />
        </div>
        <Skeleton className="w-24 h-7 rounded-xl" />
      </div>

      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white/80 dark:bg-[#201413]/80 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322]/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="w-2/5 h-4 rounded-md" />
                <Skeleton className="w-4/5 h-3 rounded-md" />
              </div>
            </div>
            <div className="space-y-1 text-right shrink-0">
              <Skeleton className="w-14 h-3 rounded-md ml-auto" />
              <Skeleton className="w-4 h-4 rounded-full ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   APP SHELL SKELETON
   Renders full layout (Sidebar + Header + Page Content)
   Used in ProtectedRoute and AppRoutes during initial auth
   checks and page chunk loading so the app never shows a blank screen
───────────────────────────────────────────────────── */
export const AppShellSkeleton = ({ children, isWorkspace = false }) => {
  return (
    <div className="flex h-screen bg-[#FAF0E6] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] overflow-hidden">
      {/* Sidebar (Desktop visible, hidden on mobile) */}
      <div className="hidden md:block shrink-0">
        <SidebarSkeleton />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HeaderSkeleton />
        {isWorkspace ? (
          <main className="flex-1 overflow-hidden">
            {children || <WorkspaceSkeleton />}
          </main>
        ) : (
          <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {children || <DashboardSkeleton />}
          </main>
        )}
      </div>
    </div>
  );
};

export default Skeleton;
