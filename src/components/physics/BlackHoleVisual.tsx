"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BlackHoleGeometry } from "./blackHole";

// What the black hole looks like: a faint gravity glow, a spinning accretion
// ring in Google colours and a black core. It grows in once it's awake, and
// each capture sends a flash ring out in the captured domain's colour.

const RING = "conic-gradient(from 0deg, #4285f4, #ea4335, #f9ab00, #34a853, #4285f4)";
const RING_MASK = "radial-gradient(circle, transparent 46%, #000 48%, #000 62%, transparent 72%)";
// The endless spin and pulse are CSS loops (.spin-loop / .pulse-loop in
// src/styles/motion.css) so they run off the main thread, next to the physics.
// Framer only handles the one-off grow when the hole wakes up.
const OUTER_SPIN_S = 5;
const INNER_SPIN_S = 2.6;
const spin = (seconds: number, reverse = false): React.CSSProperties => ({
  animationDuration: `${seconds}s`,
  animationDirection: reverse ? "reverse" : "normal",
});

interface BlackHoleVisualProps {
  geo: BlackHoleGeometry;
  awake: boolean;
  captures: number;
  accent: string;
}

const BlackHoleVisual = ({ geo, awake, captures, accent }: BlackHoleVisualProps) => {
  const ring = geo.horizonR * 4.4;
  const center = (size: number) => ({ left: geo.cx - size / 2, top: geo.cy - size / 2, width: size, height: size });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: awake ? 1 : 0.25 }}
      transition={{ duration: 0.8 }}
    >
      {/* gravity glow: shows how far the pull reaches */}
      <div
        className="absolute rounded-full"
        style={{ ...center(geo.reachR * 2), background: "radial-gradient(circle, rgba(66,133,244,.22) 0%, rgba(66,133,244,.08) 45%, transparent 70%)" }}
      />
      {/* accretion ring */}
      <motion.div
        className="spin-loop absolute rounded-full blur-[1px]"
        style={{ ...center(ring), ...spin(OUTER_SPIN_S), background: RING, WebkitMaskImage: RING_MASK, maskImage: RING_MASK }}
        animate={{ scale: awake ? 1 : 0.4 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
      />
      {/* a second, faster ring the other way, for the swirl */}
      <motion.div
        className="spin-loop absolute rounded-full opacity-60"
        style={{ ...center(ring * 0.78), ...spin(INNER_SPIN_S, true), background: RING, WebkitMaskImage: RING_MASK, maskImage: RING_MASK }}
        animate={{ scale: awake ? 1 : 0.4 }}
        transition={{ type: "spring", stiffness: 140, damping: 12 }}
      />
      {/* the core: breathes while awake */}
      <motion.div
        className={`absolute rounded-full bg-black ${awake ? "pulse-loop" : ""}`}
        style={{ ...center(geo.horizonR * 2), boxShadow: "0 0 0 2px rgba(255,255,255,.75), 0 0 28px 8px rgba(66,133,244,.45)" }}
        animate={{ scale: awake ? 1 : 0.3 }}
        transition={{ duration: 0.4 }}
      />

      {/* each capture: a flash ring in the domain's colour */}
      <AnimatePresence>
        {captures > 0 && (
          <motion.div
            key={captures}
            className="absolute rounded-full border-4"
            style={{ ...center(geo.horizonR * 2), borderColor: accent }}
            initial={{ scale: 0.6, opacity: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlackHoleVisual;
