// Pure game logic for the dino easter egg: no DOM, no React. Every function
// returns a new state, so the canvas component only draws what it gets back.
// Units: pixels in an 800x240 world, milliseconds for time.

export const WORLD = {
  width: 800,
  height: 240,
  groundY: 206,
  gravity: 0.0026, // px/ms²
  jumpVelocity: -0.86, // px/ms
  startSpeed: 0.36, // px/ms
  maxSpeed: 0.9,
  acceleration: 0.0000055, // px/ms² of forward speed
  pointsPerPx: 0.1,
  birdsFromScore: 200,
  minGapPx: 320,
  maxGapPx: 680,
  cloudChance: 0.012, // per frame-ish (scaled by dt)
} as const;

export const SIZES = {
  dino: { w: 44, h: 48 },
  cactus: { w: 22, h: 40 },
  bird: { w: 46, h: 29 },
  cloud: { w: 62, h: 25 },
} as const;

const DINO_X = 56;
const HITBOX_PADDING = 6;
const CLOUD_SPEED_FACTOR = 0.25;
const MAX_CACTI_IN_GROUP = 3;
const CACTUS_GROUP_SPACING = 4;
// px above the ground to the bird's bottom edge: low birds must be jumped,
// high birds clear a running dino but catch one that jumps into them.
const BIRD_HEIGHTS = [14, 60];
const CLOUD_MIN_Y = 30;
const CLOUD_MAX_Y = 110;

export type Status = "ready" | "running" | "over";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Dino extends Box {
  vy: number;
  onGround: boolean;
}

export interface Obstacle extends Box {
  kind: "cactus" | "bird";
}

export interface GameState {
  status: Status;
  dino: Dino;
  obstacles: Obstacle[];
  clouds: Box[];
  speed: number;
  distance: number;
  score: number;
  /** Milliseconds until the next obstacle appears. */
  nextSpawnIn: number;
  /** Total running time, used for the run-cycle animation. */
  elapsed: number;
}

/** Random source, injectable so tests can be deterministic. */
export type Rng = () => number;

const between = (rng: Rng, min: number, max: number) => min + rng() * (max - min);

function groundedDino(): Dino {
  return { x: DINO_X, y: WORLD.groundY - SIZES.dino.h, ...SIZES.dino, vy: 0, onGround: true };
}

export function createGame(): GameState {
  return {
    status: "ready",
    dino: groundedDino(),
    obstacles: [],
    clouds: [
      { x: 180, y: 50, ...SIZES.cloud },
      { x: 520, y: 84, ...SIZES.cloud },
    ],
    speed: WORLD.startSpeed,
    distance: 0,
    score: 0,
    nextSpawnIn: 900,
    elapsed: 0,
  };
}

/** Space / tap: start, jump, or restart depending on the state. */
export function press(state: GameState): GameState {
  if (state.status === "over") return { ...createGame(), status: "running" };
  const running = state.status === "ready" ? { ...state, status: "running" as const } : state;
  if (!running.dino.onGround) return running;
  return { ...running, dino: { ...running.dino, vy: WORLD.jumpVelocity, onGround: false } };
}

export function overlaps(a: Box, b: Box, padding = HITBOX_PADDING): boolean {
  return (
    a.x + padding < b.x + b.w - padding &&
    a.x + a.w - padding > b.x + padding &&
    a.y + padding < b.y + b.h - padding &&
    a.y + a.h - padding > b.y + padding
  );
}

function stepDino(dino: Dino, dt: number): Dino {
  if (dino.onGround) return dino;
  const vy = dino.vy + WORLD.gravity * dt;
  const y = dino.y + vy * dt;
  const floor = WORLD.groundY - dino.h;
  return y >= floor ? { ...dino, y: floor, vy: 0, onGround: true } : { ...dino, y, vy };
}

function spawnObstacles(score: number, rng: Rng): Obstacle[] {
  const birdsAllowed = score >= WORLD.birdsFromScore;
  if (birdsAllowed && rng() < 0.3) {
    const lift = BIRD_HEIGHTS[Math.floor(rng() * BIRD_HEIGHTS.length)];
    return [{ kind: "bird", x: WORLD.width, y: WORLD.groundY - lift - SIZES.bird.h, ...SIZES.bird }];
  }
  const count = 1 + Math.floor(rng() * MAX_CACTI_IN_GROUP);
  return Array.from({ length: count }, (_, i) => {
    const h = SIZES.cactus.h - (i % 2) * 8; // vary heights a little
    return {
      kind: "cactus" as const,
      x: WORLD.width + i * (SIZES.cactus.w + CACTUS_GROUP_SPACING),
      y: WORLD.groundY - h,
      w: SIZES.cactus.w,
      h,
    };
  });
}

/** Advance the world by `dt` milliseconds. */
export function step(state: GameState, dt: number, rng: Rng): GameState {
  if (state.status !== "running") return state;

  const speed = Math.min(WORLD.maxSpeed, state.speed + WORLD.acceleration * dt);
  const move = speed * dt;
  const distance = state.distance + move;
  const score = Math.floor(distance * WORLD.pointsPerPx);
  const dino = stepDino(state.dino, dt);

  const moved = state.obstacles.map((o) => ({ ...o, x: o.x - move })).filter((o) => o.x + o.w > 0);
  let nextSpawnIn = state.nextSpawnIn - dt;
  let obstacles = moved;
  if (nextSpawnIn <= 0) {
    obstacles = [...moved, ...spawnObstacles(score, rng)];
    nextSpawnIn = between(rng, WORLD.minGapPx, WORLD.maxGapPx) / speed;
  }

  const drifted = state.clouds.map((c) => ({ ...c, x: c.x - move * CLOUD_SPEED_FACTOR })).filter((c) => c.x + c.w > 0);
  const clouds =
    rng() < WORLD.cloudChance * (dt / 16)
      ? [...drifted, { x: WORLD.width, y: between(rng, CLOUD_MIN_Y, CLOUD_MAX_Y), ...SIZES.cloud }]
      : drifted;

  const hit = obstacles.some((o) => overlaps(dino, o));
  return {
    ...state,
    status: hit ? "over" : "running",
    dino,
    obstacles,
    clouds,
    speed,
    distance,
    score,
    nextSpawnIn,
    elapsed: state.elapsed + dt,
  };
}
