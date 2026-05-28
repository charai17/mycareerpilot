"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Bot, Save, Send } from "lucide-react";
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
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setLoading(false);
    }

    load();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setSelectedCvId(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function submitAnswer() {
    const value = draftAnswer.trim();
    if (!currentQuestion || !value) {
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

    if (currentQuestionIndex + 1 === cvQuestions.length) {
      const generated = generateCv(nextAnswers);
      setSelectedCvId(null);
      setForm(generated);
      setMessage("CV draft generated. Review it, then save it to the account.");
    }

    setCurrentQuestionIndex((current) => current + 1);
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
    }

    setSaving(false);
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
                <ChatBubble speaker="CareerPilot">
                  The first CV draft is ready. I chose <strong>{form.recommendedStyle}</strong> based on the target role.
                </ChatBubble>
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
                    disabled={!draftAnswer.trim()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Answer
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveCv}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Saving" : "Save CV"}
                </button>
                <button
                  type="button"
                  onClick={restartInterview}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 font-bold transition hover:border-pilot-green"
                >
                  Start again
                </button>
                {!user && <p className="text-sm font-bold text-muted">Sign in with Google to save CVs.</p>}
              </div>
            )}

            {message && <p className="text-sm font-bold text-pilot-green">{message}</p>}
            {error && <p className="text-sm font-bold text-pilot-red">{error}</p>}
          </div>
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

function generateCv(answerList: ChatAnswer[]): CvFormState {
  const answerMap = Object.fromEntries(answerList.map((answer) => [answer.id, answer.answer]));
  const targetRole = answerMap.targetRole ?? "target role";
  const fullName = answerMap.fullName ?? "Master CV";
  const style = chooseCvStyle(targetRole);
  const achievements = answerMap.achievements ?? "Delivered reliable work and supported team goals.";
  const workHistory = answerMap.workHistory ?? "Professional experience";
  const skills = answerMap.skills ?? "Communication, organisation, teamwork";
  const education = answerMap.education ?? "Relevant education and training";
  const location = answerMap.location ? ` Based in ${answerMap.location}.` : "";

  return {
    title: `${fullName} Master CV`,
    recommendedStyle: style.name,
    summary: `${style.summaryLead} targeting ${targetRole}.${location} Brings ${style.strengthFrame} with evidence across ${summariseSkills(skills)}.`,
    experience: `${workHistory}\n- ${style.bulletLead} ${cleanSentence(achievements)}\n- Demonstrated reliability, communication, and consistent follow-through in role-relevant responsibilities.\n- Ready to present experience clearly for ${targetRole} opportunities.`,
    skills: formatSkills(skills, style.skillFrame),
    education
  };
}

function chooseCvStyle(targetRole: string) {
  const target = targetRole.toLowerCase();

  if (/(finance|bank|account|audit|law|legal|consult|analyst|corporate|insurance)/.test(target)) {
    return {
      name: "Professional corporate CV",
      summaryLead: "Polished and commercially aware candidate",
      strengthFrame: "professional judgement, accuracy, stakeholder communication, and structured problem solving",
      skillFrame: "Core strengths",
      bulletLead: "Built credibility through accurate, well-organised work:"
    };
  }

  if (/(barista|coffee|hospitality|restaurant|retail|customer|shop|sales assistant)/.test(target)) {
    return {
      name: "Friendly customer-facing CV",
      summaryLead: "Warm, reliable, customer-focused candidate",
      strengthFrame: "service quality, teamwork, attention to detail, and calm communication",
      skillFrame: "Customer-facing strengths",
      bulletLead: "Created a positive customer experience while staying organised:"
    };
  }

  if (/(software|developer|engineer|data|product|designer|technical|it|cyber)/.test(target)) {
    return {
      name: "Concise technical CV",
      summaryLead: "Practical, skills-led candidate",
      strengthFrame: "technical delivery, problem solving, collaboration, and measurable project impact",
      skillFrame: "Technical and delivery skills",
      bulletLead: "Applied practical skills to improve delivery:"
    };
  }

  if (/(care|health|nurse|support worker|education|teacher|childcare)/.test(target)) {
    return {
      name: "Trust-focused care CV",
      summaryLead: "Responsible and people-focused candidate",
      strengthFrame: "trust, patience, communication, safeguarding awareness, and dependable support",
      skillFrame: "Care and people skills",
      bulletLead: "Supported people with care, consistency, and responsibility:"
    };
  }

  return {
    name: "Modern ATS-friendly CV",
    summaryLead: "Reliable and adaptable candidate",
    strengthFrame: "communication, organisation, accountability, and role-relevant practical experience",
    skillFrame: "Relevant skills",
    bulletLead: "Contributed to team outcomes through dependable work:"
  };
}

function cleanSentence(value: string) {
  const trimmed = value.trim();
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

function summariseSkills(value: string) {
  return value
    .split(/,|\n/)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
}

function formatSkills(value: string, prefix: string) {
  const skills = value
    .split(/,|\n/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (!skills.length) {
    return prefix;
  }

  return `${prefix}: ${skills.join(", ")}`;
}
