"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DOMAIN_COLOR_HEX } from "@/data/domains";
import type { PageHeroCopy } from "@/data/pageHeroes";
import { SPRING_PLAYFUL } from "@/lib/motion";

// Shared title block for the inner pages: a tilted sticker, a big static
// title, a hand-drawn underline and a few floating shapes in Google colours.

const { blue: BLUE, red: RED, yellow: YELLOW, green: GREEN } = DOMAIN_COLOR_HEX;

const SHAPES = [
  { color: BLUE, className: "right-[10%] top-[16%] h-16 w-16 rounded-full", drift: -12, seconds: 4.2 },
  { color: RED, className: "right-[26%] top-[58%] h-12 w-12 rotate-12 rounded-lg", drift: 10, seconds: 5 },
  { color: YELLOW, className: "right-[5%] top-[64%] h-8 w-24 -rotate-12 rounded-full", drift: -8, seconds: 4.6 },
  { color: GREEN, className: "right-[32%] top-[14%] h-7 w-7 rotate-45 rounded-[4px]", drift: 9, seconds: 3.8 },
];
const SHAPE_DELAY_S = 0.3;
const SHAPE_STAGGER_S = 0.1;
const UNDERLINE_DELAY_S = 0.35;
const FADE_IN = { duration: 0.2 } as const;

/**
 * Sticker text is black on every Google colour: white on the bright blue, red
 * or green only reaches about 3–4:1, black gets 5:1 or more.
 */
const STICKER_INK = "#000";

/** Starts the CSS drift loop (.hero-float in src/styles/motion.css) for one shape. */
const floatStyle = (drift: number, seconds: number) =>
  ({ "--drift": `${drift}px`, "--float-seconds": `${seconds}s` }) as React.CSSProperties;

const PageHero = ({ eyebrow, title, subtitle, color }: PageHeroCopy) => {
  const reduceMotion = useReducedMotion();
  const enter = <T,>(from: T) => (reduceMotion ? false : from);

  return (
    <section className="relative overflow-hidden">
      {/* Faint dot grid that fades out downwards */}
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-60 dark:opacity-30"
        style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "22px 22px", color: "rgba(127,127,127,.45)" }}
      />

      {/* Floating shapes, desktop only so they never crowd the title. They pop
          in once with framer, then bob forever in CSS (off the main thread,
          and not at all when hidden or when motion is reduced). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        {SHAPES.map((shape, i) => (
          <motion.div
            key={shape.color}
            className={`hero-float absolute border-2 border-black shadow-[3px_3px_0_#000] ${shape.className}`}
            style={{ backgroundColor: shape.color, ...floatStyle(shape.drift, shape.seconds) }}
            initial={enter({ scale: 0.6, opacity: 0 })}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              scale: { ...SPRING_PLAYFUL, delay: SHAPE_DELAY_S + i * SHAPE_STAGGER_S },
              opacity: { ...FADE_IN, delay: SHAPE_DELAY_S + i * SHAPE_STAGGER_S },
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <motion.span
          initial={enter({ opacity: 0, scale: 0.6, rotate: -14 })}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ type: "spring", stiffness: 320, damping: 14 }}
          className="inline-block rounded-xl border-2 border-black px-3.5 py-1 text-sm font-bold uppercase tracking-wider shadow-[3px_3px_0_#000]"
          style={{ backgroundColor: color, color: STICKER_INK }}
        >
          {eyebrow}
        </motion.span>

        <h1 className="mt-5 text-[clamp(3rem,9vw,6.5rem)] font-bold leading-[0.95] tracking-tight text-gray-900 dark:text-white">
          {title}
          <span aria-hidden style={{ color: color === YELLOW ? RED : YELLOW }}>
            .
          </span>
        </h1>

        <svg aria-hidden viewBox="0 0 300 24" fill="none" className="mt-3 h-4 w-48 sm:w-64">
          <motion.path
            d="M4 16 C 40 4, 70 4, 100 14 S 160 24, 200 12 S 260 2, 296 12"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            initial={enter({ pathLength: 0 })}
            animate={{ pathLength: 1 }}
            transition={{ delay: UNDERLINE_DELAY_S, duration: 0.7, ease: "easeInOut" }}
          />
        </svg>

        <motion.p
          initial={enter({ opacity: 0, y: 14 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-5 max-w-2xl text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-gray-300"
        >
          {subtitle}
        </motion.p>

      </div>
    </section>
  );
};

export default PageHero;
