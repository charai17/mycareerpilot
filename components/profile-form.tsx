"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Save } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ProfileFormState = {
  fullName: string;
  headline: string;
  targetRoles: string;
  regions: string;
  salaryExpectation: string;
  seniority: string;
  careerSummary: string;
};

const defaultProfile: ProfileFormState = {
  fullName: "",
  headline: "",
  targetRoles: "Operations, product, customer success",
  regions: "United Kingdom, Europe, Remote global",
  salaryExpectation: "GBP 55k+",
  seniority: "Mid to senior",
  careerSummary:
    "Experienced operator with a track record improving team processes, client outcomes, and commercial reporting."
};

export function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) {
        return;
      }

      setUser(data.user);

      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", data.user.id).maybeSingle();

        if (profile) {
          setForm({
            fullName: profile.full_name ?? "",
            headline: profile.headline ?? "",
            targetRoles: profile.target_roles.join(", "),
            regions: profile.regions.join(", "),
            salaryExpectation: profile.salary_expectation ?? "",
            seniority: profile.seniority ?? "Mid to senior",
            careerSummary: profile.career_summary ?? ""
          });
        }
      }

      setLoading(false);
    }

    loadProfile();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile() {
    if (!user) {
      setError("Sign in with Google before saving your profile.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: saveError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          full_name: form.fullName || null,
          headline: form.headline || null,
          target_roles: splitList(form.targetRoles),
          regions: splitList(form.regions),
          salary_expectation: form.salaryExpectation || null,
          seniority: form.seniority || null,
          career_summary: form.careerSummary || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      setError(saveError.message);
    } else {
      setMessage("Career profile saved.");
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="rounded-lg border border-line bg-white p-5 text-sm font-bold text-muted shadow-quiet">Loading profile</div>;
  }

  return (
    <div className="grid max-w-5xl gap-4 md:grid-cols-2">
      <Field label="Full name" value={form.fullName} onChange={(value) => updateField("fullName", value)} />
      <Field label="Headline" value={form.headline} onChange={(value) => updateField("headline", value)} />
      <Field label="Target roles" value={form.targetRoles} onChange={(value) => updateField("targetRoles", value)} />
      <Field label="Regions" value={form.regions} onChange={(value) => updateField("regions", value)} />
      <label className="grid gap-2 font-bold text-slate-800">
        Seniority
        <select
          className="h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-pilot-green"
          value={form.seniority}
          onChange={(event) => updateField("seniority", event.target.value)}
        >
          <option>Mid to senior</option>
          <option>Entry level</option>
          <option>Leadership</option>
        </select>
      </label>
      <Field
        label="Salary range"
        value={form.salaryExpectation}
        onChange={(value) => updateField("salaryExpectation", value)}
      />
      <label className="grid gap-2 font-bold text-slate-800 md:col-span-2">
        Career summary
        <textarea
          className="min-h-36 rounded-lg border border-line bg-white p-3 text-base font-normal leading-6 outline-none focus:border-pilot-green"
          value={form.careerSummary}
          onChange={(event) => updateField("careerSummary", event.target.value)}
        />
      </label>
      <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center">
        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving" : "Save profile"}
        </button>
        {!user && <p className="text-sm font-bold text-muted">Sign in with Google to save this profile.</p>}
        {message && <p className="text-sm font-bold text-pilot-green">{message}</p>}
        {error && <p className="text-sm font-bold text-pilot-red">{error}</p>}
      </div>
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

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
