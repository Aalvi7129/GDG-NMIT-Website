import type { DomainInfo } from "@/data/domains";

// Where every star in the skill constellation sits. Each domain is a hub, and
// the skills only it has orbit it on the side facing away from the middle.
// Anything several domains share (skills or tools) floats between them,
// linked to each. A domain's own tools aren't stars: they appear as chips
// when the domain is picked, which keeps the map readable.
// Positions are in "frame units"; the component scales the frame to fit.

export interface Frame {
  width: number;
  height: number;
  /** Where each domain's hub sits, by domain id. */
  hubs: Record<string, { x: number; y: number }>;
  radius: number;
  /** How far round each fan spreads, in degrees either side of "outwards". */
  spreadDeg: number;
  /** Hand-picked label sides for shared stars in the crowded middle. */
  sharedSides?: Record<string, LabelSide>;
  /** Roughly how wide one label character is, in frame units (for keeping labels inside). */
  charUnits: number;
}

// Neighbours share the most: Tech–Docs (GitHub), Docs–Finance (Notion,
// Research), Finance–PR (Canva, Sheets, Forms), PR–Design (Canva).
// Wide side margins leave room for labels that point outwards.
export const DESKTOP_FRAME: Frame = {
  width: 1200,
  height: 790,
  hubs: {
    tech: { x: 430, y: 220 },
    design: { x: 770, y: 220 },
    "pr-marketing": { x: 900, y: 480 },
    "scholarship-finance": { x: 600, y: 610 },
    documentation: { x: 300, y: 480 },
  },
  radius: 120,
  spreadDeg: 58,
  charUnits: 12,
  sharedSides: { Research: "left", Notion: "left", "Google Sheets": "left", "Google Forms": "left", Canva: "left", GitHub: "right" },
};

export const PHONE_FRAME: Frame = {
  width: 600,
  height: 1010,
  hubs: {
    tech: { x: 170, y: 170 },
    design: { x: 430, y: 170 },
    "pr-marketing": { x: 490, y: 430 },
    "scholarship-finance": { x: 300, y: 860 },
    documentation: { x: 110, y: 430 },
  },
  radius: 95,
  spreadDeg: 70,
  charUnits: 11,
  sharedSides: { Research: "left", Notion: "left", "Google Sheets": "right", "Google Forms": "right", Canva: "left", GitHub: "right" },
};

export type LabelSide = "left" | "right" | "above" | "below";

export interface Hub {
  id: string;
  x: number;
  y: number;
}

export interface Star {
  key: string;
  label: string;
  kind: "skill" | "tool";
  x: number;
  y: number;
  /** Ids of the domains that use it. */
  domainIds: string[];
  side: LabelSide;
}

export interface Constellation {
  hubs: Hub[];
  stars: Star[];
}

const SHARED_PULL = 0.15; // shared stars sit a little towards the middle
const SHARED_GAP = 46; // space between shared stars that land on the same spot
// Labels point away from their hub; only nearly-vertical ones sit above or below.
const SIDEWAYS_COS = 0.2;
const EDGE_MARGIN = 16;

/** One decimal place: the server and the browser then agree exactly (no hydration mismatch). */
const round = (n: number) => Math.round(n * 10) / 10;

function sideFor(dx: number, dy: number): LabelSide {
  const length = Math.hypot(dx, dy) || 1;
  const cos = dx / length;
  if (cos > SIDEWAYS_COS) return "right";
  if (cos < -SIDEWAYS_COS) return "left";
  return dy > 0 ? "below" : "above";
}

/** Flips a sideways label to the other side of its star if it would run off the edge. */
function keepInside(side: LabelSide, x: number, label: string, frame: Frame): LabelSide {
  const width = label.length * frame.charUnits + EDGE_MARGIN;
  if (side === "right" && x + width > frame.width) return "left";
  if (side === "left" && x - width < 0) return "right";
  return side;
}

