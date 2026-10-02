import axios from "axios";
import type { ImportSource, ImportableJob } from "./types.js";
import {
  cleanString,
  cleanStringArray,
  firstNonEmptyString,
  normalizeApplyUrl,
  parseDate
} from "./normalization.js";

type RemotiveJob = {
  id?: number | string;
  url?: string;
  title?: string;
  company_name?: string;
  category?: string;
  tags?: string[];
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
};

type JobicyJob = {
  id?: number | string;
  url?: string;
  jobTitle?: string;
  companyName?: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobGeo?: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate?: string;
};

type ArbeitnowJob = {
  slug?: string;
  company_name?: string;
  title?: string;
  description?: string;
  remote?: boolean;
  url?: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
};

type WorkingNomadsJob = {
  url?: string;
  title?: string;
  description?: string;
  company_name?: string;
  category_name?: string;
  tags?: string[];
  location?: string;
  pub_date?: string;
};

type HimalayasJob = {
  title?: string;
  excerpt?: string;
  companyName?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryPeriod?: string;
  currency?: string;
  locationRestrictions?: string[];
  timezoneRestrictions?: number[];
  categories?: string[];
  parentCategories?: string[];
  description?: string;
  pubDate?: string;
  expiryDate?: string;
  applicationLink?: string;
  guid?: string;
};

type TheMuseJob = {
  id?: number | string;
  name?: string;
  contents?: string;
  publication_date?: string;
  locations?: Array<{ name?: string }>;
  categories?: Array<{ name?: string }>;
  levels?: Array<{ name?: string }>;
  tags?: Array<{ name?: string }>;
  refs?: {
    landing_page?: string;
  };
  company?: {
    name?: string;
  };
};

export function isPublicApiSource(source: ImportSource): boolean {
  return (
    source.url.includes("remotive.com/api/remote-jobs") ||
    source.url.includes("jobicy.com/api/v2/remote-jobs") ||
    source.url.includes("arbeitnow.com/api/job-board-api") ||
    source.url.includes("workingnomads.com/api/exposed_jobs") ||
    source.url.includes("himalayas.app/jobs/api/search") ||
    source.url.includes("themuse.com/api/public/jobs")
  );
}

export async function fetchPublicApiJobs(source: ImportSource): Promise<ImportableJob[]> {
  const response = await axios.get<unknown>(source.url, {
    headers: {
      "User-Agent": "Job tracker"
    },
    timeout: 25000
  });

  if (source.url.includes("remotive.com/api/remote-jobs")) {
    return normalizeRemotiveJobs(source, response.data);
  }

  if (source.url.includes("jobicy.com/api/v2/remote-jobs")) {
    return normalizeJobicyJobs(source, response.data);
  }

  if (source.url.includes("arbeitnow.com/api/job-board-api")) {
    return normalizeArbeitnowJobs(source, response.data);
  }

  if (source.url.includes("workingnomads.com/api/exposed_jobs")) {
    return normalizeWorkingNomadsJobs(source, response.data);
  }

  if (source.url.includes("himalayas.app/jobs/api/search")) {
    return normalizeHimalayasJobs(source, response.data);
  }

  if (source.url.includes("themuse.com/api/public/jobs")) {
    return normalizeTheMuseJobs(source, response.data);
  }

  return [];
}

function normalizeRemotiveJobs(source: ImportSource, data: unknown): ImportableJob[] {
  const jobs = getObjectArray<RemotiveJob>(data, "jobs");

  return jobs.map((job) => normalizeRemotiveJob(source, job)).filter((job): job is ImportableJob => Boolean(job));
}

