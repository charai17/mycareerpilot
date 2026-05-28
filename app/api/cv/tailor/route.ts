import { NextResponse } from "next/server";

type JobBrief = {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  source?: string;
  score?: number;
};

type JobInsight = {
  fit?: string[];
  missing?: string[];
  cvAngle?: string;
  checklist?: string[];
};

type GeneratedCv = {
  title: string;
  recommendedStyle: string;
  summary: string;
  experience: string;
  skills: string;
  education: string;
};

const fallbackModel = "anthropic/claude-4.6-sonnet";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_CV_MODEL || fallbackModel;

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is missing." }, { status: 500 });
    }

    const body = (await request.json()) as {
      masterCv?: string;
      job?: JobBrief;
      insight?: JobInsight;
    };
    const masterCv = cleanInput(body.masterCv);

    if (!masterCv) {
      return NextResponse.json({ error: "A master CV is required before tailoring." }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CareerPilot AI"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are CareerPilot AI, an expert CV tailoring assistant. Rewrite the user's existing CV for one specific job. Keep it honest. Do not invent employers, dates, qualifications, tools, achievements, metrics, or experience. Return valid JSON only."
          },
          {
            role: "user",
            content: buildPrompt(masterCv, body.job ?? {}, body.insight ?? {})
          }
        ],
        temperature: 0.28,
        max_tokens: 1800
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: "The tailored CV could not be generated.", detail }, { status: response.status });
    }

    const completion = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "The AI returned an empty tailored CV." }, { status: 502 });
    }

    const cv = parseCvJson(content);
    return NextResponse.json({ cv, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPrompt(masterCv: string, job: JobBrief, insight: JobInsight) {
  return `Create one tailored CV for this job.

Return only this JSON shape:
{
  "title": "Full Name - Job Title CV",
  "recommendedStyle": "short style label",
  "summary": "3-4 sentence tailored professional summary",
  "experience": "Tailored experience section with truthful role headings and bullet points",
  "skills": "Grouped skills section prioritised for this job",
  "education": "Education and training section"
}

Rules:
- Base every claim on the master CV only.
- Do not invent experience, dates, employers, qualifications, metrics, tools, or certifications.
- Reorder and rephrase honestly to make the strongest fit obvious.
- Reflect the job title, company, and CV angle.
- Keep it ATS-friendly and premium.

Job:
Title: ${job.title ?? "Not provided"}
Company: ${job.company ?? "Not provided"}
Location: ${job.location ?? "Not provided"}
Salary: ${job.salary ?? "Not provided"}
Source: ${job.source ?? "Not provided"}
Match score: ${job.score ?? "Not provided"}

Fit reasons:
${(insight.fit ?? []).join("\n")}

Missing or check:
${(insight.missing ?? []).join("\n")}

Recommended CV angle:
${insight.cvAngle ?? "Use the strongest relevant evidence from the master CV."}

Master CV:
${masterCv}`;
}

function parseCvJson(content: string): GeneratedCv {
  const trimmed = content.trim();
  const unfenced = trimmed.startsWith("```") ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "") : trimmed;
  const firstBrace = unfenced.indexOf("{");
  const lastBrace = unfenced.lastIndexOf("}");
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? unfenced.slice(firstBrace, lastBrace + 1) : unfenced;
  const parsed = JSON.parse(jsonText) as Partial<GeneratedCv>;

  return {
    title: ensureString(parsed.title, "Tailored CV"),
    recommendedStyle: ensureString(parsed.recommendedStyle, "Tailored ATS-friendly CV"),
    summary: ensureString(parsed.summary, ""),
    experience: ensureString(parsed.experience, ""),
    skills: ensureString(parsed.skills, ""),
    education: ensureString(parsed.education, "")
  };
}

function ensureString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function cleanInput(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}
