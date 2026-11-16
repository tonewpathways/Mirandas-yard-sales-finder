import { asc, gte } from 'drizzle-orm';
import { estimateCoordsForLocation } from '../data/usStates.ts';
import type { AdTierType, NewYardSaleInput, YardSaleListing } from '../types/yardSale.ts';
import { addDaysToDateStr, getTodayLocalDateStr } from '../utils/dateUtils.ts';
import { db } from './index.ts';
import { adInquiries, users, yardSales } from './schema.ts';

/**
 * Builds the 12 initial sample yard sale rows using public /assets/images/* URLs
 * so the PostgreSQL database never requires static image imports on the server.
 */
function buildInitialSeedRows(today: string) {
  return [
    {
      title: 'Mid-Century Furniture, Brass Lamps & Framed Botanicals',
      date: today,
      startTime: '08:00',
      endTime: '14:00',
      streetAddress: '1428 NW Flanders St',
      city: 'Portland',
      state: 'OR',
      zip: '97205',
      description:
        'Downsizing after 15 years in our Craftsman bungalow! Selling a matching set of four walnut dining chairs, vintage brass table lamps, woven wool area rugs, framed fern prints, oak end tables, and assorted home decor. Cash and Venmo welcome. Early birds kindly wait until 8 AM!',
      photoUrl: '/assets/images/sale_vintage_furniture_1794772031093.jpg',
      contactEmail: 'claire.bennett@example.com',
      isFeatured: true,
      lat: 45.5231,
      lng: -122.6765,
    },
    {
      title: 'Sunny Patio Plant Swap & Garden Tool Sale',
      date: today,
      startTime: '09:00',
      endTime: '15:00',
      streetAddress: '2107 Barton Hills Dr',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
      description:
        'Over 60 healthy potted ferns, herbs, succulents, and terracotta planters looking for new sunny windowsills! Also clearing out galvanized watering cans, sturdy garden spades, rakes, ceramic plant stands, and two wrought-iron patio bistro chairs.',
      photoUrl: '/assets/images/sale_garden_plants_1794772032155.jpg',
      contactPhone: '(512) 555-0148',
      isFeatured: true,
      lat: 30.2455,
      lng: -97.7688,
    },
    {
      title: 'Kids Bikes, Classic Board Games & Wooden Toys',
      date: addDaysToDateStr(today, 1),
      startTime: '08:30',
      endTime: '13:30',
      streetAddress: '842 Oakridge Ave',
      city: 'Columbus',
      state: 'OH',
      zip: '43214',
      description:
        'Kids have outgrown their favorite gear! Four clean kids bicycles (12-inch to 20-inch with training wheels included), classic board games with all pieces accounted for, wooden train tracks, rocking horse, and gently loved plush animals.',
      photoUrl: '/assets/images/sale_kids_toys_bikes_1794772031126.jpg',
      contactEmail: 'millerfamily@example.com',
      isFeatured: false,
      lat: 40.0468,
      lng: -83.0199,
    },
    {
      title: 'Vinyl Records, Vintage Stereos & Paperback Library',
      date: addDaysToDateStr(today, 1),
      startTime: '09:00',
      endTime: '16:00',
      streetAddress: '315 Merrimon Ave',
      city: 'Asheville',
      state: 'NC',
      zip: '28801',
      description:
        'Crate diggers welcome! 400+ classic rock, jazz, and folk LPs priced $3–$10, two serviced silver-face 1970s stereo receivers, a direct-drive turntable, and hundreds of mystery novels, Agatha Christie paperbacks, and vintage hardcovers.',
      photoUrl: '/assets/images/sale_vinyl_books_1794772031416.jpg',
      contactEmail: 'soundandpages@example.com',
      isFeatured: false,
      lat: 35.5951,
      lng: -82.5515,
    },
    {
      title: 'Farmhouse Kitchen Estate Sale: Cast Iron & Copper',
      date: addDaysToDateStr(today, 2),
      startTime: '08:00',
      endTime: '14:00',
      streetAddress: '1122 Spruce St',
      city: 'Boulder',
      state: 'CO',
      zip: '80302',
      description:
        'Estate kitchen cleanout with seasoned cast iron skillets, an heirloom copper tea kettle, floral porcelain dinnerware sets, vintage Ball mason jars, wooden spoons, and hand-embroidered table linens. Everything priced to move!',
      photoUrl: '/assets/images/sale_kitchen_ceramics_1794772031273.jpg',
      contactPhone: '(303) 555-0192',
      isFeatured: false,
      lat: 40.015,
      lng: -105.2705,
    },
    {
      title: 'Vintage Denim, Summer Dresses & Leather Handbags',
      date: addDaysToDateStr(today, 3),
      startTime: '09:30',
      endTime: '15:00',
      streetAddress: '450 4th St N',
      city: 'St. Petersburg',
      state: 'FL',
      zip: '33701',
      description:
        'Closet purge from three stylish roommates! Curated racks of vintage Levi denim jackets, floral midi dresses (sizes XS–XL), genuine leather crossbody bags, silk scarves, and woven sun hats. Mirrors available to try items on.',
      photoUrl: '/assets/images/sale_clothing_boutique_1794772036578.jpg',
      isFeatured: false,
      lat: 27.7676,
      lng: -82.6403,
    },
    {
      title: 'Woodworker Garage Cleanout: Planes, Drills & Ladders',
      date: addDaysToDateStr(today, 4),
      startTime: '07:30',
      endTime: '13:00',
      streetAddress: '6740 Petaluma Hill Rd',
      city: 'Sebastopol',
      state: 'CA',
      zip: '95472',
      description:
        'Retiring carpenter clearing out the shop! Heavy-duty red rolling tool chests, antique Stanley hand planes, cordless power drills with extra batteries, aluminum extension ladders, Coleman camping lanterns, and extension cords.',
      photoUrl: '/assets/images/sale_tools_workshop_1794772033828.jpg',
      contactPhone: '(707) 555-0164',
      isFeatured: false,
      lat: 38.4021,
      lng: -122.8239,
    },
    {
      title: 'Multi-Family Antiques, Clocks & Polaroid Cameras',
      date: addDaysToDateStr(today, 5),
      startTime: '08:00',
      endTime: '15:00',
      streetAddress: '98 Willow Ave',
      city: 'Somerville',
      state: 'MA',
      zip: '02144',
      description:
        'Four Davis Square neighbors teaming up on the front lawn! Antique wooden wall and mantel clocks, solid brass candlesticks, working Polaroid SX-70 and Land cameras, English bone china teacups, and carved wooden jewelry boxes.',
      photoUrl: '/assets/images/sale_antiques_collectibles_1794772032599.jpg',
      contactEmail: 'willowave.sale@example.com',
      isFeatured: false,
      lat: 42.3959,
      lng: -71.1225,
    },
    {
      title: 'Camping Gear, Acoustic Guitar & Outdoor Sports',
      date: addDaysToDateStr(today, 6),
      startTime: '09:00',
      endTime: '14:30',
      streetAddress: '4112 Stone Way N',
      city: 'Seattle',
      state: 'WA',
      zip: '98103',
      description:
        'Get ready for Pacific Northwest adventures! 4-person dome tent (used twice), Osprey and Gregory hiking backpacks, folding camp chairs, Igloo coolers, trekking poles, tennis rackets, and a warm-toned dreadnought acoustic guitar.',
      photoUrl: '/assets/images/sale_sports_camping_1794772034974.jpg',
      contactEmail: 'pnwgear@example.com',
      isFeatured: false,
      lat: 47.6694,
      lng: -122.3417,
    },
    {
      title: 'Crafter Heaven: Yarn, Vintage Singer & Quilting Fabric',
      date: addDaysToDateStr(today, 6),
      startTime: '09:00',
      endTime: '15:00',
      streetAddress: '3109 Bryant Ave S',
      city: 'Minneapolis',
      state: 'MN',
      zip: '55408',
      description:
        'A maker’s dream sale on our covered porch! Crates of wool and cotton yarn skeins, fat quarter quilting fabric bundles, working vintage black Singer sewing machine in wooden case, wooden embroidery hoops, watercolors, and brushes.',
      photoUrl: '/assets/images/sale_craft_sewing_1794772036238.jpg',
      contactPhone: '(612) 555-0133',
      isFeatured: false,
      lat: 44.9481,
      lng: -93.2882,
    },
    {
      title: 'Coastal Home Moving Sale: Wicker Chairs & Artwork',
      date: addDaysToDateStr(today, 7),
      startTime: '10:00',
      endTime: '16:00',
      streetAddress: '519 Clairemont Ave',
      city: 'Decatur',
      state: 'GA',
      zip: '30030',
      description:
        'Moving cross-country next week and everything on the patio must go! Pair of woven wicker armchairs with striped cushions, handmade stoneware vases, framed coastal watercolor prints, cotton throw blankets, and ceramic table lamps.',
      photoUrl: '/assets/images/sale_home_decor_1794772034746.jpg',
      contactEmail: 'decatur.moving@example.com',
      isFeatured: false,
      lat: 33.7748,
      lng: -84.2963,
    },
    {
      title: 'Cul-de-Sac Block Sale: Holiday Decor & Baking Pans',
      date: addDaysToDateStr(today, 9),
      startTime: '08:00',
      endTime: '13:00',
      streetAddress: '1824 E Hawthorne St',
      city: 'Tucson',
      state: 'AZ',
      zip: '85719',
      description:
        'Ten households participating in our annual cul-de-sac community yard sale! Sorted bins of vintage glass holiday ornaments, warm white string lights, bundt and cake baking pans, ceramic serving platters, and much more.',
      photoUrl: '/assets/images/sale_holiday_party_1794772036828.jpg',
      isFeatured: false,
      lat: 32.2389,
      lng: -110.9574,
    },
  ];
}

