"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, Globe2, MapPin, SlidersHorizontal } from "lucide-react";
import { jobMatches } from "@/lib/mock-data";

type SearchState = {
  role: string;
  regions: string;
  workingStyle: string;
  seniority: string;
  salary: string;
  priorities: string;
};

const defaultSearch: SearchState = {
  role: "Operations Manager, Customer Success Lead",
  regions: "United Kingdom, Europe, Remote",
  workingStyle: "Remote-first",
  seniority: "Mid to senior",
  salary: "GBP 55k+",
  priorities: "SaaS, stable team, growth path, strong work-life balance"
};

const steps = ["Search profile", "Preferences", "Review"];

export function JobDiscoveryFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SearchState>(defaultSearch);

  const summary = useMemo(
    () => [
      ["Roles", form.role],
      ["Regions", form.regions],
      ["Style", form.workingStyle],
      ["Level", form.seniority],
      ["Salary", form.salary]
    ],
    [form]
  );

  function updateField(field: keyof SearchState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Service setup</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-normal">Job Discovery Pilot</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Set the brief CareerPilot AI should use when finding roles for this user.
            </p>
          </div>
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-pilot-greenSoft px-3 text-sm font-semibold text-pilot-green">
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            Premium search
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`min-h-10 rounded-lg border px-3 text-sm font-semibold transition ${
                step === index ? "border-ink bg-ink text-white" : "border-line bg-[#fafaf8] text-muted hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {step === 0 && (
            <>
              <Field label="Target roles" value={form.role} onChange={(value) => updateField("role", value)} />
              <Field label="Preferred regions" value={form.regions} onChange={(value) => updateField("regions", value)} />
              <SelectField
                label="Working style"
                value={form.workingStyle}
                options={["Remote-first", "Hybrid", "On-site", "Flexible"]}
                onChange={(value) => updateField("workingStyle", value)}
              />
            </>
          )}

          {step === 1 && (
            <>
              <SelectField
                label="Seniority"
                value={form.seniority}
                options={["Entry level", "Mid level", "Mid to senior", "Leadership"]}
                onChange={(value) => updateField("seniority", value)}
              />
              <Field label="Salary expectation" value={form.salary} onChange={(value) => updateField("salary", value)} />
              <TextArea
                label="Role priorities"
                value={form.priorities}
                onChange={(value) => updateField("priorities", value)}
              />
            </>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              {summary.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-[#fafaf8] p-4">
                  <p className="text-xs font-semibold uppercase text-muted">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
              <div className="rounded-xl border border-line bg-[#fafaf8] p-4">
                <p className="text-xs font-semibold uppercase text-muted">Priorities</p>
                <p className="mt-1 leading-6">{form.priorities}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-semibold transition hover:bg-[#f7f7f4]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-[#353535]"
          >
            {step === steps.length - 1 ? "Find roles" : "Continue"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="grid gap-5">
        <article className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Search brief</h3>
            <SlidersHorizontal className="h-5 w-5 text-muted" aria-hidden="true" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill icon={Globe2} label={form.regions} />
            <Pill icon={MapPin} label={form.workingStyle} />
            <Pill icon={Check} label={form.seniority} />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            This will become the saved-search profile once backend search is wired.
          </p>
        </article>

        <article className="rounded-2xl border border-line bg-white p-5">
          <h3 className="text-lg font-semibold">Preview matches</h3>
          <div className="mt-4 grid gap-3">
            {jobMatches.map((job) => (
              <div key={job.id} className="rounded-xl border border-line bg-[#fafaf8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="mt-1 text-sm text-muted">
                      {job.company} | {job.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-pilot-greenSoft px-3 py-1 text-sm font-bold text-pilot-green">
                    {job.score}%
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-muted">{job.salary}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Globe2; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fafaf8] px-3 py-1.5 text-sm font-semibold text-muted">
      <Icon className="h-4 w-4" aria-hidden="true" />
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

function TextArea({
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
      <textarea
        rows={5}
        className="rounded-lg border border-line bg-white p-3 text-base font-normal leading-6 outline-none focus:border-pilot-green"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
