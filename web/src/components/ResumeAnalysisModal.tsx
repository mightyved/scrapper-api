import { AlertTriangle, CheckCircle2, Download, FileText, Gauge, Lightbulb, ShieldCheck, Sparkles, UserCheck, X } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Job } from "../lib/jobs";
import { generateResumeForJob, type ResumeAnalysisResult, type ResumeGenerationResult } from "../lib/resumeAnalysis";

type ResumeAnalysisModalProps = {
  analysis: ResumeAnalysisResult;
  job: Job;
  onClose: () => void;
  resumeFile: File | null;
};

export function ResumeAnalysisModal({ analysis, job, onClose, resumeFile }: ResumeAnalysisModalProps) {
  const [generatedResume, setGeneratedResume] = useState<ResumeGenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const shouldOfferGeneration =
    analysis.atsRate < 80 && analysis.humanizedPercentage < 80 && analysis.recruiterScreeningPassRate < 80;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleGenerateResume() {
    if (!resumeFile) {
      setGenerationError("Resume file is not available. Upload it again and run analysis first.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const nextGeneratedResume = await generateResumeForJob(job, resumeFile);
      setGeneratedResume(nextGeneratedResume);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Unable to generate resume.");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadGeneratedResume() {
    if (!generatedResume) {
      return;
    }

    const blob = new Blob([generatedResume.generatedResumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = generatedResume.generatedFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="analysis-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="analysis-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`analysis-${job.id}-title`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="analysis-modal__header">
          <div>
            <p className="section-label">Resume analysis</p>
            <h2 id={`analysis-${job.id}-title`}>{job.title}</h2>
            <span>
              {analysis.fileName} for {job.companyName || "company not listed"}
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close resume analysis">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="analysis-verdict">
          <div>
            <strong>{analysis.verdict}</strong>
            <p>{analysis.summary}</p>
          </div>
          <span>Estimated from JD and resume text</span>
        </div>

        <div className="analysis-score-grid" aria-label="Resume analysis scores">
          <ScoreTile
            icon={<ShieldCheck size={18} aria-hidden="true" />}
            label="Recruiter screening pass"
            score={analysis.recruiterScreeningPassRate}
          />
          <ScoreTile icon={<Gauge size={18} aria-hidden="true" />} label="ATS rate" score={analysis.atsRate} />
          <ScoreTile icon={<UserCheck size={18} aria-hidden="true" />} label="Humanized percentage" score={analysis.humanizedPercentage} />
        </div>

        <div className="analysis-breakdown">
          <BreakdownBar label="Keyword coverage" score={analysis.scoreBreakdown.keywordCoverage} />
          <BreakdownBar label="Required signals" score={analysis.scoreBreakdown.requiredCoverage} />
          <BreakdownBar label="Title fit" score={analysis.scoreBreakdown.titleFit} />
          <BreakdownBar label="Evidence" score={analysis.scoreBreakdown.evidence} />
          <BreakdownBar label="ATS format" score={analysis.scoreBreakdown.format} />
          <BreakdownBar label="Seniority" score={analysis.scoreBreakdown.seniority} />
        </div>

        <div className="analysis-columns">
          <SignalPanel icon={<CheckCircle2 size={16} aria-hidden="true" />} title="Matched JD keywords" items={analysis.matchedKeywords} />
          <SignalPanel
            emptyText="No major missing keywords detected."
            icon={<AlertTriangle size={16} aria-hidden="true" />}
            tone="warning"
            title="Missing priority keywords"
            items={analysis.missingKeywords}
          />
        </div>

        <div className="analysis-columns analysis-columns--signals">
          <SignalPanel icon={<ShieldCheck size={16} aria-hidden="true" />} title="Recruiter signals" items={analysis.recruiterSignals} />
          <SignalPanel icon={<Gauge size={16} aria-hidden="true" />} title="ATS signals" items={analysis.atsSignals} />
          <SignalPanel icon={<UserCheck size={16} aria-hidden="true" />} title="Human review signals" items={analysis.humanSignals} />
        </div>

        <section className="analysis-actions" aria-label="Recommended resume improvements">
          <h3>
            <Lightbulb size={16} aria-hidden="true" />
            Recommended edits
          </h3>
          <ul>
            {analysis.improvementActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </section>

        {shouldOfferGeneration || generatedResume ? (
          <section className="resume-generator-panel" aria-label="Generate tailored resume">
            <div className="resume-generator-panel__header">
              <div>
                <h3>
                  <Sparkles size={16} aria-hidden="true" />
                  Generate tailored resume
                </h3>
                <p>
                  Creates a local ATS-friendly draft from this resume and JD, then re-scores it against the same analysis model.
                </p>
              </div>
              <button type="button" onClick={handleGenerateResume} disabled={isGenerating || !resumeFile}>
                <Sparkles size={16} aria-hidden="true" />
                {isGenerating ? "Generating" : generatedResume ? "Regenerate" : "Generate resume"}
              </button>
            </div>

            {generationError ? <p className="resume-generator-panel__error">{generationError}</p> : null}

            {generatedResume ? (
              <div className="generated-resume-result">
                <div className="generated-resume-result__scores">
                  <GeneratedScore label="Recruiter" score={generatedResume.analysis.recruiterScreeningPassRate} />
                  <GeneratedScore label="ATS" score={generatedResume.analysis.atsRate} />
                  <GeneratedScore label="Humanized" score={generatedResume.analysis.humanizedPercentage} />
                </div>
                <div className="generated-resume-result__body">
                  <div>
                    <strong>{generatedResume.targetReached ? "80+ target reached" : "Draft generated"}</strong>
                    <p>
                      Minimum generated score: {generatedResume.targetScore}. Review the draft for truthfulness before submitting.
                    </p>
                  </div>
                  <button type="button" onClick={downloadGeneratedResume}>
                    <Download size={16} aria-hidden="true" />
                    Download resume
                  </button>
                </div>
                <pre>{generatedResume.generatedResumeText.slice(0, 1100)}</pre>
              </div>
            ) : null}
          </section>
        ) : null}

        <p className="analysis-disclaimer">
          This is a local estimate for prioritization. It cannot guarantee ATS behavior or recruiter decisions.
        </p>
      </section>
    </div>
  );
}

type GeneratedScoreProps = {
  label: string;
  score: number;
};

function GeneratedScore({ label, score }: GeneratedScoreProps) {
  return (
    <span className={score >= 80 ? "is-strong" : ""}>
      <strong>{score}</strong>
      {label}
    </span>
  );
}

type ScoreTileProps = {
  icon: ReactNode;
  label: string;
  score: number;
};

function ScoreTile({ icon, label, score }: ScoreTileProps) {
  return (
    <div className={`analysis-score-card analysis-score-card--${scoreTone(score)}`}>
      <span className="analysis-score-card__icon">{icon}</span>
      <div className="analysis-score-ring" style={{ "--score": `${score}%` } as CSSProperties}>
        <span>{score}</span>
      </div>
      <strong>{label}</strong>
    </div>
  );
}

type BreakdownBarProps = {
  label: string;
  score: number;
};

function BreakdownBar({ label, score }: BreakdownBarProps) {
  return (
    <div className="analysis-breakdown-row">
      <span>{label}</span>
      <div>
        <span style={{ width: `${score}%` }} />
      </div>
      <strong>{score}</strong>
    </div>
  );
}

type SignalPanelProps = {
  emptyText?: string;
  icon: ReactNode;
  items: string[];
  title: string;
  tone?: "warning";
};

function SignalPanel({ emptyText = "No signals available.", icon, items, title, tone }: SignalPanelProps) {
  return (
    <section className={`analysis-panel${tone === "warning" ? " analysis-panel--warning" : ""}`}>
      <h3>
        {icon}
        {title}
      </h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>
              <FileText size={13} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{emptyText}</p>
      )}
    </section>
  );
}

function scoreTone(score: number): "high" | "low" | "medium" {
  if (score >= 78) {
    return "high";
  }

  if (score >= 58) {
    return "medium";
  }

  return "low";
}
