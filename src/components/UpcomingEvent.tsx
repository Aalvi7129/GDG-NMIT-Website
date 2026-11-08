"use client";
import React from "react";
import Link from "next/link";

export default function UpcomingEvent() {
  return (
    <section className="bg-white dark:bg-g-almost-black py-12 lg:py-16">
      <div className="pt-0 px-8 sm:px-12 lg:px-16 xl:px-20 mb-15 text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          Upcoming Event
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-3" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="group relative rounded-2xl border border-transparent bg-gradient-to-br from-white/70 to-white/40 dark:from-white/10 dark:to-white/5 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.35)] hover:ring-1 hover:ring-blue-500/30 dark:hover:ring-blue-400/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                Google Cloud: Learn with Communities
              </h3>
            </div>
            <div className="flex flex-col justify-center md:items-start gap-5">
              <div className="w-full md:w-11/12 lg:w-10/12 md:pr-1 lg:pr-3">
                <p className="mt-2 mb-4 md:mb-6 text-base sm:text-lg leading-relaxed text-gray-700/90 dark:text-gray-300/90">
                  Master Google Cloud &amp; Generative AI with hands-on labs, Earn official digital badges, track your chapter progress, and qualify for exclusive swags!
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 md:gap-4 md:self-start">
                <Link
                  href="/upcomingevent"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-[#4285F4] to-[#34A853] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-indigo-400"
                  aria-label="Know more about Google Cloud Learn with Communities"
                >
                  Know More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
