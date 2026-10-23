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
    <div className="max-w-2xl mx-auto space-y-4 pb-16 px-2 sm:px-4 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title="Search Users - Collabo"
        description="Search creators, video editors, and production talent on Collabo."
      />

      {/* Top Search Card (Editorial Brutalist Search) */}
      <div className="bg-[#FFFDF9] dark:bg-[#201413] p-4 sm:p-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FDEBDE] dark:hover:bg-[#2A1B19] transition-colors shrink-0 cursor-pointer shadow-[2px_2px_0_#382322]"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-serif font-black text-[#261615] dark:text-[#FDEBDE] tracking-tight">
              Search Users
            </h1>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] truncate font-sans">
              Discover creators and video editors across Collabo
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#5C3A38] dark:text-[#FFEBAA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or @username..."
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs sm:text-sm text-[#261615] dark:text-[#FDEBDE] placeholder-[#5C3A38]/60 dark:placeholder-[#D4B8A8]/60 focus:outline-none shadow-[2px_2px_0_#382322] transition-colors font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] cursor-pointer"
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
              className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider shrink-0 transition-colors border-2 cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#FFEBAA] text-[#261615] border-[#382322] shadow-[2px_2px_0_#382322]'
                  : 'bg-[#FFF7F1] dark:bg-[#19100F] text-[#5C3A38] dark:text-[#D4B8A8] border-[#382322]/20 dark:border-[#FDEBDE]/20 hover:border-[#382322]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between px-1 text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8]">
        <span>
          {query.trim()
            ? `Results (${filteredResults.length})`
            : 'Recent or Suggested'}
        </span>
        {isLoading && (
          <span className="text-[#8A5200] dark:text-[#FFEBAA] flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#382322] dark:border-[#FFEBAA] border-t-transparent animate-spin" />
            Searching...
          </span>
        )}
      </div>

      {/* Empty State: Prompt to Type */}
      {!isLoading && !query.trim() && (
        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-10 text-center border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-2">
          <div className="w-12 h-12 bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center mx-auto mb-2 text-[#261615] shadow-[2px_2px_0_#382322]">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">Find People on Collabo</h2>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] max-w-xs mx-auto leading-relaxed font-sans">
            Search for any creator, thumbnail artist, or video editor by typing their name or @username above.
          </p>
        </div>
      )}

      {/* Empty State: No matches */}
      {!isLoading && query.trim() && filteredResults.length === 0 && (
        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-10 text-center border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-2">
          <div className="w-12 h-12 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 flex items-center justify-center mx-auto mb-2 text-[#5C3A38] dark:text-[#D4B8A8]">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">No users found</h2>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] max-w-xs mx-auto leading-relaxed font-sans">
            No profile matched <span className="text-[#261615] dark:text-[#FFEBAA] font-bold">"{query}"</span>. Check spelling or try a different filter.
          </p>
        </div>
      )}

      {/* Instagram-Style User List (Single Column, NOT A GRID) */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] overflow-hidden divide-y-2 divide-[#382322]/10 dark:divide-[#FDEBDE]/10">
          {filteredResults.map((user) => {
            const isCreator = user.role === 'creator';
            const roleLabel = isCreator ? 'Creator' : 'Freelancer';
            const roleBadgeStyle = isCreator
              ? 'bg-[#FFEBAA] text-[#261615] border-[#382322]'
              : 'bg-[#B1C8EA] text-[#261615] border-[#382322]';

            const ratingVal = user.rating != null ? Number(user.rating).toFixed(1) : '0.0';
            const totalReviews = user.totalReviews || 0;

            return (
              <div
                key={user._id}
                onClick={() => handleOpenProfile(user)}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#FFF7F1] dark:hover:bg-[#2A1B19] transition-colors cursor-pointer group"
              >
                {/* Left: Avatar (Fixed 48px size) + Details */}
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  {/* Strict Fixed-Size Avatar Container */}
                  <div className="relative w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] shrink-0 rounded-full border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] overflow-hidden">
                    <img
                      src={user.profileImage || DEFAULT_PFP}
                      alt={user.name || 'User avatar'}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_PFP;
                      }}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#059669] border border-[#382322]" />
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[#261615] dark:text-[#FDEBDE] group-hover:underline truncate">
                        {user.username ? `@${user.username}` : user.name}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border uppercase tracking-wider ${roleBadgeStyle}`}>
                        {roleLabel}
                      </span>
                    </div>

                    {/* Full Name & Title */}
                    <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] truncate mt-0.5 font-sans">
                      <span className="font-semibold text-[#261615] dark:text-[#FDEBDE]">{user.name}</span>
                      {user.title && <span className="text-[#5C3A38] dark:text-[#D4B8A8] ml-1.5">• {user.title}</span>}
                    </p>

                    {/* Bio or Category snippet */}
                    {user.bio ? (
                      <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]/90 line-clamp-1 mt-0.5 font-sans">
                        {user.bio}
                      </p>
                    ) : user.category ? (
                      <p className="text-[11px] font-mono text-[#5C3A38] dark:text-[#D4B8A8] truncate mt-0.5">
                        {user.category}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Right: Rating & Chevron */}
                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#261615] bg-[#FFEBAA] border border-[#382322] px-2 py-0.5 shadow-[1px_1px_0_#382322]">
                      <Star className="w-3 h-3 fill-[#261615] text-[#261615]" />
                      <span>{ratingVal}</span>
                    </div>
                    {totalReviews > 0 && (
                      <span className="text-[10px] font-mono text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5C3A38] dark:text-[#D4B8A8] group-hover:text-[#261615] dark:group-hover:text-[#FFEBAA] group-hover:translate-x-0.5 transition-all" />
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
