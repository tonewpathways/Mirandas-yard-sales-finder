import React from 'react';
import { Calendar, MapPin, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { US_STATES } from '../data/usStates';
import { DateFilterOption, FilterState } from '../types/yardSale';
import { getTodayLocalDateStr } from '../utils/dateUtils';
import { AdSlot } from './AdSlot';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
  onOpenAdvertise: () => void;
  activeFilterCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * Date preset buttons rendered inside the Sale Date filter block.
 */
const DATE_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: 'all', label: 'All Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'next7', label: 'Next 7 Days' },
  { value: 'custom', label: 'Pick a Date' },
];

/**
 * Provides location and date filters for the Browse feed.
 * Renders as a persistent left sidebar on desktop (lg+) and as a
 * slide-up bottom sheet drawer on mobile/tablet viewports.
 */
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onClear,
  onOpenAdvertise,
  activeFilterCount,
  mobileOpen,
  onMobileClose,
}) => {
  const todayStr = getTodayLocalDateStr();
  // Radius distance slider becomes interactive once a 5-digit ZIP is entered
  const hasFiveDigitZip = /^\d{5}$/.test(filters.cityOrZip.trim());

  /**
   * Shared filter controls JSX reused inside both the desktop sidebar and mobile drawer.
   */
  const filterControls = (
    <div className="space-y-5">
      {/* Header + Quick Clear Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="w-4 h-4 text-[#147A70]"
            aria-hidden="true"
          />
          <h2 className="font-display font-extrabold text-lg text-[#5B3A29]">
            Filter Sales
          </h2>
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#147A70] hover:text-[#0F5E56] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Block 1: State Dropdown (all 50 US states) */}
      <div className="space-y-1.5">
        <label
          htmlFor="filter-state"
          className="block text-xs font-bold text-[#5B3A29]"
        >
          State
        </label>
        <select
          id="filter-state"
          value={filters.state}
          onChange={(e) => onChange({ ...filters, state: e.target.value })}
          className="w-full px-3.5 py-2.5 text-sm bg-[#FFF8E7] text-[#5B3A29] rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30 cursor-pointer"
        >
          <option value="">All 50 States</option>
          {US_STATES.map((st) => (
            <option key={st.code} value={st.code}>
              {st.name} ({st.code})
            </option>
          ))}
        </select>
      </div>

      {/* Block 2: City or 5-Digit ZIP Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="filter-city-zip"
          className="block text-xs font-bold text-[#5B3A29]"
        >
          City or ZIP Code
        </label>
        <div className="relative">
          <MapPin
            className="w-4 h-4 text-[#5B3A29]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="filter-city-zip"
            type="text"
            value={filters.cityOrZip}
            onChange={(e) => {
              const val = e.target.value;
              const isZip = /^\d{5}$/.test(val.trim());
              onChange({
                ...filters,
                cityOrZip: val,
                // Automatically clear distance filter if user clears/changes away from a 5-digit ZIP
                maxDistanceMiles: isZip ? filters.maxDistanceMiles : null,
              });
            }}
            placeholder="e.g. Portland or 97205"
            className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/50 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
          />
        </div>
      </div>

      {/* Block 3: Optional "Within X Miles" Radius Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="filter-distance"
            className="font-bold text-[#5B3A29]"
          >
            Within Distance
          </label>
          <span className="font-semibold text-[#147A70] tabular-nums">
            {filters.maxDistanceMiles
              ? `${filters.maxDistanceMiles} miles`
              : 'Any distance'}
          </span>
        </div>
        <input
          id="filter-distance"
          type="range"
          min={5}
          max={100}
          step={5}
          disabled={!hasFiveDigitZip}
          value={filters.maxDistanceMiles ?? 50}
          onChange={(e) =>
            onChange({
              ...filters,
              maxDistanceMiles: Number(e.target.value),
            })
          }
          className="w-full accent-[#2EC4B6] disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between text-[11px] text-[#5B3A29]/65">
          <span>
            {hasFiveDigitZip
              ? 'Adjust radius around ZIP'
              : 'Enter a 5-digit ZIP to enable'}
          </span>
          {filters.maxDistanceMiles !== null && (
            <button
              type="button"
              onClick={() =>
                onChange({ ...filters, maxDistanceMiles: null })
              }
              className="font-bold text-[#147A70] hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Block 4: Date Preset Chips + Optional Custom Date Picker */}
      <div className="space-y-2 pt-1">
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#5B3A29]">
          <Calendar className="w-3.5 h-3.5 text-[#147A70]" aria-hidden="true" />
          <span>Sale Date</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {DATE_OPTIONS.map((opt) => {
            const active = filters.dateFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    dateFilter: opt.value,
                    customDate:
                      opt.value === 'custom' && !filters.customDate
                        ? todayStr
                        : filters.customDate,
                  })
                }
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147A70] ${
                  active
                    ? 'bg-[#2EC4B6] text-[#2F1D14] shadow-xs'
                    : 'bg-[#FFF8E7] text-[#5B3A29] hover:bg-[#FFC93C]/40 border border-[#5B3A29]/10'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {filters.dateFilter === 'custom' && (
          <div className="pt-1.5">
            <label htmlFor="filter-custom-date" className="sr-only">
              Select a specific date
            </label>
            <input
              id="filter-custom-date"
              type="date"
              min={todayStr}
              value={filters.customDate}
              onChange={(e) =>
                onChange({ ...filters, customDate: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm bg-[#FFF8E7] text-[#5B3A29] rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
            />
          </div>
        )}
      </div>

      {/* Block 5: Reset All Filters CTA */}
      <button
        type="button"
        onClick={onClear}
        className="w-full py-2.5 px-4 rounded-full bg-[#FFF8E7] hover:bg-[#FFC93C]/50 text-[#5B3A29] text-xs font-bold border border-[#5B3A29]/15 transition-colors cursor-pointer"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar + Sidebar Ad Placement */}
      <aside
        aria-label="Yard sale filters"
        className="hidden lg:block w-72 shrink-0 space-y-5"
      >
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_18px_rgba(91,58,41,0.07)] border border-[#5B3A29]/8">
          {filterControls}
        </div>
        <AdSlot variant="sidebar" onOpenAdvertise={onOpenAdvertise} />
      </aside>

      {/* Mobile Slide-Up Filter Sheet Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex items-end bg-[#3B2418]/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Filter yard sales"
          onClick={onMobileClose}
        >
          <div
            className="w-full max-h-[88vh] overflow-y-auto bg-white rounded-t-3xl p-5 pb-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#5B3A29]/10">
              <span className="font-display font-extrabold text-base text-[#5B3A29]">
                Filters &amp; Location
              </span>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close filters"
                className="w-10 h-10 rounded-full bg-[#FFF8E7] text-[#5B3A29] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filterControls}

            <button
              type="button"
              onClick={onMobileClose}
              className="w-full py-3 px-6 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] font-bold text-sm shadow-sm cursor-pointer"
            >
              Show Matching Sales
            </button>
          </div>
        </div>
      )}
    </>
  );
};
