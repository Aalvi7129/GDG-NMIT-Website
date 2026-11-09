"use client";
import React, { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((body: { configured?: boolean }) => setConfigured(Boolean(body.configured)))
      .catch(() => setConfigured(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        window.location.assign("/admin");
        return;
      }
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Sign-in failed.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-gray-50 dark:bg-black px-4 pt-20">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border-2 border-black dark:border-white/70 bg-white dark:bg-g-quite-black p-8 shadow-[8px_8px_0_#4285f4]">
        <p className="font-mono text-xs font-bold tracking-widest text-gray-500">GDG NMIT ADMIN</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Sign in</h1>

        {configured === false ? (
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Admin isn&apos;t switched on for this server yet. Set <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> in the environment.
          </p>
        ) : (
          <>
            <label htmlFor="admin-password" className="mt-6 mb-1 block text-sm font-bold text-gray-800 dark:text-gray-200">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={error ? "admin-login-error" : undefined}
              className="w-full rounded-xl border-2 border-black dark:border-white/70 bg-white dark:bg-g-almost-black px-3 py-2 text-gray-900 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-g-blue/40"
            />
            {error && (
              <p id="admin-login-error" role="alert" className="mt-2 text-sm font-bold text-g-red">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || configured === null}
              className="mt-6 w-full cursor-pointer rounded-xl border-2 border-black bg-g-blue px-6 py-2.5 font-bold text-white shadow-[3px_3px_0_#000] disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
