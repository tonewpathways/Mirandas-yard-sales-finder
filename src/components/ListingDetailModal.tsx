import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  ImageOff,
  Mail,
  MapPin,
  Phone,
  Star,
  X,
} from 'lucide-react';
import { getStateName } from '../data/usStates';
import { YardSaleListing } from '../types/yardSale';
import {
  formatLongDate,
  formatTimeRange,
  isThisWeekendDate,
  isTodayDate,
} from '../utils/dateUtils';

interface ListingDetailModalProps {
  listing: YardSaleListing | null;
  onClose: () => void;
}

/**
 * Accessible dialog modal displaying full details for a selected yard sale:
 * large photo, date/time range, full street address, description, contact info,
 * and a "Get Directions" Google Maps external link.
 */
export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Reset image error state whenever a different listing is opened
  useEffect(() => {
    setImgFailed(false);
  }, [listing?.id]);

  // Allow users to close the modal via the Escape key
  useEffect(() => {
    if (!listing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, onClose]);

  if (!listing) return null;

  // Construct encoded Google Maps search URL for one-click turn-by-turn directions
  const fullAddress = `${listing.streetAddress}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress
  )}`;
  const isToday = isTodayDate(listing.date);
  const isWeekend = !isToday && isThisWeekendDate(listing.date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#3B2418]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-detail-title"
      onClick={onClose}
    >
      {/* Stop click propagation inside card so backdrop clicks still dismiss */}
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-[0_24px_60px_rgba(59,36,24,0.3)] border border-[#5B3A29]/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close yard sale details"
          className="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-white/95 hover:bg-[#FFC93C] text-[#5B3A29] flex items-center justify-center shadow-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147A70]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Block 1: Large Photo Banner + Status Tags */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-[#FFF0CC] overflow-hidden">
          {!imgFailed && listing.photoUrl ? (
            <img
              src={listing.photoUrl}
              alt={`${listing.title} in ${listing.city}, ${listing.state}`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#5B3A29]/70">
              <ImageOff className="w-10 h-10 mb-2" aria-hidden="true" />
              <span className="text-sm font-semibold">{listing.title}</span>
            </div>
          )}

          <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">
            {listing.isFeatured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D93E3E] text-white text-xs font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Featured Sale</span>
              </span>
            )}
            {isToday && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#7BC74D] text-[#233D12] text-xs font-bold shadow-sm">
                Happening Today
              </span>
            )}
            {isWeekend && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#7BC74D] text-[#233D12] text-xs font-bold shadow-sm">
                This Weekend
              </span>
            )}
          </div>
        </div>

        {/* Block 2: Full Sale Details, Schedule, Address, Contact & Directions CTA */}
        <div className="p-5 sm:p-7 space-y-5">
          <div>
            <h2
              id="listing-detail-title"
              className="font-display font-extrabold text-2xl sm:text-3xl text-[#5B3A29] leading-tight"
            >
              {listing.title}
            </h2>
          </div>

          {/* Schedule & Full Address Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FFF8E7] rounded-2xl p-4 border border-[#5B3A29]/10">
            <div className="flex items-start gap-2.5">
              <Calendar
                className="w-5 h-5 text-[#147A70] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-[#5B3A29]/65">Date</p>
                <p className="text-sm font-bold text-[#5B3A29]">
                  {formatLongDate(listing.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock
                className="w-5 h-5 text-[#147A70] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-[#5B3A29]/65">Hours</p>
                <p className="text-sm font-bold text-[#5B3A29]">
                  {formatTimeRange(listing.startTime, listing.endTime)}
                </p>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-start gap-2.5 pt-2 border-t border-[#5B3A29]/10">
              <MapPin
                className="w-5 h-5 text-[#D93E3E] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-[#5B3A29]/65">
                  Address
                </p>
                <p className="text-sm font-bold text-[#5B3A29]">
                  {listing.streetAddress}
                </p>
                <p className="text-sm text-[#5B3A29]/85">
                  {listing.city}, {getStateName(listing.state)} {listing.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Full Item Description */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-base text-[#5B3A29]">
              What’s at this sale
            </h3>
            <p className="text-sm sm:text-[15px] text-[#5B3A29]/90 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Optional Seller Contact Links */}
          {(listing.contactEmail || listing.contactPhone) && (
            <div className="space-y-2 pt-2 border-t border-[#5B3A29]/10">
              <h3 className="font-display font-bold text-sm text-[#5B3A29]">
                Seller Contact
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {listing.contactEmail && (
                  <a
                    href={`mailto:${listing.contactEmail}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#147A70] hover:underline"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span>{listing.contactEmail}</span>
                  </a>
                )}
                {listing.contactPhone && (
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#147A70] hover:underline"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span>{listing.contactPhone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer Action Row: Google Maps Directions + Back */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] font-bold text-sm shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B3A29]"
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>Get Directions</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-full bg-[#FFF8E7] hover:bg-[#5B3A29]/10 text-[#5B3A29] font-semibold text-sm transition-colors cursor-pointer"
            >
              Back to Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
