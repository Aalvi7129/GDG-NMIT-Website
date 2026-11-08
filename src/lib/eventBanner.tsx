import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { connectToDatabase } from "./mongodb";

/**
 * Link-preview banner for /upcomingevent, drawn as an event ticket.
 * Shows the next upcoming event from the database (name, date, venue), so the
 * card updates by itself when a new event is added. If there's no upcoming
 * event, or the database can't be reached, it falls back to the normal GDG banner.
 */

export const bannerSize = { width: 1200, height: 630 };
export const bannerAlt = "Upcoming event at GDG on Campus NMIT";

export interface BannerEvent {
  title: string;
  date: Date;
  venue?: string;
  speaker?: string;
}

const BLUE = "#4285f4";
const RED = "#ea4335";
const YELLOW = "#f9ab00";
const GREEN = "#34a853";
const INK = "#202124";
const PAGE = "#e8eaed";

async function getNextEvent(): Promise<BannerEvent | null> {
  try {
    const { client } = await connectToDatabase();
    // Event dates are stored as UTC midnight, so today's event still counts as upcoming today
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const event = await client
      .db()
      .collection<BannerEvent>("events")
      .find({ date: { $gte: startOfToday }, title: { $exists: true, $ne: "" } })
      .sort({ date: 1 })
      .limit(1)
      .next();
    return event ?? null;
  } catch (err) {
    console.error("upcomingevent banner: couldn't load event", err);
    return null;
  }
}

const file = (path: string) => readFile(join(process.cwd(), path));

/** Fake barcode, but the same event always gets the same stripes */
function barcode(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const bars: number[] = [];
  for (let i = 0; i < 26; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    bars.push(2 + (Math.abs(h) % 5));
  }
  return bars;
}

export async function drawBanner(event: BannerEvent) {
  const [bold, regular, logo] = await Promise.all([
    file("public/assets/GoogleSansDisplay-Bold.ttf"),
    file("public/assets/GoogleSansDisplay-Regular.ttf"),
    file("public/gdg.svg"),
  ]);

  const d = new Date(event.date);
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", { ...o, timeZone: "Asia/Kolkata" });
  const day = part({ day: "numeric" });
  const month = part({ month: "short" }).toUpperCase();
  const weekday = part({ weekday: "long" });
  const year = part({ year: "numeric" });

  const titleSize = event.title.length > 56 ? 52 : event.title.length > 30 ? 64 : 80;
  const subline = [event.venue, event.speaker && `with ${event.speaker}`].filter(Boolean).join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAGE,
          fontFamily: "Google Sans Display",
          overflow: "hidden",
        }}
      >
        {/* confetti-ish Google shapes peeking out from behind the ticket */}
        <div style={{ position: "absolute", top: -120, right: -60, width: 360, height: 360, borderRadius: 999, background: BLUE }} />
        <div style={{ position: "absolute", bottom: -150, left: -90, width: 340, height: 340, borderRadius: 999, background: YELLOW }} />
        <div style={{ position: "absolute", top: 36, left: 260, width: 46, height: 46, borderRadius: 999, background: RED }} />
        <div style={{ position: "absolute", bottom: 28, right: 330, width: 84, height: 84, borderRadius: 999, border: `14px solid ${GREEN}` }} />
        <div style={{ position: "absolute", top: 470, left: 1115, width: 70, height: 22, borderRadius: 11, background: RED, transform: "rotate(-30deg)" }} />

        {/* the ticket */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 72,
            width: 1060,
            height: 486,
            display: "flex",
            background: "#ffffff",
            borderRadius: 36,
            transform: "rotate(-1.5deg)",
            boxShadow: "0 18px 40px rgba(32,33,36,0.18)",
          }}
        >
          {/* main part */}
          <div style={{ display: "flex", flexDirection: "column", width: 760, padding: "44px 52px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/svg+xml;base64,${logo.toString("base64")}`} height={46} alt="" />
              <div style={{ display: "flex", marginLeft: 16, fontSize: 26, fontWeight: 700, color: INK }}>
                GDG on Campus NMIT
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: 34,
                padding: "8px 20px",
                borderRadius: 999,
                background: "#e8f0fe",
                color: "#1a73e8",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
              }}
            >
              YOU&apos;RE INVITED
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: titleSize,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.04,
                letterSpacing: -1.5,
                maxHeight: titleSize * 1.04 * 3,
                overflow: "hidden",
              }}
            >
              {event.title}
            </div>

            <div style={{ display: "flex", flexGrow: 1 }} />
            {subline ? (
              <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: "#5f6368" }}>
                <div style={{ width: 14, height: 14, borderRadius: 999, background: GREEN, marginRight: 14 }} />
                {subline}
              </div>
            ) : null}
          </div>

          {/* tear-off line */}
          <div style={{ display: "flex", width: 0, borderLeft: "5px dashed #dadce0", margin: "34px 0" }} />

          {/* stub */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, paddingTop: 44 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: RED, letterSpacing: 6 }}>{month}</div>
            <div style={{ display: "flex", fontSize: 170, fontWeight: 700, color: BLUE, lineHeight: 1, marginTop: -6 }}>{day}</div>
            <div style={{ display: "flex", fontSize: 28, color: INK, marginTop: 4 }}>{weekday}</div>
            <div style={{ display: "flex", fontSize: 22, color: "#5f6368" }}>{year}</div>
            <div style={{ display: "flex", alignItems: "flex-end", height: 54, marginTop: 30 }}>
              {barcode(event.title).map((w, i) => (
                <div key={i} style={{ width: w, height: i % 7 === 0 ? 54 : 46, background: INK, marginRight: 3 }} />
              ))}
            </div>
          </div>

          {/* punched notches at the tear line */}
          <div style={{ position: "absolute", left: 734, top: -26, width: 52, height: 52, borderRadius: 999, background: PAGE }} />
          <div style={{ position: "absolute", left: 734, bottom: -26, width: 52, height: 52, borderRadius: 999, background: PAGE }} />
        </div>
      </div>
    ),
    {
      ...bannerSize,
      fonts: [
        { name: "Google Sans Display", data: bold, weight: 700, style: "normal" },
        { name: "Google Sans Display", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}

export async function renderEventBanner() {
  const event = await getNextEvent();
  if (event) return drawBanner(event);

  const fallback = await file("src/app/opengraph-image.png");
  return new Response(new Uint8Array(fallback), { headers: { "Content-Type": "image/png" } });
}
