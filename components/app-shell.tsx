"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  FileSearch,
  FileText,
  Globe2,
  KeyRound,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { AuthStatus } from "@/components/auth-status";
import { CvStudio } from "@/components/cv-studio";
import { JobDiscoveryFlow } from "@/components/job-discovery-flow";
import { TrackerView as ApplicationTracker } from "@/components/tracker-view";
import {
  applicationSteps,
  jobMatches,
  metrics,
  navigation
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
    <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="border-line bg-[#f7f7f4] p-3 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r">
        <div className="flex items-center justify-between gap-3 px-1">
          <button
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold transition hover:bg-white"
            type="button"
            onClick={() => setActiveView("dashboard")}
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-sm text-white">m</span>
            <span>mycareerpilot</span>
          </button>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-bold text-muted lg:hidden">
            {activeLabel}
          </span>
        </div>

        <nav className="mt-6 grid gap-0.5 sm:grid-cols-2 lg:grid-cols-1" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                  selected ? "bg-white font-semibold text-ink shadow-sm" : "font-medium text-muted hover:bg-white/70"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <section className="mt-6 rounded-lg border border-line bg-white p-3 lg:mt-auto">
          <p className="text-xs font-semibold uppercase text-muted">Plan</p>
          <strong className="mt-1 block text-sm">Premium preview</strong>
          <p className="mt-1 text-xs leading-5 text-muted">Daily market checks on the GBP 10 plan</p>
        </section>
      </aside>

      <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
        <Hero />
        {activeView === "dashboard" && <DashboardView onNavigate={setActiveView} />}
        {activeView === "jobs" && <JobsView />}
        {activeView === "cv" && <CvView />}
        {activeView === "tracker" && <TrackerPanel />}
        {activeView === "plans" && <PlansView />}
      </main>
    </div>
  );
}

