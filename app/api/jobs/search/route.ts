import { NextResponse } from "next/server";

type SearchRequest = {
  role?: string;
  regions?: string;
  workingStyle?: string;
  salary?: string;
  numberOfJobs?: string;
  cvText?: string;
};

type JobInsight = {
  fit: string[];
  missing: string[];
  cvAngle: string;
  checklist: string[];
};

type JobResult = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  score: number;
  status: "match" | "tailored" | "external" | "tracked";
  url: string;
  insight: JobInsight;
};

type AdzunaJob = {
  id?: string;
  title?: string;
  redirect_url?: string;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
  };
  salary_min?: number;
  salary_max?: number;
};

type RemotiveJob = {
  id?: number;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  salary?: string;
  url?: string;
};

const adzunaCountries: Record<string, string> = {
  "united kingdom": "gb",
  uk: "gb",
  england: "gb",
  scotland: "gb",
  wales: "gb",
  "northern ireland": "gb",
  "united states": "us",
  usa: "us",
  canada: "ca",
  australia: "au",
  germany: "de",
  france: "fr",
  italy: "it",
  spain: "es",
  netherlands: "nl",
  brazil: "br",
  india: "in",
  poland: "pl",
  austria: "at",
  belgium: "be",
  "south africa": "za",
  singapore: "sg",
  "new zealand": "nz"
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRequest;
    const limit = clampNumber(Number(body.numberOfJobs) || 25, 5, 50);
    const role = cleanInput(body.role) || "customer success";
    const regions = cleanInput(body.regions) || "United Kingdom";
    const workingStyle = cleanInput(body.workingStyle);
    const cvProfile = buildCvProfile(cleanInput(body.cvText));

    const [adzunaJobs, remotiveJobs] = await Promise.all([
      fetchAdzunaJobs({ role, regions, limit }),
      fetchRemotiveJobs({ role, workingStyle, limit })
    ]);

    const jobs = dedupeJobs([...adzunaJobs, ...remotiveJobs])
      .map((job) => enrichJobWithCv(job, cvProfile))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      jobs,
      sources: {
        adzuna: adzunaJobs.length,
        remotive: remotiveJobs.length
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Job search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function fetchAdzunaJobs({
  role,
  regions,
  limit
}: {
  role: string;
  regions: string;
  limit: number;
}): Promise<JobResult[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return [];
  }

  const country = resolveAdzunaCountry(regions);
  const where = resolveAdzunaWhere(regions);
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("what", role);
  url.searchParams.set("results_per_page", String(limit));
  url.searchParams.set("content-type", "application/json");

  if (where) {
    url.searchParams.set("where", where);
  }

  const response = await fetch(url, { next: { revalidate: 900 } });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { results?: AdzunaJob[] };

  return (data.results ?? []).map((job, index) => ({
    id: `adzuna-${job.id ?? index}`,
    title: job.title || "Untitled role",
    company: job.company?.display_name || "Company not listed",
    location: job.location?.display_name || where || country.toUpperCase(),
    salary: formatSalary(job.salary_min, job.salary_max),
    source: "Adzuna",
    score: scoreJob(index),
    status: "match",
    url: job.redirect_url || "",
    insight: fallbackInsight()
  }));
}

async function fetchRemotiveJobs({
  role,
  workingStyle,
  limit
}: {
  role: string;
  workingStyle: string;
  limit: number;
}): Promise<JobResult[]> {
  if (!workingStyle.toLowerCase().includes("remote")) {
    return [];
  }

  const url = new URL("https://remotive.com/api/remote-jobs");
  url.searchParams.set("search", role);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, { next: { revalidate: 900 } });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { jobs?: RemotiveJob[] };

  return (data.jobs ?? []).map((job, index) => ({
    id: `remotive-${job.id ?? index}`,
    title: job.title || "Untitled remote role",
    company: job.company_name || "Company not listed",
    location: job.candidate_required_location || "Remote",
    salary: job.salary || "Salary not listed",
    source: "Remotive",
    score: scoreJob(index + 3),
    status: "match",
    url: job.url || "",
    insight: fallbackInsight()
  }));
}

function buildCvProfile(cvText: string) {
  const normalized = cvText.toLowerCase();
  const skills = [
    "javascript",
    "typescript",
    "react",
    "node",
    "python",
    "java",
    "c#",
    "sql",
    "excel",
    "power bi",
    "tableau",
    "aws",
    "azure",
    "git",
    "github",
    "testing",
    "qa",
    "data",
    "analysis",
    "customer",
    "support",
    "service desk",
    "troubleshooting",
    "communication",
    "project",
    "computer science"
  ].filter((skill) => normalized.includes(skill));

  const careerSignals = [
    "graduate",
    "junior",
    "developer",
    "software",
    "engineer",
    "analyst",
    "data",
    "it support",
    "service desk",
    "tester",
    "qa",
    "business analyst"
  ].filter((signal) => normalized.includes(signal));

  return {
    hasCv: normalized.length > 40,
    skills,
    careerSignals,
    text: normalized
  };
}

function enrichJobWithCv(job: JobResult, profile: ReturnType<typeof buildCvProfile>): JobResult {
  const jobText = `${job.title} ${job.company} ${job.location}`.toLowerCase();
  const matchedSkills = profile.skills.filter((skill) => jobText.includes(skill) || relatedSkillMatch(skill, jobText));
  const matchedSignals = profile.careerSignals.filter((signal) => jobText.includes(signal) || relatedSkillMatch(signal, jobText));
  const missing = inferMissingChecks(jobText, profile.skills);
  const baseScore = job.score;
  const cvBoost = profile.hasCv ? Math.min(16, matchedSkills.length * 4 + matchedSignals.length * 3) : 0;
  const adjustedScore = Math.min(98, Math.max(62, baseScore + cvBoost - missing.length * 2));

  return {
    ...job,
    score: adjustedScore,
    insight: buildInsight(job, profile, matchedSkills, matchedSignals, missing)
  };
}

