"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ApplicationStatus = "saved" | "ready" | "applied" | "interview" | "rejected" | "offer";

type JobRecord = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  source: string | null;
  url: string | null;
  match_score: number | null;
};

type ApplicationRecord = {
  id: string;
  job_id: string;
  cv_id: string | null;
  status: ApplicationStatus;
  created_at: string;
  submitted_at: string | null;
};

type TrackerItem = ApplicationRecord & {
  job?: JobRecord;
};

const columns: Array<{ status: ApplicationStatus; title: string }> = [
  { status: "saved", title: "Saved" },
  { status: "ready", title: "CV ready" },
  { status: "applied", title: "Applied" },
  { status: "interview", title: "Interview" },
  { status: "offer", title: "Offer" },
  { status: "rejected", title: "Rejected" }
];

const statusOptions: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "saved", label: "Saved" },
  { value: "ready", label: "CV ready" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" }
];

export function TrackerView() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      items: items.filter((item) => item.status === column.status)
    }));
  }, [items]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) {
        return;
      }

      setUser(data.user);
      if (data.user) {
        await loadTracker(data.user.id);
      } else {
        setItems([]);
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadTracker(session.user.id);
      } else {
        setItems([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadTracker(userId = user?.id) {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    const { data: applications, error: applicationError } = await supabase
      .from("applications")
      .select("id,job_id,cv_id,status,created_at,submitted_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (applicationError) {
      setError(applicationError.message);
      setLoading(false);
      return;
    }

    const jobIds = Array.from(new Set((applications ?? []).map((application) => application.job_id)));
    const { data: jobs, error: jobsError } = jobIds.length
      ? await supabase
          .from("jobs")
          .select("id,title,company,location,salary,source,url,match_score")
          .in("id", jobIds)
      : { data: [], error: null };

    if (jobsError) {
      setError(jobsError.message);
      setLoading(false);
      return;
    }

    const jobsById = new Map((jobs ?? []).map((job) => [job.id, job]));
    setItems(
      (applications ?? []).map((application) => ({
        ...application,
        status: normalizeStatus(application.status),
        job: jobsById.get(application.job_id)
      }))
    );
    setLoading(false);
  }

  async function updateStatus(applicationId: string, status: ApplicationStatus) {
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status,
        submitted_at: status === "applied" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === applicationId
          ? { ...item, status, submitted_at: status === "applied" ? new Date().toISOString() : null }
          : item
      )
    );
    setMessage("Tracker updated.");
  }

  if (loading) {
    return <div className="rounded-2xl border border-line bg-white p-5 text-sm font-bold text-muted shadow-quiet">Loading tracker</div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 text-sm font-bold text-muted shadow-quiet">
        Sign in with Google to save jobs and use the tracker.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-quiet sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted">Live tracker</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-normal">{items.length} saved application{items.length === 1 ? "" : "s"}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Move each job as the user applies manually, gets interviews, or receives a decision.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadTracker()}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </section>

      {message && <p className="text-sm font-bold text-pilot-green">{message}</p>}
      {error && <p className="text-sm font-bold text-pilot-red">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {grouped.map((column) => (
          <section key={column.status} className="min-h-72 rounded-2xl border border-line/90 bg-white/85 p-4 shadow-quiet">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold">{column.title}</h3>
              <span className="rounded-full bg-[#f1eee6] px-2.5 py-1 text-xs font-black text-muted">{column.items.length}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {column.items.length === 0 && (
                <div className="rounded-xl border border-dashed border-line bg-[#fbfaf7] p-3 text-sm font-bold text-muted">
                  No jobs here yet.
                </div>
              )}
              {column.items.map((item) => (
                <TrackerCard key={item.id} item={item} onStatusChange={updateStatus} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function TrackerCard({
  item,
  onStatusChange
}: {
  item: TrackerItem;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
}) {
  const job = item.job;

  return (
    <article className="rounded-xl border border-line/80 bg-[#fbfaf7] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black">{job?.title ?? "Saved job"}</h4>
          <p className="mt-1 text-xs font-semibold leading-5 text-muted">
            {[job?.company, job?.location].filter(Boolean).join(" | ") || "Details saved"}
          </p>
        </div>
        {typeof job?.match_score === "number" && (
          <span className="rounded-full bg-pilot-greenSoft px-2 py-1 text-xs font-black text-pilot-green">{job.match_score}%</span>
        )}
      </div>

      <div className="mt-3 grid gap-2">
        <select
          value={item.status}
          onChange={(event) => onStatusChange(item.id, event.target.value as ApplicationStatus)}
          className="h-9 rounded-lg border border-line bg-white px-2 text-sm font-bold outline-none focus:border-pilot-green"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {job?.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green"
          >
            Apply link
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

function normalizeStatus(status: string): ApplicationStatus {
  if (status === "drafted") {
    return "ready";
  }

  if (["saved", "ready", "applied", "interview", "rejected", "offer"].includes(status)) {
    return status as ApplicationStatus;
  }

  return "saved";
}
