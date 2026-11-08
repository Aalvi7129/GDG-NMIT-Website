"use client";
import React, { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const COUNT_DURATION = 1.2;

function formatCount(n: number, suffix = ""): string {
  return `${Math.round(n).toLocaleString()}${suffix}`;
}

interface CountUpProps {
  value: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** A number that counts up from 0 the first time it scrolls into view. */
const CountUp = ({ value, suffix, className, style }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  // The page arrives with the real number (for search engines and no-JS visitors);
  // once the script runs it drops to 0, ready to count up when seen.
  useEffect(() => {
    if (!reduceMotion && ref.current) ref.current.textContent = formatCount(0, suffix);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  // Writes to the DOM directly so the count-up doesn't re-render every frame.
  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    if (reduceMotion) {
      node.textContent = formatCount(value, suffix);
      return;
    }
    const controls = animate(0, value, {
      duration: COUNT_DURATION,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = formatCount(v, suffix);
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, suffix]);

  return (
    <span ref={ref} className={className} style={style}>
      {formatCount(value, suffix)}
    </span>
  );
};

export default CountUp;
