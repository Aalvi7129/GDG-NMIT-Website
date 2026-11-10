"use client";
import React, { useState } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { toDomainContent, type SiteContent } from "@/lib/content/schema";
import DomainsEditor from "./DomainsEditor";

const AdminDashboard = ({ initial }: { initial: SiteContent }) => {
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign("/admin/login");
  };

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-black px-4 sm:px-8 pt-28 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold tracking-widest text-gray-500">GDG NMIT ADMIN</p>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Site content</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Changes go live on the Domains page as soon as you save.</p>
          </div>
          <div className="flex gap-2">
            <a href="/domain" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black dark:border-white/70 px-4 py-2 font-bold text-gray-900 dark:text-white">
              View page <ExternalLink aria-hidden className="w-4 h-4" />
            </a>
            <button type="button" onClick={signOut} disabled={signingOut} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-black px-4 py-2 font-bold text-white disabled:opacity-50">
              <LogOut aria-hidden className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

        <section aria-label="Domains" className="mt-8 border-t-2 border-gray-200 dark:border-gray-800 pt-6">
          <DomainsEditor initial={toDomainContent(initial.domains)} />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
