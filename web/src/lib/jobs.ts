export type RegionFilter = "All" | "Urgent" | "APAC" | "LATAM" | "EMEA" | "Japan" | "Vietnam" | "Worldwide" | "Startup";

export type JobTimeBucket = {
  id: string;
  label: string;
  rangeLabel: string;
  jobs: Job[];
};

export type JobSource = {
  id: string;
  name: string;
  type: "RSS" | "API";
  url: string;
};

export type JobSourceRecord = JobSource & {
  enabled: boolean;
  lastFetchedAt: string | null;
};

export type Job = {
  id: string;
  title: string;
  companyName: string | null;
  description?: string | null;
  applyUrl: string;
  locationText: string | null;
  remoteText: string | null;
  totalScore: number;
  apacScore: number;
  relevanceScore: number;
  matchReasons: string[];
  tags: string[];
  publishedAt: string | null;
  source: JobSource;
};

type JobsResponse = {
  data: Job[];
};

type SourcesResponse = {
  data: JobSourceRecord[];
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const excludedApacMarketPattern = /\b(india|pakistan|bangladesh|delhi|mumbai|bengaluru|bangalore|hyderabad|pune|karachi|lahore|islamabad|dhaka)\b/i;
const linkedInHybridPattern = /\b(hybrid|on[-\s]?site|onsite|in[-\s]?office|office[-\s]?based|partially remote|partial remote)\b/i;
const linkedInRemotePattern = /\b(remote|work from home|work from anywhere|fully remote|remote-first|remote source)\b/i;
const urgentHiringPattern = /\b(urgent|urgently hiring|urgent hire|hiring immediately|immediate hire|immediate start|start immediately|start asap|asap start|actively hiring|fast hiring|fast-track hiring|priority hiring)\b/i;

export async function fetchJobs(): Promise<Job[]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/jobs`);
  } catch {
    throw new Error(`API is not reachable at ${apiBaseUrl}. Start the backend API first.`);
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message ?? `Unable to load jobs: ${response.status}`);
  }

  const payload = (await response.json()) as JobsResponse;
  return payload.data.filter(isDisplayableJob);
}

export async function fetchSources(): Promise<JobSourceRecord[]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/sources`);
  } catch {
    throw new Error(`API is not reachable at ${apiBaseUrl}. Start the backend API first.`);
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message ?? `Unable to load sources: ${response.status}`);
  }

  const payload = (await response.json()) as SourcesResponse;
  return payload.data;
}

export async function addJobSource(url: string): Promise<JobSourceRecord> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/sources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });
  } catch {
    throw new Error(`API is not reachable at ${apiBaseUrl}. Start the backend API first.`);
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message ?? `Unable to add job site: ${response.status}`);
  }

  const payload = (await response.json()) as { data: JobSourceRecord };
  return payload.data;
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    return typeof payload.error === "string" ? payload.error : null;
  } catch {
    return null;
  }
}

