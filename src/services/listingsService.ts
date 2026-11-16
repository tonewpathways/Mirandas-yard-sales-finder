import type { AdInquiry, NewYardSaleInput, YardSaleListing } from '../types/yardSale';
import { isPastDate } from '../utils/dateUtils';

/**
 * Data-access contract for listings and advertising inquiries.
 * Keeps UI components decoupled from the underlying HTTP/SQL transport.
 */
export interface ListingsRepository {
  getActiveListings(): Promise<YardSaleListing[]>;
  createListing(input: NewYardSaleInput, idToken: string): Promise<YardSaleListing>;
  submitAdInquiry(
    inquiry: Omit<AdInquiry, 'id' | 'submittedAt'>
  ): Promise<AdInquiry>;
}

/**
 * Extracts a human-readable error message from a failed JSON API response.
 */
async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    // Response body wasn't JSON; fall back to default message
  }
  return fallback;
}

/**
 * Full-stack API repository communicating with the Express + Cloud SQL PostgreSQL
 * backend endpoints (/api/listings and /api/inquiries).
 */
class ApiListingsRepository implements ListingsRepository {
  /**
   * Fetches all active (non-expired) yard sale listings from PostgreSQL via Express
   * and applies a local calendar-date guard so expired sales never appear.
   */
  async getActiveListings(): Promise<YardSaleListing[]> {
    const response = await fetch('/api/listings', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        await readApiError(
          response,
          'Unable to load yard sales right now. Please try again.'
        )
      );
    }

    const data = (await response.json()) as { listings?: YardSaleListing[] };
    const items = Array.isArray(data.listings) ? data.listings : [];
    return items.filter((item) => !isPastDate(item.date));
  }

  /**
   * Publishes a new yard sale to PostgreSQL via the authenticated POST /api/listings route.
   * Requires a valid Firebase ID token sent in the Authorization Bearer header.
   */
  async createListing(
    input: NewYardSaleInput,
    idToken: string
  ): Promise<YardSaleListing> {
    if (!idToken) {
      throw new Error('Please sign in with Google to publish a yard sale.');
    }

    const response = await fetch('/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(
        await readApiError(
          response,
          'Could not publish your yard sale right now. Please try again.'
        )
      );
    }

    const data = (await response.json()) as { listing: YardSaleListing };
    return data.listing;
  }

  /**
   * Submits an advertiser inquiry to PostgreSQL via POST /api/inquiries.
   */
  async submitAdInquiry(
    inquiry: Omit<AdInquiry, 'id' | 'submittedAt'>
  ): Promise<AdInquiry> {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(inquiry),
    });

    if (!response.ok) {
      throw new Error(
        await readApiError(
          response,
          'Could not send your inquiry right now. Please try again.'
        )
      );
    }

    const data = (await response.json()) as { inquiry: AdInquiry };
    return data.inquiry;
  }
}

export const listingsService: ListingsRepository = new ApiListingsRepository();
