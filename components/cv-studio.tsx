"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { FileText, RefreshCw, Save, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/database.types";

type CvContent = {
  summary: string;
  experience: string;
  skills: string;
  education: string;
};

type CvRecord = {
  id: string;
  title: string;
  source_type: "built" | "uploaded" | "tailored";
  content: Json;
  updated_at: string;
};

type CvFormState = CvContent & {
  title: string;
};

const defaultCv: CvFormState = {
  title: "Master CV",
  summary:
    "Commercial operator with experience improving process quality, stakeholder communication, and team delivery.",
  experience:
    "Role | Company | Dates\n- Improved team workflows and reporting cadence.\n- Coordinated cross-functional work across operations, customers, and leadership.\n- Tracked outcomes and turned feedback into measurable improvements.",
  skills: "Operations, customer success, stakeholder management, reporting, process improvement, SaaS tools",
  education: "Degree, certifications, or relevant training"
};

export function CvStudio() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<CvFormState>(defaultCv);
  const [cvs, setCvs] = useState<CvRecord[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewLines = useMemo(
    () => [
      form.summary,
      form.experience,
      `Skills: ${form.skills}`,
      form.education
    ],
    [form]
  );

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

      setLoading(false);
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
        setSelectedCvId(null);
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
      .select("id,title,source_type,content,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    const records = data ?? [];
    setCvs(records);

    if (records[0] && !selectedCvId) {
      loadIntoForm(records[0]);
    }
  }

  function updateField(field: keyof CvFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function loadIntoForm(cv: CvRecord) {
    const content = normalizeContent(cv.content);
    setSelectedCvId(cv.id);
    setForm({
      title: cv.title,
      summary: content.summary,
      experience: content.experience,
      skills: content.skills,
      education: content.education
    });
    setMessage(`Loaded ${cv.title}.`);
    setError(null);
  }

  async function buildFromProfile() {
    if (!user) {
      setError("Sign in with Google before using your profile.");
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("full_name,headline,target_roles,career_summary,seniority")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      return;
    }

    if (!data) {
      setError("Save your career profile first, then build the CV from it.");
      return;
    }

    setForm((current) => ({
      ...current,
      title: data.full_name ? `${data.full_name} Master CV` : current.title,
      summary: data.career_summary ?? current.summary,
      skills: data.target_roles.length ? data.target_roles.join(", ") : current.skills,
      experience: `${data.headline ?? data.seniority ?? "Professional experience"}\n- Add your most relevant wins here.\n- Focus on measurable outcomes, tools used, and commercial impact.`
    }));
    setMessage("Profile details pulled into the CV draft.");
    setError(null);
  }

  async function saveCv() {
    if (!user) {
      setError("Sign in with Google before saving your CV.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    const content: CvContent = {
      summary: form.summary,
      experience: form.experience,
      skills: form.skills,
      education: form.education
    };

    const cvFields = {
      title: form.title || "Master CV",
      source_type: "built" as const,
      content: content as Json,
      updated_at: new Date().toISOString()
    };

    const query = selectedCvId
      ? supabase.from("cvs").update(cvFields).eq("id", selectedCvId).eq("user_id", user.id).select("id").single()
      : supabase
          .from("cvs")
          .insert({
            ...cvFields,
            user_id: user.id
          })
          .select("id")
          .single();

    const { data, error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
    } else {
      setSelectedCvId(data.id);
      setMessage("CV saved.");
      await loadCvs(user.id);
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="rounded-lg border border-line bg-white p-5 text-sm font-bold text-muted shadow-quiet">Loading CV studio</div>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-lg border border-line bg-white p-5 shadow-quiet">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Master CV</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Create the core CV that job-specific versions will use.</p>
          </div>
          <button
            type="button"
            onClick={buildFromProfile}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Use profile
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="CV title" value={form.title} onChange={(value) => updateField("title", value)} />
          <TextArea label="Professional summary" value={form.summary} onChange={(value) => updateField("summary", value)} />
          <TextArea label="Experience" value={form.experience} rows={8} onChange={(value) => updateField("experience", value)} />
          <TextArea label="Skills" value={form.skills} onChange={(value) => updateField("skills", value)} />
          <TextArea label="Education" value={form.education} onChange={(value) => updateField("education", value)} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={saveCv}
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Saving" : "Save CV"}
          </button>
          {!user && <p className="text-sm font-bold text-muted">Sign in with Google to save CVs.</p>}
          {message && <p className="text-sm font-bold text-pilot-green">{message}</p>}
          {error && <p className="text-sm font-bold text-pilot-red">{error}</p>}
        </div>
      </section>

      <section className="grid gap-5">
        <article className="rounded-lg border border-line bg-white p-6 shadow-quiet">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Preview</h3>
            <span className="rounded-full bg-pilot-greenSoft px-3 py-1 text-xs font-black text-pilot-green">
              ATS-friendly
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            <h4 className="text-2xl font-bold">{form.title}</h4>
            {previewLines.map((line, index) => (
              <p key={`${line}-${index}`} className="whitespace-pre-line rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-line bg-white p-5 shadow-quiet">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Saved CVs</h3>
            <button
              type="button"
              onClick={() => user && loadCvs(user.id)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-line text-muted transition hover:border-pilot-green hover:text-pilot-green"
              aria-label="Refresh saved CVs"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {cvs.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-muted">No saved CVs yet.</div>
          ) : (
            <div className="grid gap-3">
              {cvs.map((cv) => (
                <button
                  key={cv.id}
                  type="button"
                  onClick={() => loadIntoForm(cv)}
                  className={`flex min-h-16 items-center justify-between gap-3 rounded-lg border px-4 text-left transition ${
                    selectedCvId === cv.id ? "border-pilot-green bg-pilot-greenSoft" : "border-line bg-white hover:border-pilot-green"
                  }`}
                >
                  <span>
                    <strong className="block">{cv.title}</strong>
                    <span className="text-sm text-muted">Updated {new Date(cv.updated_at).toLocaleDateString()}</span>
                  </span>
                  <FileText className="h-4 w-4 text-pilot-green" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
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
    <label className="grid gap-2 font-bold text-slate-800">
      {label}
      <input
        className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  rows = 4,
  onChange
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 font-bold text-slate-800">
      {label}
      <textarea
        rows={rows}
        className="rounded-lg border border-line bg-white p-3 text-base font-normal leading-6 outline-none focus:border-pilot-green"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function normalizeContent(value: Json): CvContent {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, Json>;
    return {
      summary: typeof record.summary === "string" ? record.summary : defaultCv.summary,
      experience: typeof record.experience === "string" ? record.experience : defaultCv.experience,
      skills: typeof record.skills === "string" ? record.skills : defaultCv.skills,
      education: typeof record.education === "string" ? record.education : defaultCv.education
    };
  }

  return defaultCv;
}