function mapRowToListing(row: typeof yardSales.$inferSelect): YardSaleListing {
  return {
    id: String(row.id),
    title: row.title,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    streetAddress: row.streetAddress,
    city: row.city,
    state: row.state,
    zip: row.zip,
    description: row.description,
    photoUrl: row.photoUrl,
    contactEmail: row.contactEmail ?? undefined,
    contactPhone: row.contactPhone ?? undefined,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt.toISOString(),
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  };
}

/**
 * Registers or updates the authenticated Firebase user inside PostgreSQL.
 */
export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName ?? null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName ?? null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to sync user record:', error);
    throw new Error('Unable to verify user account. Please try again.', {
      cause: error,
    });
  }
}

/**
 * Fetches all upcoming yard sales (date >= today) from PostgreSQL.
 * If no active listings exist yet, seeds the 12 initial sample sales idempotently.
 */
export async function getActiveYardSales(): Promise<YardSaleListing[]> {
  try {
    const todayStr = getTodayLocalDateStr();
    let rows = await db
      .select()
      .from(yardSales)
      .where(gte(yardSales.date, todayStr))
      .orderBy(asc(yardSales.date), asc(yardSales.startTime));

    if (rows.length === 0) {
      const existingAny = await db.select({ id: yardSales.id }).from(yardSales).limit(1);
      if (existingAny.length === 0) {
        const seedRows = buildInitialSeedRows(todayStr);
        await db.insert(yardSales).values(seedRows);
        rows = await db
          .select()
          .from(yardSales)
          .where(gte(yardSales.date, todayStr))
          .orderBy(asc(yardSales.date), asc(yardSales.startTime));
      }
    }

    return rows.map(mapRowToListing);
  } catch (error) {
    console.error('Failed to fetch yard sales from PostgreSQL:', error);
    throw new Error('Unable to load yard sales right now. Please try again.', {
      cause: error,
    });
  }
}