function Hero() {
  return (
    <header className="flex items-center justify-between gap-4 pb-4">
      <button className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted transition hover:bg-white">
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
    <section aria-labelledby="dashboard-title" className="mx-auto max-w-4xl">
      <div className="pt-8 text-center lg:pt-14">
        <p className="text-sm font-medium text-muted">Career search, tuned to you</p>
        <h1
          id="dashboard-title"
          className="mx-auto mt-3 max-w-3xl text-4xl font-medium leading-tight tracking-normal sm:text-5xl"
        >
          Choose the career service you want to start with.
        </h1>
      </div>

      <ServiceLauncher onNavigate={onNavigate} />

      <CvCta onNavigate={onNavigate} />

      <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
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

const services: Array<{
  title: string;
  detail: string;
  view: ViewId;
  icon: typeof BriefcaseBusiness;
  label: string;
}> = [
  {
    title: "Job Discovery Pilot",
    detail: "Find relevant roles, prepare CVs, and open official apply links from one place.",
    view: "jobs",
    icon: BriefcaseBusiness,
    label: "Search jobs"
  },
  {
    title: "Professional CV Studio",
    detail: "Build a polished master CV designed for recruiter scans and ATS systems.",
    view: "cv",
    icon: FileText,
    label: "Build CV"
  },
  {
    title: "Application Tracker",
    detail: "Track every saved role, manual application, interview, and follow-up.",
    view: "tracker",
    icon: ShieldCheck,
    label: "Open tracker"
  },
  {
    title: "Plans",
    detail: "Choose the normal plan or upgrade for daily market checks and tailored CVs.",
    view: "plans",
    icon: CreditCard,
    label: "View plans"
  }
];

function ServiceLauncher({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const Icon = service.icon;

        return (
          <button
            key={service.title}
            type="button"
            onClick={() => onNavigate(service.view)}
            className="group rounded-2xl border border-line bg-white p-5 text-left transition hover:border-[#cfcfca] hover:shadow-quiet"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3f3ef] text-ink transition group-hover:bg-ink group-hover:text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-5 block text-lg font-semibold">{service.title}</span>
            <span className="mt-2 block min-h-12 text-sm leading-6 text-muted">{service.detail}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              {service.label}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CvCta({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <section className="mx-auto mt-4 flex max-w-4xl flex-col gap-4 rounded-2xl border border-line bg-[#1f1f1f] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[#b8d8d3]">Build the perfect CV</p>
        <h2 className="mt-1 text-2xl font-medium tracking-normal">A stronger CV can improve job chances by 75%.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d7d7d2]">
          CareerPilot AI helps shape your master CV and can prepare a tailored version for selected roles.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate("cv")}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink transition hover:bg-[#f1f1ec]"
      >
        Start CV
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}

function JobsView() {
  return (
    <section aria-labelledby="jobs-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Discovery" title="Job search">
        <Button>Find jobs</Button>
      </SectionHeading>

      <JobDiscoveryFlow />
    </section>
  );
}

function CvView() {
  return (
    <section aria-labelledby="cv-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Documents" title="CV Studio">
        <Button>Build CV</Button>
      </SectionHeading>

      <CvStudio />
    </section>
  );
}

function TrackerPanel() {
  return (
    <section aria-labelledby="tracker-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Pipeline" title="Application tracker">
        <Button variant="secondary">Export</Button>
      </SectionHeading>

      <ApplicationTracker />
    </section>
  );
}

function PlansView() {
  return (
    <section aria-labelledby="plans-title" className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Billing" title="Choose a plan">
        <Button>Connect Stripe next</Button>
      </SectionHeading>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <PlanCard
          name="CareerPilot"
          price="GBP 6"
          cadence="per month"
          description="For users who want one calm place to search jobs, build a CV, save roles, and track applications."
          cta="Start normal plan"
          features={[
            "Job search across connected sources",
            "Master CV builder and PDF download",
            "Save jobs to the tracker",
            "CV-aware job matching",
            "Manual apply links"
          ]}
        />
        <PlanCard
          name="CareerPilot Premium"
          price="GBP 10"
          cadence="per month"
          description="For users who want CareerPilot to keep watching the market and prepare stronger job-specific CVs."
          cta="Start premium plan"
          featured
          features={[
            "Everything in the normal plan",
            "Daily market checks for new jobs",
            "Tailored CVs for selected roles",
            "Priority recommended jobs",
            "Better fit explanations from the user's CV"
          ]}
        />
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-quiet">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Add-on later</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-normal">Extra tailored CV credits</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              If a normal-plan user wants a job-specific CV, they can buy extra credits without upgrading. This becomes the one-off checkout after subscriptions are connected.
            </p>
          </div>
          <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-[#fafaf8] px-4 text-sm font-bold text-ink">
            Paid add-on
          </span>
        </div>
      </section>
    </section>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  description,
  features,
  cta,
  featured = false
}: {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <article className={`rounded-2xl border p-5 shadow-quiet ${featured ? "border-ink bg-[#1f1f1f] text-white" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-normal">{name}</h3>
          <p className={`mt-2 text-sm leading-6 ${featured ? "text-[#d7d7d2]" : "text-muted"}`}>{description}</p>
        </div>
        {featured && <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ink">Best value</span>}
      </div>
      <div className="mt-6 flex items-end gap-2">
        <strong className="text-5xl font-semibold leading-none tracking-normal">{price}</strong>
        <span className={`pb-1 text-sm font-bold ${featured ? "text-[#d7d7d2]" : "text-muted"}`}>{cadence}</span>
      </div>
      <ul className="mt-6 grid gap-3">
        {features.map((feature) => (
          <li key={feature} className={`flex gap-2 text-sm font-semibold ${featured ? "text-white" : "text-ink"}`}>
            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-[#b8d8d3]" : "text-pilot-green"}`} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
          featured ? "bg-white text-ink hover:bg-[#f1f1ec]" : "bg-ink text-white hover:bg-[#353535]"
        }`}
      >
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
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
    <article className="rounded-xl border border-line bg-white/70 p-3 text-center">
      <strong className="block text-2xl font-semibold leading-none">{metric.value}</strong>
      <p className="mt-2 text-xs font-medium text-muted">{metric.label}</p>
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
    <section className="rounded-2xl border border-line bg-white p-5">
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
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-[#fafaf8] p-4 sm:flex-row sm:items-center sm:justify-between">
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
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
        variant === "primary"
          ? "bg-ink text-white hover:bg-[#353535]"
          : "border border-line bg-white text-ink hover:bg-[#f7f7f4]"
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
      <MiniNote icon={Sparkles} title="AI ready" detail="AI calls can slot into CV writing, matching, and premium job monitoring." />
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
