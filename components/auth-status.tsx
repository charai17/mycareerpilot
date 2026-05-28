"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user);
        setLoading(false);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    setBusy(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (authError) {
      setError(authError.message);
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError(null);
    const { error: authError } = await supabase.auth.signOut();
    if (authError) {
      setError(authError.message);
    }
    setBusy(false);
  }

  if (loading) {
    return <div className="h-11 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-muted">Checking sign-in</div>;
  }

  return (
    <div className="grid gap-2">
      {user ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="rounded-lg border border-line bg-white px-4 py-2 text-sm">
            <span className="font-bold text-ink">{user.email}</span>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 font-bold text-ink transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={signIn}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {busy ? "Opening Google" : "Connect Google"}
        </button>
      )}
      {error && <p className="max-w-sm text-sm font-bold text-pilot-red">{error}</p>}
    </div>
  );
}
