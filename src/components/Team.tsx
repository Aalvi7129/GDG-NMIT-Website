"use client";
import React, { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { Github, Linkedin, Mail, ChevronDown } from "lucide-react";
import type { Member, TeamData, TierMembers, MemberTierGroup } from "@/types/team";

interface TeamProps {
  teamData: TeamData | null;
}

// -------------------------------------------------------------
// Google Developer Groups Color Palettes & Tokens
// -------------------------------------------------------------
interface Palette {
  id: string;
  name: string;
  primaryBg: string;
  secondaryBg: string;
  borderColor: string;
  accentBg: string;
  dotColor: string;
  glowColor: string;
  sectorFill: string;
  sectorHover: string;
  hex: string;
  badgeBg: string;
  // Picture frame tokens matching design specification
  frameTopLeft: string;
  framePastelWave: string;
  frameBeads: string;
}

const colorPalettes: Record<string, Palette> = {
  blue: {
    id: "blue",
    name: "Blue",
    primaryBg: "bg-[#4285F4]",
    secondaryBg: "bg-[#7BAAF7]",
    borderColor: "border-[#4285F4]",
    accentBg: "bg-[#4285F4]",
    dotColor: "bg-[#4285F4]",
    glowColor: "rgba(66, 133, 244, 0.45)",
    sectorFill: "#4285F4",
    sectorHover: "#185ABC",
    hex: "#4285F4",
    badgeBg: "bg-[#4285F4]/15",
    frameTopLeft: "#55BCF6",
    framePastelWave: "#BAE6FD",
    frameBeads: "#2563EB",
  },
  coral: {
    id: "coral",
    name: "Coral",
    primaryBg: "bg-[#EA4335]",
    secondaryBg: "bg-[#F28B82]",
    borderColor: "border-[#EA4335]",
    accentBg: "bg-[#EA4335]",
    dotColor: "bg-[#EA4335]",
    glowColor: "rgba(234, 67, 53, 0.45)",
    sectorFill: "#EA4335",
    sectorHover: "#B31412",
    hex: "#EA4335",
    badgeBg: "bg-[#EA4335]/15",
    frameTopLeft: "#F77B96",
    framePastelWave: "#FDD1D9",
    frameBeads: "#EA4335",
  },
  yellow: {
    id: "yellow",
    name: "Yellow",
    primaryBg: "bg-[#FBBC04]",
    secondaryBg: "bg-[#FDD663]",
    borderColor: "border-[#FBBC04]",
    accentBg: "bg-[#FBBC04]",
    dotColor: "bg-[#FBBC04]",
    glowColor: "rgba(251, 188, 4, 0.45)",
    sectorFill: "#FBBC04",
    sectorHover: "#C46200",
    hex: "#FBBC04",
    badgeBg: "bg-[#FBBC04]/15",
    frameTopLeft: "#F9D038",
    framePastelWave: "#FEF08A",
    frameBeads: "#F59E0B",
  },
  green: {
    id: "green",
    name: "Green",
    primaryBg: "bg-[#34A853]",
    secondaryBg: "bg-[#81C995]",
    borderColor: "border-[#34A853]",
    accentBg: "bg-[#34A853]",
    dotColor: "bg-[#34A853]",
    glowColor: "rgba(52, 168, 83, 0.45)",
    sectorFill: "#34A853",
    sectorHover: "#137333",
    hex: "#34A853",
    badgeBg: "bg-[#34A853]/15",
    frameTopLeft: "#61D278",
    framePastelWave: "#BBF7D0",
    frameBeads: "#16A34A",
  },
};

const paletteKeys = ["blue", "coral", "yellow", "green"] as const;

// -------------------------------------------------------------
// Domain & Tier Ranking Helpers
// -------------------------------------------------------------
const tierRank: Record<string, number> = {
  "faculty coordinator": 12,
  lead: 11,
  "co-lead": 10,
  "student-advisor": 9,
  mentor: 8,
  core: 7,
  tech: 6,
  "pr & marketing": 5,
  operations: 4,
  design: 3,
  "social media": 2,
  "content and documentation": 1,
  member: -2,
  past: -3,
  recruit: -4,
};

const domainNames: Record<string, string> = {
  club: "Heads & Advisors",
  tech: "Technical Team",
  design: "Design Team",
  "content and documentation": "Content & Documentation",
  "pr & marketing": "PR & Marketing",
  "social media": "Social Media",
  operations: "Operations",
};

function isMemberArray(value: TierMembers): value is Member[] {
  return Array.isArray(value);
}

function isMemberTierGroup(value: TierMembers): value is MemberTierGroup {
  return !Array.isArray(value) && typeof value === "object" && value !== null;
}

function extractMembersFromTier(tierMembers: TierMembers): Member[] {
  if (isMemberArray(tierMembers)) {
    return tierMembers;
  }
  if (isMemberTierGroup(tierMembers)) {
    const members: Member[] = [];
    if (tierMembers.past) {
      members.push(...tierMembers.past);
    }
    if (tierMembers.recruit) {
      members.push(...tierMembers.recruit);
    }
    return members;
  }
  return [];
}

function sortMembersByTierRank(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const rankA = tierRank[a.tier] ?? 0;
    const rankB = tierRank[b.tier] ?? 0;
    if (rankB !== rankA) {
      return rankB - rankA;
    }
    return a.name.localeCompare(b.name);
  });
}

