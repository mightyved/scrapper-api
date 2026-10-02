export type ResumeJobInput = {
  title: string;
  companyName?: string | null;
  description?: string | null;
  locationText?: string | null;
  remoteText?: string | null;
  matchReasons?: string[];
  tags?: string[];
  sourceName?: string | null;
};

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

type KeywordScore = {
  keyword: string;
  weight: number;
};

const stopWords = new Set([
  "about",
  "above",
  "across",
  "after",
  "again",
  "against",
  "also",
  "and",
  "any",
  "are",
  "as",
  "at",
  "based",
  "be",
  "been",
  "being",
  "between",
  "both",
  "but",
  "by",
  "can",
  "candidate",
  "company",
  "day",
  "each",
  "experience",
  "for",
  "from",
  "have",
  "has",
  "help",
  "here",
  "hire",
  "into",
  "job",
  "join",
  "like",
  "more",
  "must",
  "new",
  "not",
  "of",
  "on",
  "one",
  "or",
  "our",
  "own",
  "per",
  "plus",
  "role",
  "required",
  "skills",
  "team",
  "that",
  "the",
  "their",
  "this",
  "to",
  "using",
  "we",
  "with",
  "work",
  "will",
  "you",
  "your"
]);

const actionVerbs = [
  "architected",
  "automated",
  "built",
  "delivered",
  "designed",
  "developed",
  "drove",
  "improved",
  "increased",
  "launched",
  "led",
  "migrated",
  "optimized",
  "owned",
  "reduced",
  "refactored",
  "scaled",
  "shipped",
  "streamlined"
];

const genericPhrases = [
  "a fast learner",
  "detail oriented",
  "dynamic professional",
  "go getter",
  "hard worker",
  "highly motivated",
  "passionate about technology",
  "proven track record",
  "results driven",
  "self starter",
  "team player"
];

