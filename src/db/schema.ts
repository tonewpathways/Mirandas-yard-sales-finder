import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Authenticated application users synchronized from Firebase Auth.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Yard sale listings stored in PostgreSQL.
 * `userId` links user-created listings to the posting user; nullable for initial seeded samples.
 */
export const yardSales = pgTable('yard_sales', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  date: text('date').notNull(), // Local calendar date formatted as YYYY-MM-DD
  startTime: text('start_time').notNull(), // 24-hour HH:mm
  endTime: text('end_time').notNull(), // 24-hour HH:mm
  streetAddress: text('street_address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(), // 2-letter US state code
  zip: text('zip').notNull(),
  description: text('description').notNull(),
  photoUrl: text('photo_url').notNull(),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Advertiser lead inquiries submitted from the Advertise page.
 */
export const adInquiries = pgTable('ad_inquiries', {
  id: serial('id').primaryKey(),
  businessName: text('business_name').notNull(),
  email: text('email').notNull(),
  adType: text('ad_type').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  yardSales: many(yardSales),
}));

export const yardSalesRelations = relations(yardSales, ({ one }) => ({
  author: one(users, {
    fields: [yardSales.userId],
    references: [users.id],
  }),
}));