export function getPlatformNameFromSource(source: Pick<JobSource, "name" | "url">): string {
  const text = `${source.name} ${source.url}`.toLowerCase();

  if (text.includes("linkedin.com") || text.includes("linkedin")) return "LinkedIn";
  if (text.includes("weworkremotely.com") || text.includes("we work remotely")) return "We Work Remotely";
  if (text.includes("remoteok.com") || text.includes("remote ok")) return "Remote OK";
  if (text.includes("remotive.com") || text.includes("remotive")) return "Remotive";
  if (text.includes("workingnomads.com") || text.includes("working nomads")) return "Working Nomads";
  if (text.includes("jobicy.com") || text.includes("jobicy")) return "Jobicy";
  if (text.includes("himalayas.app") || text.includes("himalayas")) return "Himalayas";
  if (text.includes("realworkfromanywhere.com") || text.includes("real work from anywhere")) return "Real Work From Anywhere";
  if (text.includes("jobscollider.com") || text.includes("jobscollider")) return "JobsCollider";
  if (text.includes("arbeitnow.com") || text.includes("arbeitnow")) return "Arbeitnow";
  if (text.includes("python.org") || text.includes("python.org")) return "Python.org Jobs";
  if (text.includes("vuejobs.com") || text.includes("vuejobs")) return "VueJobs";
  if (text.includes("golangprojects.com") || text.includes("golang projects")) return "Golang Projects";
  if (text.includes("remoteworkhub.com") || text.includes("remoteworkhub")) return "RemoteWorkHub";
  if (text.includes("devitjobs.com") || text.includes("devitjobs")) return "DevITjobs";
  if (text.includes("themuse.com") || text.includes("the muse")) return "The Muse";
  if (text.includes("larajobs.com") || text.includes("larajobs")) return "LaraJobs";
  if (text.includes("rubyonrails.org") || text.includes("rails jobs")) return "Rails Jobs";
  if (text.includes("elixirjobs.net") || text.includes("elixir jobs")) return "Elixir Jobs";
  if (text.includes("4dayweek.io") || text.includes("4 day week")) return "4 Day Week";
  if (text.includes("dribbble.com") || text.includes("dribbble")) return "Dribbble";
  if (text.includes("berlinstartupjobs.com") || text.includes("berlin startup jobs")) return "Berlin Startup Jobs";
  if (text.includes("germantechjobs.de") || text.includes("germantechjobs")) return "GermanTechJobs";
  if (text.includes("swissdevjobs.ch") || text.includes("swissdevjobs")) return "SwissDevJobs";
  if (text.includes("reed.co.uk") || text.includes("reed jobs")) return "Reed";
  if (text.includes("authenticjobs.com") || text.includes("authentic jobs")) return "Authentic Jobs";
  if (text.includes("cybersecjobs.com") || text.includes("cybersecjobs")) return "CyberSecJobs";
  if (text.includes("cybersecurityjobs.com") || text.includes("cybersecurityjobs")) return "CyberSecurityJobs";
  if (text.includes("workanywhere.pro") || text.includes("workanywhere")) return "WorkAnywhere";
  if (text.includes("tokyodev.com") || text.includes("tokyodev")) return "TokyoDev";
  if (text.includes("japan-dev.com") || text.includes("japan dev")) return "Japan Dev";
  if (text.includes("itviec.com") || text.includes("itviec")) return "ITviec";
  if (text.includes("vietnamdevs.com") || text.includes("vietnamdevs")) return "VietnamDevs";
  if (text.includes("remoterocketship.com") || text.includes("remote rocketship")) return "Remote Rocketship";
  if (text.includes("nodesk.co") || text.includes("nodesk")) return "NoDesk";
  if (text.includes("remote.co") || text.includes("remote.co")) return "Remote.co";
  if (text.includes("justremote.co") || text.includes("justremote")) return "JustRemote";
  if (text.includes("dynamitejobs.com") || text.includes("dynamite jobs")) return "Dynamite Jobs";
  if (text.includes("remoteleaf.com") || text.includes("remoteleaf")) return "RemoteLeaf";
  if (text.includes("wellfound.com") || text.includes("wellfound")) return "Wellfound";
  if (text.includes("arc.dev") || text.includes("arc remote")) return "Arc";
  if (text.includes("ycombinator.com") || text.includes("y combinator")) return "Y Combinator";
  if (text.includes("techinasia.com") || text.includes("tech in asia")) return "Tech in Asia";

  return source.name.replace(/\s+(remote|software|developer|engineer|jobs?|job board|api|rss|worldwide|apac|latam|emea|japan|vietnam|fully)\b.*$/i, "").trim() || source.name;
}

