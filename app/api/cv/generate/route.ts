import { NextResponse } from "next/server";

type ChatAnswer = {
  id: string;
  question: string;
  answer: string;
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

    const body = (await request.json()) as { answers?: ChatAnswer[] };
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (answers.length === 0) {
      return NextResponse.json({ error: "CV answers are required." }, { status: 400 });
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
              "You are CareerPilot AI, an expert CV writer. Create honest, ATS-friendly UK-style CV content from the user's answers. Do not invent employers, dates, degrees, certifications, metrics, or claims. Choose the CV style based on the target job. Return valid JSON only."
          },
          {
            role: "user",
            content: buildPrompt(answers)
          }
        ],
        temperature: 0.35,
        max_tokens: 1800
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: "The AI CV generator could not complete.", detail }, { status: response.status });
    }

    const completion = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "The AI returned an empty CV." }, { status: 502 });
    }

    const cv = parseCvJson(content);
    return NextResponse.json({ cv, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPrompt(answers: ChatAnswer[]) {
  const answerText = answers.map((item) => `Question: ${item.question}\nAnswer: ${item.answer}`).join("\n\n");

  return `Create a complete master CV draft from these answers.

Return only this JSON shape:
{
  "title": "Full Name Master CV",
  "recommendedStyle": "short style label",
  "summary": "3-4 sentence professional summary",
  "experience": "Experience section with role headings if available and bullet points",
  "skills": "Grouped skills section",
  "education": "Education and training section"
}

Rules:
- Keep it truthful and based only on the answers.
- If a detail is missing, use a clean placeholder such as "Dates to add" rather than inventing it.
- Choose a formal style for finance, legal, consulting, corporate and senior roles.
- Choose a friendly, service-focused style for hospitality, coffee, retail and customer-facing roles.
- Choose a concise skills-led style for tech, product, data and design roles.
- Choose a trust-focused style for healthcare, care and education roles.
- Make the wording premium, polished, and ready for a paid SaaS product.

Answers:
${answerText}`;
}

function parseCvJson(content: string): GeneratedCv {
  const trimmed = content.trim();
  const unfenced = trimmed.startsWith("```") ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "") : trimmed;
  const firstBrace = unfenced.indexOf("{");
  const lastBrace = unfenced.lastIndexOf("}");
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? unfenced.slice(firstBrace, lastBrace + 1) : unfenced;
  const parsed = JSON.parse(jsonText) as Partial<GeneratedCv>;

  return {
    title: ensureString(parsed.title, "Master CV"),
    recommendedStyle: ensureString(parsed.recommendedStyle, "Modern ATS-friendly CV"),
    summary: ensureString(parsed.summary, ""),
    experience: ensureString(parsed.experience, ""),
    skills: ensureString(parsed.skills, ""),
    education: ensureString(parsed.education, "")
  };
}

function ensureString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}
