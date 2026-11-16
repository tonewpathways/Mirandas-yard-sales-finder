import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LogIn,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { US_STATES } from '../data/usStates';
import { NewYardSaleInput, YardSaleListing } from '../types/yardSale';
import { getTodayLocalDateStr, isPastDate } from '../utils/dateUtils';
import { compressAndResizeImage } from '../utils/imageUtils';

interface PostSaleViewProps {
  onBack: () => void;
  onCreateListing: (input: NewYardSaleInput) => Promise<YardSaleListing>;
}

interface FormErrors {
  title?: string;
  date?: string;
  time?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  photoUrl?: string;
  description?: string;
  contactEmail?: string;
}

const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Full-page form allowing users to publish a new yard sale.
 * Includes client-side image compression, past-date prevention, live character counting,
 * friendly validation messages, and an immediate success confirmation view.
 */
export const PostSaleView: React.FC<PostSaleViewProps> = ({
  onBack,
  onCreateListing,
}) => {
  const {
    user,
    isAuthLoading,
    authError,
    signInWithGoogle,
    signOutUser,
    clearAuthError,
  } = useAuth();
  const todayStr = getTodayLocalDateStr();

  // Form field states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Validation and submission feedback state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedListing, setSubmittedListing] =
    useState<YardSaleListing | null>(null);

  /**
   * Handles image file selection, compresses/resizes the photo via Canvas,
   * and updates the preview Data URL.
   */
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors((prev) => ({ ...prev, photoUrl: undefined }));
    setIsProcessingPhoto(true);
    try {
      const compressed = await compressAndResizeImage(file, 960, 0.78);
      setPhotoUrl(compressed);
      setPhotoName(file.name);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        photoUrl:
          err instanceof Error
            ? err.message
            : 'Could not load that photo. Please try a JPG or PNG image.',
      }));
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  /**
   * Validates all required fields, past-date checks, time ordering, ZIP format,
   * description length, and optional email format.
   */
  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (!title.trim()) {
      next.title = 'Please enter a catchy title for your yard sale.';
    } else if (title.trim().length < 4) {
      next.title = 'Title should be at least 4 characters long.';
    }

    if (!date) {
      next.date = 'Please pick the date of your yard sale.';
    } else if (isPastDate(date)) {
      next.date =
        'Yard sale dates cannot be in the past. Please choose today or a future date.';
    }

    if (!startTime || !endTime) {
      next.time = 'Please set both a start and end time.';
    } else if (endTime <= startTime) {
      next.time = 'End time must be later than start time.';
    }

    if (!streetAddress.trim()) {
      next.streetAddress = 'Please enter the street address for shoppers.';
    }
    if (!city.trim()) {
      next.city = 'Please enter your city.';
    }
    if (!state) {
      next.state = 'Please select your state.';
    }
    if (!/^\d{5}$/.test(zip.trim())) {
      next.zip = 'Please enter a valid 5-digit ZIP code.';
    }

    if (!photoUrl) {
      next.photoUrl = 'Please upload a photo of your sale items or setup.';
    }

    if (!description.trim()) {
      next.description =
        'Tell shoppers what treasures you’re selling (furniture, kids clothes, books, etc.).';
    } else if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      next.description = `Please keep your description under ${MAX_DESCRIPTION_LENGTH} characters.`;
    }

    if (
      contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())
    ) {
      next.contactEmail = 'Please enter a valid email address or leave it blank.';
    }

    return next;
  };

  /**
   * Runs validation, uploads the compressed photo & listing to storage,
   * and shows either a confirmation view or a friendly error banner.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!user) {
      setSubmitError('Please sign in with Google above before publishing your yard sale.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const created = await onCreateListing({
        title,
        date,
        startTime,
        endTime,
        streetAddress,
        city,
        state,
        zip,
        description,
        photoUrl,
        contactEmail,
        contactPhone,
      });
      setSubmittedListing(created);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Could not publish your yard sale right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Clears all form fields so the user can post another sale consecutively.
   */
  const handleResetForm = () => {
    setTitle('');
    setDate(todayStr);
    setStartTime('08:00');
    setEndTime('14:00');
    setStreetAddress('');
    setCity('');
    setState('');
    setZip('');
    setPhotoUrl('');
    setPhotoName('');
    setDescription('');
    setContactEmail('');
    setContactPhone('');
    setErrors({});
    setSubmitError('');
    setSubmittedListing(null);
  };

  // Block 1: Post-Submission Success Confirmation State
  if (submittedListing) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(91,58,41,0.09)] border border-[#7BC74D]/40 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#7BC74D] text-[#233D12] mx-auto flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#5B3A29]">
              Your Yard Sale Is Live!
            </h1>
            <p className="text-sm sm:text-base text-[#5B3A29]/80 max-w-md mx-auto">
              <strong className="text-[#5B3A29]">
                {submittedListing.title}
              </strong>{' '}
              in {submittedListing.city}, {submittedListing.state} has been added
              to the browse feed right away.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              Browse All Yard Sales
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-6 py-3 rounded-full bg-[#FFF8E7] hover:bg-[#5B3A29]/10 text-[#5B3A29] font-bold text-sm border border-[#5B3A29]/15 transition-colors cursor-pointer"
            >
              Post Another Sale
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Block 2: Yard Sale Submission Form
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#147A70] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to Browse</span>
      </button>

      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-[0_6px_24px_rgba(91,58,41,0.08)] border border-[#5B3A29]/10 space-y-6">
        <div className="space-y-1.5 border-b border-[#5B3A29]/10 pb-5">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#5B3A29]">
            Post a Yard Sale
          </h1>
          <p className="text-sm text-[#5B3A29]/75">
            List your upcoming yard, garage, moving, or estate sale for free so
            local neighbors can find it.
          </p>
        </div>

        {/* Google Sign-In Gate / Authenticated Poster Bar */}
        {!isAuthLoading &&
          (user ? (
            <div className="rounded-2xl bg-[#7BC74D]/15 border border-[#7BC74D]/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#233D12]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#2B4F14]" aria-hidden="true" />
                <span>
                  Posting as{' '}
                  <strong>{user.displayName || user.email || 'Verified Host'}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="text-xs font-bold text-[#147A70] hover:underline cursor-pointer"
              >
                Switch account
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FFF8E7] border border-[#FFC93C] p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-display font-bold text-base text-[#5B3A29]">
                    Sign in with Google to publish
                  </p>
                  <p className="text-xs sm:text-sm text-[#5B3A29]/80">
                    Quick one-click sign-in keeps neighborhood yard sale listings
                    authentic and spam-free.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitError('');
                    clearAuthError();
                    void signInWithGoogle();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFC93C] hover:bg-[#F5BA24] text-[#5B3A29] text-sm font-bold whitespace-nowrap shrink-0 shadow-sm transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Continue with Google</span>
                </button>
              </div>
              {authError && (
                <p
                  role="alert"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{authError}</span>
                </p>
              )}
            </div>
          ))}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Sale Title Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="sale-title"
              className="block text-sm font-bold text-[#5B3A29]"
            >
              Sale Title <span className="text-[#D93E3E]">*</span>
            </label>
            <input
              id="sale-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Huge Saturday Moving Sale — Furniture, Books & Plants"
              className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
            />
            {errors.title && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Date, Start Time, and End Time Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="sale-date"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Date <span className="text-[#D93E3E]">*</span>
              </label>
              <input
                id="sale-date"
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
              />
              {errors.date && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sale-start-time"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Start Time <span className="text-[#D93E3E]">*</span>
              </label>
              <input
                id="sale-start-time"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sale-end-time"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                End Time <span className="text-[#D93E3E]">*</span>
              </label>
              <input
                id="sale-end-time"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
              />
            </div>
          </div>
          {errors.time && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E] -mt-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.time}</span>
            </p>
          )}

          {/* Street Address, City, State & 5-Digit ZIP Inputs */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="sale-street"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Street Address <span className="text-[#D93E3E]">*</span>
              </label>
              <input
                id="sale-street"
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. 742 Maple Blossom Lane"
                className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
              />
              {errors.streetAddress && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.streetAddress}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <label
                  htmlFor="sale-city"
                  className="block text-sm font-bold text-[#5B3A29]"
                >
                  City <span className="text-[#D93E3E]">*</span>
                </label>
                <input
                  id="sale-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
                />
                {errors.city && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label
                  htmlFor="sale-state"
                  className="block text-sm font-bold text-[#5B3A29]"
                >
                  State <span className="text-[#D93E3E]">*</span>
                </label>
                <select
                  id="sale-state"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30 cursor-pointer"
                >
                  <option value="">Select state...</option>
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.state}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-1 space-y-1.5">
                <label
                  htmlFor="sale-zip"
                  className="block text-sm font-bold text-[#5B3A29]"
                >
                  ZIP <span className="text-[#D93E3E]">*</span>
                </label>
                <input
                  id="sale-zip"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  required
                  value={zip}
                  onChange={(e) =>
                    setZip(e.target.value.replace(/\D/g, '').slice(0, 5))
                  }
                  placeholder="97205"
                  className="w-full px-3.5 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30 tabular-nums"
                />
                {errors.zip && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.zip}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Photo Upload Dropzone with Preview & Replace/Remove Controls */}
          <div className="space-y-2">
            <label
              htmlFor="sale-photo"
              className="block text-sm font-bold text-[#5B3A29]"
            >
              Yard Sale Photo <span className="text-[#D93E3E]">*</span>
            </label>

            {!photoUrl ? (
              <label
                htmlFor="sale-photo"
                className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#2EC4B6] bg-[#FFF8E7]/70 hover:bg-[#FFF8E7] p-8 text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2EC4B6]/20 text-[#147A70] flex items-center justify-center">
                  <ImagePlus className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-[#5B3A29]">
                  {isProcessingPhoto
                    ? 'Optimizing your photo...'
                    : 'Click to upload a photo of your sale'}
                </p>
                <p className="text-xs text-[#5B3A29]/65">
                  Image files only (JPG, PNG, WebP). Large photos are resized
                  automatically.
                </p>
                <input
                  id="sale-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-[#5B3A29]/15 bg-[#FFF8E7]">
                <img
                  src={photoUrl}
                  alt="Uploaded yard sale preview"
                  className="w-full max-h-72 object-cover"
                />
                <div className="p-3 bg-white flex items-center justify-between gap-3 border-t border-[#5B3A29]/10">
                  <span className="text-xs font-semibold text-[#5B3A29] truncate">
                    {photoName || 'Uploaded photo'}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <label
                      htmlFor="sale-photo-replace"
                      className="px-3 py-1.5 rounded-full bg-[#FFF8E7] hover:bg-[#FFC93C]/50 text-[#5B3A29] text-xs font-bold cursor-pointer transition-colors"
                    >
                      Replace
                      <input
                        id="sale-photo-replace"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setPhotoName('');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D93E3E]/10 hover:bg-[#D93E3E]/20 text-[#D93E3E] text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.photoUrl && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.photoUrl}</span>
              </p>
            )}
          </div>

          {/* Multi-Line Description with Live Character Counter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="sale-description"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Items &amp; Details <span className="text-[#D93E3E]">*</span>
              </label>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  description.length > MAX_DESCRIPTION_LENGTH * 0.9
                    ? 'text-[#D93E3E]'
                    : 'text-[#5B3A29]/65'
                }`}
              >
                {description.length} / {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              id="sale-description"
              rows={5}
              required
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="List the highlights! For example: oak dining table, kids bicycles, vintage vinyl records, kitchenware, garden pots, early bird notes, Venmo/cash accepted..."
              className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30 leading-relaxed"
            />
            {errors.description && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Optional Contact Email & Phone Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label
                htmlFor="sale-email"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Contact Email{' '}
                <span className="font-normal text-[#5B3A29]/60">(optional)</span>
              </label>
              <input
                id="sale-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
              />
              {errors.contactEmail && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D93E3E]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.contactEmail}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sale-phone"
                className="block text-sm font-bold text-[#5B3A29]"
              >
                Contact Phone{' '}
                <span className="font-normal text-[#5B3A29]/60">(optional)</span>
              </label>
              <input
                id="sale-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 text-sm bg-[#FFF8E7] text-[#5B3A29] placeholder:text-[#5B3A29]/45 rounded-2xl border border-[#5B3A29]/15 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/30"
              />
            </div>
          </div>

          {/* Submission Error Alert */}
          {submitError && (
            <div
              role="alert"
              className="rounded-2xl bg-[#D93E3E]/10 border border-[#D93E3E]/30 px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#D93E3E]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Cancel / Submit Action Row */}
          <div className="pt-3 flex flex-wrap items-center justify-end gap-3 border-t border-[#5B3A29]/10">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-[#FFF8E7] hover:bg-[#5B3A29]/10 disabled:opacity-60 text-[#5B3A29] font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessingPhoto || isSubmitting}
              className="px-7 py-3 rounded-full bg-[#D93E3E] hover:bg-[#C23232] disabled:opacity-60 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Yard Sale'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
