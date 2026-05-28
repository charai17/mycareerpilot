"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Clock3,
  Database,
  FileSearch,
  FileText,
  Globe2,
  KeyRound,
  LockKeyhole,
  Plus,
  Search,
  SendHorizontal,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { AuthStatus } from "@/components/auth-status";
import { CvStudio } from "@/components/cv-studio";
import { ProfileForm } from "@/components/profile-form";
import {
  applicationSteps,
  jobMatches,
  launchPrinciples,
  metrics,
  navigation,
  sourceCards,
  trackerColumns
} from "@/lib/mock-data";
import type { JobMatch, Metric, ViewId } from "@/lib/types";

const statusStyles: Record<JobMatch["status"], string> = {
  recommended: "bg-pilot-greenSoft text-pilot-green",
  ready: "bg-blue-50 text-pilot-blue",
  applied: "bg-amber-50 text-pilot-gold",
  interview: "bg-red-50 text-pilot-red"
};

export function AppShell() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const activeLabel = useMemo(
    () => navigation.find((item) => item.id === activeView)?.label ?? "Dashboard",
    [activeView]
  );

  return (
    <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="border-line/80 bg-[#fbfaf7]/90 p-4 shadow-sm backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:p-4">
        <div className="flex items-center justify-between gap-4">
          <button
            className="inline-flex items-center gap-3 rounded-xl px-2 py-1.5 text-left font-bold transition hover:bg-white"
            type="button"
            onClick={() => setActiveView("dashboard")}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-pilot-green text-white">m</span>
            <span>mycareerpilot</span>
          </button>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-bold text-muted lg:hidden">
            {activeLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveView("jobs")}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-3 text-sm font-bold text-white transition hover:bg-[#343632]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New search
        </button>

        <nav className="mt-4 grid gap-1 sm:grid-cols-2 lg:grid-cols-1" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                  selected ? "bg-white text-pilot-green shadow-sm" : "text-[#5f615b] hover:bg-white/75"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <section className="mt-6 rounded-xl border border-line/80 bg-white/75 p-4 lg:mt-auto">
          <p className="text-xs font-bold uppercase text-pilot-green">Workspace</p>
          <strong className="mt-1 block">Pro trial</strong>
          <p className="mt-2 text-sm leading-6 text-muted">32 matches and 8 tailored CV drafts remaining.</p>
        </section>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-10 lg:py-6">
        <Hero />
        {activeView === "dashboard" && <DashboardView onNavigate={setActiveView} />}
        {activeView === "profile" && <ProfileView />}
        {activeView === "jobs" && <JobsView />}
        {activeView === "cv" && <CvView />}
        {activeView === "apply" && <ApplyView />}
        {activeView === "tracker" && <TrackerView />}
      </main>
    </div>
  );
}