export function getPlatformHomeUrl(source: Pick<JobSource, "name" | "url">): string {
  const text = `${source.name} ${source.url}`.toLowerCase();

  if (text.includes("linkedin.com") || text.includes("linkedin")) return "https://www.linkedin.com/jobs/";
  if (text.includes("weworkremotely.com") || text.includes("we work remotely")) return "https://weworkremotely.com/";
  if (text.includes("remoteok.com") || text.includes("remote ok")) return "https://remoteok.com/";
  if (text.includes("remotive.com") || text.includes("remotive")) return "https://remotive.com/";
  if (text.includes("workingnomads.com") || text.includes("working nomads")) return "https://www.workingnomads.com/jobs";
  if (text.includes("jobicy.com") || text.includes("jobicy")) return "https://jobicy.com/";
  if (text.includes("himalayas.app") || text.includes("himalayas")) return "https://himalayas.app/jobs";
  if (text.includes("realworkfromanywhere.com") || text.includes("real work from anywhere")) return "https://www.realworkfromanywhere.com/";
  if (text.includes("jobscollider.com") || text.includes("jobscollider")) return "https://jobscollider.com/";
  if (text.includes("arbeitnow.com") || text.includes("arbeitnow")) return "https://www.arbeitnow.com/jobs";
  if (text.includes("python.org") || text.includes("python.org")) return "https://www.python.org/jobs/";
  if (text.includes("vuejobs.com") || text.includes("vuejobs")) return "https://vuejobs.com/";
  if (text.includes("golangprojects.com") || text.includes("golang projects")) return "https://www.golangprojects.com/";
  if (text.includes("remoteworkhub.com") || text.includes("remoteworkhub")) return "https://remoteworkhub.com/jobs/";
  if (text.includes("devitjobs.com") || text.includes("devitjobs")) return "https://devitjobs.com/jobs/all/remote";
  if (text.includes("themuse.com") || text.includes("the muse")) return "https://www.themuse.com/search/category/software-engineering/location/remote-flexible";
  if (text.includes("larajobs.com") || text.includes("larajobs")) return "https://larajobs.com/";
  if (text.includes("rubyonrails.org") || text.includes("rails jobs")) return "https://jobs.rubyonrails.org/";
  if (text.includes("elixirjobs.net") || text.includes("elixir jobs")) return "https://elixirjobs.net/";
  if (text.includes("4dayweek.io") || text.includes("4 day week")) return "https://4dayweek.io/remote-jobs";
  if (text.includes("dribbble.com") || text.includes("dribbble")) return "https://dribbble.com/jobs";
  if (text.includes("berlinstartupjobs.com") || text.includes("berlin startup jobs")) return "https://berlinstartupjobs.com/engineering/";
  if (text.includes("germantechjobs.de") || text.includes("germantechjobs")) return "https://germantechjobs.de/jobs/all/remote";
  if (text.includes("swissdevjobs.ch") || text.includes("swissdevjobs")) return "https://swissdevjobs.ch/jobs/all/remote";
  if (text.includes("reed.co.uk") || text.includes("reed jobs")) return "https://www.reed.co.uk/jobs";

  return source.url;
}

export function getJobPlatformName(job: Job): string {
  return getPlatformNameFromSource(job.source);
}

export function getRegionFit(job: Job): RegionFilter {
  if (isStartupJob(job)) {
    return "Startup";
  }

  return getGeographicRegionFit(job);
}

