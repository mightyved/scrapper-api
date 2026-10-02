export function cleanString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => cleanString(item))
        .filter((item): item is string => Boolean(item))
    )
  );
}

export function normalizeApplyUrl(value: unknown): string | null {
  const rawUrl = cleanString(value);

  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    url.hash = "";

    for (const key of Array.from(url.searchParams.keys())) {
      if (/^utm_/i.test(key) || ["fbclid", "gclid", "mc_cid", "mc_eid"].includes(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    const cleaned = cleanString(value);

    if (cleaned) {
      return cleaned;
    }
  }

  return null;
}

export function splitTitleAndCompany(rawTitle: string): { title: string; companyName: string | null } {
  const colonMatch = rawTitle.match(/^([^:]{2,80}):\s+(.+)$/);

  if (colonMatch) {
    return {
      companyName: colonMatch[1].trim(),
      title: colonMatch[2].trim()
    };
  }

  const atMatch = rawTitle.match(/^(.+?)\s+at\s+(.+)$/i);

  if (atMatch) {
    return {
      title: atMatch[1].trim(),
      companyName: atMatch[2].trim()
    };
  }

  return {
    title: rawTitle,
    companyName: null
  };
}
