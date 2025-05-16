// app/api/journal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient();
    const coll = client.db().collection('trades');
    const all = await coll.find().sort({ _id: -1 }).toArray();
    return NextResponse.json(all, { headers: CORS });
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: 'DB fetch failed' }, { status: 500, headers: CORS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const trade = await req.json();
    if (typeof trade !== 'object' || trade === null) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS });
    }
    const client = await getMongoClient();
    const coll = client.db().collection('trades');
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
      { headers: CORS }
    );
  } catch (err: any) {
    console.error('Upsert error:', err);
    return NextResponse.json({ error: 'DB upsert failed' }, { status: 500, headers: CORS });
  }
}
