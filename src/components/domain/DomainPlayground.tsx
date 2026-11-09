"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DOMAIN_COLOR_HEX } from "@/data/domains";
import PhysicsBox, { type PhysicsItem } from "@/components/physics/PhysicsBox";
import { useDomains } from "./ContentContext";
import DomainEmblem from "./DomainEmblem";
import DragHint from "./DragHint";
import { openDinoGame } from "./dino/DinoEasterEgg";

// The top of /domain: the five domain emblems, the GDG logo and some Google
// confetti in a physics box with a black hole in the middle. Fling an emblem
// into it (or just tap it) to open that domain; anything else gets spat back
// out. Tap the GDG logo three times for the hidden dino game.

const CONFETTI_COLORS = [DOMAIN_COLOR_HEX.blue, DOMAIN_COLOR_HEX.red, DOMAIN_COLOR_HEX.yellow, DOMAIN_COLOR_HEX.green];
const CONFETTI_COUNT = 12;
const TRIPLE_TAP_WINDOW_MS = 1200;
const SQUISH = [{ transform: "scale(1)" }, { transform: "scale(0.86)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }];
const SQUISH_MS = 280;
const EMBLEM_ART_SCALE = 0.9; // the emblem art includes a drop shadow, so its body is a bit smaller
const WARP_PAUSE_MS = 900; // let the spiral-in play before scrolling to the details

const tileFor = (width: number) => Math.round(Math.min(104, Math.max(60, width / 8)));

const DomainPlayground = ({ onPick }: { onPick: (id: string) => void }) => {
  const domains = useDomains();
  // A ref keeps buildItems stable, so a new onPick doesn't rebuild the world.
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);
  const [showHint, setShowHint] = useState(true);
  const logoTaps = useRef<number[]>([]);
  const logoFace = useRef<HTMLSpanElement>(null);

  const buildItems = useCallback(
    (width: number): PhysicsItem[] => {
      const tile = tileFor(width);
      const logo = Math.round(tile * 1.35);

      const emblems: PhysicsItem[] = domains.map((domain) => ({
        id: domain.id,
        shape: "box",
        w: tile,
        h: tile,
        bodyScale: EMBLEM_ART_SCALE,
        chamfer: Math.round(tile * 0.2),
        label: `Open ${domain.name}`,
        onTap: () => onPickRef.current(domain.id),
        capturable: true,
        accent: DOMAIN_COLOR_HEX[domain.color],
        content: <DomainEmblem domainId={domain.id} size={tile} className="pointer-events-none h-full w-full" />,
      }));

      const gdg: PhysicsItem = {
        id: "gdg-logo",
        shape: "circle",
        w: logo,
        h: logo,
        restitution: 0.5,
        label: "GDG logo",
        // Three quick taps open the dino game (phones can't type "dino"). The logo
        // stays put when tapped (no hop) so all three taps land; it squishes instead.
        hopOnTap: false,
        onTap: () => {
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) logoFace.current?.animate(SQUISH, { duration: SQUISH_MS, easing: "ease-out" });
          const now = performance.now();
          logoTaps.current = [...logoTaps.current.filter((t) => now - t < TRIPLE_TAP_WINDOW_MS), now];
          if (logoTaps.current.length >= 3) {
            logoTaps.current = [];
            openDinoGame();
          }
        },
        content: (
          <span ref={logoFace} className="grid h-full w-full place-items-center rounded-full border-2 border-black bg-white shadow-[4px_4px_0_#000]">
            <Image src="/assets/gdg.svg" alt="" width={80} height={43} draggable={false} className="pointer-events-none h-auto w-[60%]" />
          </span>
        ),
      };

      const confetti: PhysicsItem[] = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
        const size = Math.round(tile * (0.28 + (i % 3) * 0.08));
        const round = i % 2 === 0;
        return {
          id: `confetti-${i}`,
          shape: round ? "circle" : "box",
          w: size,
          h: size,
          chamfer: round ? 0 : Math.round(size * 0.25),
          restitution: 0.6,
          content: (
            <span
              className={`block h-full w-full border-2 border-black ${round ? "rounded-full" : "rounded-md"}`}
              style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
            />
          ),
        };
      });

      return [...emblems, gdg, ...confetti];
    },
    [domains],
  );

  const onCapture = useCallback((id: string) => {
    setShowHint(false);
    window.setTimeout(() => onPickRef.current(id), WARP_PAUSE_MS);
  }, []);

  return (
    <section aria-label="Domain playground" className="bg-white dark:bg-g-almost-black px-4 sm:px-8 lg:px-12 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">
          Drag a domain into the black hole to open it. <span className="text-g-blue">Or just tap one.</span>{" "}
          <span className="hidden sm:inline">Tap empty space to make everything jump.</span>
        </p>
        {/* The ghost demo stops for good the first time the visitor touches the box. */}
        <div className="relative mt-4" onPointerDownCapture={() => setShowHint(false)}>
          <PhysicsBox
            buildItems={buildItems}
            onCapture={onCapture}
            className="h-[340px] sm:h-[420px] rounded-3xl border-2 border-black dark:border-white/80 bg-gray-50 dark:bg-black shadow-[8px_8px_0_#ea4335] [background-image:radial-gradient(rgba(127,127,127,.25)_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <DragHint visible={showHint} tileFor={tileFor} demoDomainId={domains[0]?.id ?? "tech"} />
        </div>
      </div>
    </section>
  );
};

export default DomainPlayground;
