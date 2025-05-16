import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Collection } from 'mongodb';

const MONGO_URI =
  process.env.MONGO_URI ?? 'mongodb://localhost:27017/trade_journal';

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable.');
}

// ——— Global cached variables to reuse client across requests ———
let cachedClient: MongoClient | null = null;
let cachedCollection: Collection | null = null;

async function getCollection() {
  if (cachedCollection) return cachedCollection;

  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URI);
    await cachedClient.connect();
    console.log('✅ Connected to MongoDB');
  }

  const db = cachedClient.db();
  cachedCollection = db.collection('trades');
  return cachedCollection;
}

// ——— Common CORS headers ———
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept',
};

// ——— Handle preflight ———
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}

// ——— GET /api/journal ———
export async function GET(req: NextRequest) {
  try {
    const coll = await getCollection();
    const all = await coll.find().sort({ _id: -1 }).toArray();

    return NextResponse.json(all, {
      headers: {
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json(
      { error: 'DB fetch failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ——— POST /api/journal ———
export async function POST(req: NextRequest) {
  try {
    const trade = await req.json();

    // basic JSON parse error handling
    if (typeof trade !== 'object' || trade === null) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const coll = await getCollection();
    const result = await coll.updateOne(
      { ticket: (trade as any).ticket },
      { $set: trade },
      { upsert: true }
    );

    return NextResponse.json(
      {
        status: 'ok',
        operation: result.upsertedCount ? 'inserted' : 'updated',
        ticket: (trade as any).ticket,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    if (err.type === 'entity.parse.failed') {
      console.error('Invalid JSON received:', err.message);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    console.error('Upsert error:', err);
    return NextResponse.json(
      { error: 'DB upsert failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
