import type { Request, Response } from "express";
import { JobSourceType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function getSources(_req: Request, res: Response) {
  try {
    const sources = await prisma.jobSource.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        enabled: true,
        lastFetchedAt: true
      }
    });

    res.json({ data: sources });
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Sources are unavailable. Check the database connection." });
  }
}

export async function createSource(req: Request, res: Response) {
  const url = normalizeSourceUrl(req.body?.url);

  if (!url) {
    res.status(400).json({ error: "A valid job site URL is required." });
    return;
  }

  const name = normalizeSourceName(req.body?.name) ?? deriveSourceName(url);
  const type = inferSourceType(url);

  try {
    const existingSource = await prisma.jobSource.findUnique({
      where: { url },
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        enabled: true,
        lastFetchedAt: true
      }
    });

    if (existingSource) {
      res.status(200).json({ data: existingSource });
      return;
    }

    const source = await prisma.jobSource.create({
      data: {
        name,
        type,
        url,
        enabled: false
      },
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        enabled: true,
        lastFetchedAt: true
      }
    });

    res.status(201).json({ data: source });
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Unable to save this job site. Check the database connection." });
  }
}

function normalizeSourceUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;

  try {
    const url = new URL(candidate);

    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeSourceName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue.slice(0, 120) : null;
}

function deriveSourceName(url: string): string {
  const hostname = new URL(url).hostname.replace(/^www\./i, "");
  const domain = hostname.split(".").slice(0, -1).join(".") || hostname;

  return domain
    .split(/[.-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferSourceType(url: string): JobSourceType {
  return /\.(rss|xml)$/i.test(url) || /\/(feed|rss)(?:\/|\?|$)/i.test(url) ? JobSourceType.RSS : JobSourceType.API;
}