const skillAliases: Array<{ canonical: string; patterns: RegExp[] }> = [
  { canonical: "TypeScript", patterns: [/\btypescript\b/i, /\bts\b/i] },
  { canonical: "JavaScript", patterns: [/\bjavascript\b/i] },
  { canonical: "React", patterns: [/\breact(?:\.js)?\b/i] },
  { canonical: "Next.js", patterns: [/\bnext(?:\.js)?\b/i] },
  { canonical: "Vue", patterns: [/\bvue(?:\.js)?\b/i] },
  { canonical: "Angular", patterns: [/\bangular\b/i] },
  { canonical: "Node.js", patterns: [/\bnode(?:\.js)?\b/i] },
  { canonical: "Express", patterns: [/\bexpress(?:\.js)?\b/i] },
  { canonical: "Python", patterns: [/\bpython\b/i] },
  { canonical: "Django", patterns: [/\bdjango\b/i] },
  { canonical: "FastAPI", patterns: [/\bfastapi\b/i] },
  { canonical: "Java", patterns: [/\bjava\b/i] },
  { canonical: "Spring", patterns: [/\bspring\b/i, /\bspring boot\b/i] },
  { canonical: "Go", patterns: [/\bgolang\b/i, /\bgo\b/i] },
  { canonical: "Rust", patterns: [/\brust\b/i] },
  { canonical: "C#", patterns: [/\bc#\b/i, /\bc sharp\b/i] },
  { canonical: ".NET", patterns: [/\b\.net\b/i, /\bdotnet\b/i] },
  { canonical: "PHP", patterns: [/\bphp\b/i] },
  { canonical: "Laravel", patterns: [/\blaravel\b/i] },
  { canonical: "Ruby", patterns: [/\bruby\b/i] },
  { canonical: "Rails", patterns: [/\brails\b/i, /\bruby on rails\b/i] },
  { canonical: "SQL", patterns: [/\bsql\b/i] },
  { canonical: "PostgreSQL", patterns: [/\bpostgres(?:ql)?\b/i] },
  { canonical: "MySQL", patterns: [/\bmysql\b/i] },
  { canonical: "MongoDB", patterns: [/\bmongodb\b/i] },
  { canonical: "Redis", patterns: [/\bredis\b/i] },
  { canonical: "GraphQL", patterns: [/\bgraphql\b/i] },
  { canonical: "REST APIs", patterns: [/\brest(?:ful)?\b/i, /\bapi(?:s)?\b/i] },
  { canonical: "AWS", patterns: [/\baws\b/i, /\bamazon web services\b/i] },
  { canonical: "GCP", patterns: [/\bgcp\b/i, /\bgoogle cloud\b/i] },
  { canonical: "Azure", patterns: [/\bazure\b/i] },
  { canonical: "Docker", patterns: [/\bdocker\b/i] },
  { canonical: "Kubernetes", patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { canonical: "Terraform", patterns: [/\bterraform\b/i] },
  { canonical: "CI/CD", patterns: [/\bci\/cd\b/i, /\bcontinuous integration\b/i, /\bcontinuous delivery\b/i] },
  { canonical: "GitHub Actions", patterns: [/\bgithub actions\b/i] },
  { canonical: "Jenkins", patterns: [/\bjenkins\b/i] },
  { canonical: "Microservices", patterns: [/\bmicroservices?\b/i] },
  { canonical: "System design", patterns: [/\bsystem design\b/i, /\barchitecture\b/i] },
  { canonical: "Testing", patterns: [/\btesting\b/i, /\bunit tests?\b/i, /\bintegration tests?\b/i, /\be2e\b/i] },
  { canonical: "Security", patterns: [/\bsecurity\b/i, /\bauth(?:entication|orization)?\b/i, /\boauth\b/i] },
  { canonical: "Machine learning", patterns: [/\bmachine learning\b/i, /\bml\b/i] },
  { canonical: "AI", patterns: [/\bai\b/i, /\bartificial intelligence\b/i] },
  { canonical: "Data engineering", patterns: [/\bdata engineering\b/i, /\betl\b/i, /\bpipeline(?:s)?\b/i] },
  { canonical: "Remote collaboration", patterns: [/\bremote\b/i, /\bdistributed team\b/i, /\basynchronous\b/i, /\basync\b/i] }
];

export function analyzeResumeAgainstJob(job: ResumeJobInput, resumeText: string, fileName: string): ResumeAnalysisResult {
  const normalizedResume = normalizeText(resumeText);
  const normalizedJob = normalizeText(buildJobText(job));
  const keywordScores = extractWeightedKeywords(job);
  const matchedKeywords = keywordScores.filter((item) => includesKeyword(normalizedResume, item.keyword));
  const missingKeywords = keywordScores
    .filter((item) => !includesKeyword(normalizedResume, item.keyword))
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.keyword)
    .slice(0, 12);
  const keywordCoverage = weightedCoverage(matchedKeywords, keywordScores);
  const requiredKeywords = keywordScores.filter((item) => item.weight >= 1.45);
  const requiredCoverage = requiredKeywords.length > 0 ? weightedCoverage(matchedKeywords, requiredKeywords) : keywordCoverage;
  const titleFit = scoreTitleFit(job.title, normalizedResume);
  const format = scoreFormat(normalizedResume);
  const evidence = scoreEvidence(normalizedResume);
  const seniority = scoreSeniority(normalizedJob, normalizedResume);
  const remoteFit = /\b(remote|distributed|async|asynchronous|timezone|work from home|work from anywhere)\b/i.test(normalizedResume)
    ? 100
    : /\b(remote|distributed|async|timezone)\b/i.test(normalizedJob)
      ? 58
      : 72;
  const atsRate = clampScore(keywordCoverage * 0.43 + requiredCoverage * 0.22 + titleFit * 0.16 + format * 0.12 + remoteFit * 0.07);
  const humanizedPercentage = scoreHumanized(normalizedResume, evidence);
  const recruiterScreeningPassRate = clampScore(
    atsRate * 0.34 + evidence * 0.24 + titleFit * 0.18 + seniority * 0.12 + humanizedPercentage * 0.12
  );
  const verdict = getVerdict(recruiterScreeningPassRate, atsRate);

  return {
    atsRate,
    fileName,
    humanizedPercentage,
    recruiterScreeningPassRate,
    resumeTextLength: normalizedResume.length,
    verdict,
    summary: buildSummary(verdict, matchedKeywords.length, keywordScores.length, missingKeywords),
    atsSignals: buildAtsSignals(keywordCoverage, requiredCoverage, format, remoteFit),
    humanSignals: buildHumanSignals(normalizedResume, evidence, humanizedPercentage),
    improvementActions: buildImprovementActions(missingKeywords, evidence, format, titleFit, seniority, humanizedPercentage),
    matchedKeywords: matchedKeywords.map((item) => item.keyword).slice(0, 18),
    missingKeywords,
    recruiterSignals: buildRecruiterSignals(evidence, titleFit, seniority, recruiterScreeningPassRate),
    scoreBreakdown: {
      evidence,
      format,
      keywordCoverage: clampScore(keywordCoverage),
      requiredCoverage: clampScore(requiredCoverage),
      seniority,
      titleFit
    }
  };
}

export function generateTailoredResumeForJob(job: ResumeJobInput, resumeText: string, fileName: string): ResumeGenerationResult {
  const originalAnalysis = analyzeResumeAgainstJob(job, resumeText, fileName);
  const generatedFileName = createGeneratedFileName(fileName, job.title);
  let generatedResumeText = buildTailoredResumeDraft(job, resumeText, originalAnalysis);
  let analysis = analyzeResumeAgainstJob(job, generatedResumeText, generatedFileName);

  if (!meetsTargetScores(analysis)) {
    generatedResumeText = strengthenTailoredResumeDraft(generatedResumeText, job, analysis);
    analysis = analyzeResumeAgainstJob(job, generatedResumeText, generatedFileName);
  }

  if (!meetsTargetScores(analysis)) {
    generatedResumeText = strengthenTailoredResumeDraft(generatedResumeText, job, analysis, true);
    analysis = analyzeResumeAgainstJob(job, generatedResumeText, generatedFileName);
  }

  return {
    analysis,
    generatedFileName,
    generatedResumeText,
    originalAnalysis,
    targetReached: meetsTargetScores(analysis),
    targetScore: Math.min(analysis.atsRate, analysis.humanizedPercentage, analysis.recruiterScreeningPassRate)
  };
}

function buildTailoredResumeDraft(job: ResumeJobInput, resumeText: string, originalAnalysis: ResumeAnalysisResult): string {
  const candidateName = inferCandidateName(resumeText);
  const contactLine = buildContactLine(resumeText);
  const keywordScores = extractWeightedKeywords(job);
  const priorityKeywords = keywordScores.map((item) => item.keyword).slice(0, 24);
  const coreKeywords = uniqueStrings([...priorityKeywords, ...originalAnalysis.matchedKeywords]).slice(0, 22);
  const jobTitle = job.title.trim();
  const companyLine = job.companyName ? `${job.companyName} target role` : "Target role";
  const resumeYears = extractMaxYears(normalizeText(resumeText));
  const seniorityLine = resumeYears > 0 ? `${resumeYears}+ years of relevant experience` : "Relevant software engineering experience";
  const evidenceLines = extractEvidenceLines(resumeText, priorityKeywords).slice(0, 8);
  const tailoredEvidence = buildTailoredEvidenceBullets(evidenceLines, priorityKeywords);
  const impactVocabulary = uniqueStrings([
    "architected",
    "automated",
    "built",
    "delivered",
    "designed",
    "improved",
    "optimized",
    "owned",
    "reduced",
    "scaled",
    "shipped",
    "performance",
    "reliability",
    "latency",
    "security",
    "quality",
    "user impact"
  ]);

  return [
    candidateName.toUpperCase(),
    contactLine,
    "",
    `TARGET ROLE: ${jobTitle}`,
    "",
    "PROFESSIONAL SUMMARY",
    `${seniorityLine} tailored for ${companyLine} as a ${jobTitle}. Strong alignment with ${coreKeywords.slice(0, 8).join(", ")}.`,
    `Builds maintainable software with clear ownership, practical system design, remote collaboration, testing discipline, and measurable delivery impact.`,
    "",
    "CORE SKILLS",
    wrapCsv(coreKeywords),
    "",
    "ROLE ALIGNMENT",
    `Priority JD keywords: ${wrapCsv(priorityKeywords.slice(0, 18))}`,
    `Remote collaboration: distributed teamwork, async communication, documentation, timezone-aware delivery, stakeholder updates.`,
    `Delivery language: ${wrapCsv(impactVocabulary)}`,
    "",
    "EXPERIENCE HIGHLIGHTS",
    ...tailoredEvidence,
    "",
    "SELECTED IMPACT STORIES",
    ...buildImpactStories(resumeText, priorityKeywords),
    "",
    "PROJECT AND SYSTEM STRENGTHS",
    `- Built, improved, and shipped software systems connected to ${priorityKeywords.slice(0, 6).join(", ")} priorities.`,
    "- Designed maintainable workflows with testing, observability, documentation, performance awareness, and production ownership.",
    "- Collaborated with product, design, engineering, and business stakeholders to clarify requirements and reduce delivery risk.",
    "",
    "ATS KEYWORD INDEX",
    wrapCsv(priorityKeywords),
    "",
    "EDUCATION AND CERTIFICATIONS",
    ...extractEducationLines(resumeText),
    "",
    "REVIEW BEFORE SENDING",
    "This tailored draft is generated locally from the uploaded resume and JD. Verify every skill, tool, metric, company, and responsibility before submitting."
  ]
    .filter((line) => line !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function strengthenTailoredResumeDraft(
  generatedResumeText: string,
  job: ResumeJobInput,
  analysis: ResumeAnalysisResult,
  finalPass = false
): string {
  const keywordScores = extractWeightedKeywords(job);
  const priorityKeywords = keywordScores.map((item) => item.keyword);
  const missing = analysis.missingKeywords.length > 0 ? analysis.missingKeywords : priorityKeywords.slice(0, 10);
  const targetRoleLine = `${job.title}: ${priorityKeywords.slice(0, 10).join(", ")}`;
  const additionalSignals = uniqueStrings([
    ...missing,
    "Remote collaboration",
    "System design",
    "Testing",
    "CI/CD",
    "performance",
    "reliability",
    "security",
    "documentation",
    "stakeholder communication"
  ]).slice(0, finalPass ? 24 : 16);

  return [
    generatedResumeText,
    "",
    "ADDITIONAL TARGETED ALIGNMENT",
    `- ${targetRoleLine}.`,
    `- Relevant ATS terms to preserve when truthful: ${wrapCsv(additionalSignals)}.`,
    "- Human review focus: connect each priority skill to a concrete project, ownership decision, production constraint, or measurable business/user outcome.",
    "- Recruiter screen focus: show title fit, seniority, remote communication, delivery ownership, and direct evidence for the JD requirements.",
    finalPass
      ? "- Final tailoring pass: architected, automated, built, delivered, designed, improved, optimized, owned, reduced, scaled, shipped reliable software with clear performance and quality impact."
      : null
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

function buildTailoredEvidenceBullets(lines: string[], keywords: string[]): string[] {
  const evidenceLines =
    lines.length > 0
      ? lines
      : [
          "Owned software delivery across planning, implementation, testing, review, and production support.",
          "Built maintainable systems with clear documentation, quality checks, and collaboration across stakeholders.",
          "Improved reliability, performance, and user impact by clarifying requirements and reducing technical risk."
        ];

  return evidenceLines.slice(0, 8).map((line, index) => {
    const cleanLine = sentenceCase(cleanResumeLine(line));
    const signals = keywords.filter((keyword) => !includesKeyword(cleanLine, keyword)).slice(index % 3, index % 3 + 2);
    const suffix = signals.length > 0 ? ` Relevant to ${signals.join(" and ")}.` : "";
    return `- ${cleanLine}${cleanLine.endsWith(".") ? "" : "."}${suffix}`;
  });
}

function buildImpactStories(resumeText: string, keywords: string[]): string[] {
  const lines = extractEvidenceLines(resumeText, keywords).slice(0, 4);

  if (lines.length === 0) {
    return [
      "- Delivered software changes with attention to product outcomes, maintainability, reliability, and team communication.",
      "- Improved engineering execution by documenting tradeoffs, validating requirements, testing changes, and supporting production quality.",
      "- Strengthened remote teamwork through async updates, written context, code reviews, and clear handoffs."
    ];
  }

  return lines.map((line, index) => {
    const keyword = keywords[index % Math.max(keywords.length, 1)] ?? "software delivery";
    return `- ${sentenceCase(cleanResumeLine(line))} This supports the JD focus on ${keyword}, measurable impact, ownership, and delivery quality.`;
  });
}

function extractEvidenceLines(resumeText: string, keywords: string[]): string[] {
  const candidates = resumeText
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map(cleanResumeLine)
    .filter((line) => line.length >= 28 && line.length <= 240 && !/^(summary|skills|experience|education)$/i.test(line));

  return uniqueStrings(candidates)
    .map((line) => ({ line, score: scoreEvidenceLine(line, keywords) }))
    .sort((a, b) => b.score - a.score || a.line.length - b.line.length)
    .map((item) => item.line)
    .slice(0, 10);
}

function scoreEvidenceLine(line: string, keywords: string[]): number {
  const normalizedLine = normalizeText(line);
  const keywordScore = keywords.filter((keyword) => includesKeyword(normalizedLine, keyword)).length * 4;
  const actionScore = actionVerbs.filter((verb) => includesKeyword(normalizedLine, verb)).length * 5;
  const metricScore = /\b(?:\d+%|\d+x|\$[\d,.]+|\d+\s*(?:users|customers|engineers|requests|ms|seconds|hours|days|weeks|revenue|costs?))\b/i.test(line)
    ? 16
    : 0;
  const impactScore = /\b(improved|reduced|increased|scaled|optimized|performance|latency|security|reliability|quality|revenue|conversion)\b/i.test(line)
    ? 10
    : 0;

  return keywordScore + actionScore + metricScore + impactScore;
}

function inferCandidateName(resumeText: string): string {
  const candidateLine = resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(
      (line) =>
        line.length >= 3 &&
        line.length <= 60 &&
        /^[a-z ,.'-]+$/i.test(line) &&
        !/\b(summary|resume|curriculum|experience|skills|education|profile|email|phone|linkedin|github)\b/i.test(line)
    );

  return candidateLine || "Candidate Name";
}

function buildContactLine(resumeText: string): string {
  const email = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = resumeText.match(/\+?\d[\d\s().-]{7,}\d/)?.[0]?.replace(/\s+/g, " ");
  const linkedin = resumeText.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i)?.[0];
  const github = resumeText.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i)?.[0];
  const contactItems = [email, phone, linkedin, github].filter(Boolean);

  return contactItems.length > 0 ? contactItems.join(" | ") : "Email | Phone | LinkedIn | GitHub";
}

function extractEducationLines(resumeText: string): string[] {
  const educationCandidates = resumeText
    .split(/\r?\n/)
    .map(cleanResumeLine)
    .filter((line) => /\b(university|college|bachelor|master|degree|certification|certificate|aws|scrum|education)\b/i.test(line))
    .slice(0, 4)
    .map((line) => `- ${sentenceCase(line)}${line.endsWith(".") ? "" : "."}`);

  return educationCandidates.length > 0 ? educationCandidates : ["- Add verified education, certifications, or relevant training."];
}

function createGeneratedFileName(fileName: string, jobTitle: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "resume";
  const titleSlug = jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${baseName}-${titleSlug || "tailored"}-resume.txt`;
}

function meetsTargetScores(analysis: ResumeAnalysisResult): boolean {
  return analysis.atsRate >= 80 && analysis.humanizedPercentage >= 80 && analysis.recruiterScreeningPassRate >= 80;
}

function cleanResumeLine(value: string): string {
  return value
    .replace(/^[\s*\u2022\u2013\u2014-]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of values) {
    const cleanValue = value.trim();
    const key = cleanValue.toLowerCase();

    if (cleanValue && !seen.has(key)) {
      unique.push(cleanValue);
      seen.add(key);
    }
  }

  return unique;
}

function wrapCsv(values: string[]): string {
  return uniqueStrings(values).join(", ");
}

function buildJobText(job: ResumeJobInput): string {
  return [
    job.title,
    job.companyName,
    job.description,
    job.locationText,
    job.remoteText,
    job.sourceName,
    ...(job.matchReasons ?? []),
    ...(job.tags ?? [])
  ]
    .filter(Boolean)
    .join(" ");
}

function extractWeightedKeywords(job: ResumeJobInput): KeywordScore[] {
  const jobText = buildJobText(job);
  const requirementText = [job.description, ...(job.matchReasons ?? [])].filter(Boolean).join(" ");
  const normalizedJob = normalizeText(jobText);
  const weighted = new Map<string, number>();

  for (const { canonical, patterns } of skillAliases) {
    if (patterns.some((pattern) => pattern.test(jobText))) {
      weighted.set(canonical, Math.max(weighted.get(canonical) ?? 0, 1.8));
    }
  }

  for (const tag of job.tags ?? []) {
    const cleanTag = normalizeKeyword(tag);

    if (cleanTag && cleanTag.length > 1) {
      weighted.set(cleanTag, Math.max(weighted.get(cleanTag) ?? 0, 1.55));
    }
  }

  for (const phrase of extractRequirementPhrases(normalizeText(requirementText))) {
    weighted.set(phrase, Math.max(weighted.get(phrase) ?? 0, 1.7));
  }

  for (const keyword of extractNounKeywords(normalizedJob)) {
    weighted.set(keyword, Math.max(weighted.get(keyword) ?? 0, 1));
  }

  const titleTokens = tokenize(job.title).filter((token) => !stopWords.has(token));

  for (const token of titleTokens) {
    weighted.set(token, Math.max(weighted.get(token) ?? 0, 1.35));
  }

  const deduped = new Map<string, KeywordScore>();

  for (const [keyword, weight] of weighted) {
    const key = keyword.toLowerCase();
    const existing = deduped.get(key);

    if (!existing || weight > existing.weight) {
      deduped.set(key, { keyword, weight });
    }
  }

  return Array.from(deduped.values())
    .filter((item) => item.keyword.length > 1)
    .sort((a, b) => b.weight - a.weight || a.keyword.localeCompare(b.keyword))
    .slice(0, 34);
}

function extractRequirementPhrases(text: string): string[] {
  const phrases: string[] = [];
  const requirementPattern =
    /\b(?:required skills?|requirements?|must have|you have|experience with|proficient in|strong knowledge of|familiarity with|required)\b[:\s-]*(.{0,170})/gi;
  let match: RegExpExecArray | null;

  while ((match = requirementPattern.exec(text)) !== null) {
    phrases.push(
      ...match[1]
        .split(/[,.;/|]/)
        .map(normalizeKeyword)
        .filter(isUsefulRequirementPhrase)
    );
  }

  return phrases.slice(0, 14);
}

function extractNounKeywords(text: string): string[] {
  const tokens = tokenize(text).filter((token) => token.length > 2 && !stopWords.has(token));
  const counts = new Map<string, number>();

  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 22)
    .map(([token]) => token);
}

function weightedCoverage(matches: KeywordScore[], required: KeywordScore[]): number {
  const total = required.reduce((sum, item) => sum + item.weight, 0);

  if (total === 0) {
    return 0;
  }

  const matched = new Set(matches.map((item) => item.keyword.toLowerCase()));
  const matchedWeight = required.reduce((sum, item) => (matched.has(item.keyword.toLowerCase()) ? sum + item.weight : sum), 0);

  return clampScore((matchedWeight / total) * 100);
}

function scoreTitleFit(title: string, resumeText: string): number {
  const titleTokens = tokenize(title).filter((token) => token.length > 2 && !stopWords.has(token));

  if (titleTokens.length === 0) {
    return 68;
  }

  const matchedCount = titleTokens.filter((token) => includesKeyword(resumeText, token)).length;
  return clampScore((matchedCount / titleTokens.length) * 100);
}

function scoreFormat(text: string): number {
  const sections = ["experience", "skills", "education", "projects", "summary", "certifications"].filter((section) =>
    includesKeyword(text, section)
  ).length;
  const contactSignals = [/@/.test(text), /\bgithub\.com\b|\blinkedin\.com\b/i.test(text), /\+?\d[\d\s().-]{7,}\d/.test(text)].filter(Boolean).length;
  const lengthScore = text.length < 900 ? 45 : text.length > 12000 ? 72 : 92;

  return clampScore(lengthScore * 0.42 + Math.min(sections, 4) * 12 + contactSignals * 4);
}

function scoreEvidence(text: string): number {
  const metricCount = (text.match(/\b(?:\d+%|\d+x|\$[\d,.]+|\d+\s*(?:users|customers|engineers|requests|ms|seconds|hours|days|weeks|revenue|costs?))\b/gi) ?? []).length;
  const actionCount = actionVerbs.filter((verb) => includesKeyword(text, verb)).length;
  const impactWords = ["reduced", "increased", "improved", "saved", "scaled", "revenue", "latency", "performance", "conversion"].filter((word) =>
    includesKeyword(text, word)
  ).length;

  return clampScore(Math.min(metricCount, 8) * 8 + Math.min(actionCount, 10) * 4 + Math.min(impactWords, 7) * 5 + 16);
}

function scoreSeniority(jobText: string, resumeText: string): number {
  const jobYears = extractMaxYears(jobText);
  const resumeYears = extractMaxYears(resumeText);

  if (jobYears === 0) {
    return 72;
  }

  if (resumeYears === 0) {
    return 56;
  }

  return clampScore((resumeYears / jobYears) * 100);
}

function scoreHumanized(text: string, evidence: number): number {
  const sentenceLengths = text
    .split(/[.!?]\s+/)
    .map((sentence) => tokenize(sentence).length)
    .filter((length) => length > 3);
  const averageLength = sentenceLengths.reduce((sum, length) => sum + length, 0) / Math.max(sentenceLengths.length, 1);
  const lengthVariance =
    sentenceLengths.reduce((sum, length) => sum + Math.abs(length - averageLength), 0) / Math.max(sentenceLengths.length, 1);
  const genericPenalty = genericPhrases.filter((phrase) => text.includes(phrase)).length * 7;
  const firstPersonPenalty = (text.match(/\b(i|me|my)\b/gi) ?? []).length > 10 ? 8 : 0;
  const specificity = Math.min(new Set(tokenize(text).filter((token) => token.length > 5)).size / 80, 1) * 100;
  const variation = clampScore(lengthVariance * 8);

  return clampScore(evidence * 0.38 + specificity * 0.24 + variation * 0.18 + 26 - genericPenalty - firstPersonPenalty);
}

function buildSummary(verdict: ResumeAnalysisResult["verdict"], matchedCount: number, keywordCount: number, missing: string[]): string {
  if (verdict === "High fit") {
    return `Strong resume/JD alignment with ${matchedCount} of ${keywordCount} priority signals covered.`;
  }

  if (verdict === "Competitive") {
    return `Competitive fit. Tailoring the top missing signals${missing.length > 0 ? `, especially ${missing.slice(0, 3).join(", ")}` : ""}, can lift the screen rate.`;
  }

  if (verdict === "Needs tailoring") {
    return `Some core signals are present, but the resume should be tailored more closely to this JD before applying.`;
  }

  return "Weak alignment for this specific JD. Add clearer matching skills, impact evidence, and role language before applying.";
}

function buildAtsSignals(keywordCoverage: number, requiredCoverage: number, format: number, remoteFit: number): string[] {
  return [
    `${Math.round(keywordCoverage)}% weighted keyword coverage across role, stack, and domain terms.`,
    `${Math.round(requiredCoverage)}% coverage of high-priority required signals.`,
    format >= 78 ? "Resume text looks parseable with recognizable sections." : "Resume may need clearer section headings and contact details.",
    remoteFit >= 80 ? "Remote/distributed work signal is present." : "Remote-readiness signal is light for a remote role."
  ];
}

function buildHumanSignals(text: string, evidence: number, humanized: number): string[] {
  const metricCount = (text.match(/\b(?:\d+%|\d+x|\$[\d,.]+|\d+\s*(?:users|customers|requests|ms|revenue|costs?))\b/gi) ?? []).length;
  const genericCount = genericPhrases.filter((phrase) => text.includes(phrase)).length;

  return [
    evidence >= 70 ? "Specific achievement evidence is strong." : "Achievement evidence could be more measurable.",
    metricCount > 0 ? `${metricCount} quantified impact signal${metricCount === 1 ? "" : "s"} found.` : "No clear quantified impact signals found.",
    genericCount === 0 ? "No heavy generic resume phrases detected." : `${genericCount} generic phrase${genericCount === 1 ? "" : "s"} may weaken authenticity.`,
    humanized >= 75 ? "Writing reads specific and credible for human review." : "Writing would benefit from more concrete project context."
  ];
}

function buildRecruiterSignals(evidence: number, titleFit: number, seniority: number, passRate: number): string[] {
  return [
    passRate >= 75 ? "Likely to survive an initial recruiter skim if the role requirements are accurate." : "Initial recruiter skim may need stronger role-fit proof.",
    titleFit >= 70 ? "Resume language aligns with the target role title." : "Role title alignment is weak or indirect.",
    seniority >= 80 ? "Seniority signal appears sufficient." : "Seniority signal is unclear against the JD.",
    evidence >= 70 ? "Impact evidence supports credibility." : "Impact evidence needs more measurable outcomes."
  ];
}

function buildImprovementActions(
  missingKeywords: string[],
  evidence: number,
  format: number,
  titleFit: number,
  seniority: number,
  humanized: number
): string[] {
  const actions: string[] = [];

  if (missingKeywords.length > 0) {
    actions.push(`Add truthful evidence for missing JD terms: ${missingKeywords.slice(0, 5).join(", ")}.`);
  }

  if (evidence < 70) {
    actions.push("Rewrite 2-3 bullets with metric-backed outcomes, such as latency, revenue, conversion, cost, uptime, or user impact.");
  }

  if (format < 75) {
    actions.push("Use ATS-readable headings: Summary, Skills, Experience, Projects, Education, Certifications.");
  }

  if (titleFit < 70) {
    actions.push("Mirror the target role title in the summary when it truthfully fits your background.");
  }

  if (seniority < 70) {
    actions.push("Make years of relevant experience, ownership scope, and seniority level explicit.");
  }

  if (humanized < 72) {
    actions.push("Replace generic claims with named projects, specific constraints, and concrete tradeoffs.");
  }

  return actions.slice(0, 6);
}

function getVerdict(passRate: number, atsRate: number): ResumeAnalysisResult["verdict"] {
  if (passRate >= 82 && atsRate >= 78) {
    return "High fit";
  }

  if (passRate >= 68 && atsRate >= 62) {
    return "Competitive";
  }

  if (passRate >= 48 || atsRate >= 52) {
    return "Needs tailoring";
  }

  return "Weak fit";
}

function includesKeyword(text: string, keyword: string): boolean {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  const exactPattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword).replace(/\s+/g, "\\s+")}($|[^a-z0-9])`, "i");

  if (exactPattern.test(text)) {
    return true;
  }

  const keywordTokens = tokenize(normalizedKeyword);

  if (keywordTokens.length <= 1) {
    return false;
  }

  const textTokens = new Set(tokenize(text).map(stemToken));
  return keywordTokens.every((token) => textTokens.has(stemToken(token)));
}

function normalizeKeyword(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s,;:()[\]-]+|[\s,.;:()[\]-]+$/g, "");
}

function normalizeText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenize(value: string): string[] {
  return (normalizeText(value).match(/[a-z][a-z0-9+#.-]*/g) ?? [])
    .map((token) => token.replace(/^[^a-z0-9+#]+|[^a-z0-9+#]+$/g, ""))
    .filter(Boolean);
}

function extractMaxYears(text: string): number {
  const matches = Array.from(text.matchAll(/\b(\d{1,2})\+?\s*(?:years?|yrs?)\b/gi));
  return matches.reduce((max, match) => Math.max(max, Number(match[1]) || 0), 0);
}

function isUsefulRequirementPhrase(phrase: string): boolean {
  const tokens = tokenize(phrase).filter((token) => !stopWords.has(token));

  if (phrase.length <= 2 || phrase.split(" ").length > 4 || tokens.length === 0) {
    return false;
  }

  if (/^\d+\+?\s*(?:years?|yrs?)\b/.test(phrase)) {
    return false;
  }

  return true;
}

function stemToken(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.length > 3 && token.endsWith("s")) {
    return token.slice(0, -1);
  }

  return token;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
