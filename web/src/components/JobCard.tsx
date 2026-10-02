import { Building2, CalendarClock, ExternalLink, Flame, MapPin, RadioTower, ScanSearch, Tags, UploadCloud } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import type { Job } from "../lib/jobs";
import { formatPublishedDate, getMatchedKeywords, getRegionFit, isUrgentHiringJob } from "../lib/jobs";
import { analyzeResumeForJob, type ResumeAnalysisResult } from "../lib/resumeAnalysis";
import { ResumeAnalysisModal } from "./ResumeAnalysisModal";

type JobCardProps = {
  job: Job;
};

export function JobCard({ job }: JobCardProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const regionFit = getRegionFit(job);
  const matchedKeywords = getMatchedKeywords(job);
  const scoreTone = getScoreTone(job.totalScore);
  const isLinkedIn = job.source.name.toLowerCase().includes("linkedin");
  const isUrgent = isUrgentHiringJob(job);

  function handleResumeChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setResumeFile(nextFile);
    setAnalysis(null);
    setAnalysisError(null);
  }

  async function handleAnalyzeResume() {
    if (!resumeFile) {
      setAnalysisError("Upload a resume file first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const nextAnalysis = await analyzeResumeForJob(job, resumeFile);
      setAnalysis(nextAnalysis);
      setIsAnalysisOpen(true);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Unable to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <>
      <article className={`job-card job-card--${scoreTone}`}>
        <div className="job-card__main">
          <div className="job-card__topline">
            <div className="job-card__badges">
              <span className={`source-badge${isLinkedIn ? " source-badge--linkedin" : ""}`}>{job.source.name}</span>
              {isUrgent ? (
                <span className="region-pill region-pill--urgent">
                  <Flame size={13} aria-hidden="true" />
                  Urgent
                </span>
              ) : null}
              <span className={`region-pill region-pill--${regionFit.toLowerCase()}`}>{regionFit}</span>
            </div>
          </div>

          <div className="job-card__heading">
            <h2>{job.title}</h2>
            <p>
              <Building2 size={15} aria-hidden="true" />
              {job.companyName || "Company not listed"}
            </p>
          </div>

          <dl className="job-card__meta">
            <div>
              <dt>
                <MapPin size={15} aria-hidden="true" />
                Location
              </dt>
              <dd>{job.locationText || job.remoteText || "Remote"}</dd>
            </div>
            <div>
              <dt>
                <CalendarClock size={15} aria-hidden="true" />
                Posted
              </dt>
              <dd>{formatPublishedDate(job.publishedAt)}</dd>
            </div>
            <div>
              <dt>
                <RadioTower size={15} aria-hidden="true" />
                Board
              </dt>
              <dd>{job.source.type}</dd>
            </div>
          </dl>

          <div className="keyword-row" aria-label="Matched keywords">
            <Tags size={15} aria-hidden="true" />
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((keyword) => (
                <span className="keyword-chip" key={keyword}>
                  {keyword}
                </span>
              ))
            ) : (
              <span className="keyword-chip keyword-chip--muted">No keywords yet</span>
            )}
          </div>
        </div>

        <div className="job-card__actions">
          <div className={`score-pill score-pill--${scoreTone}`} aria-label={`Match score ${job.totalScore} out of 100`}>
            <span>{job.totalScore}</span>
            <small>match</small>
          </div>

          <div className="resume-analyzer">
            <label className="resume-upload">
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,.html,.htm,.json,.csv,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/*"
                onChange={handleResumeChange}
              />
              <UploadCloud size={16} aria-hidden="true" />
              <span>{resumeFile ? "Resume selected" : "Upload resume"}</span>
            </label>
            <small title={resumeFile?.name}>{resumeFile?.name ?? "PDF, DOCX, TXT"}</small>
            <button className="analyse-button" type="button" onClick={handleAnalyzeResume} disabled={!resumeFile || isAnalyzing}>
              <ScanSearch size={16} aria-hidden="true" />
              {isAnalyzing ? "Analysing" : "Analyse"}
            </button>
            {analysis ? (
              <button className="analysis-view-button" type="button" onClick={() => setIsAnalysisOpen(true)}>
                View report
              </button>
            ) : null}
            {analysisError ? <p className="resume-analyzer__error">{analysisError}</p> : null}
          </div>

          <a className="apply-button" href={job.applyUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={17} aria-hidden="true" />
            Apply
          </a>
        </div>
      </article>

      {analysis && isAnalysisOpen ? (
        <ResumeAnalysisModal analysis={analysis} job={job} resumeFile={resumeFile} onClose={() => setIsAnalysisOpen(false)} />
      ) : null}
    </>
  );
}

function getScoreTone(score: number): "strong" | "steady" | "low" {
  if (score >= 70) {
    return "strong";
  }

  if (score >= 40) {
    return "steady";
  }

  return "low";
}