function getDomainMemberSplit(domain: string, members: Member[]): {
  coreMembers: Member[];
  otherMembers: Member[];
} {
  if (domain === "club") {
    return { coreMembers: members, otherMembers: [] };
  }

  const explicitOther = members.filter((m) => {
    const t = m.tier?.toLowerCase()?.trim();
    return t === "member" || t === "recruit" || t === "past";
  });

  if (explicitOther.length > 0) {
    const explicitCore = members.filter((m) => {
      const t = m.tier?.toLowerCase()?.trim();
      return t !== "member" && t !== "recruit" && t !== "past";
    });
    return {
      coreMembers: explicitCore.length > 0 ? explicitCore : members.slice(0, 4),
      otherMembers: explicitCore.length > 0 ? explicitOther : members.slice(4),
    };
  }

  if (members.length > 4) {
    return {
      coreMembers: members.slice(0, 4),
      otherMembers: members.slice(4),
    };
  }

  return {
    coreMembers: members,
    otherMembers: [],
  };
}

// -------------------------------------------------------------
// Polar & Annular Radial Geometry Generator
// -------------------------------------------------------------
function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number) {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
}

function describeAnnularSector(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// -------------------------------------------------------------
// GDG Custom Picture Frame (Restored Original Components)
// -------------------------------------------------------------
interface GDGPictureFrameProps {
  photoUrl?: string;
  name: string;
  palette: Palette;
  isHovered: boolean;
}

const GDGPictureFrame: React.FC<GDGPictureFrameProps> = ({
  photoUrl,
  name,
  palette,
  isHovered,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{ transform: "translateZ(30px)" }}
      className={`relative w-[196px] h-[196px] transition-transform duration-300 select-none z-10 ${
        isHovered ? "scale-[1.02]" : "scale-100"
      }`}
    >
      {/* 1. Underlying Circular Photo with Next.js Image */}
      <div className="absolute inset-0 rounded-full overflow-hidden border-[2.5px] border-black bg-gray-100 dark:bg-neutral-800 shadow-lg">
        {photoUrl && !imgError ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 196px, 196px"
            className="object-cover transition-all duration-300 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center ${palette.primaryBg} text-white font-black text-3xl`}
          >
            {name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
        )}
      </div>

      {/* 2. Vector Frame Graphics Layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        viewBox="0 0 200 200"
      >
        <defs>
          <filter id={`frame-shadow-${palette.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* --- Top-Left Organic Sector / Tab (Balanced Medium Size) --- */}
        <path
          d="M 79 7.2 A 95.5 95.5 0 0 0 10.5 67 L 53 67 Q 63 67 63 57 L 63 17 Q 63 8.5 79 7.2 Z"
          fill={palette.frameTopLeft}
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Globe Icon inside Top-Left Sector */}
        <g transform="translate(38, 38)">
          {/* Globe Outline */}
          <circle cx="0" cy="0" r="9.5" fill="none" stroke="#000000" strokeWidth="1.7" />
          {/* Equator */}
          <line x1="-9.5" y1="0" x2="9.5" y2="0" stroke="#000000" strokeWidth="1.7" />
          {/* Meridian / Longitude */}
          <ellipse cx="0" cy="0" rx="4.8" ry="9.5" fill="none" stroke="#000000" strokeWidth="1.7" />
          {/* Latitude Arcs */}
          <path d="M -7.6 -4 Q 0 -1.8 7.6 -4" fill="none" stroke="#000000" strokeWidth="1.5" />
          <path d="M -7.6 4 Q 0 1.8 7.6 4" fill="none" stroke="#000000" strokeWidth="1.5" />
        </g>

        {/* --- Bottom-Right Organic Pastel Wave --- */}
        <path
          d="M 191 138 C 172 135 158 144 151 159 C 145 173 130 187 110 195.5 A 95.5 95.5 0 0 0 191 138 Z"
          fill={palette.framePastelWave}
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* --- Outer Circular Rim Stroke (ties everything seamlessly to circular photo) --- */}
        <circle
          cx="100"
          cy="100"
          r="95.5"
          fill="none"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* --- Right-Edge Stacked Accent Beads --- */}
        {/* Top Bead */}
        <circle
          cx="190.5"
          cy="88"
          r="8.5"
          fill={palette.frameBeads}
          stroke="#000000"
          strokeWidth="2.5"
        />
        {/* Bottom Bead */}
        <circle
          cx="190.5"
          cy="105"
          r="8.5"
          fill={palette.frameBeads}
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* --- Floating Google Developer (< / >) Pill Badge --- */}
        <g transform="translate(114, 137)" filter={`url(#frame-shadow-${palette.id})`}>
          {/* Pill Capsule Background */}
          <rect
            x="0"
            y="0"
            width="52"
            height="27"
            rx="13.5"
            ry="13.5"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2.3"
          />

          {/* Left Bracket < (Google Blue) */}
          <path
            d="M 12.5 13.5 L 17.5 9 L 19 10.5 L 15.5 13.5 L 19 16.5 L 17.5 18 Z"
            fill="#4285F4"
          />

          {/* Slash / Top Half (Google Red) */}
          <polygon
            points="27.5,7.5 25,13.5 22.8,13.5 25.3,7.5"
            fill="#EA4335"
          />

          {/* Slash / Bottom Half (Google Yellow) */}
          <polygon
            points="25,13.5 22.5,19.5 20.3,19.5 22.8,13.5"
            fill="#FBBC04"
          />

          {/* Right Bracket > (Google Green) */}
          <path
            d="M 39.5 13.5 L 34.5 9 L 33 10.5 L 36.5 13.5 L 33 16.5 L 34.5 18 Z"
            fill="#34A853"
          />
        </g>
      </svg>
    </div>
  );
};

