"use client";
import React, { useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { DomainInfo } from "@/data/domains";
import { EASE_OUT, REVEAL, SPRING_PLAYFUL } from "@/lib/motion";
import { PHONE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { useDomains } from "../ContentContext";
import { DOMAIN_ICONS, domainHex, domainInk } from "../domainTheme";
import { buildConstellation, DESKTOP_FRAME, PHONE_FRAME, type Hub, type LabelSide, type Star } from "./layout";

// Domains page: a star map of every skill and tool. Each domain is a glowing
// hub with its own skills and tools orbiting it; the ones several domains
// share float in the middle, linked to each. Point at a hub to light up its
// cluster, at a star to see who uses it; click a hub to open that domain.
// On phones the shared stars show first and a tapped hub fans out its own.

type Focus = { kind: "domain"; id: string } | { kind: "star"; key: string } | null;

const DIM = 0.12;
const LINE_DRAW_S = 0.8;
const STAR_STEP_S = 0.012;
const LABEL_POSITION: Record<LabelSide, string> = {
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  above: "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
  below: "top-full left-1/2 mt-1.5 -translate-x-1/2",
};

function listNames(domains: (DomainInfo | undefined)[]): string {
  const names = domains.filter(Boolean).map((d) => d!.name);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const SkillConstellation = ({ onOpenDomain }: { onOpenDomain: (id: string) => void }) => {
  const domains = useDomains();
  const phone = useMediaQuery(PHONE_QUERY);
  const frame = phone ? PHONE_FRAME : DESKTOP_FRAME;
  const { hubs, stars } = useMemo(() => buildConstellation(domains, frame), [domains, frame]);
  const byId = useMemo(() => new Map(domains.map((d) => [d.id, d])), [domains]);
  const [focus, setFocus] = useState<Focus>(null);
  const lastPointer = useRef("");
  const panelRef = useRef<HTMLDivElement>(null);
  const shown = useInView(panelRef, { once: true, amount: 0.25 });

  const focusedStar = focus?.kind === "star" ? stars.find((s) => s.key === focus.key) : undefined;
  const hubLit = (id: string) => !focus || (focus.kind === "domain" ? focus.id === id : !!focusedStar?.domainIds.includes(id));
  const starLit = (star: Star) => !focus || (focus.kind === "domain" ? star.domainIds.includes(focus.id) : star.key === focus.key);
  // Phones show only the shared stars (a picked domain lists its own skills in the caption instead).
  const starVisible = (star: Star) => !phone || star.domainIds.length > 1;
  const percent = (n: number, of: number) => `${Math.round((n / of) * 10000) / 100}%`; // rounded so server and browser match
  const at = (x: number, y: number) => ({ left: percent(x, frame.width), top: percent(y, frame.height) });
  const hubOf = (id: string) => hubs.find((h) => h.id === id) as Hub;

  const onHubClick = (id: string) => {
    // A mouse already highlighted it on hover, so a click opens it; on touch the first tap highlights.
    if (lastPointer.current === "mouse" || (focus?.kind === "domain" && focus.id === id)) onOpenDomain(id);
    else setFocus({ kind: "domain", id });
  };

  const focusedDomain = focus?.kind === "domain" ? byId.get(focus.id) : undefined;

  /** The bar under the map: who uses a star, or a domain's toolbox popping in as chips. */
  const caption = (() => {
    if (focusedStar) {
      const users = focusedStar.domainIds.map((id) => byId.get(id));
      return <span>{`${focusedStar.label}: a ${focusedStar.kind} ${users.length > 1 ? "shared by" : "used by"} ${listNames(users)}.`}</span>;
    }
    if (focusedDomain) {
      // Chips pop in one by one: on phones its skills (filled) then tools (outlined); on desktop the skills are already on the map.
      const chips = [...(phone ? focusedDomain.skills.map((label) => ({ label, filled: true })) : []), ...focusedDomain.tools.map((label) => ({ label, filled: false }))];
      return (
        <span className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="mr-1">{focusedDomain.name} {phone ? "is" : "works with"}</span>
          {chips.map(({ label, filled }, i) => (
            <motion.span
              key={`${focusedDomain.id}-${label}`}
              className="rounded-full border-2 px-2.5 py-0.5 text-xs sm:text-sm"
              style={{ borderColor: domainHex(focusedDomain), backgroundColor: filled ? domainHex(focusedDomain) : "transparent", color: filled ? domainInk(focusedDomain) : "#fff" }}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT, delay: i * 0.04 }}
            >
              {label}
            </motion.span>
          ))}
          <span className="ml-1 text-white/60">· {phone ? "tap again" : "click"} to open</span>
        </span>
      );
    }
    return <span>{phone ? "Tap a domain to see its skills and tools, or a star to see who shares it. Tap a domain again to open it." : "Point at a domain to see its tools, or at a star to see who uses it. Click a domain to open it."}</span>;
  })();

  return (
    <section aria-labelledby="constellation-title" className="bg-white px-4 py-16 dark:bg-g-almost-black sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={REVEAL}>
          <h2 id="constellation-title" className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Skills that connect us
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-gray-700 dark:text-gray-300">
            Every star is something our domains do or use. The ones in the middle are shared: that&apos;s where we work together.
          </p>
        </motion.div>

        <div
          ref={panelRef}
          className="constellation-sky relative mt-8 overflow-hidden rounded-3xl border-2 border-black bg-[#0b0d12] shadow-[6px_6px_0_#000] dark:border-white/80 dark:shadow-[6px_6px_0_#4285f4]"
          onPointerDown={(e) => {
            lastPointer.current = e.pointerType;
            if (e.target === e.currentTarget) setFocus(null); // tapping empty sky clears the highlight
          }}
        >
          <div aria-hidden className="relative mx-auto w-full" style={{ aspectRatio: `${frame.width} / ${frame.height}` }}>
            {/* The links between stars and their domains */}
            <svg viewBox={`0 0 ${frame.width} ${frame.height}`} className="absolute inset-0 h-full w-full">
              {stars.flatMap((star, i) =>
                star.domainIds.map((id) => {
                  const hub = hubOf(id);
                  const visible = starVisible(star);
                  return (
                    <motion.path
                      key={`${star.key}-${id}`}
                      d={`M${hub.x} ${hub.y} L${star.x} ${star.y}`}
                      stroke={domainHex(byId.get(id)!)}
                      strokeWidth={star.domainIds.length > 1 ? 2 : 1.5}
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: shown ? 1 : 0, opacity: !visible ? 0 : starLit(star) && hubLit(id) ? 0.6 : DIM }}
                      transition={{ pathLength: { duration: LINE_DRAW_S, ease: EASE_OUT, delay: 0.3 + i * STAR_STEP_S }, opacity: { duration: 0.2 } }}
                    />
                  );
                }),
              )}
            </svg>

            {/* Stars */}
            {stars.map((star, i) => {
              const visible = starVisible(star);
              const shared = star.domainIds.length > 1;
              const color = domainHex(byId.get(star.domainIds[0])!);
              return (
                <motion.span
                  key={star.key}
                  className="absolute"
                  style={at(star.x, star.y)}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: shown && visible ? (starLit(star) ? 1 : DIM + 0.1) : 0, scale: shown && visible ? 1 : 0.6 }}
                  transition={{ duration: 0.35, ease: EASE_OUT, delay: focus ? 0 : 0.5 + i * STAR_STEP_S }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setFocus({ kind: "star", key: star.key })}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
                  onClick={() => lastPointer.current !== "mouse" && setFocus(focus?.kind === "star" && focus.key === star.key ? null : { kind: "star", key: star.key })}
                >
                  <span className={`relative -ml-2 -mt-2 grid h-4 w-4 cursor-default place-items-center ${visible ? "" : "pointer-events-none"}`}>
                    <span
                      className={star.kind === "skill" ? "h-2.5 w-2.5 rounded-full lg:h-3.5 lg:w-3.5" : "h-2.5 w-2.5 rotate-45 rounded-[2px] lg:h-3.5 lg:w-3.5"}
                      style={{
                        backgroundColor: shared ? "#fff" : color,
                        boxShadow: `0 0 ${shared ? 14 : 8}px ${shared ? "#fff" : color}`,
                      }}
                    />
                    <span className={`pointer-events-none absolute whitespace-nowrap text-[11px] font-bold sm:text-sm lg:text-base ${shared ? "text-white" : "text-white/75"} ${LABEL_POSITION[star.side]}`}>
                      {star.label}
                    </span>
                  </span>
                </motion.span>
              );
            })}

            {/* Domain hubs */}
            {hubs.map((hub, i) => {
              const domain = byId.get(hub.id)!;
              const Icon = DOMAIN_ICONS[hub.id];
              const lit = hubLit(hub.id);
              const picked = focus?.kind === "domain" && focus.id === hub.id;
              return (
                <motion.button
                  key={hub.id}
                  type="button"
                  tabIndex={-1} // keyboard users get the list below instead
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={at(hub.x, hub.y)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: shown ? (lit ? 1 : 0.35) : 0, scale: shown ? (picked ? 1.12 : 1) : 0.5 }}
                  transition={{ ...SPRING_PLAYFUL, delay: focus ? 0 : i * 0.08 }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setFocus({ kind: "domain", id: hub.id })}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
                  onClick={() => onHubClick(hub.id)}
                >
                  {picked && <span className="absolute inset-0 rounded-full motion-safe:animate-ping" style={{ backgroundColor: domainHex(domain), opacity: 0.35 }} />}
                  <span
                    className="relative grid h-16 w-16 place-items-center rounded-full border-2 border-black transition-shadow duration-300 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                    style={{ backgroundColor: domainHex(domain), color: domainInk(domain), boxShadow: lit ? `0 0 34px ${domainHex(domain)}` : "none" }}
                  >
                    {Icon && <Icon aria-hidden className="h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9" strokeWidth={2.4} />}
                  </span>
                  <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white sm:text-sm lg:text-base">
                    {domain.shortName}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div aria-live="polite" className="flex min-h-[3.5rem] items-center justify-center border-t-2 border-white/10 px-4 py-3 text-center text-sm font-bold text-white/85 sm:text-base">
            {caption}
          </div>
        </div>

        {/* The same map as a list, for screen readers and keyboard users (it appears when tabbed into) */}
        <ul className="sr-only focus-within:not-sr-only focus-within:mt-4 focus-within:flex focus-within:flex-wrap focus-within:gap-2 [&_button]:rounded-full [&_button]:border-2 [&_button]:px-3 [&_button]:py-1 [&_button]:text-sm [&_button]:font-bold [&_button]:text-gray-900 dark:[&_button]:text-white">
          {domains.map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => onOpenDomain(d.id)}>
                Open {d.name}. Skills: {d.skills.join(", ")}. Tools: {d.tools.join(", ")}.
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SkillConstellation;
