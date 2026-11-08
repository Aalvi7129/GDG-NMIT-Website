"use client";
import React, { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Calendar,
  ExternalLink,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const REGISTRATION_DEADLINE = "2026-10-31T23:59:59+05:30";
const CAMPAIGN_DEADLINE = "2026-11-23T23:59:59+05:30";
const REGISTRATION_LINK = "https://forms.gle/WU4xL4ixs4Cujry4A";
const VIDEO_LINK = "https://www.youtube.com/watch?v=pdlW5IioOXk";
const QR_CODE_URL = `/assets/learn_with_communities.png`;

interface EventItem {
  _id: string;
  title: string;
  description?: string;
  date: string;
  venue?: string;
  speaker?: string;
}

function parseDDMMYYYY(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.split("/").map(Number);
  if (parts.length !== 3) return 0;
  const [day, month, year] = parts;
  return new Date(year, (month || 1) - 1, day || 1).getTime();
}

function getTimeRemaining(targetIso: string) {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  return {
    diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: diff <= 0,
  };
}

export default function UpcomingEventPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.upcomingEvents) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = (data.upcomingEvents as EventItem[])
          .filter((e) => e?.title && (!e.date || parseDDMMYYYY(e.date) >= today.getTime()))
          .sort((a, b) => parseDDMMYYYY(a.date) - parseDDMMYYYY(b.date));

        setEvents(upcoming.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const regTime = getTimeRemaining(REGISTRATION_DEADLINE);
  const campTime = getTimeRemaining(CAMPAIGN_DEADLINE);

  const activeCountdown = !regTime.isExpired ? regTime : campTime;
  const activeLabel = !regTime.isExpired
    ? "Registration Closes  In"
    : "Campaign Milestone Closes In";
  const activeSubDate = !regTime.isExpired
    ? "Deadline: 31 Oct, 11:59 PM IST"
    : "Deadline: 23 Nov, 11:59 PM IST";

  return (
    <>
      {isLoading ? (
        <Loader className="fixed inset-0 z-[9999] bg-white dark:bg-g-almost-black" />
      ) : (
        <div className="min-h-screen bg-white dark:bg-g-almost-black text-gray-900 dark:text-white pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest font-bold text-[#4285F4]">
                GDGoC 2026-27 • Google Cloud
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mt-1 tracking-tight text-gray-900 dark:text-white">
                Learn with Communities
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Chapter Tracker &amp; Cloud Skills Initiative
              </p>
            </div>

            <div className="max-w-xl mx-auto mb-12">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-4 sm:p-6 backdrop-blur-md text-center shadow-sm">
                <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#EA4335] dark:text-[#f28b82]">
                    <Clock className="w-4 h-4" />
                    {activeLabel}
                  </span>
                  <span className="font-mono">{activeSubDate}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3 py-1 font-mono">
                  {[
                    { label: "DAYS", val: activeCountdown.days },
                    { label: "HOURS", val: activeCountdown.hours },
                    { label: "MINS", val: activeCountdown.minutes },
                    { label: "SECS", val: activeCountdown.seconds },
                  ].map((unit, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-black/40 rounded-xl p-2.5 sm:p-3 border border-gray-200/70 dark:border-white/10"
                    >
                      <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {String(unit.val).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 tracking-wider mt-0.5">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200/60 dark:border-white/10">
                  <span
                    className={
                      !regTime.isExpired
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "line-through opacity-60"
                    }
                  >
                    1. Registration: 31 Oct
                  </span>
                  <span>•</span>
                  <span
                    className={
                      regTime.isExpired && !campTime.isExpired
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : ""
                    }
                  >
                    2. Campaign: 23 Nov
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-16">
              <div className="h-full flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 sm:p-8 shadow-sm">
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      REGISTRATION
                    </h2>
                    <div className="h-1 w-12 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-2" />
                  </div>

                  <div className="flex flex-col items-center justify-center my-6">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                      <Image
                        src={QR_CODE_URL}
                        alt="Registration QR Code"
                        width={180}
                        height={180}
                        unoptimized
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center font-medium">
                      Scan QR code with your phone or click below
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/60 dark:border-white/10">
                  <Link
                    href={REGISTRATION_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#4285F4] to-[#34A853] hover:opacity-95 shadow-md transition-all"
                  >
                    <span>Register Now!</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="h-full flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 sm:p-8 shadow-sm">
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      EVENT DETAILS
                    </h2>
                    <div className="h-1 w-12 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-2" />
                  </div>

                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
                    Join GDG on Campus NMIT for{" "}
                    <strong>Google Cloud Learn with Communities</strong>. Learn
                    hands-on Generative AI, cloud infrastructure, and earn
                    verifiable skill badges on Google Cloud Skills Boost.
                  </p>

                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#4285F4] mt-0.5 shrink-0" />
                      <span>Free Google Cloud lab credits — no credit card needed.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#EA4335] mt-0.5 shrink-0" />
                      <span>Earn official digital skill badges in Gen AI &amp; Cloud.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#FBBC05] mt-0.5 shrink-0" />
                      <span>Points update live on NMIT&apos;s Chapter Tracker leaderboard.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#34A853] mt-0.5 shrink-0" />
                      <span>Get exclusive Google Cloud certificates &amp; swags.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Need help setting up your profile?
                  </span>
                  <Link
                    href={VIDEO_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#EA4335] hover:underline"
                  >
                    <span>Watch Video Guide</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-white/10 my-12" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    more upcoming events
                  </h2>
                  <div className="h-0.5 w-10 bg-g-blue rounded-full mt-1.5" />
                </div>
                <Link
                  href="/event"
                  className="text-xs sm:text-sm font-semibold text-[#4285F4] hover:underline inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {events.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-blue-500/40 transition-colors shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">
                          <Calendar className="w-3.5 h-3.5 text-[#4285F4]" />
                          <span>{item.date}</span>
                        </div>
                        <h3 className="font-bold text-base mb-1.5 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-white/5">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#EA4335] shrink-0" />
                          <span className="truncate">{item.venue || "NMIT"}</span>
                        </span>
                        {item.speaker && (
                          <span className="truncate font-medium">{item.speaker}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm">
                  No other upcoming events scheduled right now. Check out our{" "}
                  <Link href="/event" className="text-[#4285F4] underline font-medium">
                    events archive
                  </Link>
                  .
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
