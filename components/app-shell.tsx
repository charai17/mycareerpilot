"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Database,
  FileSearch,
  Globe2,
  KeyRound,
  LockKeyhole,
  Sparkles
} from "lucide-react";
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
    <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-line bg-white/85 p-5 shadow-sm backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <button
            className="inline-flex items-center gap-3 text-left font-bold"
            type="button"
            onClick={() => setActiveView("dashboard")}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">m</span>
            <span>mycareerpilot</span>
          </button>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-bold text-muted lg:hidden">
            {activeLabel}
          </span>
        </div>

        <nav className="mt-6 grid gap-1 sm:grid-cols-2 lg:grid-cols-1" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold transition ${
                  selected ? "bg-pilot-greenSoft text-pilot-green" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <section className="mt-6 rounded-lg border border-line bg-white p-4 shadow-quiet lg:mt-auto">
          <p className="text-xs font-bold uppercase text-pilot-green">Plan</p>
          <strong className="mt-1 block">Pro trial</strong>
          <p className="mt-2 text-sm leading-6 text-muted">32 AI matches and 8 tailored CV drafts remaining.</p>
        </section>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-12 lg:py-8">
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
    <header className="flex flex-col gap-5 pb-7 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase text-pilot-green">Global job search assistant</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-none tracking-normal sm:text-5xl lg:text-6xl">
          Find, tailor, apply, and track in one calm workspace.
        </h1>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button variant="secondary">Preview profile</Button>
        <Button>Connect Google</Button>
      </div>
    </header>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <section aria-labelledby="dashboard-title">
      <SectionHeading eyebrow="Today" title="Command center">
        <Button onClick={() => onNavigate("jobs")}>
          Start search
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </SectionHeading>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Best matches" action="View all">
          <div className="grid gap-3">
            {jobMatches.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        </Panel>

        <Panel title="Application queue" action="Review">
          <ol className="grid gap-4">
            {applicationSteps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-black text-pilot-blue">
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

function ProfileView() {
  return (
    <section aria-labelledby="profile-title">
      <SectionHeading eyebrow="Onboarding" title="Career profile">
        <Button>Save profile</Button>
      </SectionHeading>

      <div className="grid max-w-5xl gap-4 md:grid-cols-2">
        <Field label="Target roles" defaultValue="Operations, product, customer success" />
        <Field label="Regions" defaultValue="United Kingdom, Europe, Remote global" />
        <label className="grid gap-2 font-bold text-slate-800">
          Seniority
          <select className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green">
            <option>Mid to senior</option>
            <option>Entry level</option>
            <option>Leadership</option>
          </select>
        </label>
        <Field label="Salary range" defaultValue="GBP 55k+" />
        <label className="grid gap-2 font-bold text-slate-800 md:col-span-2">
          Career summary
          <textarea
            className="min-h-36 rounded-lg border border-line bg-white p-3 text-base font-normal leading-6 outline-none focus:border-pilot-green"
            defaultValue="Experienced operator with a track record improving team processes, client outcomes, and commercial reporting."
          />
        </label>
      </div>
    </section>
  );
}

function JobsView() {
  return (
    <section aria-labelledby="jobs-title">
      <SectionHeading eyebrow="Discovery" title="Job search">
        <Button>Run search</Button>
      </SectionHeading>

      <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
        <input
          aria-label="Search query"
          defaultValue="remote operations manager"
          className="h-12 rounded-lg border border-line bg-white px-3 outline-none focus:border-pilot-green"
        />
        <select
          aria-label="Region"
          className="h-12 rounded-lg border border-line bg-white px-3 outline-none focus:border-pilot-green"
        >
          <option>Global regions</option>
          <option>United Kingdom</option>
          <option>United States</option>
          <option>Europe</option>
        </select>
        <Button variant="secondary">Filters</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {sourceCards.map((source) => (
          <article key={source.title} className="rounded-lg border border-line bg-white p-5 shadow-quiet">
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
    <section aria-labelledby="cv-title">
      <SectionHeading eyebrow="Documents" title="CV Studio">
        <Button>Generate tailored CV</Button>
      </SectionHeading>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Build from scratch">
          <p className="leading-6 text-muted">
            Create a master CV from profile data, then generate tailored versions for each job.
          </p>
          <div className="mt-5 grid gap-3">
            {["Professional CV", "Modern CV", "ATS-friendly CV"].map((label) => (
              <button
                key={label}
                type="button"
                className="flex min-h-12 items-center justify-between rounded-lg border border-line bg-white px-4 text-left font-bold transition hover:border-pilot-green"
              >
                {label}
                <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
              </button>
            ))}
          </div>
        </Panel>

        <article className="grid min-h-[460px] content-start gap-4 rounded-lg border border-line bg-white p-8 shadow-quiet">
          <div className="h-7 w-7/12 rounded bg-ink" />
          <div className="h-3 rounded bg-slate-200" />
          <div className="h-3 w-5/12 rounded bg-slate-200" />
          <div className="h-28 rounded bg-slate-100" />
          <div className="h-3 rounded bg-slate-200" />
          <div className="h-3 w-6/12 rounded bg-slate-200" />
          <div className="h-24 rounded bg-slate-100" />
        </article>
      </div>
    </section>
  );
}

function ApplyView() {
  return (
    <section aria-labelledby="apply-title">
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
              index === 0 ? "border-emerald-200 bg-emerald-50" : "border-line bg-white"
            }`}
          >
            <span className="text-sm font-black text-pilot-green">{number}</span>
            <h3 className="mt-3 text-lg font-bold">{title}</h3>
            <p className="mt-3 leading-6 text-muted">{detail}</p>
          </article>
        ))}
      </div>

      <article className="mt-5 rounded-lg border border-line bg-white p-5 shadow-quiet">
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
            <div key={principle} className="flex gap-3 rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-700">
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
    <section aria-labelledby="tracker-title">
      <SectionHeading eyebrow="Pipeline" title="Application tracker">
        <Button variant="secondary">Export</Button>
      </SectionHeading>

      <div className="grid gap-4 xl:grid-cols-4">
        {trackerColumns.map((column) => (
          <section key={column.title} className="min-h-72 rounded-lg border border-line bg-white p-4 shadow-quiet">
            <h3 className="font-bold">{column.title}</h3>
            <div className="mt-4 grid gap-3">
              {column.jobs.map((job) => (
                <article key={job} className="rounded-lg border border-line bg-slate-50 p-3 text-sm font-bold">
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
        <h2 className="mt-1 text-3xl font-bold tracking-normal">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="min-h-36 rounded-lg border border-line bg-white p-5 shadow-quiet">
      <p className="text-sm text-muted">{metric.label}</p>
      <strong className="mt-4 block text-4xl leading-none">{metric.value}</strong>
      <span className="mt-4 block text-sm text-muted">{metric.detail}</span>
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
    <section className="rounded-lg border border-line bg-white p-5 shadow-quiet">
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
    <article className="flex flex-col gap-3 rounded-lg border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
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

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 font-bold text-slate-800">
      {label}
      <input
        className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green"
        defaultValue={defaultValue}
      />
    </label>
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-bold transition ${
        variant === "primary"
          ? "bg-ink text-white hover:bg-slate-800"
          : "border border-line bg-white text-ink hover:border-slate-400"
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
    <article className="rounded-lg border border-line bg-white p-4 shadow-quiet">
      <Icon className="h-5 w-5 text-pilot-green" aria-hidden="true" />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </article>
  );
}
