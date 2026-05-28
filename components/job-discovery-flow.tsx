"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Globe2,
  MapPin,
  Send,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { jobMatches } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/database.types";

type CvRecord = {
  id: string;
  title: string;
  content: Json;
  updated_at: string;
};

type SearchState = {
  role: string;
  regions: string;
  workingStyle: string;
  salary: string;
  numberOfJobs: string;
};

type JobStatus = "ready" | "needs-review" | "unsupported" | "sent";

type ApplyJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  score: number;
  status: JobStatus;
};

const defaultSearch: SearchState = {
  role: "Operations Manager, Customer Success Lead",
  regions: "United Kingdom, Europe, Remote",
  workingStyle: "Remote-first",
  salary: "GBP 55k+",
  numberOfJobs: "25"
};

const initialJobs: ApplyJob[] = jobMatches.map((job, index) => ({
  id: job.id,
  title: job.title,
  company: job.company,
  location: job.location,
  salary: job.salary,
  source: job.source,
  score: job.score,
  status: index === 2 ? "needs-review" : "ready"
}));

const statusCopy: Record<JobStatus, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-pilot-greenSoft text-pilot-green" },
  "needs-review": { label: "Needs review", className: "bg-amber-50 text-pilot-gold" },
  unsupported: { label: "Guided apply", className: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", className: "bg-blue-50 text-pilot-blue" }
};

