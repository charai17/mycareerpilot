import type { LucideIcon } from "lucide-react";

export type ViewId = "dashboard" | "jobs" | "cv" | "tracker";

export type NavigationItem = {
  id: ViewId;
  label: string;
  icon: LucideIcon;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type JobMatch = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  score: number;
  status: "recommended" | "ready" | "applied" | "interview";
};

export type ApplicationStep = {
  title: string;
  detail: string;
};

export type TrackerColumn = {
  title: string;
  jobs: string[];
};

export type SourceCard = {
  title: string;
  detail: string;
  label: string;
};
