import React from 'react';
import { cn } from '../../lib/utils';

// Analog paper tape sticker
export function TapeSticker({ className, color = 'bg-[#FFEBAA]' }) {
  return (
    <div
      className={cn(
        'h-5 px-3 py-0.5 rounded-sm shadow-sm border border-[#382322]/20 flex items-center justify-center rotate-[-3deg] select-none pointer-events-none',
        color,
        className
      )}
    >
      <div className="w-full h-full border-b border-t border-dashed border-[#382322]/25" />
    </div>
  );
}

// Spontaneous automatic ink star
export function InkStar({ className, size = 20, color = '#382322' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none pointer-events-none', className)}
    >
      <path
        d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
        fill={color}
      />
    </svg>
  );
}

// Automatic psychic ink arrow
export function InkArrow({ className, color = '#382322' }) {
  return (
    <svg
      width="44"
      height="28"
      viewBox="0 0 54 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('select-none pointer-events-none', className)}
    >
      <path
        d="M3 26C14 18 29 10 48 14M48 14L37 7M48 14L39 23"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Spontaneous ink swirl / underline
export function InkScribble({ className, color = '#382322' }) {
  return (
    <svg
      width="90"
      height="18"
      viewBox="0 0 100 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('select-none pointer-events-none', className)}
    >
      <path
        d="M2 13C25 8 50 16 75 11C84 9 93 14 98 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Analog 35mm film contact sheet motif
export function ContactSheetStrip({ className }) {
  return (
    <div
      className={cn(
        'bg-[#382322] text-[#FDEBDE] p-1.5 rounded-lg border border-[#382322] shadow-brutal-sm flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest select-none',
        className
      )}
    >
      <div className="flex flex-col gap-0.5 opacity-60">
        <div className="w-1.5 h-1.5 bg-[#FFEBAA] rounded-xs" />
        <div className="w-1.5 h-1.5 bg-[#FFEBAA] rounded-xs" />
      </div>
      <div className="px-2 py-0.5 bg-[#261615] rounded border border-[#FFEBAA]/20 text-[#FFEBAA]">
        RAW • 24FPS
      </div>
      <div className="flex flex-col gap-0.5 opacity-60">
        <div className="w-1.5 h-1.5 bg-[#FFEBAA] rounded-xs" />
        <div className="w-1.5 h-1.5 bg-[#FFEBAA] rounded-xs" />
      </div>
    </div>
  );
}

// Surrealist collage composition graphic (Floating vintage camera & analog cut-paper artwork)
export function SurrealistCollageArtwork({ className }) {
  return (
    <div className={cn('relative w-64 sm:w-72 h-56 select-none pointer-events-none', className)}>
      {/* Background paper cutout angle */}
      <div className="absolute -top-3 -right-2 w-48 h-36 bg-[#FFEBAA] rounded-2xl border-2 border-[#382322] shadow-brutal rotate-[4deg] overflow-hidden">
        <div className="p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#382322]/80 font-bold">
            Studio Log № 04
          </div>
          <p className="font-hand text-base text-[#382322] leading-none mt-1">
            "make something worth looking at"
          </p>
        </div>
      </div>

      {/* Floating 35mm Vintage Rangefinder Camera Cutout */}
      <div className="absolute top-6 left-4 w-52 p-3 bg-[#FAF0E6] rounded-2xl border-2 border-[#382322] shadow-brutal-lg rotate-[-5deg]">
        {/* Taped top edge */}
        <div className="absolute -top-2.5 left-12 w-14 h-4 bg-[#FFEBAA]/90 border border-[#382322]/30 rotate-[2deg] shadow-xs" />

        {/* Camera body illustration */}
        <div className="p-2.5 rounded-xl bg-[#382322] text-[#FDEBDE] border border-[#382322]">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/15">
            <span className="text-[8px] font-mono text-[#FFEBAA] tracking-wider">COLLABO • 35MM</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFEBAA]" />
            </div>
          </div>
          <div className="my-2.5 flex items-center justify-center">
            {/* Camera lens */}
            <div className="w-16 h-16 rounded-full border-4 border-[#FFEBAA] bg-[#261615] flex items-center justify-center shadow-inner">
              <div className="w-8 h-8 rounded-full border-2 border-[#B1C8EA] bg-[#B1C8EA]/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white/80" />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono text-[#FFEBAA]">
            <span>F/1.4 • 50MM</span>
            <span>4K PRORES</span>
          </div>
        </div>
      </div>

      {/* Floating doodles */}
      <div className="absolute -bottom-2 right-4">
        <ContactSheetStrip />
      </div>
      <div className="absolute top-1 left-2">
        <InkStar size={24} color="#382322" />
      </div>
      <div className="absolute top-2 right-12">
        <InkStar size={16} color="#382322" />
      </div>
      <div className="absolute -bottom-3 left-8 rotate-12">
        <span className="font-hand text-sm font-bold text-[#382322] px-2 py-0.5 bg-[#FFEBAA] border border-[#382322] rounded shadow-xs">
          Take 03 ✳
        </span>
      </div>
    </div>
  );
}

export default SurrealistCollageArtwork;
