"use client";
import React, { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { ContentSection } from "@/lib/content/schema";

// Small building blocks shared by the admin editors.

export const inputClass =
  "w-full rounded-xl border-2 border-black dark:border-white/70 bg-white dark:bg-g-almost-black px-3 py-2 text-gray-900 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-g-blue/40";
const iconButton = "grid place-items-center w-9 h-9 shrink-0 cursor-pointer rounded-lg border-2 border-black dark:border-white/70 disabled:opacity-30 disabled:cursor-not-allowed";

/** Immutable list helpers. */
export const replaceAt = <T,>(list: readonly T[], index: number, value: T): T[] => list.map((item, i) => (i === index ? value : item));
export const removeAt = <T,>(list: readonly T[], index: number): T[] => list.filter((_, i) => i !== index);
export function move<T>(list: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
    </label>
  );
}

export function RowControls({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex gap-1">
      <button type="button" className={iconButton} aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index - 1)}>
        <ArrowUp aria-hidden className="w-4 h-4" />
      </button>
      <button type="button" className={iconButton} aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
        <ArrowDown aria-hidden className="w-4 h-4" />
      </button>
      <button type="button" className={`${iconButton} text-g-red`} aria-label={`Remove ${label}`} onClick={onRemove}>
        <X aria-hidden className="w-4 h-4" />
      </button>
    </div>
  );
}

export function AddButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-2 border-dashed border-gray-400 px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Plus aria-hidden className="w-4 h-4" /> {children}
    </button>
  );
}

/** Editable list of short texts (skills, tools, achievements…). */
export function StringListEditor({ label, items, onChange, maxItems, maxLength }: { label: string; items: string[]; onChange: (next: string[]) => void; maxItems: number; maxLength: number }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-gray-800 dark:text-gray-200">
        {label} <span className="font-normal text-gray-500">({items.length}/{maxItems})</span>
      </legend>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className={inputClass} value={item} maxLength={maxLength} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(replaceAt(items, i, e.target.value))} />
            <RowControls index={i} count={items.length} label={`${label} ${i + 1}`} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(removeAt(items, i))} />
          </div>
        ))}
      </div>
      <AddButton onClick={() => onChange([...items, ""])} disabled={items.length >= maxItems}>
        Add
      </AddButton>
    </fieldset>
  );
}

type SaveState = { status: "idle" | "saving" | "saved" } | { status: "error"; message: string; issues: string[] };

/** Saves one content section and tracks the result. Sends the user to sign in if the session expired. */
export function useSaveSection(section: ContentSection) {
  const [state, setState] = useState<SaveState>({ status: "idle" });

  const save = async (data: unknown): Promise<boolean> => {
    setState({ status: "saving" });
    try {
      const response = await fetch(`/api/admin/content/${section}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return false;
      }
      const body = (await response.json().catch(() => ({}))) as { error?: string; issues?: string[] };
      if (!response.ok) {
        setState({ status: "error", message: body.error ?? "Saving failed.", issues: body.issues ?? [] });
        return false;
      }
      setState({ status: "saved" });
      return true;
    } catch {
      setState({ status: "error", message: "Couldn't reach the server. Check your connection and try again.", issues: [] });
      return false;
    }
  };

  return { state, save };
}

export function SaveBar({ state, dirty, onSave }: { state: ReturnType<typeof useSaveSection>["state"]; dirty: boolean; onSave: () => void }) {
  return (
    <div className="sticky bottom-4 z-10 mt-8 rounded-2xl border-2 border-black dark:border-white/70 bg-white dark:bg-g-quite-black p-4 shadow-[6px_6px_0_#4285f4]">
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex-1 text-sm font-bold text-gray-700 dark:text-gray-200" aria-live="polite">
          {state.status === "saving" && "Saving…"}
          {state.status === "saved" && !dirty && "Saved. The live page is updated."}
          {state.status === "error" && <span className="text-g-red">{state.message}</span>}
          {(state.status === "idle" || (state.status === "saved" && dirty)) && (dirty ? "You have unsaved changes." : "No changes yet.")}
        </p>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || state.status === "saving"}
          className="cursor-pointer rounded-xl border-2 border-black bg-g-blue px-6 py-2.5 font-bold text-white shadow-[3px_3px_0_#000] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save changes
        </button>
      </div>
      {state.status === "error" && state.issues.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-g-red">
          {state.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
