"use client";
import React, { useState } from "react";
import type { DomainContent } from "@/lib/content/schema";
import { AddButton, Field, inputClass, move, removeAt, replaceAt, RowControls, SaveBar, StringListEditor, useSaveSection } from "./fields";

const MAX_STATS = 4;
const MAX_WORKS = 6;

type Stat = DomainContent["stats"][number];
type Work = DomainContent["works"][number];

const DomainsEditor = ({ initial }: { initial: DomainContent[] }) => {
  const [domains, setDomains] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id);
  const [dirty, setDirty] = useState(false);
  const { state, save } = useSaveSection("domains");

  const active = domains.find((d) => d.id === activeId) ?? domains[0];
  const update = (patch: Partial<DomainContent>) => {
    setDomains((list) => list.map((d) => (d.id === active.id ? { ...d, ...patch } : d)));
    setDirty(true);
  };
  const setStat = (i: number, patch: Partial<Stat>) => update({ stats: replaceAt(active.stats, i, { ...active.stats[i], ...patch }) });
  const setWork = (i: number, patch: Partial<Work>) => update({ works: replaceAt(active.works, i, { ...active.works[i], ...patch }) });

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a domain">
        {domains.map((domain) => (
          <button
            key={domain.id}
            type="button"
            role="tab"
            aria-selected={domain.id === active.id}
            onClick={() => setActiveId(domain.id)}
            className={`cursor-pointer rounded-full border-2 border-black dark:border-white/70 px-4 py-1.5 text-sm font-bold ${domain.id === active.id ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-800 dark:text-gray-200"}`}
          >
            {domain.shortName}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Name">
          <input className={inputClass} value={active.name} maxLength={40} onChange={(e) => update({ name: e.target.value })} />
        </Field>
        <Field label="Short name" hint="Used in small labels, like the group chat.">
          <input className={inputClass} value={active.shortName} maxLength={14} onChange={(e) => update({ shortName: e.target.value })} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Tagline">
            <input className={inputClass} value={active.tagline} maxLength={90} onChange={(e) => update({ tagline: e.target.value })} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea className={`${inputClass} min-h-24`} value={active.description} maxLength={400} onChange={(e) => update({ description: e.target.value })} />
          </Field>
        </div>
        <StringListEditor label="What you'll do" items={active.whatYouDo} maxItems={6} maxLength={120} onChange={(whatYouDo) => update({ whatYouDo })} />
        <StringListEditor label="Achievements" items={active.achievements} maxItems={6} maxLength={140} onChange={(achievements) => update({ achievements })} />
        <StringListEditor label="Skills" items={active.skills} maxItems={8} maxLength={30} onChange={(skills) => update({ skills })} />
        <StringListEditor label="Tools" items={active.tools} maxItems={8} maxLength={30} onChange={(tools) => update({ tools })} />
      </div>

      <fieldset className="mt-8">
        <legend className="text-lg font-bold text-gray-900 dark:text-white">Stats (count up on the Achievements tab)</legend>
        <div className="mt-3 space-y-2">
          {active.stats.map((stat, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input className={`${inputClass} w-28`} type="number" min={0} aria-label={`Stat ${i + 1} number`} value={stat.value} onChange={(e) => setStat(i, { value: Number(e.target.value) })} />
              <input className={`${inputClass} w-16`} maxLength={3} aria-label={`Stat ${i + 1} suffix`} placeholder="+" value={stat.suffix ?? ""} onChange={(e) => setStat(i, { suffix: e.target.value || undefined })} />
              <input className={`${inputClass} flex-1 min-w-40`} maxLength={30} aria-label={`Stat ${i + 1} label`} value={stat.label} onChange={(e) => setStat(i, { label: e.target.value })} />
              <RowControls index={i} count={active.stats.length} label={`stat ${i + 1}`} onMove={(to) => update({ stats: move(active.stats, i, to) })} onRemove={() => update({ stats: removeAt(active.stats, i) })} />
            </div>
          ))}
        </div>
        <AddButton disabled={active.stats.length >= MAX_STATS} onClick={() => update({ stats: [...active.stats, { value: 0, label: "" }] })}>
          Add stat
        </AddButton>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-lg font-bold text-gray-900 dark:text-white">Works</legend>
        <div className="mt-3 space-y-4">
          {active.works.map((work, i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input className={`${inputClass} flex-1 min-w-40`} maxLength={60} aria-label={`Work ${i + 1} title`} placeholder="Title" value={work.title} onChange={(e) => setWork(i, { title: e.target.value })} />
                <input className={`${inputClass} w-36`} maxLength={24} aria-label={`Work ${i + 1} type`} placeholder="Type (e.g. Web)" value={work.kind} onChange={(e) => setWork(i, { kind: e.target.value })} />
                <RowControls index={i} count={active.works.length} label={`work ${i + 1}`} onMove={(to) => update({ works: move(active.works, i, to) })} onRemove={() => update({ works: removeAt(active.works, i) })} />
              </div>
              <textarea className={`${inputClass} mt-2`} maxLength={160} aria-label={`Work ${i + 1} description`} placeholder="One-line description" value={work.description} onChange={(e) => setWork(i, { description: e.target.value })} />
            </div>
          ))}
        </div>
        <AddButton disabled={active.works.length >= MAX_WORKS} onClick={() => update({ works: [...active.works, { title: "", kind: "", description: "" }] })}>
          Add work
        </AddButton>
      </fieldset>

      <SaveBar state={state} dirty={dirty} onSave={async () => (await save(domains)) && setDirty(false)} />
    </div>
  );
};

export default DomainsEditor;