function Hero() {
  return (
    <header className="flex items-center justify-between gap-4 pb-6">
      <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line/80 bg-white/70 px-3 text-sm font-bold text-muted transition hover:bg-white">
        <Clock3 className="h-4 w-4" aria-hidden="true" />
        Recent
      </button>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <AuthStatus />
      </div>
    </header>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <section aria-labelledby="dashboard-title" className="mx-auto max-w-5xl">
      <div className="pt-6 text-center lg:pt-12">
        <p className="text-sm font-bold text-pilot-green">Career search, tuned to you</p>
        <h1
          id="dashboard-title"
          className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl"
        >
          What role should we find and prepare today?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">
          Search across regions, compare matches, tailor your CV, and keep every application ready for approval.
        </p>
      </div>

      <CommandComposer onNavigate={onNavigate} />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Best matches" action="View all">
          <div className="grid gap-2">
            {jobMatches.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        </Panel>

        <Panel title="Application queue" action="Review">
          <ol className="grid gap-3">
            {applicationSteps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f1eee6] text-sm font-black text-pilot-blue">
                  {index + 1}
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </section>
  );
}

function CommandComposer({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line/90 bg-white p-3 shadow-quiet">
      <div className="flex gap-3">
        <Search className="mt-3 h-5 w-5 shrink-0 text-pilot-green" aria-hidden="true" />
        <textarea
          aria-label="Career search prompt"
          rows={3}
          defaultValue="Find remote operations or customer success roles in the UK and Europe, then prepare a tailored CV draft."
          className="min-h-24 flex-1 resize-none bg-transparent p-1 leading-7 outline-none"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line/80 pt-3">
        <div className="flex flex-wrap gap-2">
          <CommandChip icon={Globe2} label="Global" />
          <CommandChip icon={FileText} label="Use master CV" />
          <CommandChip icon={SlidersHorizontal} label="Filters" />
        </div>
        <button
          type="button"
          onClick={() => onNavigate("jobs")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-pilot-green px-4 text-sm font-bold text-white transition hover:bg-[#196961]"
        >
          Search jobs
          <SendHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function CommandChip({ icon: Icon, label }: { icon: typeof Globe2; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line/80 bg-[#fbfaf7] px-3 text-sm font-bold text-muted transition hover:border-pilot-green hover:text-pilot-green"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function ProfileView() {
  return (
    <section aria-labelledby="profile-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Onboarding" title="Career profile">
        <span className="rounded-full border border-line bg-white px-3 py-1 text-sm font-bold text-muted">
          Supabase-backed
        </span>
      </SectionHeading>

      <ProfileForm />
    </section>
  );
}

function JobsView() {
  return (
    <section aria-labelledby="jobs-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Discovery" title="Job search">
        <Button>Run search</Button>
      </SectionHeading>

      <div className="mb-5 rounded-2xl border border-line/90 bg-white p-3 shadow-quiet">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-pilot-green" aria-hidden="true" />
          <input
            aria-label="Search query"
            defaultValue="remote operations manager"
            className="h-12 flex-1 bg-transparent px-1 outline-none"
          />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted transition hover:border-pilot-green hover:text-pilot-green"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 border-t border-line/80 pt-3">
          {["Global regions", "United Kingdom", "Remote", "Mid to senior", "GBP 55k+"].map((filter) => (
            <span key={filter} className="rounded-full bg-[#f4f1ea] px-3 py-1.5 text-sm font-bold text-muted">
              {filter}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {sourceCards.map((source) => (
          <article key={source.title} className="rounded-2xl border border-line/90 bg-white/85 p-5 shadow-quiet">
            <h3 className="text-lg font-bold">{source.title}</h3>
            <p className="mt-3 leading-6 text-muted">{source.detail}</p>
            <span className="mt-4 block text-sm font-black text-pilot-gold">{source.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function CvView() {
  return (
    <section aria-labelledby="cv-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Documents" title="CV Studio">
        <Button>Generate tailored CV</Button>
      </SectionHeading>

      <CvStudio />
    </section>
  );
}

function ApplyView() {
  return (
    <section aria-labelledby="apply-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Automation" title="Assisted apply">
        <Button>Review application</Button>
      </SectionHeading>

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          ["01", "Find eligible jobs", "Searches selected regions and excludes roles that fail user rules."],
          ["02", "Prepare application", "Tailors CV, drafts cover letter, and fills common questions."],
          ["03", "Ask for approval", "The user reviews exactly what will be submitted."],
          ["04", "Submit if allowed", "Only sends after permission, and only on supported sources."]
        ].map(([number, title, detail], index) => (
          <article
            key={title}
            className={`rounded-lg border p-5 shadow-quiet ${
              index === 0 ? "border-emerald-200 bg-emerald-50" : "border-line/90 bg-white/85"
            }`}
          >
            <span className="text-sm font-black text-pilot-green">{number}</span>
            <h3 className="mt-3 text-lg font-bold">{title}</h3>
            <p className="mt-3 leading-6 text-muted">{detail}</p>
          </article>
        ))}
      </div>

      <article className="mt-5 rounded-2xl border border-line/90 bg-white p-5 shadow-quiet">
        <div className="flex items-center gap-3">
          <LockKeyhole className="h-5 w-5 text-pilot-green" aria-hidden="true" />
          <h3 className="text-lg font-bold">Recommended launch rule</h3>
        </div>
        <p className="mt-3 max-w-4xl leading-7 text-muted">
          Start with assisted approval: mycareerpilot prepares and fills the application, then the user confirms before
          it sends. Later, paid users can enable trusted auto-submit rules for specific job types, regions, and sources.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {launchPrinciples.map((principle) => (
            <div key={principle} className="flex gap-3 rounded-xl bg-[#f4f1ea] p-4 text-sm font-bold text-slate-700">
              <Check className="h-4 w-4 shrink-0 text-pilot-green" aria-hidden="true" />
              {principle}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function TrackerView() {
  return (
    <section aria-labelledby="tracker-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Pipeline" title="Application tracker">
        <Button variant="secondary">Export</Button>
      </SectionHeading>

      <div className="grid gap-4 xl:grid-cols-4">
        {trackerColumns.map((column) => (
          <section key={column.title} className="min-h-72 rounded-2xl border border-line/90 bg-white/85 p-4 shadow-quiet">
            <h3 className="font-bold">{column.title}</h3>
            <div className="mt-4 grid gap-3">
              {column.jobs.map((job) => (
                <article key={job} className="rounded-xl border border-line/80 bg-[#fbfaf7] p-3 text-sm font-bold">
                  {job}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase text-pilot-green">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-normal">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="min-h-28 rounded-2xl border border-line/90 bg-white/80 p-4">
      <p className="text-sm text-muted">{metric.label}</p>
      <strong className="mt-3 block text-3xl leading-none">{metric.value}</strong>
      <span className="mt-3 block text-sm text-muted">{metric.detail}</span>
    </article>
  );
}

function Panel({
  title,
  action,
  children
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line/90 bg-white/85 p-5 shadow-quiet">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{title}</h3>
        {action && <button className="font-bold text-pilot-green">{action}</button>}
      </div>
      {children}
    </section>
  );
}

function JobRow({ job }: { job: JobMatch }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line/80 bg-[#fbfaf7] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-bold">{job.title}</h4>
          <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusStyles[job.status]}`}>
            {job.status}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted">
          {job.company} | {job.location} | {job.salary}
        </p>
        <p className="mt-1 text-xs font-bold text-slate-500">{job.source}</p>
      </div>
      <span className="grid h-9 min-w-16 place-items-center rounded-full bg-pilot-greenSoft px-3 font-black text-pilot-green">
        {job.score}%
      </span>
    </article>
  );
}

function Button({
  children,
  variant = "primary",
  onClick
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-bold transition ${
        variant === "primary"
          ? "bg-ink text-white hover:bg-[#343632]"
          : "border border-line/90 bg-white/80 text-ink hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export function FoundationNotes() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <MiniNote icon={KeyRound} title="Auth ready" detail="Google sign-in can be wired through Supabase Auth." />
      <MiniNote icon={Database} title="Data ready" detail="Profile, CV, jobs, drafts, and audit logs map cleanly to Postgres." />
      <MiniNote icon={Sparkles} title="AI ready" detail="OpenAI calls can slot into CV parsing, matching, and answer drafting." />
      <MiniNote icon={Globe2} title="Global regions" detail="The search model supports user-selected regions and remote preferences." />
      <MiniNote icon={FileSearch} title="Manual import" detail="A paste-any-job flow gives value before broad connector coverage." />
      <MiniNote icon={CircleDollarSign} title="Billing ready" detail="Stripe can be introduced after the core value loop works." />
    </div>
  );
}

function MiniNote({
  icon: Icon,
  title,
  detail
}: {
  icon: typeof KeyRound;
  title: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-line/90 bg-white/85 p-4 shadow-quiet">
      <Icon className="h-5 w-5 text-pilot-green" aria-hidden="true" />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </article>
  );
}
