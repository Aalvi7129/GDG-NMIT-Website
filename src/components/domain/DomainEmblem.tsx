"use client";
import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { DOMAIN_COLOR_HEX, findDomain } from "@/data/domains";

// Sticker-style emblems, one per domain: a coloured tile with a hard black
// shadow and a small illustrated symbol. `active` (hover/selected) plays a
// bigger animation; otherwise a gentle idle loop runs.

const INK = "#000";
const PAPER = "#fff";
const { blue: BLUE, red: RED, yellow: YELLOW, green: GREEN } = DOMAIN_COLOR_HEX;
const STROKE = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

interface ArtProps {
  active: boolean;
  loop: boolean;
}

const ACTIVE_REPEATS = 3;
const forever = (duration: number, delay = 0) => ({ duration, delay, repeat: Infinity, ease: "easeInOut" as const });
/** Hover/selected animations play a few times, then settle. */
const burst = (duration: number, delay = 0) => ({ duration, delay, repeat: ACTIVE_REPEATS, ease: "easeInOut" as const });

function TechArt({ active, loop }: ArtProps) {
  return (
    <motion.g animate={active ? { y: -3, rotate: -4 } : { y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
      <rect x="22" y="30" width="76" height="58" rx="9" fill={PAPER} {...STROKE} />
      <path d="M22 44 H98" {...STROKE} />
      {[RED, YELLOW, GREEN].map((c, i) => (
        <circle key={c} cx={31 + i * 8} cy="37" r="2.8" fill={c} />
      ))}
      <motion.polyline
        points="36,56 46,64 36,72"
        fill="none"
        {...STROKE}
        strokeWidth={4}
        animate={active ? { x: [0, 5, 0] } : { x: 0 }}
        transition={active ? burst(0.9) : undefined}
      />
      <motion.rect
        x="52"
        y="70"
        width="18"
        height="5"
        rx="1.5"
        fill={GREEN}
        animate={loop || active ? { opacity: [1, 0, 1] } : { opacity: 1 }}
        transition={active ? burst(0.6) : loop ? forever(1.1) : undefined}
      />
      <motion.path
        d="M76 56 H88 M80 64 H88"
        {...STROKE}
        stroke={BLUE}
        strokeWidth={4}
        initial={false}
        animate={{ pathLength: active ? [0, 1] : 1 }}
        transition={{ duration: 0.6 }}
      />
    </motion.g>
  );
}

function DesignArt({ active, loop }: ArtProps) {
  return (
    <>
      <motion.path
        d="M18 94 C 34 58, 52 106, 102 42"
        fill="none"
        stroke={YELLOW}
        strokeWidth={7}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? [0, 1] : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <rect x="14" y="90" width="8" height="8" fill={PAPER} {...STROKE} strokeWidth={2.5} />
      <rect x="98" y="38" width="8" height="8" fill={PAPER} {...STROKE} strokeWidth={2.5} />
      <motion.g
        style={{ transformBox: "view-box", transformOrigin: "60px 96px" }}
        animate={active ? { rotate: [0, -14, 8, 0] } : loop ? { rotate: [0, -4, 0] } : { rotate: 0 }}
        transition={active ? { duration: 0.9 } : loop ? forever(3) : undefined}
      >
        <path d="M48 26 H72 L82 54 L60 96 L38 54 Z" fill={PAPER} {...STROKE} />
        <path d="M60 68 V94" {...STROKE} />
        <circle cx="60" cy="62" r="5" fill={INK} />
        <rect x="46" y="18" width="28" height="10" rx="3" fill={RED} {...STROKE} />
      </motion.g>
    </>
  );
}

function PrArt({ active, loop }: ArtProps) {
  return (
    <>
      <motion.g
        style={{ transformBox: "view-box", transformOrigin: "40px 70px" }}
        animate={active ? { rotate: [0, -8, 4, -8, 0] } : { rotate: 0 }}
        transition={active ? { duration: 0.8 } : undefined}
      >
        <path d="M24 52 L66 32 V88 L24 68 Z" fill={PAPER} {...STROKE} />
        <rect x="18" y="50" width="10" height="20" rx="3" fill={RED} {...STROKE} />
        <path d="M34 70 L40 92 H50 L46 74" fill={BLUE} {...STROKE} />
      </motion.g>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${74 + i * 9} ${46 - i * 6} Q${84 + i * 12} 60 ${74 + i * 9} ${74 + i * 6}`}
          fill="none"
          {...STROKE}
          strokeWidth={4}
          animate={active || loop ? { opacity: [0.15, 1, 0.15] } : { opacity: 1 }}
          transition={active ? burst(0.7, i * 0.12) : loop ? forever(1.6, i * 0.3) : undefined}
        />
      ))}
    </>
  );
}

function FinanceArt({ active, loop }: ArtProps) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x="32"
          y={82 - i * 11}
          width="56"
          height="12"
          rx="6"
          fill={YELLOW}
          {...STROKE}
          animate={active ? { y: [0, -6 - i * 3, 0] } : { y: 0 }}
          transition={active ? { duration: 0.5, delay: i * 0.08 } : undefined}
        />
      ))}
      <motion.g animate={active ? { y: [0, -10, 0] } : { y: 0 }} transition={active ? { duration: 0.6, delay: 0.2 } : undefined}>
        <path d="M60 22 L98 36 L60 50 L22 36 Z" fill={INK} {...STROKE} />
        <path d="M38 42 V52 C 46 60, 74 60, 82 52 V42" fill={INK} {...STROKE} />
        <motion.g
          style={{ transformBox: "view-box", transformOrigin: "90px 39px" }}
          animate={active ? { rotate: [0, 30, -20, 0] } : loop ? { rotate: [0, 8, 0] } : { rotate: 0 }}
          transition={active ? { duration: 0.9 } : loop ? forever(2.4) : undefined}
        >
          <path d="M90 39 V58" stroke={YELLOW} strokeWidth={3} strokeLinecap="round" />
          <circle cx="90" cy="60" r="4" fill={YELLOW} stroke={INK} strokeWidth={2} />
        </motion.g>
      </motion.g>
    </>
  );
}

function DocsArt({ active, loop }: ArtProps) {
  return (
    <>
      <motion.rect
        x="42"
        y="22"
        width="48"
        height="64"
        rx="4"
        fill={PAPER}
        {...STROKE}
        style={{ transformBox: "view-box", transformOrigin: "66px 54px" }}
        animate={{ rotate: active ? 14 : 8 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      />
      <motion.g
        animate={active ? { y: -4, rotate: -3 } : loop ? { y: [0, -2, 0] } : { y: 0 }}
        transition={active ? { type: "spring", stiffness: 300, damping: 14 } : loop ? forever(2.6) : undefined}
      >
        <path d="M28 30 H66 L80 44 V96 H28 Z" fill={PAPER} {...STROKE} />
        <path d="M66 30 V44 H80" fill="none" {...STROKE} />
        {[58, 68, 78].map((y, i) => (
          <motion.path
            key={y}
            d={`M36 ${y} H${70 - i * 6}`}
            {...STROKE}
            stroke={[BLUE, RED, GREEN][i]}
            strokeWidth={4}
            initial={false}
            animate={{ pathLength: active ? [0, 1] : 1 }}
            transition={{ duration: 0.35, delay: active ? i * 0.15 : 0 }}
          />
        ))}
        <path d="M70 84 L70 100 L75 96 L80 100 L80 84" fill={RED} {...STROKE} strokeWidth={2.5} />
      </motion.g>
    </>
  );
}

const ARTS: Record<string, (props: ArtProps) => React.JSX.Element> = {
  tech: TechArt,
  design: DesignArt,
  "pr-marketing": PrArt,
  "scholarship-finance": FinanceArt,
  documentation: DocsArt,
};

interface DomainEmblemProps {
  domainId: string;
  active?: boolean;
  /** Rendered width/height in px. */
  size?: number;
  className?: string;
}

const DomainEmblem = ({ domainId, active = false, size = 120, className }: DomainEmblemProps) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  // Idle loops only run while the emblem is on screen (and not display:none).
  const inView = useInView(ref);
  const domain = findDomain(domainId);
  const Art = ARTS[domainId];
  if (!domain || !Art) return null;

  const loop = inView && !reduceMotion;
  const isActive = active && !reduceMotion;

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden
      animate={isActive ? { rotate: -6, scale: 1.06 } : { rotate: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 14 }}
    >
      <rect x="13" y="13" width="100" height="100" rx="26" fill={INK} />
      <rect x="7" y="7" width="100" height="100" rx="26" fill={DOMAIN_COLOR_HEX[domain.color]} stroke={INK} strokeWidth={3} />
      <Art active={isActive} loop={loop} />
    </motion.svg>
  );
};

export default DomainEmblem;
