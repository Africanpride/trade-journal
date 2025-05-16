// lib/mongodb.ts
import { MongoClient } from 'mongodb';

declare global {
  var _mongoClient: MongoClient | undefined;
}

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/trade_journal';
if (!MONGO_URI) throw new Error('Define MONGO_URI env var');

/**
 * Get a connected MongoClient.
 * Reuses a global instance in development to avoid multiple connections.
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (global._mongoClient) {
    return global._mongoClient;
  }
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('✅ Connected to MongoDB');
  global._mongoClient = client;
  return client;
}