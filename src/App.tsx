import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowUpDown, RotateCcw, SearchX, SlidersHorizontal } from 'lucide-react';
import { AdSlot } from './components/AdSlot';
import { AdvertiseView } from './components/AdvertiseView';
import { FilterSidebar } from './components/FilterSidebar';
import { Footer } from './components/Footer';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { Navbar } from './components/Navbar';
import { PostSaleView } from './components/PostSaleView';
import { useAuth } from './contexts/AuthContext';
import {
  getStateName,
  haversineMiles,
  lookupZipCoords,
} from './data/usStates';
import { listingsService } from './services/listingsService';
import {
  AppView,
  FilterState,
  NewYardSaleInput,
  SortOption,
  YardSaleListing,
} from './types/yardSale';
import {
  isThisWeekendDate,
  isTodayDate,
  isWithinNext7Days,
} from './utils/dateUtils';

/**
 * Default unfiltered state used on initial load and when resetting filters.
 */
const INITIAL_FILTERS: FilterState = {
  keyword: '',
  state: '',
  cityOrZip: '',
  dateFilter: 'all',
  customDate: '',
  maxDistanceMiles: null,
};

/**
 * Root application component coordinating page navigation ("browse", "post", "advertise"),
 * async yard sale loading from PostgreSQL via Express, search/filter/sort state,
 * sponsored ad injection, and the listing detail modal.
 */
