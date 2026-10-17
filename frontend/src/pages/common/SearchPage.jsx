import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  Star,
  ChevronRight,
  CheckCircle2,
  Filter,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import { DEFAULT_PFP } from '../../constants/assets';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';

export const SearchPage = ({ role = 'creator' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role: userRole } = useAuth();
  const currentRole = userRole || role;

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'creator', 'freelancer'
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync URL search params
  useEffect(() => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [query, setSearchParams]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const users = await userService.searchUsers(query.trim());
        setResults(users || []);
      } catch (err) {
        console.warn('Search query failed:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = results.filter((u) => {
    if (activeFilter === 'creator') return u.role === 'creator';
    if (activeFilter === 'freelancer') return u.role === 'editor' || u.role === 'freelancer';
    return true;
  });

  const handleOpenProfile = (user) => {
    const targetId = user?._id || user?.id;
    if (targetId) {
      navigate(`/${currentRole}/profile/${targetId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16 px-2 sm:px-4 animate-fade-in">
      <SEO
        title="Search Users - Collabo"
        description="Search creators, video editors, and production talent on Collabo."
      />

      {/* Top Search Card (Instagram Style) */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-xl space-y-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Search Users
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Discover creators and video editors across Collabo
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or @username..."
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#07090E] border border-white/[0.12] focus:border-purple-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-0.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'creator', label: 'Creators' },
            { id: 'freelancer', label: 'Freelancers & Editors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                activeFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-900/50'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          {query.trim()
            ? `Results (${filteredResults.length})`
            : 'Recent or Suggested'}
        </span>
        {isLoading && (
          <span className="text-purple-400 flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            Searching...
          </span>
        )}
      </div>

      {/* Empty State: Prompt to Type */}
      {!isLoading && !query.trim() && (
        <div className="glass-card p-10 text-center rounded-2xl border border-white/[0.06] space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2">
            <Search className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Find People on Collabo</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Search for any creator, thumbnail artist, or video editor by typing their name or @username above.
          </p>
        </div>
      )}

      {/* Empty State: No matches */}
      {!isLoading && query.trim() && filteredResults.length === 0 && (
        <div className="glass-card p-10 text-center rounded-2xl border border-white/[0.06] space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6 text-slate-500" />
          </div>
          <h2 className="text-sm font-semibold text-white">No users found</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            No profile matched <span className="text-purple-300 font-medium">"{query}"</span>. Check spelling or try a different filter.
          </p>
        </div>
      )}

      {/* Instagram-Style User List (Single Column, NOT A GRID) */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden divide-y divide-white/[0.04] shadow-xl">
          {filteredResults.map((user) => {
            const isCreator = user.role === 'creator';
            const roleLabel = isCreator ? 'Creator' : 'Freelancer';
            const roleBadgeStyle = isCreator
              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
            const ringColor = isCreator
              ? 'ring-purple-500/40 border-purple-500/30'
              : 'ring-cyan-500/40 border-cyan-500/30';

            const ratingVal = user.rating != null ? Number(user.rating).toFixed(1) : '0.0';
            const totalReviews = user.totalReviews || 0;

            return (
              <div
                key={user._id}
                onClick={() => handleOpenProfile(user)}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.05] transition-colors cursor-pointer group"
              >
                {/* Left: Avatar (Fixed 48px size) + Details */}
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  {/* Strict Fixed-Size Avatar Container */}
                  <div className="relative w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full shrink-0 overflow-hidden">
                    <img
                      src={user.profileImage || DEFAULT_PFP}
                      alt={user.name || 'User avatar'}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_PFP;
                      }}
                      className={`w-full h-full object-cover rounded-full border p-0.5 ring-2 transition-transform group-hover:scale-105 ${ringColor}`}
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B0F19]" />
                  </div>

                  {/* Text Details (Instagram Style: @username primary, name secondary) */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {user.username ? `@${user.username}` : user.name}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border uppercase tracking-wider ${roleBadgeStyle}`}>
                        {roleLabel}
                      </span>
                    </div>

                    {/* Full Name & Title */}
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      <span className="font-medium text-slate-300">{user.name}</span>
                      {user.title && <span className="text-slate-500 ml-1.5">• {user.title}</span>}
                    </p>

                    {/* Bio or Category snippet */}
                    {user.bio ? (
                      <p className="text-xs text-slate-400/80 line-clamp-1 mt-0.5">
                        {user.bio}
                      </p>
                    ) : user.category ? (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user.category}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Right: Rating & Chevron */}
                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{ratingVal}</span>
                    </div>
                    {totalReviews > 0 && (
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
