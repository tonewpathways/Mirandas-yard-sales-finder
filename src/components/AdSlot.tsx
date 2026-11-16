import React from 'react';
import { ArrowUpRight, Megaphone, Sparkles, Truck } from 'lucide-react';

interface AdSlotProps {
  variant: 'banner' | 'sidebar' | 'sponsored-card';
  onOpenAdvertise: () => void;
  slotIndex?: number;
}

/**
 * Placeholder advertiser content rotated across in-grid "Sponsored" cards.
 * Can be replaced later with live ad-network payloads or local sponsor records.
 */
const SPONSORED_CARDS = [
  {
    title: 'Weekend Pickup? Rent a Cargo Van for $29',
    sponsor: 'Daisy Local Moving & Rentals',
    location: 'Available Nationwide',
    description:
      'Found a mid-century dresser or porch swing at a neighborhood sale? Grab a clean neighborhood van by the hour with zero hidden mileage fees.',
    cta: 'Reserve Nearby',
    accentBg: 'from-[#FFF0C2] via-[#FFE596] to-[#FFD86B]',
    iconType: 'truck' as const,
  },
  {
    title: 'Saturday Morning Yard Sale Fuel: 20% Off Lattes',
    sponsor: 'Sunny Corner Bakery & Roasters',
    location: 'Participating Local Cafés',
    description:
      'Show your Saturday yard sale route on Miranda’s Yard Sale Finder and enjoy 20% off fresh pastries and iced coffee before noon.',
    cta: 'Claim Offer',
    accentBg: 'from-[#D7F7F3] via-[#B4EFE8] to-[#8EE5DC]',
    iconType: 'sparkles' as const,
  },
];

/**
 * Reusable advertising container supporting three placements:
 * - "banner": Full-width horizontal slot at the top of the Browse page
 * - "sidebar": Compact vertical card inside the desktop filter sidebar
 * - "sponsored-card": Native-style listing card injected after every 8th listing
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  variant,
  onOpenAdvertise,
  slotIndex = 0,
}) => {
  // Block 1: Top-of-Browse horizontal banner ad
  if (variant === 'banner') {
    return (
      <aside
        aria-label="Featured advertisement"
        className="w-full max-w-full overflow-hidden rounded-3xl bg-white border border-[#5B3A29]/10 shadow-[0_4px_16px_rgba(91,58,41,0.06)] px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4"
      >
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full sm:flex-1 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFC93C] text-[#5B3A29] flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#5B3A29]/65">
              <span>Advertisement</span>
              <span aria-hidden="true">·</span>
              <span>Community Sponsor Slot</span>
            </div>
            <p className="font-display font-bold text-sm sm:text-lg text-[#5B3A29] leading-snug break-words sm:truncate">
              Reach local treasure hunters right before their weekend route!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdvertise}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-full bg-[#2EC4B6] hover:bg-[#25B0A3] text-[#3B2418] text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147A70]"
        >
          <span>Advertise Here</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </aside>
    );
  }

  // Block 2: Left-sidebar vertical ad placement
  if (variant === 'sidebar') {
    return (
      <aside
        aria-label="Sidebar advertisement"
        className="rounded-3xl bg-white border border-[#5B3A29]/10 p-4 shadow-[0_4px_14px_rgba(91,58,41,0.05)] space-y-3"
      >
        <div className="flex items-center justify-between text-xs text-[#5B3A29]/65 font-semibold">
          <span>Advertisement</span>
          <span>Local Partner</span>
        </div>
        <div className="rounded-2xl bg-[#FFF8E7] p-4 border border-[#FFC93C]/50 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#FFC93C] text-[#5B3A29] flex items-center justify-center">
            <Truck className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#5B3A29] leading-snug">
            Hauling home big finds?
          </h3>
          <p className="text-xs text-[#5B3A29]/80 leading-relaxed">
            Reserve this sidebar placement for your local moving service, thrift
            shop, or neighborhood café.
          </p>
          <button
            type="button"
            onClick={onOpenAdvertise}
            className="w-full mt-1 py-2 px-3 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] text-xs font-bold transition-colors cursor-pointer"
          >
            Book Sidebar Ad
          </button>
        </div>
      </aside>
    );
  }

  // Block 3: Native-style "Sponsored" card inserted into the main listing grid
  const card = SPONSORED_CARDS[slotIndex % SPONSORED_CARDS.length];

  return (
    <article
      aria-label={`Sponsored: ${card.title}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_18px_rgba(91,58,41,0.08)] hover:shadow-[0_10px_26px_rgba(91,58,41,0.14)] hover:-translate-y-1 transition-all duration-200 flex flex-col border border-[#5B3A29]/10"
    >
      {/* 4:3 illustrated sponsor header matching yard sale card geometry */}
      <div
        className={`relative aspect-[4/3] w-full bg-gradient-to-br ${card.accentBg} flex flex-col items-center justify-center p-6 text-center`}
      >
        <div className="w-16 h-16 rounded-3xl bg-white/85 shadow-sm flex items-center justify-center text-[#5B3A29] mb-3">
          {card.iconType === 'truck' ? (
            <Truck className="w-8 h-8" aria-hidden="true" />
          ) : (
            <Sparkles className="w-8 h-8" aria-hidden="true" />
          )}
        </div>
        <p className="font-display font-extrabold text-base text-[#5B3A29] max-w-[20ch] leading-snug">
          {card.sponsor}
        </p>
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[#5B3A29] text-xs font-bold shadow-sm">
          Sponsored
        </span>
      </div>

      {/* Sponsor copy and action button */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#147A70]">
            Sponsored · {card.location}
          </p>
          <h3 className="font-display font-bold text-base text-[#5B3A29] leading-snug line-clamp-2">
            {card.title}
          </h3>
          <p className="text-xs text-[#5B3A29]/80 leading-relaxed line-clamp-2">
            {card.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdvertise}
          className="w-full py-2.5 px-4 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{card.cta}</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};
