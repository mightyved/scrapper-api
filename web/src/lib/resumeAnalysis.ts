import type { Job } from "./jobs";

export type ResumeAnalysisResult = {
  atsRate: number;
  fileName: string;
  humanizedPercentage: number;
  recruiterScreeningPassRate: number;
  resumeTextLength: number;
  verdict: "Competitive" | "High fit" | "Needs tailoring" | "Weak fit";
  summary: string;
  atsSignals: string[];
  humanSignals: string[];
  improvementActions: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  recruiterSignals: string[];
  scoreBreakdown: {
    evidence: number;
    format: number;
    keywordCoverage: number;
    requiredCoverage: number;
    seniority: number;
    titleFit: number;
  };
};

export type ResumeGenerationResult = {
  analysis: ResumeAnalysisResult;
  generatedFileName: string;
  generatedResumeText: string;
  originalAnalysis: ResumeAnalysisResult;
  targetReached: boolean;
  targetScore: number;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function analyzeResumeForJob(job: Job, resume: File): Promise<ResumeAnalysisResult> {
  const payload = await postResumeForm<{ data: ResumeAnalysisResult }>("/resume/analyze", job, resume, "Unable to analyze resume");
  return payload.data;
}

export async function generateResumeForJob(job: Job, resume: File): Promise<ResumeGenerationResult> {
  const payload = await postResumeForm<{ data: ResumeGenerationResult }>("/resume/generate", job, resume, "Unable to generate resume");
  return payload.data;
}

async function postResumeForm<T>(path: string, job: Job, resume: File, fallbackMessage: string): Promise<T> {
  const formData = new FormData();
  formData.append("resume", resume);
  formData.append(
    "job",
    JSON.stringify({
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      locationText: job.locationText,
      matchReasons: job.matchReasons,
      remoteText: job.remoteText,
      sourceName: job.source.name,
      tags: job.tags
    })
  );

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      body: formData,
      method: "POST"
    });
  } catch {
    throw new Error(`API is not reachable at ${apiBaseUrl}. Start the backend API first.`);
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message ?? `${fallbackMessage}: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    return typeof payload.error === "string" ? payload.error : null;
  } catch {
    return null;
  }
}
