"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Bot, Download, FileText, History, Save, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/database.types";

type CvContent = {
  summary: string;
  experience: string;
  skills: string;
  education: string;
};

type CvFormState = CvContent & {
  title: string;
  recommendedStyle: string;
};

type CvRecord = {
  id: string;
  title: string;
  source_type: "built" | "uploaded" | "tailored";
  content: Json;
  updated_at: string;
};

type ChatAnswer = {
  id: string;
  question: string;
  answer: string;
};

type CvQuestion = {
  id: string;
  label: string;
  prompt: string;
  placeholder: string;
  helper?: string;
  multiline?: boolean;
};

const cvQuestions: CvQuestion[] = [
  {
    id: "fullName",
    label: "Name",
    prompt: "What name should appear at the top of the CV?",
    placeholder: "e.g. Anton Charai"
  },
  {
    id: "targetRole",
    label: "Target role",
    prompt: "What job or industry is this CV mainly for?",
    placeholder: "e.g. finance assistant, barista, software developer, care worker",
    helper: "This lets CareerPilot choose the right CV style automatically."
  },
  {
    id: "location",
    label: "Location",
    prompt: "Where are they based, and are they open to remote or relocation?",
    placeholder: "e.g. London, open to remote roles"
  },
  {
    id: "contact",
    label: "Contact",
    prompt: "What contact details should be included?",
    placeholder: "Email, phone, LinkedIn, portfolio"
  },
  {
    id: "workHistory",
    label: "Work history",
    prompt: "Tell me about their current or past jobs.",
    placeholder: "Job title, company, dates, and what they did there",
    multiline: true
  },
  {
    id: "achievements",
    label: "Achievements",
    prompt: "What are the strongest achievements, results, or responsibilities?",
    placeholder: "e.g. handled 80+ customers per shift, reduced admin time, trained 3 team members",
    helper: "Numbers help, but plain examples are fine.",
    multiline: true
  },
  {
    id: "skills",
    label: "Skills",
    prompt: "What skills, tools, or strengths should the CV show?",
    placeholder: "e.g. Excel, customer service, cash handling, reporting, teamwork",
    multiline: true
  },
  {
    id: "education",
    label: "Education",
    prompt: "What education, training, certificates, or courses should be included?",
    placeholder: "School, degree, course, certificate, or relevant training",
    multiline: true
  }
];

const defaultCv: CvFormState = {
  title: "Master CV",
  recommendedStyle: "Modern ATS-friendly",
  summary:
    "Reliable professional with practical experience, strong communication skills, and a clear focus on delivering quality work.",
  experience:
    "Most recent role | Company | Dates\n- Add responsibilities and achievements here.\n- Focus on the work most relevant to the target role.",
  skills: "Communication, organisation, teamwork, problem solving",
  education: "Education, certifications, or relevant training"
};

