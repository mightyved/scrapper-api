import axios from "axios";
import type { ImportSource, ImportableJob } from "./types.js";
import {
  cleanString,
  cleanStringArray,
  firstNonEmptyString,
  normalizeApplyUrl,
  parseDate
} from "./normalization.js";

type RemoteOkJob = {
  id?: number | string;
  position?: string;
  title?: string;
  company?: string;
  company_name?: string;
  description?: string;
  apply_url?: string;
  url?: string;
  location?: string;
  tags?: string[];
  date?: string;
  epoch?: number;
  salary_min?: number;
  salary_max?: number;
};

export function isRemoteOkSource(source: ImportSource): boolean {
  return source.url.includes("remoteok.com/api") || source.name.toLowerCase() === "remote ok";
}

export async function fetchRemoteOkJobs(source: ImportSource): Promise<ImportableJob[]> {
  const response = await axios.get<unknown>(source.url, {
    headers: {
      "User-Agent": "Job tracker"
    },
    timeout: 20000
  });

  if (!Array.isArray(response.data)) {
    throw new Error("Remote OK API returned a non-array response");
  }

  return response.data
    .filter(isRemoteOkJob)
    .map((item) => normalizeRemoteOkJob(source, item))
    .filter((job): job is ImportableJob => Boolean(job));
}

function isRemoteOkJob(value: unknown): value is RemoteOkJob {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as RemoteOkJob;
  return Boolean(firstNonEmptyString(item.position, item.title) && firstNonEmptyString(item.apply_url, item.url));
}

function normalizeRemoteOkJob(source: ImportSource, item: RemoteOkJob): ImportableJob | null {
  const title = firstNonEmptyString(item.position, item.title);
  const applyUrl = normalizeApplyUrl(firstNonEmptyString(item.apply_url, item.url));

  if (!title || !applyUrl) {
    return null;
  }

  const locationText = cleanString(item.location);
  const tags = cleanStringArray(item.tags);

  return {
    sourceId: source.id,
    externalId: item.id === undefined ? firstNonEmptyString(item.url, applyUrl) : String(item.id),
    title,
    companyName: firstNonEmptyString(item.company, item.company_name),
    description: cleanString(item.description),
    applyUrl,
    locationText,
    remoteText: ["Fully remote source: Remote OK", locationText].filter(Boolean).join("; "),
    employmentType: null,
    salaryText: formatSalary(item),
    tags,
    publishedAt: parseDate(firstNonEmptyString(item.date, item.epoch)),
    expiresAt: null
  };
}

function formatSalary(item: RemoteOkJob): string | null {
  if (typeof item.salary_min !== "number" && typeof item.salary_max !== "number") {
    return null;
  }

  const min = typeof item.salary_min === "number" ? `$${item.salary_min.toLocaleString()}` : null;
  const max = typeof item.salary_max === "number" ? `$${item.salary_max.toLocaleString()}` : null;

  return [min, max].filter(Boolean).join(" - ");
}