function getGeographicRegionFit(job: Job): Exclude<RegionFilter, "All" | "Urgent" | "Startup"> {
  const haystack = [
    job.locationText,
    job.remoteText,
    job.source.name,
    ...job.matchReasons,
    ...job.tags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (hasExcludedApacMarket(job)) {
    return "Worldwide";
  }

  if (/\bjapan\b|\bjst\b|\btokyo\b|\bosaka\b/.test(haystack)) {
    return "Japan";
  }

  if (/\bvietnam\b|\bviet nam\b|\bict\b|\bhanoi\b|\bha noi\b|\bho chi minh\b|\bda nang\b/.test(haystack)) {
    return "Vietnam";
  }

  if (/\b(latam|latin america|south america|central america|brazil|mexico|argentina|chile|colombia|peru|uruguay|costa rica)\b/.test(haystack)) {
    return "LATAM";
  }

  if (/\b(emea|europe|european|eu|united kingdom|uk|germany|france|spain|netherlands|italy|poland|portugal|middle east|uae|dubai|saudi|israel|turkey|africa|south africa|egypt)\b/.test(haystack)) {
    return "EMEA";
  }

  if (/\bworldwide\b|\banywhere\b|\bglobal\b|\bwork from anywhere\b/.test(haystack)) {
    return "Worldwide";
  }

  if (/\bapac\b|\basia\b|\basia-pacific\b|\basia timezone\b|\bsingapore\b|\bmalaysia\b|\bindonesia\b|\bphilippines\b|\bthailand\b|\btaiwan\b|\bhong kong\b|\bkorea\b|\baustralia\b|\bnew zealand\b|\butc\s*\+?[789]\b|\bgmt\s*\+?[789]\b/.test(haystack)) {
    return "APAC";
  }

  return "Worldwide";
}

export function filterJobsByRegion(jobs: Job[], region: RegionFilter): Job[] {
  const displayableJobs = jobs.filter(isDisplayableJob);

  if (region === "All") {
    return displayableJobs;
  }

  if (region === "Startup") {
    return displayableJobs.filter(isStartupJob);
  }

  if (region === "Urgent") {
    return displayableJobs.filter(isUrgentHiringJob);
  }

  return displayableJobs.filter((job) => getGeographicRegionFit(job) === region);
}

export function groupJobsByRecentDay(jobs: Job[], now = new Date()): JobTimeBucket[] {
  const buckets: JobTimeBucket[] = [
    {
      id: "last-24-hours",
      label: "Last 24 hours",
      rangeLabel: "Posted in the last 24 hours",
      jobs: []
    },
    ...Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;

      return {
        id: `${day}-day-ago`,
        label: `${day} day${day === 1 ? "" : "s"} ago`,
        rangeLabel: `Posted ${day} to ${day + 1} days ago`,
        jobs: []
      };
    })
  ];

  for (const job of jobs) {
    const publishedAt = parsePublishedAt(job.publishedAt);

    if (!publishedAt) {
      continue;
    }

    const ageMs = now.getTime() - publishedAt.getTime();

    if (ageMs < 0) {
      buckets[0].jobs.push(job);
      continue;
    }

    const ageHours = ageMs / (1000 * 60 * 60);

    if (ageHours < 24) {
      buckets[0].jobs.push(job);
      continue;
    }

    const dayIndex = Math.floor(ageHours / 24);

    if (dayIndex >= 1 && dayIndex <= 7) {
      buckets[dayIndex].jobs.push(job);
    }
  }

  return buckets.map((bucket) => ({
    ...bucket,
    jobs: [...bucket.jobs].sort(compareJobsByDateThenScore)
  }));
}

export function getMatchedKeywords(job: Job): string[] {
  const keywords = [...job.matchReasons, ...job.tags]
    .map((keyword) => keyword.replace(/^Rejected:\s*/i, "").trim())
    .filter(Boolean);

  return Array.from(new Set(keywords)).slice(0, 8);
}

export function isStartupJob(job: Job): boolean {
  const haystack = [
    job.title,
    job.companyName,
    job.locationText,
    job.remoteText,
    job.source.name,
    ...job.matchReasons,
    ...job.tags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\b(startup|start-up|scaleup|scale-up|early stage|early-stage|venture-backed|vc-backed|seed stage|series [abc]|y combinator|yc backed|founder-led)\b/i.test(haystack);
}

export function isUrgentHiringJob(job: Job): boolean {
  return urgentHiringPattern.test(buildJobText(job));
}

export function isDisplayableJob(job: Job): boolean {
  return !hasExcludedApacMarket(job) && isStrictRemoteLinkedInJob(job);
}

function hasExcludedApacMarket(job: Job): boolean {
  return excludedApacMarketPattern.test(buildJobText(job));
}

function isStrictRemoteLinkedInJob(job: Job): boolean {
  if (!job.source.name.toLowerCase().includes("linkedin")) {
    return true;
  }

  const haystack = buildJobText(job);
  return linkedInRemotePattern.test(haystack) && !linkedInHybridPattern.test(haystack);
}

function buildJobText(job: Job): string {
  return [
    job.title,
    job.companyName,
    job.description,
    job.locationText,
    job.remoteText,
    job.source.name,
    job.source.url,
    ...job.matchReasons,
    ...job.tags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function formatPublishedDate(value: string | null): string {
  const date = parsePublishedAt(value);

  if (!date) {
    return "Publish date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function compareJobsByDateThenScore(a: Job, b: Job): number {
  const dateDifference = dateValue(b.publishedAt) - dateValue(a.publishedAt);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  return b.totalScore - a.totalScore;
}

function dateValue(value: string | null): number {
  return parsePublishedAt(value)?.getTime() ?? 0;
}

function parsePublishedAt(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
