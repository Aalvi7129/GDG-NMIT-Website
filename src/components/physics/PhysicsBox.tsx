"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type MatterNS from "matter-js";
import { blackHoleGeometry, eject, pull, respawnX, spiralTransform, startCapture, type BlackHoleGeometry, type Capture } from "./blackHole";
import BlackHoleVisual from "./BlackHoleVisual";

// A box of things with real 2D physics (Matter.js). Items drop in from the
// top, can be dragged and thrown, and tapped. Tapping empty space makes
// everything jump; on phones that report it, tilting the device tilts gravity.
// With `onCapture`, a black hole hangs in the middle: throw a `capturable`
// item into it and it spirals in, then drops back into the box a moment later.
//
// Rendering is plain DOM: each item is an element moved with a CSS transform
// every frame, so items can be any React content (SVG emblems, images, text).
// Matter.js itself is loaded only when the box first scrolls into view.
//
// Once everything has come to rest (Matter puts still bodies to sleep) and
// nothing is being dragged, captured or spat out, the frame loop stops, so a
// settled box costs nothing. Any touch, tap, key press or phone tilt wakes it.

type Matter = typeof MatterNS;

export interface PhysicsItem {
  id: string;
  shape: "circle" | "box";
  /** Element size in px (for a circle, w = h = diameter). */
  w: number;
  h: number;
  /** Physics body size relative to the element (e.g. 0.9 when the art has a drop shadow). */
  bodyScale?: number;
  /** Corner radius of a box body, in px. */
  chamfer?: number;
  restitution?: number;
  /** Where to drop it, as a fraction of the box width (0-1); it then falls upright. Default: scattered and tilted. */
  dropAt?: number;
  content: React.ReactNode;
  /** Makes the item a button: announced with this label and tappable. */
  label?: string;
  onTap?: () => void;
  /** Taps give the item a little hop; false keeps it still (e.g. something you tap several times in a row). */
  hopOnTap?: boolean;
  /** The black hole can swallow it (anything else gets spat back out). */
  capturable?: boolean;
  /** Colour of the flash when it's captured. */
  accent?: string;
}

interface PhysicsBoxProps {
  /** Items for a box this wide. Keep it stable (useCallback) so the world isn't rebuilt every render. */
  buildItems: (width: number) => PhysicsItem[];
  /** Adds the black hole; called with the item's id each time one is captured. */
  onCapture?: (itemId: string) => void;
  className?: string;
}

const WALL = 400; // thick walls so fast throws can't tunnel through
const STEP_MS = 1000 / 60;
const MAX_FRAME_MS = 100;
const TAP_MAX_MOVE_PX = 8;
const TAP_MAX_MS = 350;
const REBUILD_WIDTH_PX = 24; // ignore tiny width changes (e.g. scrollbars)
const MAX_TILT_GRAVITY = 0.9;
const SETTLE_STEPS = 400;
const AWAKE_AFTER_MS = 2500; // the black hole sleeps while everything rains in
const THROW_WINDOW_MS = 3000; // only items thrown this recently (or being dragged) can be captured
const CAPTURE_MS = 700; // the spiral-in
const RESPAWN_AFTER_MS = 1600;
const EJECT_COOLDOWN_MS = 1500; // a spat-out item is left alone for a moment
const HORIZON_SLACK = 0.15; // bigger items fall in a little sooner
const DEFAULT_ACCENT = "#4285f4";
const TILT_WAKE_DELTA = 0.05; // phones report tiny tilt jitter constantly; ignore it so the box can rest

interface World {
  Matter: Matter;
  engine: MatterNS.Engine;
  bodies: Map<string, MatterNS.Body>;
  /** When each item was last let go of after a drag (not a tap). */
  thrownAt: Map<string, number>;
  /** Items currently spiralling into the black hole. */
  captures: Map<string, Capture>;
  hole: BlackHoleGeometry | null;
  width: number;
}