function buildInsight(
  job: JobResult,
  profile: ReturnType<typeof buildCvProfile>,
  matchedSkills: string[],
  matchedSignals: string[],
  missing: string[]
): JobInsight {
  if (!profile.hasCv) {
    return {
      fit: ["Add or select a CV to make this match personal.", "CareerPilot can then compare skills, experience, and target roles.", "This result is currently ranked mainly from the search filters."],
      missing: ["No CV was used for this fit explanation.", "Save a master CV for stronger recommendations."],
      cvAngle: "Use a broad, skills-led CV until the user adds a detailed master CV.",
      checklist: ["Add CV.", "Review job details.", "Open the official apply link."]
    };
  }

  const fit = [
    matchedSkills.length > 0
      ? `CV match: ${matchedSkills.slice(0, 4).join(", ")}.`
      : "The role matches the search, but the CV has limited direct keyword overlap.",
    matchedSignals.length > 0
      ? `Career direction match: ${matchedSignals.slice(0, 3).join(", ")}.`
      : "Career direction needs checking against the user's goals.",
    `${job.title} can be positioned using the strongest relevant evidence from the CV.`
  ];

  return {
    fit,
    missing,
    cvAngle: cvAngleForJob(job, matchedSkills),
    checklist: ["Use the selected CV as the base.", "Tailor the summary and top skills to this role.", "Apply manually on the official job page, then track status."]
  };
}

function inferMissingChecks(jobText: string, cvSkills: string[]) {
  const checks: string[] = [];
  const required = [
    { token: "python", label: "Check whether Python is required and visible in the CV." },
    { token: "sql", label: "Check whether SQL/database experience is visible." },
    { token: "aws", label: "Check whether cloud experience is required." },
    { token: "react", label: "Check whether React/frontend work is required." },
    { token: "support", label: "Check whether customer-facing support experience is visible." },
    { token: "testing", label: "Check whether testing or QA evidence is visible." }
  ];

  for (const item of required) {
    if (jobText.includes(item.token) && !cvSkills.includes(item.token)) {
      checks.push(item.label);
    }
  }

  if (checks.length === 0) {
    checks.push("Review the advert for any must-have tools not yet shown in the CV.");
  }

  return checks.slice(0, 2);
}

function cvAngleForJob(job: JobResult, matchedSkills: string[]) {
  const title = job.title.toLowerCase();
  const skillText = matchedSkills.length > 0 ? ` Bring ${matchedSkills.slice(0, 3).join(", ")} into the top third of the CV.` : "";

  if (title.includes("developer") || title.includes("software") || title.includes("engineer")) {
    return `Lead with technical projects, programming tools, GitHub evidence, and problem solving.${skillText}`;
  }

  if (title.includes("data") || title.includes("analyst")) {
    return `Position the CV around analysis, reporting, data tools, and clear business impact.${skillText}`;
  }

  if (title.includes("support") || title.includes("service desk") || title.includes("it ")) {
    return `Make the CV practical: troubleshooting, communication, ticket handling, and reliable support delivery.${skillText}`;
  }

  if (title.includes("test") || title.includes("qa")) {
    return `Frame the CV around debugging, test thinking, documentation, and careful delivery.${skillText}`;
  }

  return `Use the selected CV as the base and emphasise the experience most relevant to ${job.title}.${skillText}`;
}

function relatedSkillMatch(skill: string, jobText: string) {
  const related: Record<string, string[]> = {
    javascript: ["frontend", "front-end", "web"],
    typescript: ["frontend", "front-end", "web"],
    react: ["frontend", "front-end", "web"],
    python: ["data", "automation", "backend"],
    sql: ["data", "analyst", "database"],
    excel: ["analyst", "reporting"],
    testing: ["qa", "tester", "quality"],
    support: ["service desk", "helpdesk", "troubleshooting"],
    "computer science": ["graduate", "junior", "software", "developer", "it"]
  };

  return (related[skill] ?? []).some((token) => jobText.includes(token));
}

function fallbackInsight(): JobInsight {
  return {
    fit: ["This job matches the current search filters."],
    missing: ["Select or paste a CV for a personal fit check."],
    cvAngle: "Use the user's CV to generate a role-specific angle.",
    checklist: ["Review job details.", "Prepare CV.", "Apply manually."]
  };
}

function resolveAdzunaCountry(regions: string) {
  const normalized = regions.toLowerCase();
  const match = Object.entries(adzunaCountries).find(([name]) => normalized.includes(name));
  return match?.[1] ?? "gb";
}

function resolveAdzunaWhere(regions: string) {
  return regions
    .split(",")
    .map((region) => region.trim())
    .find((region) => region && !region.toLowerCase().includes("remote") && !region.toLowerCase().includes("europe"));
}

function formatSalary(min?: number, max?: number) {
  if (min && max) {
    return `${Math.round(min).toLocaleString()}-${Math.round(max).toLocaleString()}`;
  }

  if (min) {
    return `${Math.round(min).toLocaleString()}+`;
  }

  if (max) {
    return `Up to ${Math.round(max).toLocaleString()}`;
  }

  return "Salary not listed";
}

function dedupeJobs(jobs: JobResult[]) {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}-${job.location.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function scoreJob(index: number) {
  return Math.max(76, 94 - index);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cleanInput(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}
