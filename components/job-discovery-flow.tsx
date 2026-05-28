"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe2,
  Lightbulb,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Target,
  WandSparkles
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

type JobStatus = "match" | "tailored" | "external" | "tracked";

type JobInsight = {
  fit: string[];
  missing: string[];
  cvAngle: string;
  checklist: string[];
};

type ApplyJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  score: number;
  status: JobStatus;
  url: string;
  insight?: JobInsight;
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
  status: index === 0 ? "tailored" : index === 1 ? "tracked" : "match",
  url: "#"
}));

const statusCopy: Record<JobStatus, { label: string; className: string }> = {
  match: { label: "Match found", className: "bg-pilot-greenSoft text-pilot-green" },
  tailored: { label: "CV ready", className: "bg-blue-50 text-pilot-blue" },
  external: { label: "Apply on site", className: "bg-slate-100 text-slate-600" },
  tracked: { label: "Tracked", className: "bg-amber-50 text-pilot-gold" }
};

export function JobDiscoveryFlow() {
  const [user, setUser] = useState<User | null>(null);
  const [cvs, setCvs] = useState<CvRecord[]>([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [pastedCv, setPastedCv] = useState("");
  const [form, setForm] = useState<SearchState>(defaultSearch);
  const [jobs, setJobs] = useState<ApplyJob[]>(initialJobs);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>(initialJobs.filter((job) => job.status !== "tracked").map((job) => job.id));
  const [reviewing, setReviewing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [savingJobs, setSavingJobs] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedJobs = useMemo(() => jobs.filter((job) => selectedJobIds.includes(job.id)), [jobs, selectedJobIds]);
  const trackableSelectedJobs = selectedJobs.filter((job) => job.status !== "tracked");
  const selectedCv = cvs.find((cv) => cv.id === selectedCvId);
  const cvText = selectedCv ? stringifyCvContent(selectedCv.content) : pastedCv.trim();
  const canPrepare = Boolean(selectedCvId || pastedCv.trim()) && trackableSelectedJobs.length > 0;

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
    setSelectedJobIds((current) => (current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]));
  }

  function toggleAllReady() {
    const trackableIds = jobs.filter((job) => job.status !== "tracked").map((job) => job.id);
    const everyTrackableSelected = trackableIds.every((id) => selectedJobIds.includes(id));
    setSelectedJobIds(everyTrackableSelected ? [] : trackableIds);
  }

  async function findJobs() {
    setSearching(true);
    setReviewing(false);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cvText })
      });
      const result = (await response.json()) as { jobs?: ApplyJob[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "The job search could not complete.");
      }

      const liveJobs = result.jobs ?? [];
      setJobs(liveJobs);
      setSelectedJobIds(liveJobs.filter((job) => job.status !== "tracked").map((job) => job.id));
      setMessage(
        liveJobs.length > 0
          ? `${liveJobs.length} live job${liveJobs.length === 1 ? "" : "s"} found from connected sources.`
          : "No live jobs found for that search yet. Try a broader role or region."
      );
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : "The job search could not complete.";
      setError(message);
    } finally {
      setSearching(false);
    }
  }

  function reviewPrepare() {
    if (!canPrepare) {
      setError("Add a CV and select at least one job before preparing applications.");
      return;
    }

    setReviewing(true);
    setMessage(null);
    setError(null);
  }

  async function confirmPrepare() {
    if (!user) {
      setError("Sign in with Google before saving jobs to the tracker.");
      return;
    }

    setSavingJobs(true);
    setError(null);

    try {
      const savedIds: string[] = [];

      for (const job of trackableSelectedJobs) {
        const { data: savedJob, error: jobError } = await supabase
          .from("jobs")
          .insert({
            user_id: user.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            source: job.source,
            url: job.url,
            description: describeJobInsight(job.insight),
            match_score: job.score
          })
          .select("id")
          .single();

        if (jobError) {
          throw jobError;
        }

        const { error: applicationError } = await supabase.from("applications").insert({
          user_id: user.id,
          job_id: savedJob.id,
          cv_id: selectedCvId || null,
          status: "saved"
        });

        if (applicationError) {
          throw applicationError;
        }

        savedIds.push(job.id);
      }

      setJobs((current) => current.map((job) => (savedIds.includes(job.id) ? { ...job, status: "tracked" } : job)));
      setSelectedJobIds([]);
      setReviewing(false);
      setMessage(`${savedIds.length} job${savedIds.length === 1 ? "" : "s"} saved to the tracker. The user applies manually from the official job page.`);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Jobs could not be saved to the tracker.";
      setError(message);
    } finally {
      setSavingJobs(false);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-quiet">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Application console</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-normal">Add CV, find jobs, prepare applications</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Choose a CV first so CareerPilot can recommend jobs, explain the fit, spot missing skills, and prepare the right application pack.
            </p>
          </div>
          <button
            type="button"
            onClick={reviewPrepare}
            disabled={!canPrepare}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
            Prepare selected
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
                      <option key={cv.id} value={cv.id}>{cv.title}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-lg bg-white p-3 text-sm font-bold text-muted">
                  {user ? "No saved CVs yet. Paste a CV below for this search." : "Sign in to use saved CV history, or paste a CV below."}
                </div>
              )}
              <label className="grid gap-2 text-sm font-semibold text-ink">
                Paste CV for CV-based recommendations
                <textarea
                  rows={6}
                  value={pastedCv}
                  onChange={(event) => setPastedCv(event.target.value)}
                  placeholder="Paste a CV here so each job match reflects the user's actual skills, experience, and target direction."
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
              <SelectField label="Working style" value={form.workingStyle} options={["Remote-first", "Hybrid", "On-site", "Flexible"]} onChange={(value) => updateField("workingStyle", value)} />
              <Field label="Salary expectation" value={form.salary} onChange={(value) => updateField("salary", value)} />
              <SelectField label="How many jobs?" value={form.numberOfJobs} options={["10", "25", "50", "100"]} onChange={(value) => updateField("numberOfJobs", value)} />
              <button
                type="button"
                onClick={findJobs}
                disabled={searching}
                className="inline-flex min-h-12 items-center justify-center gap-2 self-end rounded-lg border border-line bg-white px-4 font-bold transition hover:border-pilot-green disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {searching ? "Searching" : "Find jobs"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-[#1f1f1f] p-5 text-white shadow-quiet">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#b8d8d3]">Premium monitoring</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-normal">Fresh job checks every 4 days</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#d7d7d2]">
              Paid users can save a search profile and CareerPilot will scan connected job APIs every 4 days, then surface new matches in the tracker and notify them.
            </p>
          </div>
          <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-ink">Pro feature</span>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-quiet">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold">Matching jobs</h3>
            <p className="mt-1 text-sm text-muted">
              {selectedJobs.length} selected | {trackableSelectedJobs.length} ready to prepare | {cvText ? "CV-aware ranking on" : "Add CV for personal ranking"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={toggleAllReady} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Select all new
            </button>
            <button type="button" onClick={reviewPrepare} disabled={!canPrepare} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              Prepare selected
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {jobs.length === 0 && <div className="rounded-xl border border-dashed border-line bg-[#fafaf8] p-6 text-sm font-bold text-muted">No jobs to show yet. Run a broader search or connect another source.</div>}
          {jobs.map((job) => {
            const selected = selectedJobIds.includes(job.id);
            const status = statusCopy[job.status];
            const disabled = job.status === "tracked";

            return (
              <article key={job.id} className={`rounded-xl border p-4 transition ${selected ? "border-pilot-green bg-pilot-greenSoft/60" : "border-line bg-[#fafaf8]"}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected} disabled={disabled} onChange={() => toggleJob(job.id)} className="mt-1 h-5 w-5 accent-pilot-green disabled:opacity-40" aria-label={`Select ${job.title}`} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold">{job.title}</h4>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">{job.company} | {job.location} | {job.salary}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{job.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 min-w-16 place-items-center rounded-full bg-white px-3 font-black text-pilot-green">{job.score}%</span>
                    <a href={job.url || "#"} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green">
                      Apply link
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <JobPlan job={job} cvReady={Boolean(cvText)} />
              </article>
            );
          })}
        </div>

        {reviewing && (
          <div className="mt-5 rounded-2xl border border-pilot-green/30 bg-pilot-greenSoft p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-pilot-green" aria-hidden="true" />
              <div>
                <h3 className="font-bold">Review before applying</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  CareerPilot will prepare {trackableSelectedJobs.length} selected job{trackableSelectedJobs.length === 1 ? "" : "s"} using <strong>{selectedCv?.title ?? "the pasted CV"}</strong>. The user still submits manually on each official application page.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button type="button" onClick={confirmPrepare} disabled={savingJobs} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                    <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                    {savingJobs ? "Saving" : "Save to tracker"}
                  </button>
                  <button type="button" onClick={() => setReviewing(false)} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-bold transition hover:border-pilot-green">Cancel</button>
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

function JobPlan({ job, cvReady }: { job: ApplyJob; cvReady: boolean }) {
  const insight = job.insight ?? getFallbackInsight(cvReady);

  return (
    <div className="mt-4 grid gap-3 border-t border-line/80 pt-4 xl:grid-cols-3">
      <InsightBlock icon={Target} title="Why it fits" items={insight.fit} />
      <InsightBlock icon={Lightbulb} title="Missing or check" items={insight.missing} tone="amber" />
      <div className="rounded-xl border border-line bg-white p-4">
        <div className="flex items-center gap-2">
          <WandSparkles className="h-4 w-4 text-pilot-green" aria-hidden="true" />
          <h5 className="text-sm font-black">CV angle</h5>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{insight.cvAngle}</p>
        <div className="mt-4 grid gap-2">
          {insight.checklist.map((item) => (
            <div key={item} className="flex gap-2 text-sm font-semibold text-ink">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pilot-green" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <button type="button" className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 text-sm font-bold text-white transition hover:bg-slate-800">
          <WandSparkles className="h-4 w-4" aria-hidden="true" />
          Generate tailored CV
        </button>
      </div>
    </div>
  );
}

function InsightBlock({ icon: Icon, title, items, tone = "green" }: { icon: typeof Target; title: string; items: string[]; tone?: "green" | "amber" }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${tone === "green" ? "text-pilot-green" : "text-pilot-gold"}`} aria-hidden="true" />
        <h5 className="text-sm font-black">{title}</h5>
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => <li key={item} className="text-sm leading-6 text-muted">{item}</li>)}
      </ul>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <input className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <select className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function getFallbackInsight(cvReady: boolean): JobInsight {
  if (!cvReady) {
    return {
      fit: ["Add or select a CV to make this match personal.", "CareerPilot will then rank this job against the user's actual skills and experience.", "Recommendations are currently based on search filters only."],
      missing: ["No CV was used for this fit explanation.", "Save a master CV for stronger recommendations."],
      cvAngle: "Use a broad, skills-led CV until the user adds a detailed master CV.",
      checklist: ["Add CV.", "Run search again.", "Open the official apply link."]
    };
  }

  return {
    fit: ["This role matches the selected CV and search preferences."],
    missing: ["Review the advert for must-have tools not yet shown in the CV."],
    cvAngle: "Use the selected CV as the base and emphasise the experience most relevant to this role.",
    checklist: ["Use the selected CV as the base.", "Open the official apply link.", "Track status after applying."]
  };
}

function describeJobInsight(insight?: JobInsight) {
  if (!insight) {
    return null;
  }

  return ["Why it fits:", ...insight.fit, "Missing or check:", ...insight.missing, "CV angle:", insight.cvAngle].join("\n");
}

function stringifyCvContent(content: Json | undefined): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (typeof content === "number" || typeof content === "boolean") {
    return String(content);
  }

  if (Array.isArray(content)) {
    return content.map((item) => stringifyCvContent(item)).join("\n");
  }

  return Object.values(content).map((value) => stringifyCvContent(value)).filter(Boolean).join("\n");
}