interface Drag {
  pointerId: number;
  item: PhysicsItem;
  constraint: MatterNS.Constraint;
  startX: number;
  startY: number;
  startTime: number;
  moved: number;
  /** Removes the window listeners that follow this drag. */
  detach: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function makeWalls(Matter: Matter, width: number, height: number) {
  const { Bodies } = Matter;
  const opts = { isStatic: true, friction: 0.4 };
  return [
    Bodies.rectangle(width / 2, height + WALL / 2, width + WALL * 2, WALL, opts), // floor
    Bodies.rectangle(-WALL / 2, -height, WALL, height * 4, opts), // left (reaches far above the box)
    Bodies.rectangle(width + WALL / 2, -height, WALL, height * 4, opts), // right
    Bodies.rectangle(width / 2, -height * 3 - WALL / 2, width + WALL * 2, WALL, opts), // lid, way above
  ];
}

function makeBody(Matter: Matter, item: PhysicsItem, x: number, y: number) {
  const { Bodies } = Matter;
  const scale = item.bodyScale ?? 1;
  const opts = { restitution: item.restitution ?? 0.35, friction: 0.3, frictionAir: 0.012, density: 0.002 };
  return item.shape === "circle"
    ? Bodies.circle(x, y, (item.w * scale) / 2, opts)
    : Bodies.rectangle(x, y, item.w * scale, item.h * scale, { ...opts, chamfer: { radius: item.chamfer ?? 0 } });
}

/** A little upward kick, used for taps and the "everything jumps" tap. */
function hop(Matter: Matter, body: MatterNS.Body, strength: number) {
  Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 6 * strength, y: -10 * strength });
  Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
}