export default function App() {
  const { getIdToken } = useAuth();
  const [listings, setListings] = useState<YardSaleListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentView, setCurrentView] = useState<AppView>('browse');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('soonest');
  const [selectedListing, setSelectedListing] =
    useState<YardSaleListing | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /**
   * Loads active listings from the Express + Cloud SQL PostgreSQL backend.
   */
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const active = await listingsService.getActiveListings();
      setListings(active);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Unable to load yard sales right now. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  /**
   * Counts how many filters are currently active so mobile users see a badge on "Filters".
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.state) count++;
    if (filters.cityOrZip.trim()) count++;
    if (filters.dateFilter !== 'all') count++;
    if (filters.maxDistanceMiles !== null) count++;
    return count;
  }, [filters]);

  /**
   * Applies keyword, state, city/ZIP/distance, and date filters, then sorts results
   * with Featured listings pinned to the top followed by Soonest First or Newest Posted.
   */
  const filteredAndSortedListings = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    const cityZip = filters.cityOrZip.trim().toLowerCase();
    const zipCoords =
      filters.maxDistanceMiles !== null
        ? lookupZipCoords(filters.cityOrZip.trim())
        : null;

    const filtered = listings.filter((item) => {
      // 1. Keyword match across title, description, street, city, state, and ZIP
      if (kw) {
        const stateFull = getStateName(item.state).toLowerCase();
        const haystack = `${item.title} ${item.description} ${item.city} ${item.state} ${stateFull} ${item.zip} ${item.streetAddress}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }

      // 2. Exact 2-letter US state match
      if (filters.state && item.state !== filters.state) {
        return false;
      }

      // 3. City/ZIP substring match, or Haversine radius match when a 5-digit ZIP + slider are active
      if (cityZip) {
        if (
          filters.maxDistanceMiles !== null &&
          zipCoords &&
          item.lat !== undefined &&
          item.lng !== undefined
        ) {
          const miles = haversineMiles(
            zipCoords.lat,
            zipCoords.lng,
            item.lat,
            item.lng
          );
          if (miles > filters.maxDistanceMiles) return false;
        } else {
          const matchesCityOrZip =
            item.city.toLowerCase().includes(cityZip) ||
            item.zip.toLowerCase().includes(cityZip);
          if (!matchesCityOrZip) return false;
        }
      }

      // 4. Date preset / custom date match
      if (filters.dateFilter === 'today' && !isTodayDate(item.date)) {
        return false;
      }
      if (filters.dateFilter === 'weekend' && !isThisWeekendDate(item.date)) {
        return false;
      }
      if (filters.dateFilter === 'next7' && !isWithinNext7Days(item.date)) {
        return false;
      }
      if (
        filters.dateFilter === 'custom' &&
        filters.customDate &&
        item.date !== filters.customDate
      ) {
        return false;
      }

      return true;
    });

    // Sort with Featured sales pinned first, then apply selected sort order
    return [...filtered].sort((a, b) => {
      const aFeat = a.isFeatured ? 1 : 0;
      const bFeat = b.isFeatured ? 1 : 0;
      if (aFeat !== bFeat) return bFeat - aFeat;

      if (sortBy === 'newest') {
        return b.createdAt.localeCompare(a.createdAt);
      }

      // Soonest First (default): ascending date, then ascending startTime
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [listings, filters, sortBy]);

  /**
   * Persists a newly submitted yard sale to PostgreSQL using the signed-in user's
   * Firebase ID token and prepends it to the feed immediately.
   */
  const handleCreateListing = async (
    input: NewYardSaleInput
  ): Promise<YardSaleListing> => {
    const idToken = await getIdToken();
    if (!idToken) {
      throw new Error('Please sign in with Google before publishing your yard sale.');
    }
    const created = await listingsService.createListing(input, idToken);
    setListings((prev) => [created, ...prev]);
    return created;
  };

  /**
   * Resets all search and sidebar filters back to defaults.
   */
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  /**
   * Switches between Browse, Post a Yard Sale, and Advertise views and scrolls to top.
   */
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Interleaves a "Sponsored" card after every 8th yard sale listing in the Browse grid.
   */
  const gridItems = useMemo(() => {
    const items: Array<
      | { type: 'listing'; listing: YardSaleListing }
      | { type: 'sponsored'; key: string; slotIndex: number }
    > = [];

    let sponsorCount = 0;
    filteredAndSortedListings.forEach((listing, index) => {
      items.push({ type: 'listing', listing });
      if ((index + 1) % 8 === 0) {
        items.push({
          type: 'sponsored',
          key: `sponsored-${sponsorCount}`,
          slotIndex: sponsorCount,
        });
        sponsorCount++;
      }
    });

    return items;
  }, [filteredAndSortedListings]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E7] text-[#5B3A29]">
      {/* Persistent Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        keyword={filters.keyword}
        onKeywordChange={(keyword) => setFilters((prev) => ({ ...prev, keyword }))}
      />

      {/* Active Page Content */}
      <main className="flex-1 w-full">
        {/* View 1: Home / Browse Marketplace Grid */}
        {currentView === 'browse' && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
            {/* Top Banner Ad Placement */}
            <AdSlot
              variant="banner"
              onOpenAdvertise={() => handleNavigate('advertise')}
            />

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start">
              {/* Left Filter Sidebar (Desktop) & Slide-Up Drawer (Mobile) */}
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onClear={handleClearFilters}
                onOpenAdvertise={() => handleNavigate('advertise')}
                activeFilterCount={activeFilterCount}
                mobileOpen={mobileFiltersOpen}
                onMobileClose={() => setMobileFiltersOpen(false)}
              />

              {/* Main Feed Column */}
              <div className="flex-1 min-w-0 w-full space-y-5">
                {/* Feed Toolbar: Mobile Filter Trigger, Result Count & Sort Select */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 rounded-3xl px-4 sm:px-5 py-3.5 border border-[#5B3A29]/10">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2EC4B6] hover:bg-[#25B0A3] text-[#2F1D14] text-xs font-bold whitespace-nowrap cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                      <span>
                        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                      </span>
                    </button>

                    <div>
                      <h1 className="font-display font-extrabold text-lg sm:text-xl text-[#5B3A29]">
                        Upcoming Yard Sales
                      </h1>
                      <p className="text-xs text-[#5B3A29]/70 tabular-nums">
                        {isLoading
                          ? 'Loading yard sales...'
                          : `${filteredAndSortedListings.length} ${
                              filteredAndSortedListings.length === 1
                                ? 'sale'
                                : 'sales'
                            } available${
                              activeFilterCount > 0
                                ? ' matching your filters'
                                : ''
                            }`}
                      </p>
                    </div>
                  </div>

                  {/* Sort Order Dropdown */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown
                      className="w-4 h-4 text-[#147A70] shrink-0"
                      aria-hidden="true"
                    />
                    <label htmlFor="sort-select" className="text-xs font-bold text-[#5B3A29]">
                      Sort:
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-[#FFF8E7] text-[#5B3A29] rounded-full border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30 cursor-pointer"
                    >
                      <option value="soonest">Soonest First</option>
                      <option value="newest">Newest Posted</option>
                    </select>
                  </div>
                </div>

                {/* Error Banner when listings API request fails */}
                {loadError && (
                  <div
                    role="alert"
                    className="bg-white rounded-3xl p-5 border border-[#D93E3E]/30 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 text-sm font-semibold text-[#D93E3E]">
                      <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{loadError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void fetchListings()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] text-xs font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Try Again</span>
                    </button>
                  </div>
                )}

                {/* Loading Skeletons / Friendly Empty State / Marketplace Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-3xl overflow-hidden border border-[#5B3A29]/8 animate-pulse"
                      >
                        <div className="aspect-[4/3] w-full bg-[#FFE9B3]/60" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 bg-[#5B3A29]/10 rounded-full w-3/4" />
                          <div className="h-3 bg-[#5B3A29]/10 rounded-full w-1/2" />
                          <div className="h-3 bg-[#5B3A29]/10 rounded-full w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredAndSortedListings.length === 0 && !loadError ? (
                  <div className="bg-white rounded-3xl p-10 sm:p-14 text-center shadow-[0_4px_18px_rgba(91,58,41,0.06)] border border-[#5B3A29]/10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#FFC93C]/35 text-[#5B3A29] mx-auto flex items-center justify-center">
                      <SearchX className="w-8 h-8" aria-hidden="true" />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="font-display font-extrabold text-xl text-[#5B3A29]">
                        No yard sales found, try changing your filters!
                      </h2>
                      <p className="text-sm text-[#5B3A29]/75 max-w-md mx-auto">
                        Try widening your date range, clearing your state or ZIP
                        filter, or searching with a broader keyword.
                      </p>
                    </div>
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-6 py-2.5 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] text-sm font-bold transition-colors cursor-pointer"
                      >
                        Clear All Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('post')}
                        className="px-6 py-2.5 rounded-full bg-[#D93E3E] hover:bg-[#C23232] text-white text-sm font-bold transition-colors cursor-pointer"
                      >
                        Post a Yard Sale
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {gridItems.map((entry) =>
                      entry.type === 'listing' ? (
                        <ListingCard
                          key={entry.listing.id}
                          listing={entry.listing}
                          onSelect={setSelectedListing}
                        />
                      ) : (
                        <AdSlot
                          key={entry.key}
                          variant="sponsored-card"
                          slotIndex={entry.slotIndex}
                          onOpenAdvertise={() => handleNavigate('advertise')}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View 2: Post a Yard Sale Form */}
        {currentView === 'post' && (
          <PostSaleView
            onBack={() => handleNavigate('browse')}
            onCreateListing={handleCreateListing}
          />
        )}

        {/* View 3: Advertise Options, Pricing & Inquiry Page */}
        {currentView === 'advertise' && (
          <AdvertiseView onBack={() => handleNavigate('browse')} />
        )}
      </main>

      {/* Persistent Footer with Smiling Daisy Mascot */}
      <Footer onNavigate={handleNavigate} />

      {/* Listing Detail Modal (opens when any listing card is clicked) */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
}
