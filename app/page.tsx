import { AppShell, FoundationNotes } from "@/components/app-shell";
import { Check } from "lucide-react";
import { getSupabaseStatus } from "@/lib/supabase/status";

export default function Home() {
  const supabaseStatus = getSupabaseStatus();

  return (
    <>
      <AppShell />
      <section className="border-t border-line bg-white px-4 py-8 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-pilot-green">Build foundation</p>
              <h2 className="mt-2 text-2xl font-bold">Ready for Supabase, OpenAI, and Stripe</h2>
            </div>
            <div className="rounded-lg border border-line bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-pilot-green">Supabase</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill ready={supabaseStatus.hasUrl} label="Project URL" />
                <StatusPill ready={supabaseStatus.hasAnonKey} label="Public key" />
              </div>
            </div>
          </div>
          <div className="mt-5">
            <FoundationNotes />
          </div>
        </div>
      </section>
    </>
  );
}

function StatusPill({ ready, label }: { ready: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
        ready ? "bg-pilot-greenSoft text-pilot-green" : "bg-white text-muted"
      }`}
    >
      <Check className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
}
