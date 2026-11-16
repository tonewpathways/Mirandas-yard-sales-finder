import React from 'react';
import { AppView } from '../types/yardSale';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

/**
 * Site footer displaying the smiling daisy logo (with hover wiggle animation),
 * quick navigation links, and copyright notice.
 */
export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-14 bg-white border-t border-[#5B3A29]/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Daisy mascot + brand tagline (scrolls back to top on click) */}
        <button
          type="button"
          onClick={() => {
            onNavigate('browse');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-3 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147A70] rounded-2xl"
        >
          <img
            src="/assets/aistudio/mirandas-daisy-logo_c75ec03c.svg"
            alt="Smiling daisy mascot for Miranda's Yard Sale Finder"
            className="w-12 h-12 shrink-0 daisy-wiggle"
          />
          <div>
            <p className="font-display font-extrabold text-base text-[#5B3A29]">
              Miranda’s Yard Sale Finder
            </p>
            <p className="text-xs text-[#5B3A29]/70">
              Sunny neighborhood treasures, every weekend.
            </p>
          </div>
        </button>

        {/* Primary site navigation links */}
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-6 text-sm font-semibold text-[#5B3A29]"
        >
          <button
            type="button"
            onClick={() => {
              onNavigate('browse');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-[#147A70] hover:underline cursor-pointer whitespace-nowrap"
          >
            Browse Sales
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('post');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-[#147A70] hover:underline cursor-pointer whitespace-nowrap"
          >
            Post a Yard Sale
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('advertise');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-[#147A70] hover:underline cursor-pointer whitespace-nowrap"
          >
            Advertise
          </button>
        </nav>

        <p className="text-xs text-[#5B3A29]/60">
          © {new Date().getFullYear()} Miranda’s Yard Sale Finder
        </p>
      </div>
    </footer>
  );
};