/** Places a domain's own skills in a fan around its hub, pointing away from the middle. */
function fan(labels: string[], domainId: string, hub: { x: number; y: number }, outward: number, frame: Frame): Star[] {
  const spread = (frame.spreadDeg * Math.PI) / 180;
  return labels.map((label, i) => {
    const t = labels.length === 1 ? 0.5 : i / (labels.length - 1);
    const angle = outward - spread + t * spread * 2;
    const dx = Math.cos(angle) * frame.radius;
    const dy = Math.sin(angle) * frame.radius;
    const x = round(hub.x + dx);
    return { key: `skill:${label}`, label, kind: "skill", x, y: round(hub.y + dy), domainIds: [domainId], side: keepInside(sideFor(dx, dy), x, label, frame) };
  });
}

/** Who uses what: every skill and tool label with its kind and the domains that use it. */
function owners(domains: readonly DomainInfo[]) {
  const map = new Map<string, { kind: Star["kind"]; domainIds: string[] }>();
  for (const d of domains) {
    for (const [kind, list] of [["skill", d.skills], ["tool", d.tools]] as const) {
      for (const label of list) {
        const entry = map.get(label);
        map.set(label, entry ? { ...entry, domainIds: [...entry.domainIds, d.id] } : { kind, domainIds: [d.id] });
      }
    }
  }
  return map;
}

export function buildConstellation(domains: readonly DomainInfo[], frame: Frame): Constellation {
  const placed = domains.filter((d) => frame.hubs[d.id]);
  const hubs: Hub[] = placed.map((d) => ({ id: d.id, ...frame.hubs[d.id] }));
  const cx = hubs.reduce((sum, h) => sum + h.x, 0) / (hubs.length || 1);
  const cy = hubs.reduce((sum, h) => sum + h.y, 0) / (hubs.length || 1);
  const usage = owners(placed);

  const ownSkills = placed.flatMap((d) => {
    const hub = frame.hubs[d.id];
    const mine = [...usage].filter(([, o]) => o.kind === "skill" && o.domainIds.length === 1 && o.domainIds[0] === d.id).map(([label]) => label);
    return fan(mine, d.id, hub, Math.atan2(hub.y - cy, hub.x - cx), frame);
  });

  // Shared stars: between their domains, nudged apart when several share the same spot.
  const groups = new Map<string, { label: string; kind: Star["kind"]; domainIds: string[] }[]>();
  for (const [label, o] of usage) {
    if (o.domainIds.length < 2) continue;
    const groupKey = [...o.domainIds].sort().join("|");
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), { label, ...o }]);
  }
  const sharedStars = [...groups.values()].flatMap((group) => {
    const hubsOf = group[0].domainIds.map((id) => frame.hubs[id]);
    const mx = hubsOf.reduce((s, h) => s + h.x, 0) / hubsOf.length;
    const my = hubsOf.reduce((s, h) => s + h.y, 0) / hubsOf.length;
    const x0 = mx + (cx - mx) * SHARED_PULL;
    const y0 = my + (cy - my) * SHARED_PULL;
    // Spread along the line from the middle, so they stack instead of colliding.
    const length = Math.hypot(x0 - cx, y0 - cy) || 1;
    const ux = (x0 - cx) / length;
    const uy = (y0 - cy) / length;
    return group.map((item, i) => {
      const offset = (i - (group.length - 1) / 2) * SHARED_GAP;
      const x = round(x0 + ux * offset);
      const y = round(y0 + uy * offset);
      // The label points away from the domains it links, so it never runs into their hubs.
      const side: LabelSide = frame.sharedSides?.[item.label] ?? (mx > x ? "left" : "right");
      return { key: `${item.kind}:${item.label}`, label: item.label, kind: item.kind, x, y, domainIds: item.domainIds, side };
    });
  });

  return { hubs, stars: [...ownSkills, ...sharedStars] };
}
