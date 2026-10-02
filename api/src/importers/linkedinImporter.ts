import axios from "axios";
import { load } from "cheerio";
import type { ImportableJob, ImportSource } from "./types.js";
import { cleanString, cleanStringArray, normalizeApplyUrl, parseDate } from "./normalization.js";

const linkedInGuestSearchUrl = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";
const linkedInUserAgent = "Job tracker";
const defaultPageLimit = 1;
const maxPageLimit = 5;
const linkedInPageSize = 10;
const linkedInRemotePattern = /\b(remote|work from home|work from anywhere|fully remote|remote-first|remote source)\b/i;
const linkedInHybridOrOnsitePattern = /\b(hybrid|on[-\s]?site|onsite|in[-\s]?office|office[-\s]?based|partially remote|partial remote)\b/i;

export function isLinkedInSource(source: ImportSource): boolean {
  return isLinkedInHost(source.url) || source.name.toLowerCase().includes("linkedin");
}

export async function fetchLinkedInJobs(source: ImportSource): Promise<ImportableJob[]> {
  const searchUrl = toLinkedInGuestSearchUrl(source);
  const pageLimit = getLinkedInPageLimit();
  const baseStart = parsePositiveInteger(searchUrl.searchParams.get("start"), 0);
  const jobs: ImportableJob[] = [];
  const seenJobIds = new Set<string>();

  for (let page = 0; page < pageLimit; page += 1) {
    const pageUrl = new URL(searchUrl);
    pageUrl.searchParams.set("start", String(baseStart + page * linkedInPageSize));

    const response = await fetchLinkedInPage(pageUrl);

    const pageJobs = parseLinkedInJobCards(source, response.data, searchUrl);

    if (pageJobs.length === 0) {
      break;
    }

    for (const job of pageJobs) {
      const dedupeKey = job.externalId ?? job.applyUrl;

      if (seenJobIds.has(dedupeKey)) {
        continue;
      }

      seenJobIds.add(dedupeKey);
      jobs.push(job);
    }
  }

  return jobs;
}

async function fetchLinkedInPage(pageUrl: URL): Promise<{ data: string }> {
  try {
    return await axios.get<string>(pageUrl.toString(), {
      headers: {
        "User-Agent": linkedInUserAgent,
        Accept: "text/html,application/xhtml+xml"
      },
      responseType: "text",
      timeout: 20000
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      return { data: "" };
    }

    throw error;
  }
}

export function parseLinkedInJobCards(source: ImportSource, html: string, searchUrl: URL): ImportableJob[] {
  const $ = load(html);
  const cards = $(".job-search-card").toArray();
  const searchKeywords = cleanString(searchUrl.searchParams.get("keywords"));
  const searchLocation = cleanString(searchUrl.searchParams.get("location"));
  const remoteText = ["Remote source: LinkedIn", searchLocation ? `Search location: ${searchLocation}` : null]
    .filter(Boolean)
    .join("; ");

  return cards
    .map((element): ImportableJob | null => {
      const card = $(element);
      const entityUrn = cleanString(card.attr("data-entity-urn"));
      const jobId = getLinkedInJobId(entityUrn) ?? getLinkedInJobId(card.find("a.base-card__full-link").attr("href"));
      const title = cleanString(card.find(".base-search-card__title").first().text());
      const applyUrl = canonicalLinkedInJobUrl(jobId, card.find("a.base-card__full-link").attr("href"));
      const companyName = cleanString(card.find(".base-search-card__subtitle").first().text());
      const locationText = cleanString(card.find(".job-search-card__location").first().text());

      if (!title || !applyUrl) {
        return null;
      }

      const job = {
        sourceId: source.id,
        externalId: jobId,
        title,
        companyName,
        description: null,
        applyUrl,
        locationText,
        remoteText,
        employmentType: null,
        salaryText: null,
        tags: cleanStringArray(["LinkedIn", searchKeywords, searchLocation]),
        publishedAt: parseDate(card.find("time").first().attr("datetime")),
        expiresAt: null
      };

      return isStrictRemoteLinkedInJob(job) ? job : null;
    })
    .filter((job): job is ImportableJob => Boolean(job));
}

function toLinkedInGuestSearchUrl(source: ImportSource): URL {
  const sourceUrl = parseSourceUrl(source.url);

  if (sourceUrl.pathname.includes("/jobs-guest/jobs/api/seeMoreJobPostings/search")) {
    applyLinkedInSearchDefaults(sourceUrl, source);
    return sourceUrl;
  }

  const searchUrl = new URL(linkedInGuestSearchUrl);

  for (const [key, value] of sourceUrl.searchParams) {
    searchUrl.searchParams.append(key, value);
  }

  applyLinkedInSearchDefaults(searchUrl, source);
  return searchUrl;
}

function applyLinkedInSearchDefaults(searchUrl: URL, source: ImportSource) {
  if (!searchUrl.searchParams.has("keywords")) {
    searchUrl.searchParams.set("keywords", deriveSearchKeywords(source));
  }

  if (!searchUrl.searchParams.has("location")) {
    searchUrl.searchParams.set("location", deriveSearchLocation(source));
  }

  if (!searchUrl.searchParams.has("f_WT")) {
    searchUrl.searchParams.set("f_WT", "2");
  }

  if (!searchUrl.searchParams.has("sortBy")) {
    searchUrl.searchParams.set("sortBy", "DD");
  }

  if (!searchUrl.searchParams.has("f_TPR")) {
    searchUrl.searchParams.set("f_TPR", "r604800");
  }
}

function parseSourceUrl(value: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error(`LinkedIn source URL is invalid: ${value}`);
  }
}

function isLinkedInHost(value: string): boolean {
  try {
    return new URL(value).hostname.toLowerCase().endsWith("linkedin.com");
  } catch {
    return false;
  }
}

function deriveSearchKeywords(source: ImportSource): string {
  const text = `${source.name} ${source.url}`.toLowerCase();

  if (text.includes("backend")) {
    return "backend developer";
  }

  if (text.includes("typescript") || text.includes("react") || text.includes("node")) {
    return "typescript react node";
  }

  if (text.includes("developer")) {
    return "software developer";
  }

  return "software engineer";
}

function deriveSearchLocation(source: ImportSource): string {
  const text = `${source.name} ${source.url}`.toLowerCase();

  if (text.includes("japan")) {
    return "Japan";
  }

  if (text.includes("vietnam") || text.includes("viet nam")) {
    return "Vietnam";
  }

  if (text.includes("apac") || text.includes("asia")) {
    return "Asia-Pacific (APAC)";
  }

  return "Worldwide";
}

function canonicalLinkedInJobUrl(jobId: string | null, href: unknown): string | null {
  if (jobId) {
    return `https://www.linkedin.com/jobs/view/${jobId}`;
  }

  return normalizeApplyUrl(href);
}

function isStrictRemoteLinkedInJob(job: ImportableJob): boolean {
  const haystack = [
    job.title,
    job.companyName,
    job.locationText,
    job.remoteText,
    job.employmentType,
    ...job.tags
  ]
    .filter(Boolean)
    .join(" ");

  return linkedInRemotePattern.test(haystack) && !linkedInHybridOrOnsitePattern.test(haystack);
}

function getLinkedInJobId(value: unknown): string | null {
  const text = cleanString(value);
  return text?.match(/(?:jobPosting:|jobs\/view\/)(\d+)/)?.[1] ?? null;
}

function getLinkedInPageLimit(): number {
  return Math.min(
    maxPageLimit,
    Math.max(1, parsePositiveInteger(process.env.LINKEDIN_IMPORT_PAGE_LIMIT, defaultPageLimit))
  );
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
