import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Sparkles, Film, Compass } from 'lucide-react';
import { TextEffect } from '../core/text-effect';
import { TextLoop } from '../core/text-loop';
import { Cursor } from '../core/cursor';
import { Magnetic } from '../core/magnetic';
import { TextRoll } from '../core/text-roll';
import {
  SurrealistCollageArtwork,
  TapeSticker,
  InkStar,
  InkArrow,
  InkScribble
} from './CollageDecoration';
import { useAuth } from '../../context/AuthContext';

export function DashboardHero({ role = 'creator' }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.name || currentUser?.displayName || (role === 'creator' ? 'Creator' : 'Editor');

  return (
    <div className="relative rounded-3xl bg-[#B1C8EA] border-2 border-[#382322] shadow-brutal-lg p-6 sm:p-8 md:p-10 overflow-hidden paper-grain">
      {/* Decorative top tape */}
      <div className="absolute -top-2 left-10 hidden sm:block">
        <TapeSticker />
      </div>

      {/* Background brutalist stamp */}
      <div className="absolute top-4 right-6 hidden md:flex items-center gap-2 opacity-80 select-none pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#382322] font-extrabold border border-[#382322] px-2 py-0.5 rounded-sm bg-[#FFEBAA]">
          STUDIO / DASHBOARD 001
        </span>
        <InkStar size={18} color="#382322" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Expressive Editorial Headlines */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBAA] border border-[#382322] shadow-brutal-sm text-xs font-mono font-bold text-[#382322]">
            <Sparkles className="w-3.5 h-3.5 text-[#382322]" />
            <span>Digital Creative Space</span>
            <span className="text-[#382322]/40">•</span>
            <TextRoll className="font-bold">COLLABO ACTIVE</TextRoll>
          </div>

          <div>
            <h1 className="font-display italic text-3xl sm:text-5xl md:text-6xl text-[#382322] tracking-tight leading-[1.08]">
              <TextEffect per="word">
                {`${getGreeting()}, ${displayName}`}
              </TextEffect>
            </h1>

            <div className="mt-1 flex items-center gap-2">
              <InkScribble color="#382322" />
            </div>

            <p className="text-sm sm:text-base text-[#382322]/85 font-medium mt-3 max-w-xl leading-relaxed">
              Here's where things stand with your work. Directing productions with{' '}
              <span className="font-bold text-[#382322] border-b-2 border-[#382322] pb-0.5">
                <TextLoop interval={2800}>
                  <span>Editors</span>
                  <span>Creators</span>
                  <span>Designers</span>
                  <span>Storytellers</span>
                </TextLoop>
              </span>{' '}
              in a synchronized workspace.
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Magnetic>
              <button
                onClick={() => navigate(role === 'creator' ? '/creator/create-project' : '/editor/browse')}
                className="brutal-btn-primary px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-brutal"
              >
                <span>{role === 'creator' ? 'Start New Production' : 'Explore Projects'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Magnetic>

            <button
              onClick={() => navigate(`/${role}/workspace`)}
              className="brutal-btn-yellow px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Open Media Suite</span>
            </button>

            <div className="hidden sm:inline-flex items-center gap-1 font-hand text-base text-[#382322] ml-2">
              <InkArrow color="#382322" />
              <span className="rotate-[-2deg] font-bold">real-time sync</span>
            </div>
          </div>
        </div>

        {/* Right Column: Surrealist Analog Collage with Scoped Cursor */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <Cursor
            className="p-3 rounded-3xl bg-[#FAF0E6]/50 border-2 border-dashed border-[#382322]/40"
            cursorContent={
              <div className="px-2.5 py-1 rounded-full bg-[#FFEBAA] text-[#382322] border border-[#382322] font-mono text-[10px] font-bold shadow-brutal-sm">
                Creative Lens ✳
              </div>
            }
          >
            <SurrealistCollageArtwork />
          </Cursor>
        </div>
      </div>
    </div>
  );
}

export default DashboardHero;
