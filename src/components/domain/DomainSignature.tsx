"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AtSign, Bell, Check, Coins, Heart, Megaphone, PenLine, ThumbsUp } from "lucide-react";
import { DOMAIN_COLOR_HEX, type DomainInfo } from "@/data/domains";
import { DOMAIN_ICONS, domainHex, domainInk } from "./domainTheme";

// Small looping scenes, one per domain, shown in the domain card header.
// Purely decorative: the card's text carries the meaning.

const GOOGLE = [DOMAIN_COLOR_HEX.blue, DOMAIN_COLOR_HEX.red, DOMAIN_COLOR_HEX.yellow, DOMAIN_COLOR_HEX.green];
const SPRING = { type: "spring", stiffness: 320, damping: 18 } as const;
// Pop-ins start small and see-through, never from nothing (scale 0).
const POP_FROM = { scale: 0.5, opacity: 0 } as const;
const FADE_IN = { duration: 0.2 } as const;

function TechSignature() {
  const command = "npm run build";
  const typedBy = 0.3 + command.length * 0.05;

  return (
    <div className="h-full bg-[#0d1117] p-3 font-mono text-[11px] sm:text-xs text-gray-200">
      <div className="mb-2 flex gap-1.5">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
      </div>
      <p>
        <span className="text-g-green">$ </span>
        {command.split("").map((char, i) => (
          <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05, duration: 0 }}>
            {char}
          </motion.span>
        ))}
      </p>
      <motion.p
        className="mt-1 flex items-center gap-1 text-g-green"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: typedBy + 0.4 }}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={3} /> Compiled successfully
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: typedBy + 0.7 }}>
        <span className="text-g-green">$ </span>
        <motion.span
          className="inline-block w-2 h-3.5 align-middle bg-gray-200"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.p>
    </div>
  );
}

function DesignSignature() {
  return (
    <div className="relative h-full flex items-end justify-center gap-2 pb-4">
      {GOOGLE.map((color, i) => (
        <motion.span
          key={color}
          className="w-7 h-7 rounded-md border-2 border-black"
          style={{ backgroundColor: color }}
          initial={{ y: -90, rotate: -30 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ ...SPRING, delay: 0.15 + i * 0.12 }}
        />
      ))}
      <motion.span
        className="absolute top-3 right-4 w-9 h-9 border-2 border-black"
        initial={POP_FROM}
        animate={{
          scale: 1,
          opacity: 1,
          rotate: [0, 90, 180, 270, 360],
          borderRadius: ["50%", "18%", "50%", "18%", "50%"],
          backgroundColor: [...GOOGLE, GOOGLE[0]],
        }}
        transition={{ scale: { ...SPRING, delay: 0.7 }, opacity: { ...FADE_IN, delay: 0.7 }, default: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      />
    </div>
  );
}

function PrSignature() {
  const bubbles = [Heart, AtSign, Bell, ThumbsUp];

  return (
    <div className="relative h-full flex items-center pl-5">
      <motion.span
        className="relative z-10 grid place-items-center w-12 h-12 rounded-full border-2 border-black bg-g-yellow"
        animate={{ rotate: [0, -8, 0, -8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
      >
        <Megaphone className="w-6 h-6 text-black" />
      </motion.span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-5 w-12 h-12 rounded-full border-2 border-g-yellow"
          animate={{ scale: [1, 2.6], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.66, ease: "easeOut" }}
        />
      ))}
      {bubbles.map((Icon, i) => (
        <motion.span
          key={i}
          className="absolute grid place-items-center w-7 h-7 rounded-full border-2 border-black text-white"
          style={{ left: `${45 + i * 13}%`, bottom: 6, backgroundColor: GOOGLE[i] }}
          animate={{ y: [10, -62], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
        </motion.span>
      ))}
    </div>
  );
}

function FinanceSignature() {
  const bars = [30, 48, 64, 86];

  return (
    <div className="relative h-full flex items-end gap-2.5 px-5 pb-3">
      {bars.map((height, i) => (
        <motion.span
          key={height}
          className="flex-1 rounded-t-md border-2 border-black origin-bottom"
          style={{ height: `${height}%`, backgroundColor: GOOGLE[i] }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ ...SPRING, delay: 0.2 + i * 0.15 }}
        />
      ))}
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-x-5 top-2 bottom-3 w-[calc(100%-2.5rem)] h-[calc(100%-1.25rem)] overflow-visible">
        <motion.path
          d="M 4 50 L 32 38 L 58 30 L 96 6"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          className="text-gray-900 dark:text-white"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        className="absolute top-2 right-3 text-g-yellow"
        initial={POP_FROM}
        animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
        transition={{ scale: { ...SPRING, delay: 1.6 }, opacity: { ...FADE_IN, delay: 1.6 }, y: { duration: 1.4, repeat: Infinity, delay: 1.8 } }}
      >
        <Coins className="w-6 h-6" />
      </motion.span>
    </div>
  );
}

function DocumentationSignature() {
  const lines = [88, 72, 80, 54];

  return (
    <div className="relative h-full flex items-center justify-center">
      <div className="relative w-28 h-[84%] rounded-lg border-2 border-black bg-white p-2.5 space-y-2">
        {lines.map((width, i) => (
          <motion.span
            key={i}
            className="block h-1.5 rounded-full bg-gray-300 origin-left"
            style={{ width: `${width}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 + i * 0.35, duration: 0.3, ease: "easeOut" }}
          />
        ))}
        <motion.span
          className="absolute -bottom-2 -right-3 grid place-items-center w-7 h-7 rounded-full border-2 border-black bg-g-green text-white"
          initial={{ ...POP_FROM, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ default: { ...SPRING, delay: 1.8 }, opacity: { ...FADE_IN, delay: 1.8 } }}
        >
          <Check className="w-4 h-4" strokeWidth={3} />
        </motion.span>
      </div>
      <motion.span
        className="absolute text-g-blue"
        initial={{ x: -40, y: -26 }}
        animate={{ x: [-40, 30, -40, 30, -40, 20], y: [-26, -26, -12, -12, 2, 2] }}
        transition={{ duration: 1.6, delay: 0.2, ease: "linear" }}
      >
        <PenLine className="w-6 h-6" />
      </motion.span>
    </div>
  );
}

const SIGNATURES: Record<string, () => React.JSX.Element> = {
  tech: TechSignature,
  design: DesignSignature,
  "pr-marketing": PrSignature,
  "scholarship-finance": FinanceSignature,
  documentation: DocumentationSignature,
};

// Reduced motion: a still tile with the domain icon instead of a looping scene.
function StillSignature({ domain }: { domain: DomainInfo }) {
  const Icon = DOMAIN_ICONS[domain.id];
  return (
    <div className="h-full grid place-items-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl border-2 border-black" style={{ backgroundColor: domainHex(domain), color: domainInk(domain) }}>
        <Icon className="w-7 h-7" />
      </span>
    </div>
  );
}

const DomainSignature = ({ domain }: { domain: DomainInfo }) => {
  const reduceMotion = useReducedMotion();
  const Scene = SIGNATURES[domain.id];
  if (!Scene) return null;

  return (
    <div aria-hidden className="h-28 w-full sm:w-52 shrink-0 overflow-hidden rounded-2xl border-2 border-black bg-gray-50 dark:bg-g-almost-black">
      {reduceMotion ? <StillSignature domain={domain} /> : <Scene />}
    </div>
  );
};

export default DomainSignature;
