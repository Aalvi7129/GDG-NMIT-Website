import type MatterNS from "matter-js";

// The black hole for PhysicsBox: a point of gravity hanging in mid-air. Within
// reach it pulls bodies in (with a little sideways swirl, so they spiral).
// Bodies that reach the centre are either captured (they spiral in and
// vanish) or spat back out sideways.

export interface BlackHoleGeometry {
  cx: number;
  cy: number;
  /** Reaching this close to the centre counts as falling in. */
  horizonR: number;
  /** Beyond this, no pull at all. */
  reachR: number;
}

export interface Capture {
  start: number;
  /** Distance and angle from the centre at the moment of capture. */
  r0: number;
  a0: number;
  spin0: number;
}

const GRAVITY_SCALE = 0.001; // Matter's own gravity scale, so the pull below is in "g"
const PULL_AT_EDGE_G = 1.1; // a touch stronger than gravity at the edge of its reach
const MAX_PULL_G = 5;
const SWIRL = 0.35; // sideways share of the pull
const EJECT_SPEED_X = 13;
const EJECT_SPEED_Y = 4; // a little downward, so it leaves the pull instead of falling straight back in
const SPIRAL_TURNS = 1.5;

/** Hangs in the middle, a third of the way down, and reaches well short of the floor. */
export function blackHoleGeometry(width: number, height: number): BlackHoleGeometry {
  const reachR = Math.round(Math.min(width * 0.22, height * 0.3, 140));
  return { cx: Math.round(width / 2), cy: Math.round(height * 0.36), horizonR: Math.round(reachR * 0.24), reachR };
}

/** Pulls a body toward the centre. Returns its distance, or Infinity when out of reach. */
export function pull(Matter: typeof MatterNS, body: MatterNS.Body, geo: BlackHoleGeometry): number {
  const dx = geo.cx - body.position.x;
  const dy = geo.cy - body.position.y;
  const d = Math.hypot(dx, dy);
  if (d > geo.reachR) return Infinity;
  if (d === 0) return 0;
  const g = Math.min(MAX_PULL_G, PULL_AT_EDGE_G * (geo.reachR / Math.max(d, geo.horizonR)) ** 2);
  const force = body.mass * GRAVITY_SCALE * g;
  const ux = dx / d;
  const uy = dy / d;
  Matter.Body.applyForce(body, body.position, { x: (ux - uy * SWIRL) * force, y: (uy + ux * SWIRL) * force });
  return d;
}

/** Spits a body out sideways (away from the centre) and a little down. */
export function eject(Matter: typeof MatterNS, body: MatterNS.Body, geo: BlackHoleGeometry) {
  const side = body.position.x < geo.cx ? -1 : 1;
  Matter.Body.setVelocity(body, { x: side * EJECT_SPEED_X, y: EJECT_SPEED_Y });
  Matter.Body.setAngularVelocity(body, side * 0.3);
}

export function startCapture(body: MatterNS.Body, geo: BlackHoleGeometry, now: number): Capture {
  const dx = body.position.x - geo.cx;
  const dy = body.position.y - geo.cy;
  return { start: now, r0: Math.hypot(dx, dy), a0: Math.atan2(dy, dx), spin0: body.angle };
}

/** Where a captured item is drawn while it spirals in and shrinks to nothing (progress 0 to 1). */
export function spiralTransform(capture: Capture, progress: number, geo: BlackHoleGeometry, w: number, h: number): string {
  const eased = progress * progress;
  const r = capture.r0 * (1 - eased);
  const a = capture.a0 + progress * SPIRAL_TURNS * Math.PI * 2;
  const x = geo.cx + Math.cos(a) * r;
  const y = geo.cy + Math.sin(a) * r;
  return `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${capture.spin0 + progress * 8}rad) scale(${Math.max(0, 1 - eased)})`;
}

/** A spot above the box, beside the hole's reach, to drop a captured item back in. */
export function respawnX(geo: BlackHoleGeometry, width: number, itemW: number): number {
  const leftRoom = geo.cx - geo.reachR - itemW / 2;
  const useLeft = Math.random() < 0.5 && leftRoom > itemW / 2;
  const min = useLeft ? itemW / 2 : geo.cx + geo.reachR + itemW / 2;
  const max = useLeft ? leftRoom : width - itemW / 2;
  return min + Math.random() * Math.max(0, max - min);
}
