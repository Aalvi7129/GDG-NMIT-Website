import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { CONTENT_SECTIONS, describeIssues, SECTION_SCHEMAS, type ContentSection } from "@/lib/content/schema";
import { saveSection } from "@/lib/content/store";

const MAX_BODY_BYTES = 256 * 1024;

function isSection(value: string): value is ContentSection {
  return (CONTENT_SECTIONS as readonly string[]).includes(value);
}

/** Parsed JSON, or undefined when the body isn't valid JSON (zod then rejects it). */
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Replace one section of site content (currently only domains). */
export async function PUT(request: NextRequest, context: { params: Promise<{ section: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { section } = await context.params;
  if (!isSection(section)) return NextResponse.json({ error: "Unknown section." }, { status: 404 });
  // Measure the body itself: a chunked upload has no Content-Length to check.
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That's too much data in one save." }, { status: 413 });
  }

  const body: unknown = parseJson(raw);
  const result = SECTION_SCHEMAS[section].safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Some fields need fixing.", issues: describeIssues(result.error) }, { status: 400 });
  }

  try {
    await saveSection(section, result.data);
  } catch (error) {
    console.error(`Saving "${section}" failed:`, error);
    return NextResponse.json({ error: "Couldn't reach the database. Nothing was saved." }, { status: 503 });
  }

  revalidatePath("/domain");
  console.info(`Admin saved "${section}" content at ${new Date().toISOString()}`);
  return NextResponse.json({ ok: true });
}
