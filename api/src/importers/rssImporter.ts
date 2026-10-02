import axios from "axios";
import Parser from "rss-parser";
import type { ImportSource, ImportableJob } from "./types.js";
import {
  cleanString,
  cleanStringArray,
  firstNonEmptyString,
  normalizeApplyUrl,
  parseDate,
  splitTitleAndCompany
} from "./normalization.js";

type RssJobItem = {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  categories?: string[];
  creator?: string;
};

const parser = new Parser<Record<string, unknown>, RssJobItem>();
const defaultMaxRssItems = 120;

export async function fetchRssJobs(source: ImportSource): Promise<ImportableJob[]> {
  const xml = await fetchRssXml(source.url);
  const feed = await parseRssXml(limitFeedItems(xml, getMaxRssItems()));

  return feed.items
    .map((item) => normalizeRssItem(source, item))
    .filter((job): job is ImportableJob => Boolean(job));
}

async function fetchRssXml(url: string): Promise<string> {
  const response = await axios.get<string>(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml, */*",
      "User-Agent": "Job tracker"
    },
    responseType: "text",
    timeout: 25000
  });

  return response.data;
}

async function parseRssXml(xml: string) {
  try {
    return await parser.parseString(xml);
  } catch (error) {
    return parser.parseString(sanitizeXmlEntities(xml));
  }
}

function limitFeedItems(xml: string, maxItems: number): string {
  if (maxItems <= 0) {
    return xml;
  }

  return limitXmlElements(limitXmlElements(xml, "item", maxItems), "entry", maxItems);
}

function limitXmlElements(xml: string, elementName: "entry" | "item", maxItems: number): string {
  const elementPattern = new RegExp(`<${elementName}\\b[\\s\\S]*?<\\/${elementName}>`, "gi");
  const matches = Array.from(xml.matchAll(elementPattern));

  if (matches.length <= maxItems) {
    return xml;
  }

  const keptItems = matches.slice(0, maxItems).map((match) => match[0]).join("");
  const firstMatch = matches[0];
  const lastMatch = matches[matches.length - 1];
  const firstIndex = firstMatch.index ?? 0;
  const lastIndex = lastMatch.index ?? firstIndex;

  return `${xml.slice(0, firstIndex)}${keptItems}${xml.slice(lastIndex + lastMatch[0].length)}`;
}

function sanitizeXmlEntities(xml: string): string {
  return xml.replace(/&(?!#\d+;|#x[\da-fA-F]+;|[a-zA-Z][\w.-]*;)/g, "&amp;");
}

function getMaxRssItems(): number {
  const configured = Number.parseInt(process.env.MAX_RSS_ITEMS_PER_SOURCE ?? "", 10);
  return Number.isInteger(configured) && configured > 0 ? configured : defaultMaxRssItems;
}

function normalizeRssItem(source: ImportSource, item: RssJobItem): ImportableJob | null {
  const rawTitle = cleanString(item.title);
  const applyUrl = normalizeApplyUrl(firstNonEmptyString(item.link, item.guid));

  if (!rawTitle || !applyUrl) {
    return null;
  }

  const titleParts = splitTitleAndCompany(rawTitle);
  const description = firstNonEmptyString(item.content, item.contentSnippet, item.summary);
  const tags = cleanStringArray(item.categories);
  const locationText = tags.length > 0 ? tags.join(", ") : null;
  const remoteText = getRemoteText(source, item, description, tags);

  return {
    sourceId: source.id,
    externalId: firstNonEmptyString(item.guid, item.link, applyUrl),
    title: titleParts.title,
    companyName: firstNonEmptyString(titleParts.companyName, item.creator),
    description,
    applyUrl,
    locationText,
    remoteText,
    employmentType: null,
    salaryText: null,
    tags,
    publishedAt: parseDate(firstNonEmptyString(item.isoDate, item.pubDate)),
    expiresAt: null
  };
}

function getRemoteText(source: ImportSource, item: RssJobItem, description: string | null, tags: string[]): string | null {
  const text = [
    source.name,
    source.url,
    item.title,
    item.link,
    item.guid,
    description,
    ...tags
  ]
    .filter(Boolean)
    .join(" ");

  if (!hasRemoteSignal(text)) {
    return null;
  }

  return `Remote source: ${source.name}`;
}

function hasRemoteSignal(value: string): boolean {
  return /\b(remote|worldwide|anywhere|global|work from home|work from anywhere)\b/i.test(value);
}
