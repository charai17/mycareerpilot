import {
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Search
} from "lucide-react";
import type { ApplicationStep, JobMatch, Metric, NavigationItem, SourceCard, TrackerColumn } from "./types";

export const navigation: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "jobs", label: "Job Search", icon: Search },
  { id: "cv", label: "CV Studio", icon: FileText },
  { id: "tracker", label: "Tracker", icon: ClipboardCheck },
  { id: "plans", label: "Plans", icon: CreditCard }
];

export const metrics: Metric[] = [
  { label: "Recommended jobs", value: "48", detail: "Across selected regions" },
  { label: "CVs prepared", value: "7", detail: "Ready for manual apply" },
  { label: "Tracked applications", value: "14", detail: "This month" },
  { label: "Interview rate", value: "21%", detail: "Estimated from tracker" }
];

export const jobMatches: JobMatch[] = [
  {
    id: "operations-manager",
    title: "Operations Manager",
    company: "Northstar Labs",
    location: "Remote | United Kingdom",
    salary: "GBP 52k-65k",
    source: "Greenhouse",
    score: 94,
    status: "ready"
  },
  {
    id: "customer-success-lead",
    title: "Customer Success Lead",
    company: "Brightlane",
    location: "Hybrid | Berlin",
    salary: "EUR 72k-88k",
    source: "Lever",
    score: 89,
    status: "applied"
  },
  {
    id: "product-analyst",
    title: "Product Analyst",
    company: "SignalWorks",
    location: "Remote | Canada",
    salary: "CAD 95k",
    source: "Manual URL",
    score: 86,
    status: "recommended"
  }
];

export const applicationSteps: ApplicationStep[] = [
  {
    title: "Find roles",
    detail: "Search connected job APIs for roles that fit the user's CV, location, salary, and work preferences."
  },
  {
    title: "Prepare CV",
    detail: "Highlight operations, stakeholder management, and SaaS metrics."
  },
  {
    title: "Apply manually",
    detail: "Open the official job page, use the prepared CV, then track the application status in CareerPilot."
  }
];

export const sourceCards: SourceCard[] = [
  {
    title: "ATS boards",
    detail: "Greenhouse, Lever, Ashby, Workable, and company career pages.",
    label: "Best first source"
  },
  {
    title: "Job boards",
    detail: "Regional and specialist boards can be added as searchable connectors.",
    label: "Expandable"
  },
  {
    title: "Manual URLs",
    detail: "Paste any job link and let mycareerpilot extract the job details.",
    label: "Always available"
  }
];

export const trackerColumns: TrackerColumn[] = [
  { title: "Discovered", jobs: ["Product Analyst | Remote", "Office Manager | London"] },
  { title: "CV ready", jobs: ["Operations Manager | Remote"] },
  { title: "Applied", jobs: ["Customer Success Lead | Berlin", "Programme Coordinator | Dublin"] },
  { title: "Interview", jobs: ["Client Operations Lead | Amsterdam"] }
];

export const launchPrinciples = [
  "Find jobs through approved APIs and official public feeds.",
  "Prepare master and tailored CVs without submitting applications for the user.",
  "Check premium saved searches every day and notify users about new matches."
];
