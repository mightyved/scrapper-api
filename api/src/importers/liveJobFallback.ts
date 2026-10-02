import { createHash } from "node:crypto";
import { JobSourceType } from "@prisma/client";
import { matchJob } from "../matching/jobMatcher.js";
import { fetchPublicApiJobs } from "./publicApiImporters.js";
import { fetchRemoteOkJobs } from "./remoteOkImporter.js";
import { fetchRssJobs } from "./rssImporter.js";
import type { ImportSource, ImportableJob } from "./types.js";

type LiveJobSource = ImportSource & {
  fetcher: "remote-ok" | "rss" | "public-api";
};

type LiveJob = ImportableJob & {
  id: string;
  apacScore: number;
  relevanceScore: number;
  totalScore: number;
  matchReasons: string[];
  status: "ACTIVE";
  firstSeenAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
  source: {
    id: string;
    name: string;
    type: JobSourceType;
    url: string;
  };
};

const liveSources: LiveJobSource[] = [
  {
    id: "live-remote-ok",
    name: "Remote OK",
    type: JobSourceType.API,
    url: "https://remoteok.com/api",
    fetcher: "remote-ok"
  },
  {
    id: "live-remotive",
    name: "Remotive",
    type: JobSourceType.API,
    url: "https://remotive.com/api/remote-jobs",
    fetcher: "public-api"
  },
  {
    id: "live-working-nomads",
    name: "Working Nomads",
    type: JobSourceType.API,
    url: "https://www.workingnomads.com/api/exposed_jobs/",
    fetcher: "public-api"
  },
  {
    id: "live-jobicy-apac-software",
    name: "Jobicy APAC Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&geo=apac&industry=dev",
    fetcher: "public-api"
  },
  {
    id: "live-jobicy-latam-software",
    name: "Jobicy LATAM Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&geo=latam&industry=dev",
    fetcher: "public-api"
  },
  {
    id: "live-jobicy-emea-software",
    name: "Jobicy EMEA Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&geo=emea&industry=dev",
    fetcher: "public-api"
  },
  {
    id: "live-jobicy-worldwide-software",
    name: "Jobicy Worldwide Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&industry=dev",
    fetcher: "public-api"
  },
  {
    id: "live-himalayas-api",
    name: "Himalayas API",
    type: JobSourceType.API,
    url: "https://himalayas.app/jobs/api/search?q=software&worldwide=true&sort=recent",
    fetcher: "public-api"
  },
  {
    id: "live-arbeitnow",
    name: "Arbeitnow",
    type: JobSourceType.API,
    url: "https://www.arbeitnow.com/api/job-board-api",
    fetcher: "public-api"
  },
  {
    id: "live-the-muse",
    name: "The Muse Remote Software",
    type: JobSourceType.API,
    url: "https://www.themuse.com/api/public/jobs?category=Software%20Engineering&location=Remote&page=1",
    fetcher: "public-api"
  },
  {
    id: "live-we-work-remotely",
    name: "We Work Remotely",
    type: JobSourceType.RSS,
    url: "https://weworkremotely.com/remote-jobs.rss",
    fetcher: "rss"
  },
  {
    id: "live-himalayas",
    name: "Himalayas",
    type: JobSourceType.RSS,
    url: "https://himalayas.app/jobs/rss",
    fetcher: "rss"
  },
  {
    id: "live-real-work-from-anywhere-software",
    name: "Real Work From Anywhere Software",
    type: JobSourceType.RSS,
    url: "https://www.realworkfromanywhere.com/remote-software-developer-jobs/rss.xml",
    fetcher: "rss"
  },
  {
    id: "live-real-work-from-anywhere-backend",
    name: "Real Work From Anywhere Backend",
    type: JobSourceType.RSS,
    url: "https://www.realworkfromanywhere.com/remote-backend-jobs/rss.xml",
    fetcher: "rss"
  },
  {
    id: "live-jobscollider",
    name: "JobsCollider Remote Jobs",
    type: JobSourceType.RSS,
    url: "https://jobscollider.com/remote-jobs.rss",
    fetcher: "rss"
  },
  {
    id: "live-larajobs",
    name: "LaraJobs",
    type: JobSourceType.RSS,
    url: "https://larajobs.com/feed",
    fetcher: "rss"
  },
  {
    id: "live-rails-jobs",
    name: "Rails Jobs",
    type: JobSourceType.RSS,
    url: "https://jobs.rubyonrails.org/jobs.rss",
    fetcher: "rss"
  },
  {
    id: "live-elixir-jobs",
    name: "Elixir Jobs",
    type: JobSourceType.RSS,
    url: "https://elixirjobs.net/rss",
    fetcher: "rss"
  },
  {
    id: "live-four-day-week",
    name: "4 Day Week Jobs",
    type: JobSourceType.RSS,
    url: "https://4dayweek.io/feed",
    fetcher: "rss"
  },
  {
    id: "live-dribbble",
    name: "Dribbble Jobs",
    type: JobSourceType.RSS,
    url: "https://dribbble.com/jobs.rss",
    fetcher: "rss"
  },
  {
    id: "live-berlin-startup-jobs",
    name: "Berlin Startup Jobs Engineering",
    type: JobSourceType.RSS,
    url: "https://berlinstartupjobs.com/engineering/feed/",
    fetcher: "rss"
  },
  {
    id: "live-germantechjobs",
    name: "GermanTechJobs",
    type: JobSourceType.RSS,
    url: "https://germantechjobs.de/rss",
    fetcher: "rss"
  },
  {
    id: "live-swissdevjobs",
    name: "SwissDevJobs",
    type: JobSourceType.RSS,
    url: "https://swissdevjobs.ch/rss",
    fetcher: "rss"
  },
  {
    id: "live-reed",
    name: "Reed Jobs",
    type: JobSourceType.RSS,
    url: "https://www.reed.co.uk/jobs/rss",
    fetcher: "rss"
  },
  {
    id: "live-python-org-jobs",
    name: "Python.org Jobs",
    type: JobSourceType.RSS,
    url: "https://www.python.org/jobs/feed/rss/",
    fetcher: "rss"
  },
  {
    id: "live-vuejobs",
    name: "VueJobs",
    type: JobSourceType.RSS,
    url: "https://vuejobs.com/feed",
    fetcher: "rss"
  },
  {
    id: "live-golang-projects",
    name: "Golang Projects",
    type: JobSourceType.RSS,
    url: "https://www.golangprojects.com/rss.xml",
    fetcher: "rss"
  },
  {
    id: "live-remoteworkhub",
    name: "RemoteWorkHub",
    type: JobSourceType.RSS,
    url: "https://remoteworkhub.com/feed/",
    fetcher: "rss"
  }
];

