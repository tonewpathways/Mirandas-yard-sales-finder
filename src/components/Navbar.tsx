import React from 'react';
import { LogIn, LogOut, PlusCircle, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AppView } from '../types/yardSale';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
}

/**
 * Top navigation bar shared across all views.
 * Contains the brand logo (with hover daisy wiggle), keyword search box,
 * "Advertise" link, account sign-in/out button, and "Post a Yard Sale" primary CTA.
 */
export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  keyword,
  onKeywordChange,
}) => {
  const { user, isAuthLoading, signInWithGoogle, signOutUser } = useAuth();

  /**
   * Updates the search keyword live and switches back to the Browse grid
   * if the user starts typing while on Post or Advertise.
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onKeywordChange(val);
    if (currentView !== 'browse') {
      onNavigate('browse');
    }
  };

  /**
   * Prevents full-page form reload on Enter and ensures the Browse feed is visible.
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentView !== 'browse') {
      onNavigate('browse');
    }
  };

  const firstName = user?.displayName?.trim().split(' ')[0] || 'Account';

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-[#5B3A29]/10 md:sticky md:top-0 z-30 shadow-[0_2px_12px_rgba(91,58,41,0.05)]">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 md:gap-6">
        {/* Zone 1: Wide Brand Logo (clicks return to Browse) */}
        <button
          type="button"
          onClick={() => onNavigate('browse')}
          className="group flex items-center text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147A70] rounded-2xl shrink-0 cursor-pointer"
          aria-label="Miranda's Yard Sale Finder Home"
        >
          <img
            src="/assets/aistudio/mirandas-logo-wide_0fdb8b59.svg"
            alt="Miranda's Yard Sale Finder"
            className="h-8 sm:h-12 w-auto object-contain daisy-wiggle"
          />
        </button>

        {/* Zone 2: Keyword Search Box (drops to full-width second row on mobile) */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          aria-label="Search yard sales"
          className="order-3 md:order-2 w-full md:flex-1 md:max-w-lg"
        >
          <div className="relative flex items-center">
            <Search
              className="w-4 h-4 text-[#5B3A29]/60 absolute left-4 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={keyword}
              onChange={handleSearchChange}
              placeholder="Search furniture, toys, vintage, city..."
              aria-label="Search yard sales by keyword"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/55 rounded-full border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30 transition-colors"
            />
            {/* Inline clear button shown only when a keyword is entered */}
            {keyword && (
              <button
                type="button"
                onClick={() => onKeywordChange('')}
                aria-label="Clear search keyword"
                className="absolute right-2.5 p-1.5 rounded-full text-[#5B3A29]/60 hover:text-[#5B3A29] hover:bg-[#5B3A29]/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Zone 3: Advertise Text Link + Account Action + Post a Yard Sale Primary CTA */}
        <div className="order-2 md:order-3 flex items-center gap-2 sm:gap-5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('advertise')}
            className={`text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 py-2 px-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147A70] rounded-lg ${
              currentView === 'advertise'
                ? 'text-[#147A70] underline decoration-2 underline-offset-4'
                : 'text-[#5B3A29] hover:text-[#147A70] hover:underline decoration-2 underline-offset-4'
            }`}
          >
            Advertise
          </button>

          {!isAuthLoading &&
            (user ? (
              <button
                type="button"
                onClick={() => void signOutUser()}
                title={`Signed in as ${user.email ?? user.displayName ?? 'Google user'} — click to sign out`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5B3A29]/85 hover:text-[#D93E3E] whitespace-nowrap shrink-0 py-1.5 px-2.5 rounded-full bg-[#FFF8E7] border border-[#5B3A29]/15 transition-colors cursor-pointer"
              >
                <span className="hidden lg:inline max-w-[100px] truncate">
                  {firstName}
                </span>
                <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#147A70] hover:text-[#0F5D55] whitespace-nowrap shrink-0 py-1.5 px-2.5 rounded-full bg-[#2EC4B6]/12 hover:bg-[#2EC4B6]/20 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ))}

          <button
            type="button"
            onClick={() => onNavigate('post')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 shadow-[0_3px_10px_rgba(217,62,62,0.25)] transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B3A29] ${
              currentView === 'post'
                ? 'bg-[#FFC93C] text-[#5B3A29] ring-2 ring-[#5B3A29]/20'
                : 'bg-[#D93E3E] hover:bg-[#C23232] text-white hover:-translate-y-0.5'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Post a Yard Sale</span>
          </button>
        </div>
      </div>
    </header>
  );
};