export function CvStudio() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<CvFormState>(defaultCv);
  const [cvs, setCvs] = useState<CvRecord[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<ChatAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState("");

  const currentQuestion = cvQuestions[currentQuestionIndex];
  const complete = currentQuestionIndex >= cvQuestions.length;
  const progress = Math.round((answers.length / cvQuestions.length) * 100);

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

    setCvs(data ?? []);
  }

  async function submitAnswer() {
    const value = draftAnswer.trim();
    if (!currentQuestion || !value || generating) {
      return;
    }

    const nextAnswers = [
      ...answers,
      {
        id: currentQuestion.id,
        question: currentQuestion.prompt,
        answer: value
      }
    ];

    setAnswers(nextAnswers);
    setDraftAnswer("");
    setMessage(null);
    setError(null);

    setCurrentQuestionIndex((current) => current + 1);

    if (currentQuestionIndex + 1 === cvQuestions.length) {
      await generateCvWithAi(nextAnswers);
    }
  }

  async function generateCvWithAi(nextAnswers: ChatAnswer[]) {
    setGenerating(true);
    setMessage("CareerPilot is writing the CV with Claude.");
    setError(null);

    try {
      const response = await fetch("/api/cv/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers: nextAnswers })
      });
      const result = (await response.json()) as { cv?: CvFormState; error?: string; detail?: string };

      if (!response.ok || !result.cv) {
        throw new Error(result.error || "The CV could not be generated.");
      }

      setSelectedCvId(null);
      setForm(result.cv);
      setMessage("CV draft generated with Claude. Save it to the account when ready.");
    } catch (generationError) {
      const errorMessage = generationError instanceof Error ? generationError.message : "The CV could not be generated.";
      setError(errorMessage);
      setMessage(null);
    } finally {
      setGenerating(false);
    }
  }

  function restartInterview() {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setDraftAnswer("");
    setSelectedCvId(null);
    setForm(defaultCv);
    setMessage("Started a new CV interview.");
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

    const content: CvContent & { recommendedStyle: string } = {
      summary: form.summary,
      experience: form.experience,
      skills: form.skills,
      education: form.education,
      recommendedStyle: form.recommendedStyle
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

  async function downloadCv(cv: CvFormState) {
    setDownloading(true);
    setError(null);

    try {
      const response = await fetch("/api/cv/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cv })
      });

      if (!response.ok) {
        throw new Error("The PDF could not be generated.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeFileName(cv.title)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("PDF downloaded.");
    } catch (downloadError) {
      const errorMessage = downloadError instanceof Error ? downloadError.message : "The PDF could not be downloaded.";
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <div className="rounded-lg border border-line bg-white p-5 text-sm font-bold text-muted shadow-quiet">Loading CV studio</div>;
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">AI CV interview</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-normal">Build the perfect CV</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              CareerPilot asks one question at a time, chooses the right style for the target job, then prepares a master CV for review.
            </p>
          </div>
          <div className="rounded-full border border-line px-4 py-2 text-sm font-bold text-muted">{progress}% complete</div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-2xl border border-line bg-white shadow-quiet">
          <div className="border-b border-line p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold">CareerPilot CV Assistant</h3>
                <p className="text-sm text-muted">One answer at a time. No long forms.</p>
              </div>
            </div>
          </div>

          <div className="grid min-h-[65vh] content-between gap-5 p-5 md:p-7">
            <div className="grid max-h-[52vh] gap-4 overflow-y-auto pr-1">
              <ChatBubble speaker="CareerPilot">
                {answers.length === 0
                  ? "I'll build the CV by asking a few focused questions. First, I need the basics."
                  : "Thanks. I've added that to the CV brief."}
              </ChatBubble>

              {answers.map((answer) => (
                <div key={answer.id} className="grid gap-3">
                  <ChatBubble speaker="CareerPilot">{answer.question}</ChatBubble>
                  <ChatBubble speaker="You" user>
                    {answer.answer}
                  </ChatBubble>
                </div>
              ))}

              {!complete ? (
                <ChatBubble speaker="CareerPilot">
                  <span className="block font-semibold text-ink">{currentQuestion.label}</span>
                  <span className="mt-1 block">{currentQuestion.prompt}</span>
                  {currentQuestion.helper && <span className="mt-2 block text-xs font-semibold text-muted">{currentQuestion.helper}</span>}
                </ChatBubble>
              ) : (
                <>
                  <ChatBubble speaker="CareerPilot">
                    {generating ? (
                      "I'm writing the first CV draft with Claude now."
                    ) : (
                      <>
                        The first CV draft is ready. I chose <strong>{form.recommendedStyle}</strong> based on the target role.
                      </>
                    )}
                  </ChatBubble>
                  {!generating && !error && (
                    <ChatBubble speaker="CareerPilot">
                      <span className="block font-semibold text-ink">{form.title}</span>
                      <span className="mt-3 block font-semibold text-ink">Summary</span>
                      <span className="block">{form.summary}</span>
                      <span className="mt-3 block font-semibold text-ink">Experience</span>
                      <span className="block">{form.experience}</span>
                      <span className="mt-3 block font-semibold text-ink">Skills</span>
                      <span className="block">{form.skills}</span>
                      <span className="mt-3 block font-semibold text-ink">Education</span>
                      <span className="block">{form.education}</span>
                    </ChatBubble>
                  )}
                </>
              )}
            </div>

            {!complete ? (
              <div className="rounded-xl border border-line bg-[#fafaf8] p-3">
                {currentQuestion.multiline ? (
                  <textarea
                    rows={5}
                    value={draftAnswer}
                    onChange={(event) => setDraftAnswer(event.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full resize-none rounded-lg border border-line bg-white p-3 text-sm leading-6 outline-none focus:border-pilot-green"
                  />
                ) : (
                  <input
                    value={draftAnswer}
                    onChange={(event) => setDraftAnswer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submitAnswer();
                      }
                    }}
                    placeholder={currentQuestion.placeholder}
                    className="h-12 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-pilot-green"
                  />
                )}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={!draftAnswer.trim() || generating}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generating ? "Writing" : "Answer"}
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveCv}
                  disabled={saving || generating}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Saving" : "Save CV"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadCv(form)}
                  disabled={generating || downloading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 font-bold transition hover:border-pilot-green disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {downloading ? "Preparing" : "Download PDF"}
                </button>
                <button
                  type="button"
                  onClick={restartInterview}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 font-bold transition hover:border-pilot-green"
                >
                  Start again
                </button>
                {generating && <p className="text-sm font-bold text-muted">Claude is preparing the CV draft.</p>}
                {!user && <p className="text-sm font-bold text-muted">Sign in with Google to save CVs.</p>}
              </div>
            )}

            {message && <p className="text-sm font-bold text-pilot-green">{message}</p>}
            {error && <p className="text-sm font-bold text-pilot-red">{error}</p>}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-quiet">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3f3ef] text-ink">
              <History className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-bold">CV history</h3>
              <p className="text-sm text-muted">Saved CVs are available here without using more AI tokens.</p>
            </div>
          </div>

          {user ? (
            cvs.length ? (
              <div className="mt-4 grid gap-3">
                {cvs.map((cv) => {
                  const content = normalizeContent(cv.content, cv.title);

                  return (
                    <article key={cv.id} className="flex flex-col gap-3 rounded-xl border border-line bg-[#fafaf8] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="mt-1 h-5 w-5 shrink-0 text-pilot-green" aria-hidden="true" />
                        <div>
                          <h4 className="font-bold">{cv.title}</h4>
                          <p className="mt-1 text-sm text-muted">
                            {content.recommendedStyle} | Updated {new Date(cv.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadCv(content)}
                        disabled={downloading}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold transition hover:border-pilot-green disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        PDF
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-[#fafaf8] p-4 text-sm font-bold text-muted">No saved CVs yet.</div>
            )
          ) : (
            <div className="mt-4 rounded-xl bg-[#fafaf8] p-4 text-sm font-bold text-muted">Sign in with Google to keep CV history.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function ChatBubble({
  speaker,
  user = false,
  children
}: {
  speaker: string;
  user?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${user ? "bg-ink text-white" : "bg-[#f3f3ef] text-slate-700"}`}>
        <p className={`mb-1 text-xs font-black uppercase tracking-[0.08em] ${user ? "text-white/65" : "text-muted"}`}>{speaker}</p>
        <div className="whitespace-pre-line text-sm leading-6">{children}</div>
      </div>
    </div>
  );
}

function normalizeContent(value: Json, title: string): CvFormState {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, Json>;
    return {
      title,
      summary: typeof record.summary === "string" ? record.summary : "",
      experience: typeof record.experience === "string" ? record.experience : "",
      skills: typeof record.skills === "string" ? record.skills : "",
      education: typeof record.education === "string" ? record.education : "",
      recommendedStyle: typeof record.recommendedStyle === "string" ? record.recommendedStyle : "Modern ATS-friendly CV"
    };
  }

  return {
    ...defaultCv,
    title
  };
}

function safeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "careerpilot-cv";
}