const PhysicsBox = ({ buildItems, onCapture, className = "" }: PhysicsBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const itemEls = useRef(new Map<string, HTMLElement>());
  const worldRef = useRef<World | null>(null);
  const dragRef = useRef<Drag | null>(null);
  /** Wakes every body and restarts the frame loop if it had stopped to rest. */
  const wakeRef = useRef<(() => void) | null>(null);
  const emptyTapRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [width, setWidth] = useState(0);
  const items = useMemo(() => (width > 0 ? buildItems(width) : []), [width, buildItems]);
  const hasHole = onCapture !== undefined;
  const [hole, setHole] = useState<BlackHoleGeometry | null>(null);
  const [awake, setAwake] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  // A ref, so a new onCapture callback doesn't rebuild the world.
  const onCaptureRef = useRef(onCapture);
  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  // Track the box width; only a real width change rebuilds the world.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      setWidth((prev) => (Math.abs(prev - next) > REBUILD_WIDTH_PX ? next : prev));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Build the world (lazy-loading Matter.js) and run it only while on screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || items.length === 0) return;

    let disposed = false;
    let building = false;
    let frame = 0;
    let last = 0;
    let carry = 0;
    let visible = false;
    let awakeTimer = 0;
    let world: World | null = null;
    // Spat-out items are left alone until these times; the box stays awake meanwhile.
    const ejectedUntil = new Map<string, number>();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (now: number) => {
      if (!world) return;
      for (const item of items) {
        const body = world.bodies.get(item.id);
        const el = itemEls.current.get(item.id);
        if (!body || !el) continue;
        const capture = world.captures.get(item.id);
        if (capture && world.hole) {
          const progress = Math.min(1, (now - capture.start) / CAPTURE_MS);
          el.style.transform = spiralTransform(capture, progress, world.hole, item.w, item.h);
          el.style.opacity = progress >= 1 ? "0" : "1";
          continue;
        }
        el.style.transform = `translate(${body.position.x - item.w / 2}px, ${body.position.y - item.h / 2}px) rotate(${body.angle}rad)`;
        el.style.opacity = "1";
      }
    };

    // Captured items drop back in from above, beside the hole.
    const respawnDue = (now: number) => {
      if (!world?.hole) return;
      const { Matter, engine, hole } = world;
      for (const [id, capture] of world.captures) {
        if (now - capture.start < RESPAWN_AFTER_MS) continue;
        const body = world.bodies.get(id);
        const item = items.find((it) => it.id === id);
        world.captures.delete(id);
        if (!body || !item) continue;
        Matter.Body.setPosition(body, { x: respawnX(hole, world.width, item.w), y: -item.h });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
        Matter.Body.setAngle(body, 0);
        Matter.Composite.add(engine.world, body);
        wakeAll(); // anything resting on top of where it lands has to feel it
      }
    };

    const wakeAll = () => {
      if (!world) return;
      for (const body of world.bodies.values()) world.Matter.Sleeping.set(body, false);
    };

    // Nothing left to simulate: every body asleep, no drag, no spiral, no spat-out item cooling down.
    const atRest = (now: number) => {
      if (!world || dragRef.current || world.captures.size > 0) return false;
      for (const until of ejectedUntil.values()) if (until > now) return false;
      for (const body of world.bodies.values()) if (!body.isSleeping) return false;
      return true;
    };

    const tick = (now: number) => {
      if (!world) return;
      carry += Math.min(now - (last || now), MAX_FRAME_MS);
      last = now;
      while (carry >= STEP_MS) {
        world.Matter.Engine.update(world.engine, STEP_MS);
        carry -= STEP_MS;
      }
      respawnDue(now);
      render(now);
      if (atRest(now)) {
        frame = 0; // stop until something wakes the box
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!world || frame || !visible) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    wakeRef.current = () => {
      wakeAll();
      start();
    };

    const build = async () => {
      building = true;
      try {
        const Matter = (await import("matter-js")).default;
        if (disposed) return;
        const { Engine, Composite, Body, Events } = Matter;
        const w = box.clientWidth;
        const h = box.clientHeight;
        const engine = Engine.create({ enableSleeping: true });
        const bodies = new Map<string, MatterNS.Body>();
        const thrownAt = new Map<string, number>();
        const captures = new Map<string, Capture>();
        const geo = hasHole ? blackHoleGeometry(w, h) : null;

        items.forEach((item, i) => {
          // Spread across the width (or at dropAt), staggered above the box so they rain in.
          const spread = item.dropAt ?? (i * 0.618) % 1;
          const x = clamp(spread * w, item.w / 2, w - item.w / 2);
          const y = -item.h - i * 46;
          const body = makeBody(Matter, item, x, y);
          if (item.dropAt === undefined) Body.setAngle(body, ((i % 5) - 2) * 0.3);
          bodies.set(item.id, body);
        });
        Composite.add(engine.world, [...makeWalls(Matter, w, h), ...bodies.values()]);

        // Reduced motion: settle everything before the first frame instead of animating the drop.
        if (reduceMotion) for (let i = 0; i < SETTLE_STEPS; i++) Engine.update(engine, STEP_MS);

        if (geo) {
          const awakeAt = performance.now() + (reduceMotion ? 0 : AWAKE_AFTER_MS);
          const itemById = new Map(items.map((item) => [item.id, item]));

          const capture = (id: string, body: MatterNS.Body, item: PhysicsItem, now: number) => {
            const drag = dragRef.current;
            if (drag?.item.id === id) {
              dragRef.current = null;
              drag.detach();
              Composite.remove(engine.world, drag.constraint);
            }
            Composite.remove(engine.world, body);
            wakeAll(); // anything that was resting on it has to fall
            captures.set(id, startCapture(body, geo, now));
            setAccent(item.accent ?? DEFAULT_ACCENT);
            setCaptureCount((n) => n + 1);
            onCaptureRef.current?.(id);
          };

          // Every physics step: pull everything in reach; whatever reaches the centre is captured or spat out.
          Events.on(engine, "beforeUpdate", () => {
            const now = performance.now();
            if (now < awakeAt) return;
            for (const [id, body] of bodies) {
              const item = itemById.get(id);
              if (!item || captures.has(id) || now < (ejectedUntil.get(id) ?? 0)) continue;
              const distance = pull(Matter, body, geo);
              if (distance > geo.horizonR + item.w * HORIZON_SLACK) continue;
              const dragged = dragRef.current?.item.id === id;
              const thrown = dragged || now - (thrownAt.get(id) ?? -Infinity) < THROW_WINDOW_MS;
              if (item.capturable && thrown) capture(id, body, item, now);
              else if (!dragged) {
                eject(Matter, body, geo);
                ejectedUntil.set(id, now + EJECT_COOLDOWN_MS);
              }
            }
          });
          setHole(geo);
          awakeTimer = window.setTimeout(() => {
            setAwake(true);
            start(); // in case the box already came to rest: the hole starts pulling now
          }, reduceMotion ? 0 : AWAKE_AFTER_MS);
        }

        world = { Matter, engine, bodies, thrownAt, captures, hole: geo, width: w };
        worldRef.current = world;
        render(performance.now());
        start();
      } catch (error) {
        console.error("Physics box could not start", error);
      }
    };

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) return stop();
      if (!world && !building) void build();
      else start();
    });
    visibility.observe(box);

    // Tilt gravity sideways on phones that report orientation (Android; iOS needs a permission prompt, so it simply stays upright).
    const onTilt = (event: DeviceOrientationEvent) => {
      if (!world || event.gamma === null) return;
      const gravityX = clamp(event.gamma / 45, -MAX_TILT_GRAVITY, MAX_TILT_GRAVITY);
      if (Math.abs(gravityX - world.engine.gravity.x) < TILT_WAKE_DELTA) return;
      world.engine.gravity.x = gravityX;
      wakeRef.current?.(); // sleeping bodies don't feel gravity change on their own
    };
    window.addEventListener("deviceorientation", onTilt);

    return () => {
      disposed = true;
      stop();
      clearTimeout(awakeTimer);
      visibility.disconnect();
      window.removeEventListener("deviceorientation", onTilt);
      if (world) {
        world.Matter.Events.off(world.engine, "beforeUpdate");
        world.Matter.Composite.clear(world.engine.world, false);
        world.Matter.Engine.clear(world.engine);
      }
      dragRef.current?.detach();
      worldRef.current = null;
      dragRef.current = null;
      wakeRef.current = null;
    };
  }, [items, hasHole]);

  const toBox = (clientX: number, clientY: number) => {
    const rect = boxRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  };

  // Ends the current drag. A quick, short press counts as a tap.
  const endDrag = (event?: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    drag.detach();
    const world = worldRef.current;
    if (!world) return;
    world.Matter.Composite.remove(world.engine.world, drag.constraint);
    const isTap = event?.type === "pointerup" && drag.moved < TAP_MAX_MOVE_PX && performance.now() - drag.startTime < TAP_MAX_MS;
    if (!isTap) {
      world.thrownAt.set(drag.item.id, performance.now());
      return;
    }
    const body = world.bodies.get(drag.item.id);
    if (body && drag.item.hopOnTap !== false) {
      wakeRef.current?.();
      hop(world.Matter, body, 0.8);
    }
    drag.item.onTap?.();
  };

  const onItemPointerDown = (event: React.PointerEvent<HTMLElement>, item: PhysicsItem) => {
    const world = worldRef.current;
    const body = world?.bodies.get(item.id);
    if (!world || !body || world.captures.has(item.id)) return;
    endDrag(); // never let an unfinished drag block a new one
    event.preventDefault();
    wakeRef.current?.();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // capture can fail (e.g. the pointer already went up); the window listeners below still follow it
    }
    const point = toBox(event.clientX, event.clientY);
    const constraint = world.Matter.Constraint.create({
      pointA: point,
      bodyB: body,
      pointB: { x: point.x - body.position.x, y: point.y - body.position.y },
      stiffness: 0.15,
      damping: 0.08,
      length: 0,
    });
    world.Matter.Composite.add(world.engine.world, constraint);

    // Follow the pointer on the window, so the release is never missed even if it lands outside the item.
    const pointerId = event.pointerId;
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== pointerId) return;
      drag.constraint.pointA = toBox(e.clientX, e.clientY);
      drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY));
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId === pointerId) endDrag(e);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    const detach = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    dragRef.current = { pointerId, item, constraint, startX: event.clientX, startY: event.clientY, startTime: performance.now(), moved: 0, detach };
  };

  // Keyboard: Enter/Space on a focused item fires a click with detail 0.
  const onItemClick = (event: React.MouseEvent<HTMLElement>, item: PhysicsItem) => {
    if (event.detail !== 0) return; // pointer taps are handled on pointerup
    const world = worldRef.current;
    const body = world?.bodies.get(item.id);
    if (world && body && item.hopOnTap !== false) {
      wakeRef.current?.();
      hop(world.Matter, body, 0.8);
    }
    item.onTap?.();
  };

  // Tapping empty space makes everything jump.
  const onBoxPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    emptyTapRef.current = event.target === event.currentTarget ? { x: event.clientX, y: event.clientY, time: performance.now() } : null;
  };
  const onBoxPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const tap = emptyTapRef.current;
    emptyTapRef.current = null;
    const world = worldRef.current;
    if (!tap || !world || event.target !== event.currentTarget) return;
    const moved = Math.hypot(event.clientX - tap.x, event.clientY - tap.y);
    if (moved > TAP_MAX_MOVE_PX || performance.now() - tap.time > TAP_MAX_MS) return;
    wakeRef.current?.();
    for (const [id, body] of world.bodies) if (!world.captures.has(id)) hop(world.Matter, body, 1.3);
  };

  return (
    <div ref={boxRef} onPointerDown={onBoxPointerDown} onPointerUp={onBoxPointerUp} className={`relative select-none overflow-hidden ${className}`}>
      {hole && <BlackHoleVisual geo={hole} awake={awake} captures={captureCount} accent={accent} />}
      {items.map((item) => {
        const setEl = (el: HTMLElement | null) => {
          if (el) itemEls.current.set(item.id, el);
          else itemEls.current.delete(item.id);
        };
        const shared = {
          onPointerDown: (e: React.PointerEvent<HTMLElement>) => onItemPointerDown(e, item),
          className:
            "absolute left-0 top-0 cursor-grab touch-none rounded-2xl opacity-0 outline-none will-change-transform active:cursor-grabbing focus-visible:ring-4 focus-visible:ring-g-blue",
          style: { width: item.w, height: item.h },
        };
        return item.onTap ? (
          <button key={item.id} ref={setEl} type="button" aria-label={item.label} onClick={(e) => onItemClick(e, item)} {...shared}>
            {item.content}
          </button>
        ) : (
          <div key={item.id} ref={setEl} aria-hidden {...shared}>
            {item.content}
          </div>
        );
      })}
    </div>
  );
};

export default PhysicsBox;