function normalizeRemotiveJob(source: ImportSource, item: RemotiveJob): ImportableJob | null {
  const title = cleanString(item.title);
  const applyUrl = normalizeApplyUrl(item.url);

  if (!title || !applyUrl) {
    return null;
  }

  const locationText = requiredLocationText(item.candidate_required_location);
  const tags = cleanStringArray([...(item.tags ?? []), item.category]);

  return {
    sourceId: source.id,
    externalId: item.id === undefined ? applyUrl : String(item.id),
    title,
    companyName: cleanString(item.company_name),
    description: cleanString(item.description),
    applyUrl,
    locationText,
    remoteText: ["Fully remote source: Remotive", locationText].filter(Boolean).join("; "),
    employmentType: cleanString(item.job_type),
    salaryText: cleanString(item.salary),
    tags,
    publishedAt: parseDate(item.publication_date),
    expiresAt: null
  };
}

function normalizeJobicyJobs(source: ImportSource, data: unknown): ImportableJob[] {
  const jobs = getObjectArray<JobicyJob>(data, "jobs");

  return jobs.map((job) => normalizeJobicyJob(source, job)).filter((job): job is ImportableJob => Boolean(job));
}

function normalizeJobicyJob(source: ImportSource, item: JobicyJob): ImportableJob | null {
  const title = cleanString(item.jobTitle);
  const applyUrl = normalizeApplyUrl(item.url);

  if (!title || !applyUrl) {
    return null;
  }

  const locationText = cleanString(item.jobGeo);
  const tags = cleanStringArray([...(item.jobIndustry ?? []), ...(item.jobType ?? []), item.jobLevel]);

  return {
    sourceId: source.id,
    externalId: item.id === undefined ? applyUrl : String(item.id),
    title,
    companyName: cleanString(item.companyName),
    description: firstNonEmptyString(item.jobDescription, item.jobExcerpt),
    applyUrl,
    locationText,
    remoteText: ["Fully remote source: Jobicy", locationText].filter(Boolean).join("; "),
    employmentType: cleanStringArray(item.jobType).join(", ") || null,
    salaryText: null,
    tags,
    publishedAt: parseDate(item.pubDate),
    expiresAt: null
  };
}

function normalizeArbeitnowJobs(source: ImportSource, data: unknown): ImportableJob[] {
  const jobs = getObjectArray<ArbeitnowJob>(data, "data");

  return jobs.map((job) => normalizeArbeitnowJob(source, job)).filter((job): job is ImportableJob => Boolean(job));
}

function normalizeArbeitnowJob(source: ImportSource, item: ArbeitnowJob): ImportableJob | null {
  const title = cleanString(item.title);
  const applyUrl = normalizeApplyUrl(item.url);

  if (!title || !applyUrl) {
    return null;
  }

  const tags = cleanStringArray([...(item.tags ?? []), ...(item.job_types ?? [])]);

  return {
    sourceId: source.id,
    externalId: firstNonEmptyString(item.slug, applyUrl),
    title,
    companyName: cleanString(item.company_name),
    description: cleanString(item.description),
    applyUrl,
    locationText: cleanString(item.location),
    remoteText: item.remote ? "Fully remote source: Arbeitnow" : null,
    employmentType: cleanStringArray(item.job_types).join(", ") || null,
    salaryText: null,
    tags,
    publishedAt: typeof item.created_at === "number" ? new Date(item.created_at * 1000) : null,
    expiresAt: null
  };
}

function normalizeWorkingNomadsJobs(source: ImportSource, data: unknown): ImportableJob[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((job) => normalizeWorkingNomadsJob(source, job as WorkingNomadsJob))
    .filter((job): job is ImportableJob => Boolean(job));
}

function normalizeWorkingNomadsJob(source: ImportSource, item: WorkingNomadsJob): ImportableJob | null {
  const title = cleanString(item.title);
  const applyUrl = normalizeApplyUrl(item.url);

  if (!title || !applyUrl) {
    return null;
  }

  const locationText = cleanString(item.location);
  const tags = cleanStringArray([...(item.tags ?? []), item.category_name]);

  return {
    sourceId: source.id,
    externalId: applyUrl,
    title,
    companyName: cleanString(item.company_name),
    description: cleanString(item.description),
    applyUrl,
    locationText,
    remoteText: ["Fully remote source: Working Nomads", locationText].filter(Boolean).join("; "),
    employmentType: null,
    salaryText: null,
    tags,
    publishedAt: parseDate(item.pub_date),
    expiresAt: null
  };
}

