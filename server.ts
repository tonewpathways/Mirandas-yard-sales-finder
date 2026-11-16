import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createAdInquiryRecord,
  createYardSale,
  getActiveYardSales,
  getOrCreateUser,
} from './src/db/queries.ts';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import type { AdTierType, NewYardSaleInput } from './src/types/yardSale.ts';
import { isPastDate } from './src/utils/dateUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow compressed JPEG Data URL uploads up to 5 MB
app.use(express.json({ limit: '5mb' }));

/**
 * GET /api/listings
 * Public endpoint returning all upcoming (non-expired) yard sales from PostgreSQL.
 */
app.get('/api/listings', async (_req, res) => {
  try {
    const listings = await getActiveYardSales();
    res.json({ listings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load yard sales.';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/listings
 * Protected endpoint requiring a valid Firebase ID token.
 * Syncs the authenticated user in PostgreSQL and inserts the new yard sale.
 */
app.post('/api/listings', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const body = req.body as Partial<NewYardSaleInput>;
    if (
      !body.title?.trim() ||
      !body.date ||
      !body.startTime ||
      !body.endTime ||
      !body.streetAddress?.trim() ||
      !body.city?.trim() ||
      !body.state ||
      !body.zip?.trim() ||
      !body.description?.trim() ||
      !body.photoUrl
    ) {
      return res.status(400).json({ error: 'Please complete all required yard sale fields.' });
    }

    if (isPastDate(body.date)) {
      return res.status(400).json({ error: 'Yard sale dates cannot be in the past.' });
    }

    const dbUser = await getOrCreateUser(
      req.user.uid,
      req.user.email || `${req.user.uid}@users.local`,
      typeof req.user.name === 'string' ? req.user.name : undefined
    );

    const created = await createYardSale(dbUser.id, body as NewYardSaleInput);
    res.status(201).json({ listing: created });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to publish yard sale.';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/inquiries
 * Saves an advertising inquiry submission to PostgreSQL.
 */
app.post('/api/inquiries', async (req, res) => {
  try {
    const body = req.body as {
      businessName?: string;
      email?: string;
      adType?: AdTierType;
      message?: string;
    };

    if (
      !body.businessName?.trim() ||
      !body.email?.trim() ||
      !body.adType ||
      !body.message?.trim()
    ) {
      return res.status(400).json({ error: 'Please complete all required inquiry fields.' });
    }

    const inquiry = await createAdInquiryRecord({
      businessName: body.businessName,
      email: body.email,
      adType: body.adType,
      message: body.message,
    });

    res.status(201).json({ inquiry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit inquiry.';
    res.status(500).json({ error: message });
  }
});

// Mount Vite dev middleware in development, or serve built assets in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distDir = path.resolve(__dirname, 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
