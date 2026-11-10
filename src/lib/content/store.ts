// Server-only: loads and saves admin-edited content in MongoDB. Any problem
// (no database, slow database, bad saved data) falls back to the defaults in
// src/data so the public site always renders.

import { connectToDatabase } from "@/lib/mongodb";
import {
  CONTENT_SECTIONS,
  DEFAULT_CONTENT,
  domainsContentSchema,
  mergeDomains,
  type ContentSection,
  type SiteContent,
} from "./schema";

const COLLECTION = "site_content";
// The dev server compiles pages on demand and can stall for seconds while it
// does, which used to trip this timer even though the database was fine.
// Production keeps a short wait before falling back to the defaults.
const DB_TIMEOUT_MS = process.env.NODE_ENV === "development" ? 15_000 : 4000;

interface ContentDoc {
  _id: ContentSection;
  data: unknown;
  updatedAt: Date;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Database did not answer within ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function collection() {
  const { client } = await withTimeout(connectToDatabase(), DB_TIMEOUT_MS);
  return client.db().collection<ContentDoc>(COLLECTION);
}

/** Saved content merged over the defaults. Never throws. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const docs = await withTimeout((await collection()).find({ _id: { $in: [...CONTENT_SECTIONS] } }).toArray(), DB_TIMEOUT_MS);
    const saved = new Map(docs.map((doc) => [doc._id, doc.data]));

    const domains = domainsContentSchema.safeParse(saved.get("domains"));
    if (saved.has("domains") && !domains.success) console.error('Saved "domains" content is invalid; using defaults.', domains.error.issues);

    return {
      domains: domains.success ? mergeDomains(domains.data) : DEFAULT_CONTENT.domains,
    };
  } catch (error) {
    console.error("Could not load site content; using defaults.", error);
    return DEFAULT_CONTENT;
  }
}

/** Store one already-validated section. Throws if the database is unavailable. */
export async function saveSection(section: ContentSection, data: unknown): Promise<void> {
  await withTimeout(
    (await collection()).updateOne({ _id: section }, { $set: { data, updatedAt: new Date() } }, { upsert: true }),
    DB_TIMEOUT_MS,
  );
}