// -------------------------------------------------------------
// Tilt Card with BeamNG 4-Quadrant Radial Menu
// -------------------------------------------------------------
interface TiltCardProps {
  member: Member;
  domain: string;
  palette: Palette;
}

const TiltCard: React.FC<TiltCardProps> = ({ member, domain, palette }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glare, setGlare] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((mouseY - centerY) / centerY) * 8;
    const rotY = ((mouseX - centerX) / centerX) * 8;

    setTilt({ x: rotX, y: rotY });
    setGlare({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
    });
    setIsCardHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsCardHovered(false);
    setActiveQuadrant(null);
  };

  const isMenuOpen = isCardHovered;

  // Continuous Precision Circle Bezel Quadrants that pop up on hover
  const quadrants = [
    {
      id: "TL",
      label: "GitHub Profile",
      startAngle: 275,
      endAngle: 355,
      iconCenterAngle: 315,
      iconRadius: 113,
      url: member.githubUrl || "https://github.com",
      Icon: Github,
    },
    {
      id: "TR",
      label: "LinkedIn Profile",
      startAngle: 5,
      endAngle: 85,
      iconCenterAngle: 45,
      iconRadius: 113,
      url: member.linkedinUrl || "https://linkedin.com",
      Icon: Linkedin,
    },
    {
      id: "BR",
      label: "X Profile",
      startAngle: 95,
      endAngle: 175,
      iconCenterAngle: 135,
      iconRadius: 113,
      url: member.twitterUrl || "https://x.com",
      Icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: "BL",
      label: "Email",
      startAngle: 185,
      endAngle: 265,
      iconCenterAngle: 225,
      iconRadius: 113,
      url: `mailto:${member.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      Icon: Mail,
    },
  ];

  return (
    <div className="relative group/tilt w-full max-w-[340px] sm:max-w-[360px]">
      {/* Outer Offset Accent Frame Shell */}
      <div
        className={`absolute inset-0 rounded-[42px] transition-all duration-300 ${palette.accentBg} translate-x-2 translate-y-2 opacity-90 group-hover/tilt:translate-x-3 group-hover/tilt:translate-y-3 shadow-xl`}
      />

      {/* Main 3D Card Surface */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative z-10 w-full rounded-[38px] bg-white dark:bg-[#0E1015] border-[3.5px] ${palette.borderColor} p-6 pb-7 flex flex-col items-center justify-between shadow-xl dark:shadow-2xl transition-all select-none overflow-hidden`}
        style={{
          transformStyle: "preserve-3d",
          transform: isCardHovered
            ? `perspective(1000px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
          transition: isCardHovered
            ? "transform 0.08s ease-out"
            : "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Specular Dynamic Glare Overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[36px] transition-opacity duration-300"
          style={{
            opacity: isCardHovered ? 0.18 : 0,
            background: `radial-gradient(circle 90px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)`,
            zIndex: 40,
          }}
        />

        {/* ---------------- CARD TOP BAR ---------------- */}
        <div
          style={{ transform: "translateZ(18px)" }}
          className="w-full flex items-center justify-between px-1 mb-2 pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${palette.dotColor} shadow-sm animate-pulse`}
            />
            <span className="text-[11px] font-black tracking-widest text-gray-900 dark:text-white uppercase font-sans">
              {domainNames[domain] ?? domain}
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
            GDG NMIT
          </span>
        </div>

        <div className="w-full h-[1px] bg-gray-200 dark:bg-white/10 mb-4" />

        {/* ---------------- CENTER STAGE: AVATAR & CIRCULAR BEZEL ---------------- */}
        <div className="relative w-[260px] h-[260px] flex items-center justify-center my-2">
          {/* SVG Circular Bezel Ring that pops up on hover */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
            viewBox="0 0 260 260"
          >
            <defs>
              <filter id={`glow-hover-${member._id}`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={palette.sectorHover} floodOpacity="0.8" />
              </filter>
              <filter id={`bezel-shadow-${member._id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* 4 Annular Bezel Quadrants forming a complete circular bezel that pops up on hover */}
            {quadrants.map((quad) => {
              const isQuadActive = activeQuadrant === quad.id;
              const rInner = 99;
              const rOuter = isQuadActive ? 130 : 126;
              const pathD = describeAnnularSector(130, 130, rInner, rOuter, quad.startAngle, quad.endAngle);

              return (
                <path
                  key={quad.id}
                  d={pathD}
                  fill={isQuadActive ? palette.sectorHover : palette.sectorFill}
                  stroke="#000000"
                  strokeWidth="2.5"
                  className="cursor-pointer"
                  filter={isQuadActive ? `url(#glow-hover-${member._id})` : isMenuOpen ? `url(#bezel-shadow-${member._id})` : undefined}
                  style={{
                    opacity: isMenuOpen ? (isQuadActive ? 1 : 0.95) : 0,
                    transform: isMenuOpen
                      ? isQuadActive
                        ? "scale(1.02)"
                        : "scale(1)"
                      : "scale(0.85)",
                    transformOrigin: "130px 130px",
                    pointerEvents: isMenuOpen ? "auto" : "none",
                    transition:
                      "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out, fill 0.2s ease",
                  }}
                  onMouseEnter={() => setActiveQuadrant(quad.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(quad.url, "_blank", "noopener,noreferrer");
                  }}
                />
              );
            })}
          </svg>

          {/* Quadrant Icon Nodes Layer on the Circular Bezel */}
          <div
            style={{ transform: "translateZ(38px)" }}
            className="absolute inset-0 pointer-events-none z-25"
          >
            {quadrants.map((quad) => {
              const isQuadActive = activeQuadrant === quad.id;
              const coords = polarToCartesian(130, 130, quad.iconRadius, quad.iconCenterAngle);
              const IconComp = quad.Icon;
              const iconColor = palette.id === "yellow" ? "text-black" : "text-white";

              return (
                <a
                  key={quad.id}
                  href={quad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on ${quad.label}`}
                  title={`${quad.label}`}
                  style={{
                    left: `${coords.x}px`,
                    top: `${coords.y}px`,
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? `translate(-50%, -50%) scale(${isQuadActive ? 1.25 : 1})`
                      : "translate(-50%, -50%) scale(0.5)",
                    pointerEvents: isMenuOpen ? "auto" : "none",
                    transition:
                      "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out",
                  }}
                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${iconColor}`}
                  onMouseEnter={() => setActiveQuadrant(quad.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconComp className="w-4 h-4 drop-shadow" />
                </a>
              );
            })}
          </div>

          {/* Central Circular Avatar with Restored GDG Picture Frame */}
          <GDGPictureFrame
            photoUrl={member.photoUrl}
            name={member.name}
            palette={palette}
            isHovered={isCardHovered}
          />
        </div>

        {/* ---------------- STATUS / QUADRANT CODE TEXT ---------------- */}
        <div
          style={{ transform: "translateZ(20px)" }}
          className="w-full text-center my-3 min-h-[20px] flex items-center justify-center"
        >
          {activeQuadrant ? (
            <span
              style={{ color: palette.sectorHover }}
              className="font-mono font-bold tracking-wider text-xs transition-colors duration-200"
            >
              {quadrants.find((q) => q.id === activeQuadrant)?.label}
            </span>
          ) : (
            <span className="text-[11px] font-mono tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-opacity duration-300">
              {isMenuOpen ? "Select Profile" : "Hover To Connect"}
            </span>
          )}
        </div>

        {/* ---------------- BOTTOM PILLS: ROLE & NAME ---------------- */}
        <div className="w-full flex flex-col items-center mt-1">
          {/* Top Pill: Role */}
          <div
            style={{ transform: "translateZ(32px)" }}
            className={`w-full ${palette.primaryBg} rounded-full border-[2.5px] border-black/80 dark:border-white py-2.5 px-4 shadow-md flex items-center justify-center`}
          >
            <p className="text-center text-xs sm:text-sm font-black text-black uppercase tracking-wide truncate">
              {member.role}
            </p>
          </div>

          {/* Bottom Pill: Name */}
          <div
            style={{ transform: "translateZ(38px)" }}
            className={`w-full ${palette.secondaryBg} rounded-full border-[2.5px] border-black/80 dark:border-white py-3 px-4 shadow-md flex items-center justify-center mt-2.5`}
          >
            <p className="text-center text-base sm:text-lg font-black text-black tracking-normal truncate">
              {member.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Main Team Component with Controls & Filters
// -------------------------------------------------------------
const Team: React.FC<TeamProps> = ({ teamData }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

  const toggleDomainDropdown = (domain: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  const groupedMembers = useMemo(() => {
    if (!teamData?.members) {
      return {};
    }

    const grouped: Record<string, Member[]> = {};

    Object.entries(teamData.members).forEach(([domain, tiers]) => {
      const domainMembers: Member[] = [];

      Object.values(tiers).forEach((tierMembers) => {
        const extractedMembers = extractMembersFromTier(tierMembers);
        domainMembers.push(...extractedMembers);
      });

      grouped[domain] = sortMembersByTierRank(domainMembers);
    });

    return grouped;
  }, [teamData]);

  if (!teamData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-black flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 font-mono">No team data available</p>
      </div>
    );
  }

  const activeDomains = Object.keys(groupedMembers);
  const domainsToRender =
    selectedDomain === "all"
      ? activeDomains
      : activeDomains.filter((d) => d === selectedDomain);

  // Helper to resolve card palette cycling through Google brand colors
  const getCardPalette = (index: number): Palette => {
    const key = paletteKeys[index % paletteKeys.length];
    return colorPalettes[key];
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#08090C] text-gray-900 dark:text-white pt-24 pb-28 transition-colors duration-300">
      <div className="px-6 max-w-7xl mx-auto">
        {/* Header Title Section */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
            Meet Our Team
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] rounded-full mt-3" />
        </div>

        {/* ---------------- DOMAIN FILTER PILLS ---------------- */}
        {activeDomains.length > 1 && (
          <div className="flex flex-wrap gap-2.5 mb-14">
            {["all", ...activeDomains].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold border-2 transition-all cursor-pointer ${
                  selectedDomain === d
                    ? "bg-[#4285F4] text-white border-[#4285F4] shadow-md -translate-y-0.5"
                    : "bg-white dark:bg-[#12141A] text-gray-700 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 shadow-sm"
                }`}
              >
                {d === "all" ? "All Domains" : domainNames[d] ?? d}
              </button>
            ))}
          </div>
        )}

        {/* ---------------- DOMAINS & CARDS LIST ---------------- */}
        {domainsToRender.map((domain) => {
          const domainMembers = groupedMembers[domain] || [];
          if (domainMembers.length === 0) return null;

          const { coreMembers, otherMembers } = getDomainMemberSplit(domain, domainMembers);
          const isExpanded = !!expandedDomains[domain];

          return (
            <div key={domain} className="mb-20">
              {/* Domain Header & Dropdown Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white capitalize">
                    {domainNames[domain] ?? domain}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] rounded-full mt-2.5" />
                </div>

                {/* Extended Members Dropdown Button */}
                {otherMembers.length > 0 && (
                  <button
                    onClick={() => toggleDomainDropdown(domain)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold bg-white dark:bg-[#14161E] border-2 border-gray-300 dark:border-white/20 text-gray-800 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white hover:text-black dark:hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    <span>
                      {isExpanded
                        ? `Hide Team Members (${otherMembers.length})`
                        : `View Team Members (${otherMembers.length})`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Core Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center">
                {coreMembers.map((member, index) => (
                  <TiltCard
                    key={member._id}
                    member={member}
                    domain={domain}
                    palette={getCardPalette(index)}
                  />
                ))}
              </div>

              {/* Extended Members Dropdown Content */}
              {otherMembers.length > 0 && isExpanded && (
                <div className="mt-14 pt-8 border-t-2 border-dashed border-gray-300 dark:border-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-ping" />
                      <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-700 dark:text-gray-300">
                        {domainNames[domain] ?? domain} &bull; Extended Team ({otherMembers.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleDomainDropdown(domain)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white cursor-pointer"
                    >
                      <span>Collapse</span>
                      <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center">
                    {otherMembers.map((member, index) => (
                      <TiltCard
                        key={member._id}
                        member={member}
                        domain={domain}
                        palette={getCardPalette(coreMembers.length + index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Team;