export async function fetchLiveMatchedJobs(): Promise<LiveJob[]> {
  const results = await Promise.allSettled(
    liveSources.map((source) => withTimeout(fetchLiveSource(source), 30000, `Timed out fetching ${source.name}`))
  );
  const jobsByApplyUrl = new Map<string, LiveJob>();

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[live-jobs] Source failed:", result.reason);
      continue;
    }

    for (const job of result.value) {
      if (!jobsByApplyUrl.has(job.applyUrl)) {
        jobsByApplyUrl.set(job.applyUrl, job);
      }
    }
  }

  return Array.from(jobsByApplyUrl.values())
    .sort((a, b) => {
      const dateDifference = dateValue(b.publishedAt) - dateValue(a.publishedAt);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return b.totalScore - a.totalScore;
    })
    .slice(0, 150);
}

async function fetchLiveSource(source: LiveJobSource): Promise<LiveJob[]> {
  const importedJobs = await fetchJobsForLiveSource(source);

  return importedJobs
    .map((job) => toLiveJob(source, job))
    .filter((job): job is LiveJob => Boolean(job));
}

async function fetchJobsForLiveSource(source: LiveJobSource): Promise<ImportableJob[]> {
  if (source.fetcher === "remote-ok") {
    return fetchRemoteOkJobs(source);
  }

  if (source.fetcher === "public-api") {
    return fetchPublicApiJobs(source);
  }

  return fetchRssJobs(source);
}

function toLiveJob(source: LiveJobSource, job: ImportableJob): LiveJob | null {
  const match = matchJob(job);
  const startup = isStartupJob(source, job);

  if (!match.accepted || match.relevanceScore <= 0) {
    return null;
  }

  const now = new Date();
  const tags = startup && !job.tags.includes("Startup") ? [...job.tags, "Startup"] : job.tags;
  const matchReasons = startup && !match.matchReasons.includes("Startup") ? [...match.matchReasons, "Startup"] : match.matchReasons;

  return {
    ...job,
    tags,
    id: createLiveJobId(job.applyUrl),
    apacScore: match.apacScore,
    relevanceScore: match.relevanceScore,
    totalScore: match.totalScore,
    matchReasons,
    status: "ACTIVE",
    firstSeenAt: now,
    lastSeenAt: now,
    createdAt: now,
    updatedAt: now,
    source: {
      id: source.id,
      name: source.name,
      type: source.type,
      url: source.url
    }
  };
}

function createLiveJobId(applyUrl: string): string {
  return `live-${createHash("sha1").update(applyUrl).digest("hex").slice(0, 16)}`;
}

function dateValue(value: Date | null): number {
  return value?.getTime() ?? 0;
}

function isStartupJob(source: LiveJobSource, job: ImportableJob): boolean {
  const text = [
    source.name,
    job.title,
    job.companyName,
    job.description,
    job.locationText,
    job.remoteText,
    ...job.tags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\b(startup|start-up|scaleup|scale-up|early stage|early-stage|venture-backed|vc-backed|seed stage|series [abc]|y combinator|yc backed|founder-led)\b/i.test(text);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}