function normalizeHimalayasJobs(source: ImportSource, data: unknown): ImportableJob[] {
  const jobs = getObjectArray<HimalayasJob>(data, "jobs");

  return jobs.map((job) => normalizeHimalayasJob(source, job)).filter((job): job is ImportableJob => Boolean(job));
}

function normalizeHimalayasJob(source: ImportSource, item: HimalayasJob): ImportableJob | null {
  const title = cleanString(item.title);
  const applyUrl = normalizeApplyUrl(item.applicationLink);

  if (!title || !applyUrl) {
    return null;
  }

  const locationRestrictions = cleanStringArray(item.locationRestrictions);
  const categories = cleanStringArray([...(item.categories ?? []), ...(item.parentCategories ?? [])]);

  return {
    sourceId: source.id,
    externalId: firstNonEmptyString(item.guid, applyUrl),
    title,
    companyName: cleanString(item.companyName),
    description: firstNonEmptyString(item.description, item.excerpt),
    applyUrl,
    locationText: locationRestrictions.length > 0 ? locationRestrictions.join(", ") : "Worldwide",
    remoteText: "Fully remote source: Himalayas",
    employmentType: cleanString(item.employmentType),
    salaryText: formatHimalayasSalary(item),
    tags: categories,
    publishedAt: parseDate(item.pubDate),
    expiresAt: parseDate(item.expiryDate)
  };
}

function normalizeTheMuseJobs(source: ImportSource, data: unknown): ImportableJob[] {
  const jobs = getObjectArray<TheMuseJob>(data, "results");

  return jobs.map((job) => normalizeTheMuseJob(source, job)).filter((job): job is ImportableJob => Boolean(job));
}

function normalizeTheMuseJob(source: ImportSource, item: TheMuseJob): ImportableJob | null {
  const title = cleanString(item.name);
  const applyUrl = normalizeApplyUrl(item.refs?.landing_page);

  if (!title || !applyUrl) {
    return null;
  }

  const locations = cleanStringArray(item.locations?.map((location) => location.name));
  const categories = cleanStringArray(item.categories?.map((category) => category.name));
  const levels = cleanStringArray(item.levels?.map((level) => level.name));
  const tags = cleanStringArray([
    ...categories,
    ...levels,
    ...(item.tags?.map((tag) => tag.name) ?? []),
    "The Muse"
  ]);
  const locationText = locations.length > 0 ? locations.join(", ") : "Remote";

  return {
    sourceId: source.id,
    externalId: item.id === undefined ? applyUrl : String(item.id),
    title,
    companyName: cleanString(item.company?.name),
    description: cleanString(item.contents),
    applyUrl,
    locationText,
    remoteText: ["Remote source: The Muse", locationText].filter(Boolean).join("; "),
    employmentType: levels.join(", ") || null,
    salaryText: null,
    tags,
    publishedAt: parseDate(item.publication_date),
    expiresAt: null
  };
}

function getObjectArray<T>(data: unknown, key: string): T[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const value = (data as Record<string, unknown>)[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

function requiredLocationText(value: unknown): string | null {
  const location = cleanString(value);

  if (!location) {
    return null;
  }

  if (/\b(worldwide|anywhere|global)\b/i.test(location)) {
    return location;
  }

  return `${location} only`;
}

function formatHimalayasSalary(item: HimalayasJob): string | null {
  if (typeof item.minSalary !== "number" && typeof item.maxSalary !== "number") {
    return null;
  }

  const currency = item.currency ?? "USD";
  const min = typeof item.minSalary === "number" ? `${currency} ${item.minSalary.toLocaleString()}` : null;
  const max = typeof item.maxSalary === "number" ? `${currency} ${item.maxSalary.toLocaleString()}` : null;
  const period = item.salaryPeriod ? `/${item.salaryPeriod}` : "";

  return `${[min, max].filter(Boolean).join(" - ")}${period}`;
}
