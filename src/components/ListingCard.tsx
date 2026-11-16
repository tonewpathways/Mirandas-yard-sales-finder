import React, { useState } from 'react';
import { Calendar, ImageOff, MapPin, Star } from 'lucide-react';
import { YardSaleListing } from '../types/yardSale';
import {
  formatDisplayDate,
  formatTimeRange,
  isThisWeekendDate,
  isTodayDate,
} from '../utils/dateUtils';

interface ListingCardProps {
  listing: YardSaleListing;
  onSelect: (listing: YardSaleListing) => void;
}

/**
 * Marketplace-style card displaying a single yard sale's 4:3 photo, status tags
 * ("Featured", "Today", "This Weekend"), title, date/time, location, and snippet.
 */
export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
}) => {
  // Tracks broken/failed image loads so a clean fallback placeholder renders instead
  const [imageError, setImageError] = useState(false);

  // Derive date urgency tags for grass-green badges
  const isToday = isTodayDate(listing.date);
  const isWeekend = !isToday && isThisWeekendDate(listing.date);

  return (
    <article className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_18px_rgba(91,58,41,0.08)] hover:shadow-[0_12px_28px_rgba(91,58,41,0.14)] hover:-translate-y-1 transition-all duration-200 border border-[#5B3A29]/8 flex flex-col">
      {/* Entire card acts as an accessible button opening the detail modal */}
      <button
        type="button"
        onClick={() => onSelect(listing)}
        className="text-left flex flex-col flex-1 w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147A70] rounded-3xl"
      >
        {/* Block 1: 4:3 Lazy-Loaded Photo Frame + Status Badges */}
        <div className="relative aspect-[4/3] w-full bg-[#FFF0CC] overflow-hidden">
          {!imageError && listing.photoUrl ? (
            <img
              src={listing.photoUrl}
              alt={`${listing.title} in ${listing.city}, ${listing.state}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#FFF0C2] to-[#FFE19C] text-[#5B3A29]/75">
              <ImageOff className="w-8 h-8 mb-2" aria-hidden="true" />
              <span className="text-xs font-semibold line-clamp-2">
                {listing.title}
              </span>
            </div>
          )}

          {/* Overlay tags for Featured and Today / This Weekend */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            {listing.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D93E3E] text-white text-xs font-bold shadow-sm">
                <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                <span>Featured</span>
              </span>
            )}
            {isToday && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#7BC74D] text-[#233D12] text-xs font-bold shadow-sm">
                Today
              </span>
            )}
            {isWeekend && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#7BC74D] text-[#233D12] text-xs font-bold shadow-sm">
                This Weekend
              </span>
            )}
          </div>
        </div>

        {/* Block 2: Title, Schedule, Location & 2-Line Description Snippet */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-2.5">
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-base sm:text-[17px] text-[#5B3A29] leading-snug line-clamp-2 group-hover:text-[#147A70] transition-colors">
              {listing.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#147A70]">
              <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {formatDisplayDate(listing.date)} ·{' '}
                {formatTimeRange(listing.startTime, listing.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-[#5B3A29]/75">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#D93E3E]" aria-hidden="true" />
              <span className="truncate">
                {listing.city}, {listing.state} {listing.zip}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-[13px] text-[#5B3A29]/80 leading-relaxed line-clamp-2 pt-1 border-t border-[#5B3A29]/8">
            {listing.description}
          </p>
        </div>
      </button>
    </article>
  );
};