/**
 * Inserts a new yard sale listing linked to the authenticated PostgreSQL user.
 */
export async function createYardSale(
  userId: number,
  input: NewYardSaleInput
): Promise<YardSaleListing> {
  try {
    const coords = estimateCoordsForLocation(input.zip, input.state);

    const [created] = await db
      .insert(yardSales)
      .values({
        userId,
        title: input.title.trim(),
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        streetAddress: input.streetAddress.trim(),
        city: input.city.trim(),
        state: input.state,
        zip: input.zip.trim(),
        description: input.description.trim(),
        photoUrl: input.photoUrl,
        contactEmail: input.contactEmail?.trim() || null,
        contactPhone: input.contactPhone?.trim() || null,
        isFeatured: Boolean(input.isFeatured),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      })
      .returning();

    return mapRowToListing(created);
  } catch (error) {
    console.error('Failed to create yard sale in PostgreSQL:', error);
    throw new Error('Unable to save your yard sale right now. Please try again.', {
      cause: error,
    });
  }
}

/**
 * Inserts an advertiser inquiry submission into PostgreSQL.
 */
export async function createAdInquiryRecord(input: {
  businessName: string;
  email: string;
  adType: AdTierType;
  message: string;
}) {
  try {
    const [created] = await db
      .insert(adInquiries)
      .values({
        businessName: input.businessName.trim(),
        email: input.email.trim(),
        adType: input.adType,
        message: input.message.trim(),
      })
      .returning();

    return {
      id: String(created.id),
      businessName: created.businessName,
      email: created.email,
      adType: created.adType as AdTierType,
      message: created.message,
      submittedAt: created.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Failed to save ad inquiry in PostgreSQL:', error);
    throw new Error('Unable to submit your inquiry right now. Please try again.', {
      cause: error,
    });
  }
}