export function JobDiscoveryFlow() {
  const [user, setUser] = useState<User | null>(null);
  const [cvs, setCvs] = useState<CvRecord[]>([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [pastedCv, setPastedCv] = useState("");
  const [form, setForm] = useState<SearchState>(defaultSearch);
  const [jobs, setJobs] = useState<ApplyJob[]>(initialJobs);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>(initialJobs.filter((job) => job.status === "ready").map((job) => job.id));
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedJobs = useMemo(
    () => jobs.filter((job) => selectedJobIds.includes(job.id)),
    [jobs, selectedJobIds]
  );
  const readySelectedJobs = selectedJobs.filter((job) => job.status === "ready");
  const selectedCv = cvs.find((cv) => cv.id === selectedCvId);
  const canApply = Boolean(selectedCvId || pastedCv.trim()) && readySelectedJobs.length > 0;

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) {
        return;
      }

      setUser(data.user);
      if (data.user) {
        await loadCvs(data.user.id);
      }
    }

    load();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadCvs(session.user.id);
      } else {
        setCvs([]);
        setSelectedCvId("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadCvs(userId: string) {
    const { data, error: loadError } = await supabase
      .from("cvs")
      .select("id,title,content,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    const records = data ?? [];
    setCvs(records);
    if (records[0] && !selectedCvId) {
      setSelectedCvId(records[0].id);
    }
  }

  function updateField(field: keyof SearchState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleJob(jobId: string) {
    setSelectedJobIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]
    );
  }

  function toggleAllReady() {
    const readyIds = jobs.filter((job) => job.status === "ready").map((job) => job.id);
    const everyReadySelected = readyIds.every((id) => selectedJobIds.includes(id));
    setSelectedJobIds(everyReadySelected ? [] : readyIds);
  }

  function findJobs() {
    setJobs(initialJobs);
    setSelectedJobIds(initialJobs.filter((job) => job.status === "ready").map((job) => job.id));
    setReviewing(false);
    setMessage(`${initialJobs.length} matching jobs found. Ready jobs are selected.`);
    setError(null);
  }

  function reviewSend() {
    if (!canApply) {
      setError("Add a CV and select at least one ready job before sending.");
      return;
    }

    setReviewing(true);
    setMessage(null);
    setError(null);
  }

  function confirmSend() {
    const readyIds = readySelectedJobs.map((job) => job.id);
    setJobs((current) =>
      current.map((job) => (readyIds.includes(job.id) ? { ...job, status: "sent" } : job))
    );
    setSelectedJobIds([]);
    setReviewing(false);
    setMessage(`${readyIds.length} application${readyIds.length === 1 ? "" : "s"} marked as sent.`);
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-quiet">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Application console</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-normal">Add CV, find jobs, send applications</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Choose the general CV, search matching roles, then review and send to all selected ready jobs.
            </p>
          </div>
          <button
            type="button"
            onClick={reviewSend}
            disabled={!canApply}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Review & send selected
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-line bg-[#fafaf8] p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-pilot-green" aria-hidden="true" />
              <h4 className="font-bold">Add CV</h4>
            </div>
            <div className="mt-4 grid gap-3">
              {user && cvs.length > 0 ? (
                <label className="grid gap-2 text-sm font-semibold text-ink">
                  Saved CV
                  <select
                    value={selectedCvId}
                    onChange={(event) => setSelectedCvId(event.target.value)}
                    className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green"
                  >
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-lg bg-white p-3 text-sm font-bold text-muted">
                  {user ? "No saved CVs yet. Paste a CV below for this search." : "Sign in to use saved CV history, or paste a CV below."}
                </div>
              )}
              <label className="grid gap-2 text-sm font-semibold text-ink">
                Paste CV for this search
                <textarea
                  rows={6}
                  value={pastedCv}
                  onChange={(event) => setPastedCv(event.target.value)}
                  placeholder="Paste a CV here if they do not want to use a saved one."
                  className="rounded-lg border border-line bg-white p-3 text-base font-normal leading-6 outline-none focus:border-pilot-green"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-[#fafaf8] p-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-pilot-green" aria-hidden="true" />
              <h4 className="font-bold">Search details</h4>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Field label="Target roles" value={form.role} onChange={(value) => updateField("role", value)} />
              <Field label="Preferred regions" value={form.regions} onChange={(value) => updateField("regions", value)} />
              <SelectField
                label="Working style"
                value={form.workingStyle}
                options={["Remote-first", "Hybrid", "On-site", "Flexible"]}
                onChange={(value) => updateField("workingStyle", value)}
              />
              <Field label="Salary expectation" value={form.salary} onChange={(value) => updateField("salary", value)} />
              <SelectField
                label="How many jobs?"
                value={form.numberOfJobs}
                options={["10", "25", "50", "100"]}
                onChange={(value) => updateField("numberOfJobs", value)}
              />
              <button
                type="button"
                onClick={findJobs}
                className="inline-flex min-h-12 items-center justify-center gap-2 self-end rounded-lg border border-line bg-white px-4 font-bold transition hover:border-pilot-green"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Find jobs
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-quiet">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold">Matching jobs</h3>
            <p className="mt-1 text-sm text-muted">
              {selectedJobs.length} selected | {readySelectedJobs.length} ready to send
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={toggleAllReady}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Select all ready
            </button>
            <button
              type="button"
              onClick={reviewSend}
              disabled={!canApply}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Review & send selected
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {jobs.map((job) => {
            const selected = selectedJobIds.includes(job.id);
            const status = statusCopy[job.status];
            const disabled = job.status !== "ready";

            return (
              <article
                key={job.id}
                className={`rounded-xl border p-4 transition ${
                  selected ? "border-pilot-green bg-pilot-greenSoft/60" : "border-line bg-[#fafaf8]"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => toggleJob(job.id)}
                      className="mt-1 h-5 w-5 accent-pilot-green disabled:opacity-40"
                      aria-label={`Select ${job.title}`}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold">{job.title}</h4>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {job.company} | {job.location} | {job.salary}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{job.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 min-w-16 place-items-center rounded-full bg-white px-3 font-black text-pilot-green">
                      {job.score}%
                    </span>
                    <button className="inline-flex min-h-9 items-center rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green">
                      View job
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {reviewing && (
          <div className="mt-5 rounded-2xl border border-pilot-green/30 bg-pilot-greenSoft p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-pilot-green" aria-hidden="true" />
              <div>
                <h3 className="font-bold">Review before sending</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  CareerPilot will apply to {readySelectedJobs.length} selected ready job{readySelectedJobs.length === 1 ? "" : "s"} using{" "}
                  <strong>{selectedCv?.title ?? "the pasted CV"}</strong>. Jobs marked needs review or guided apply will not be sent automatically.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={confirmSend}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Send ready applications
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewing(false)}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-bold transition hover:border-pilot-green"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {message && <p className="mt-4 text-sm font-bold text-pilot-green">{message}</p>}
        {error && <p className="mt-4 text-sm font-bold text-pilot-red">{error}</p>}
      </section>

      <section className="grid gap-3 rounded-2xl border border-line bg-white p-5 shadow-quiet sm:grid-cols-3">
        <SummaryPill icon={FileText} label={selectedCv?.title ?? (pastedCv.trim() ? "Pasted CV" : "No CV selected")} />
        <SummaryPill icon={Globe2} label={form.regions} />
        <SummaryPill icon={MapPin} label={form.workingStyle} />
      </section>
    </div>
  );
}

function SummaryPill({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#fafaf8] px-3 text-sm font-bold text-muted">
      <Icon className="h-4 w-4 text-pilot-green" aria-hidden="true" />
      {label}
    </span>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <input
        className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <select
        className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
