/**
 * Top-level view states representing the three primary pages in the app.
 */
export type AppView = 'browse' | 'post' | 'advertise';

/**
 * Available date filter presets in the Browse sidebar.
 */
export type DateFilterOption = 'all' | 'today' | 'weekend' | 'next7' | 'custom';

/**
 * Supported sort orders for the yard sale feed.
 */
export type SortOption = 'soonest' | 'newest';

/**
 * Advertising tiers displayed on the Advertise page and inquiry form.
 */
export type AdTierType = 'Banner Ad' | 'Sponsored Listing' | 'Featured Listing';

/**
 * Core data model for a single yard sale listing stored in the app.
 */
export interface YardSaleListing {
  id: string;
  title: string;
  date: string; // Local calendar date formatted as YYYY-MM-DD
  startTime: string; // 24-hour start time formatted as HH:mm
  endTime: string; // 24-hour end time formatted as HH:mm
  streetAddress: string;
  city: string;
  state: string; // Two-letter US state abbreviation (e.g., "OR")
  zip: string; // 5-digit US postal code
  description: string;
  photoUrl: string; // Imported asset URL or compressed base64 Data URL
  contactEmail?: string;
  contactPhone?: string;
  isFeatured?: boolean; // Pins listing to top of feed with a Featured badge
  createdAt: string; // ISO 8601 timestamp used for "Newest Posted" sorting
  lat?: number; // Optional latitude for radius distance filtering
  lng?: number; // Optional longitude for radius distance filtering
}

/**
 * Payload submitted by the "Post a Yard Sale" form before ID/timestamp assignment.
 */
export interface NewYardSaleInput {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  photoUrl: string;
  contactEmail?: string;
  contactPhone?: string;
  isFeatured?: boolean;
}

/**
 * Active filter values controlled by the top search bar and FilterSidebar.
 */
export interface FilterState {
  keyword: string;
  state: string;
  cityOrZip: string;
  dateFilter: DateFilterOption;
  customDate: string;
  maxDistanceMiles: number | null;
}

/**
 * Data record saved when an advertiser submits the inquiry form.
 */
export interface AdInquiry {
  id: string;
  businessName: string;
  email: string;
  adType: AdTierType;
  message: string;
  submittedAt: string;
}
