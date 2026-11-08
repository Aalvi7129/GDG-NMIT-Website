"use client";
import { useCallback, useEffect, useState } from "react";
import type { ApiResponse, Member, TeamData, TierMembers } from "@/types/team";

export type CrewStatus = "loading" | "error" | "ready";

export interface DomainCrew {
  status: CrewStatus;
  /** Members of the latest team, keyed by the DB domain key. */
  membersByDomain: Record<string, Member[]>;
  retry: () => void;
}

// Display order for tiers; anything else is appended after these.
const TIER_ORDER = [
  "faculty coordinator",
  "lead",
  "co-lead",
  "student-advisor",
  "mentor",
  "core",
  "member",
  "recruit",
];

function flattenTier(value: TierMembers): Member[] {
  if (Array.isArray(value)) return value;
  return [...(value.past ?? []), ...(value.recruit ?? [])];
}

function tierRank(tier: string): number {
  const index = TIER_ORDER.indexOf(tier);
  return index === -1 ? TIER_ORDER.length : index;
}

// Newest team that already has members, so a freshly created (empty) team
// doesn't hide the current roster. parseInt copes with years like "2024-25".
function latestTeam(teams: TeamData[]): TeamData | undefined {
  const yearOf = (team: TeamData) => parseInt(String(team.year), 10) || 0;
  return [...teams]
    .filter((team) => Object.keys(team.members ?? {}).length > 0)
    .sort((a, b) => yearOf(b) - yearOf(a))[0];
}

function groupByDomain(team: TeamData | undefined): Record<string, Member[]> {
  if (!team) return {};

  return Object.fromEntries(
    Object.entries(team.members).map(([domainKey, tiers]) => {
      const members = Object.entries(tiers)
        .sort(([a], [b]) => tierRank(a) - tierRank(b))
        .flatMap(([, value]) => flattenTier(value));
      return [domainKey, members];
    }),
  );
}

export function useDomainCrew(): DomainCrew {
  const [status, setStatus] = useState<CrewStatus>("loading");
  const [membersByDomain, setMembersByDomain] = useState<Record<string, Member[]>>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/teams")
      .then((res) => (res.ok ? (res.json() as Promise<ApiResponse>) : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (cancelled) return;
        setMembersByDomain(groupByDomain(latestTeam(data?.teams ?? [])));
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Error fetching domain crew:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  return { status, membersByDomain, retry };
}
