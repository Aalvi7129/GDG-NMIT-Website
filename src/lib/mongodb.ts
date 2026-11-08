import { MongoClient } from 'mongodb';

// One shared database connection for the whole server. It lives on globalThis
// so the dev server's hot reloads reuse it instead of opening (and leaking) a
// new connection pool on every code change, which used to stall pages for
// seconds. A failed connection is forgotten, so the next request retries.
// src/instrumentation.ts opens it as soon as the server starts.

const uri = process.env.MONGODB_URI;
const TIMEOUT_MS = 5000;

const globalForMongo = globalThis as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };

export async function connectToDatabase() {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: TIMEOUT_MS, connectTimeoutMS: TIMEOUT_MS });
    globalForMongo._mongoClientPromise = client.connect().catch((error: unknown) => {
      globalForMongo._mongoClientPromise = undefined;
      throw error;
    });
  }

  return { client: await globalForMongo._mongoClientPromise };
}
