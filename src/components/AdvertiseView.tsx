import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  LayoutGrid,
  Megaphone,
  Star,
} from 'lucide-react';
import { listingsService } from '../services/listingsService';
import { AdTierType } from '../types/yardSale';

interface AdvertiseViewProps {
  onBack: () => void;
}

interface PricingTier {
  name: AdTierType;
  price: string;
  cadence: string;
  summary: string;
  highlights: string[];
  accentColor: string;
  badgeText?: string;
  icon: React.ReactNode;
}

/**
 * Three advertising packages displayed in the pricing comparison grid.
 */
const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Banner Ad',
    price: '$29',
    cadence: 'per week',
    summary:
      'High-visibility placement at the top of the Browse feed and inside the filter sidebar.',
    highlights: [
      'Top-of-browse horizontal banner',
      'Persistent desktop sidebar slot',
      'Direct click-through to your website',
      'Ideal for local cafés, movers & thrift shops',
    ],
    accentColor: 'bg-[#2EC4B6] text-[#2F1D14]',
    icon: <Megaphone className="w-5 h-5" aria-hidden="true" />,
  },
  {
    name: 'Sponsored Listing',
    price: '$19',
    cadence: 'per week',
    summary:
      'Native card placed neatly inside the main Marketplace grid after every 8th listing.',
    highlights: [
      'Blends naturally with yard sale cards',
      'Appears every 8th slot in the grid',
      'Includes clear "Sponsored" disclosure',
      'Great for weekend specials & local events',
    ],
    accentColor: 'bg-[#FFC93C] text-[#5B3A29]',
    badgeText: 'Most Popular',
    icon: <LayoutGrid className="w-5 h-5" aria-hidden="true" />,
  },
  {
    name: 'Featured Listing',
    price: '$12',
    cadence: 'per sale',
    summary:
      'Pin your estate sale, multi-family block sale, or charity rummage sale to the top of the feed.',
    highlights: [
      'Pinned first before standard listings',
      'Eye-catching coral "Featured" badge',
      'Highlighted in search & state filters',
      'Runs until your sale date finishes',
    ],
    accentColor: 'bg-[#D93E3E] text-white',
    icon: <Star className="w-5 h-5" aria-hidden="true" />,
  },
];

/**
 * Dedicated "Advertise" page presenting ad placement tiers and an inquiry form
 * that saves advertiser submissions via listingsService.
 */
export const AdvertiseView: React.FC<AdvertiseViewProps> = ({ onBack }) => {
  const formRef = useRef<HTMLDivElement | null>(null);

  // Inquiry form state
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [adType, setAdType] = useState<AdTierType>('Sponsored Listing');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /**
   * Pre-selects a pricing tier in the inquiry dropdown and scrolls smoothly to the form.
   */
  const handleSelectTier = (tier: AdTierType) => {
    setAdType(tier);
    setSubmitted(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /**
   * Validates inquiry fields, stores the submission, and shows confirmation.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMsg('Please enter your business or organization name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid contact email address.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please tell us a little about what you’d like to promote.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await listingsService.submitAdInquiry({
        businessName: businessName.trim(),
        email: email.trim(),
        adType,
        message: message.trim(),
      });
      setSubmitted(true);
      setBusinessName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not send your inquiry right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#147A70] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to Browse</span>
      </button>

      {/* Block 1: Hero Introduction Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_6px_24px_rgba(91,58,41,0.08)] border border-[#5B3A29]/10 text-center space-y-3">
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#5B3A29] text-balance">
          Advertise on Miranda’s Yard Sale Finder
        </h1>
        <p className="text-sm sm:text-base text-[#5B3A29]/80 max-w-2xl mx-auto leading-relaxed">
          Connect with weekend shoppers, vintage collectors, and neighborhood
          families while they plan their Saturday morning route.
        </p>
      </div>

      {/* Block 2: 3-Column Pricing Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PRICING_TIERS.map((tier) => (
          <article
            key={tier.name}
            className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(91,58,41,0.08)] border border-[#5B3A29]/10 flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tier.accentColor}`}
                >
                  {tier.icon}
                </div>
                {tier.badgeText && (
                  <span className="px-3 py-1 rounded-full bg-[#7BC74D] text-[#233D12] text-xs font-bold">
                    {tier.badgeText}
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-display font-extrabold text-xl text-[#5B3A29]">
                  {tier.name}
                </h2>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-3xl text-[#5B3A29] tabular-nums">
                    {tier.price}
                  </span>
                  <span className="text-xs font-semibold text-[#5B3A29]/65">
                    {tier.cadence}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5B3A29]/80 leading-relaxed">
                {tier.summary}
              </p>

              <ul className="space-y-2 pt-2 border-t border-[#5B3A29]/10">
                {tier.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs sm:text-[13px] text-[#5B3A29]/90"
                  >
                    <Check
                      className="w-4 h-4 text-[#147A70] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier(tier.name)}
              className="w-full py-2.5 px-5 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] font-bold text-sm transition-colors cursor-pointer"
            >
              Inquire About {tier.name}
            </button>
          </article>
        ))}
      </div>

      {/* Block 3: Advertising Inquiry Form */}
      <div
        ref={formRef}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(91,58,41,0.08)] border border-[#5B3A29]/10 max-w-2xl mx-auto space-y-5"
      >
        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-2xl text-[#5B3A29]">
            Send an Advertising Inquiry
          </h2>
          <p className="text-sm text-[#5B3A29]/75">
            Tell us which option fits your business and our team will follow up
            with available dates and artwork specs.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl bg-[#7BC74D]/20 border border-[#7BC74D] p-5 flex items-start gap-3">
            <CheckCircle2
              className="w-6 h-6 text-[#2B4F14] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-display font-bold text-base text-[#233D12]">
                Inquiry received — thank you!
              </p>
              <p className="text-sm text-[#233D12]/85">
                We’ve saved your request for <strong>{adType}</strong> and will
                reach out shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="ad-business"
                  className="block text-sm font-bold text-[#5B3A29]"
                >
                  Business Name <span className="text-[#D93E3E]">*</span>
                </label>
                <input
                  id="ad-business"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Sunny Corner Bakery"
                  className="w-full px-4 py-2.5 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="ad-email"
                  className="block text-sm font-bold text-[#5B3A29]"
                >
                  Email Address <span className="text-[#D93E3E]">*</span>
                </label>
                <input
                  id="ad-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@business.com"
                  className="w-full px-4 py-2.5 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ad-type"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Ad Option
              </label>
              <select
                id="ad-type"
                value={adType}
                onChange={(e) => setAdType(e.target.value as AdTierType)}
                className="w-full px-4 py-2.5 text-sm bg-[#FFF8E7] text-[#5B3A29] rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30 cursor-pointer"
              >
                <option value="Banner Ad">Banner Ad ($29/week)</option>
                <option value="Sponsored Listing">
                  Sponsored Listing ($19/week)
                </option>
                <option value="Featured Listing">
                  Featured Listing ($12/sale)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ad-message"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Message <span className="text-[#D93E3E]">*</span>
              </label>
              <textarea
                id="ad-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your target cities, dates, or promotion..."
                className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
              />
            </div>

            {errorMsg && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#D93E3E] hover:bg-[#C23232] disabled:opacity-60 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Sending Inquiry...' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
