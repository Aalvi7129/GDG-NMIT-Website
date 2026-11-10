"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Hand, HandGrab } from "lucide-react";
import { blackHoleGeometry } from "@/components/physics/blackHole";
import DomainEmblem from "./DomainEmblem";

// A ghost demo over the domain playground: a hand grabs a see-through block,
// carries it along a dotted arc and drops it into the black hole, where it
// spirals away. It loops until the visitor touches the playground. The motion
// lives in src/styles/motion.css (.drag-hint-*), so visitors who prefer less
// motion get a still picture of the same idea.

interface Size {
  w: number;
  h: number;
}

interface DragHintProps {
  visible: boolean;
  /** Block size for a given box width (the same rule the playground uses). */
  tileFor: (width: number) => number;
  /** Which domain's emblem the ghost block wears. */
  demoDomainId: string;
}

// The ghost starts in the empty upper-left air, clear of the pile on the floor.
const START_X_RATIO = 0.13;
const START_Y_RATIO = 0.45;
// How far the arc rises above the hole, as a share of the box height.
const ARC_LIFT_RATIO = 0.18;
// Where the arc bends, as a share of the way from the block to the hole.
const ARC_BEND_RATIO = 0.35;
const LABEL_GAP_PX = 40;
const APPEAR_DELAY_S = 1.4; // let the blocks rain in first
const TARGET_RING_PAD_PX = 10;
// Narrow boxes have no room beside the hole, so the label sits in the corner.
const COMPACT_BOX_PX = 640;
const CORNER_INSET_PX = 12;

function buildGeometry(size: Size, tileFor: (width: number) => number) {
  const hole = blackHoleGeometry(size.w, size.h);
  const tile = tileFor(size.w);
  const start = { x: Math.round(size.w * START_X_RATIO), y: Math.round(size.h * START_Y_RATIO) };
  const bend = {
    x: Math.round(start.x + (hole.cx - start.x) * ARC_BEND_RATIO),
    y: Math.round(hole.cy - size.h * ARC_LIFT_RATIO),
  };
  const path = `M ${start.x} ${start.y} Q ${bend.x} ${bend.y} ${hole.cx} ${hole.cy}`;
  const label =
    size.w < COMPACT_BOX_PX
      ? { left: CORNER_INSET_PX, top: CORNER_INSET_PX }
      : { left: Math.max(8, start.x - tile / 2), top: start.y - tile / 2 - LABEL_GAP_PX };
  return { hole, tile, start, path, label };
}

const DragHint = ({ visible, tileFor, demoDomainId }: DragHintProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const inView = useInView(ref, { amount: 0.4 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const geometry = size && size.w > 0 ? buildGeometry(size, tileFor) : null;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-[2px] overflow-hidden rounded-[22px]">
      <AnimatePresence>
        {visible && geometry && (
          <motion.div
            key="drag-hint"
            className={`absolute inset-0 ${inView ? "" : "drag-hint-paused"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: APPEAR_DELAY_S, duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <svg className="absolute inset-0 h-full w-full overflow-visible">
              <path
                d={geometry.path}
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="1 12"
                className="drag-hint-trail text-gray-900/50 dark:text-white/60"
              />
              <circle
                cx={geometry.hole.cx}
                cy={geometry.hole.cy}
                r={geometry.hole.horizonR + TARGET_RING_PAD_PX}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="4 6"
                className="drag-hint-target text-gray-900/60 dark:text-white/70"
                style={{ transformOrigin: `${geometry.hole.cx}px ${geometry.hole.cy}px` }}
              />
            </svg>

            <div
              className="drag-hint-carrier absolute left-0 top-0"
              style={{ offsetPath: `path("${geometry.path}")`, width: geometry.tile, height: geometry.tile }}
            >
              <div className="drag-hint-ghost h-full w-full rounded-2xl opacity-60 outline-dashed outline-2 outline-offset-4 outline-gray-900/40 dark:outline-white/50">
                <DomainEmblem domainId={demoDomainId} size={geometry.tile} className="h-full w-full" />
              </div>
              <Hand className="drag-hint-hand-open absolute -bottom-4 -right-3 size-9 fill-white text-black drop-shadow-md" strokeWidth={1.8} />
              <HandGrab className="drag-hint-hand-grab absolute -bottom-4 -right-3 size-9 fill-white text-black drop-shadow-md" strokeWidth={1.8} />
            </div>

            <span
              className="drag-hint-label absolute whitespace-nowrap rounded-full border-2 border-black bg-g-yellow px-3 py-1 text-xs font-bold text-black shadow-[3px_3px_0_#000] sm:text-sm"
              style={geometry.label}
            >
              Drag a block into the black hole
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DragHint;
