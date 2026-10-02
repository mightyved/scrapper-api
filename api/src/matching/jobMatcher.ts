export type JobMatcherInput = {
  title?: string | null;
  companyName?: string | null;
  description?: string | null;
  locationText?: string | null;
  remoteText?: string | null;
  employmentType?: string | null;
  salaryText?: string | null;
  tags?: string[] | null;
};

export type JobMatchResult = {
  accepted: boolean;
  apacScore: number;
  relevanceScore: number;
  totalScore: number;
  matchReasons: string[];
  rejectionReasons: string[];
};

type WeightedRule = {
  reason: string;
  score: number;
  patterns: RegExp[];
};

type RejectRule = {
  reason: string;
  patterns: RegExp[];
};

const maxApacScore = 50;
const maxRelevanceScore = 50;

const acceptRules: WeightedRule[] = [
  {
    reason: "Fully remote",
    score: 20,
    patterns: [
      /\bremote\b/i,
      /\bremote source\b/i,
      /\bremote role\b/i,
      /\bfully remote\b/i,
      /\b100%\s*remote\b/i,
      /\bremote[-\s]?first\b/i,
      /\ball[-\s]?remote\b/i,
      /\bwork from anywhere\b/i,
      /\bremote anywhere\b/i,
      /\bremote globally\b/i,
      /\blocation independent\b/i
    ]
  },
  {
    reason: "APAC friendly",
    score: 20,
    patterns: [/\bapac\b/i, /\basia[-\s]?pacific\b/i]
  },
  {
    reason: "Japan friendly",
    score: 18,
    patterns: [/\bjapan\b/i, /\bjapanese\b/i, /\bjst\b/i, /\btokyo\b/i, /\bosaka\b/i]
  },
  {
    reason: "Vietnam friendly",
    score: 18,
    patterns: [/\bvietnam\b/i, /\bviet nam\b/i, /\bict\b/i, /\bho chi minh\b/i, /\bha noi\b/i, /\bhanoi\b/i, /\bda nang\b/i]
  },
  {
    reason: "LATAM friendly",
    score: 18,
    patterns: [
      /\blatam\b/i,
      /\blatin america\b/i,
      /\bsouth america\b/i,
      /\bcentral america\b/i,
      /\bbrazil\b/i,
      /\bmexico\b/i,
      /\bargentina\b/i,
      /\bchile\b/i,
      /\bcolombia\b/i,
      /\bperu\b/i,
      /\buruguay\b/i,
      /\bcosta rica\b/i
    ]
  },
  {
    reason: "EMEA friendly",
    score: 18,
    patterns: [
      /\bemea\b/i,
      /\beurope\b/i,
      /\beuropean\b/i,
      /\beu\b/i,
      /\bunited kingdom\b/i,
      /\buk\b/i,
      /\bgermany\b/i,
      /\bfrance\b/i,
      /\bspain\b/i,
      /\bnetherlands\b/i,
      /\bitaly\b/i,
      /\bpoland\b/i,
      /\bportugal\b/i,
      /\bmiddle east\b/i,
      /\buae\b/i,
      /\bdubai\b/i,
      /\bsaudi\b/i,
      /\bisrael\b/i,
      /\bturkey\b/i,
      /\bafrica\b/i,
      /\bsouth africa\b/i,
      /\begypt\b/i
    ]
  },
  {
    reason: "Asia timezone friendly",
    score: 18,
    patterns: [
      /\basia(?:n)?\s+time\s?zone\b/i,
      /\basia(?:n)?\s+hours\b/i,
      /\bapac\s+time\s?zone\b/i,
      /\bgmt\s*\+?\s*(7|8|9)\b/i,
      /\butc\s*\+?\s*(7|8|9)\b/i,
      /\bjst\b/i,
      /\bict\b/i,
      /\bsgt\b/i,
      /\bhkt\b/i,
      /\bkst\b/i
    ]
  },
  {
    reason: "Worldwide",
    score: 24,
    patterns: [/\bworldwide\b/i, /\bglobal(?:ly)?\b/i, /\bremote globally\b/i]
  },
  {
    reason: "Anywhere",
    score: 24,
    patterns: [/\banywhere\b/i, /\bany location\b/i, /\bwork from anywhere\b/i, /\bremote anywhere\b/i]
  }
];

const rejectRules: RejectRule[] = [
  {
    reason: "Not remote",
    patterns: [/\bnot\s+remote\b/i, /\bno\s+remote\b/i, /\bremote\s+work\s+not\s+available\b/i]
  },
  {
    reason: "Excluded APAC market",
    patterns: [/\b(india|pakistan|bangladesh|delhi|mumbai|bengaluru|bangalore|hyderabad|pune|karachi|lahore|islamabad|dhaka)\b/i]
  },
  {
    reason: "Hybrid",
    patterns: [/\bhybrid\b/i, /\bpartially remote\b/i, /\bpartial remote\b/i, /\bremote\s*\/\s*hybrid\b/i]
  },
  {
    reason: "Onsite",
    patterns: [/\bon[-\s]?site\b/i, /\bin[-\s]?office\b/i, /\boffice[-\s]?based\b/i, /\bat office\b/i]
  },
  {
    reason: "Relocation required",
    patterns: [/\brelocation required\b/i, /\bmust relocate\b/i, /\brequired to relocate\b/i, /\brelocate to\b/i]
  },
  {
    reason: "US only",
    patterns: [
      /\b(?:us|u\.s\.|usa|united states)\s+(?:only|required|based|residents?|citizens?)\b/i,
      /\bonly\s+(?:in\s+)?(?:the\s+)?(?:us|u\.s\.|usa|united states)\b/i,
      /\bmust\s+be\s+(?:based|located)\s+in\s+(?:the\s+)?(?:us|u\.s\.|usa|united states)\b/i
    ]
  },
  {
    reason: "Canada only",
    patterns: [
      /\bcanada\s+(?:only|required|based|residents?|citizens?)\b/i,
      /\bonly\s+(?:in\s+)?canada\b/i,
      /\bmust\s+be\s+(?:based|located)\s+in\s+canada\b/i
    ]
  }
];

const relevanceRules: WeightedRule[] = [
  {
    reason: "Urgent hiring",
    score: 10,
    patterns: [
      /\burgent(?:ly)?\s+hiring\b/i,
      /\burgent\s+hire\b/i,
      /\bhiring\s+immediately\b/i,
      /\bimmediate\s+hire\b/i,
      /\bimmediate\s+start\b/i,
      /\bstart\s+immediately\b/i,
      /\bstart\s+asap\b/i,
      /\basap\s+start\b/i,
      /\bactively\s+hiring\b/i,
      /\bfast[-\s]?track\s+hiring\b/i,
      /\bpriority\s+hiring\b/i
    ]
  },
  { reason: "Node.js", score: 10, patterns: [/\bnode\.?js\b/i, /\bnodejs\b/i] },
  { reason: "React", score: 8, patterns: [/\breact\b/i, /\breactjs\b/i] },
  { reason: "TypeScript", score: 10, patterns: [/\btypescript\b/i, /\bts\b/i] },
  { reason: "Backend", score: 8, patterns: [/\bback[-\s]?end\b/i, /\bbackend\b/i] },
  { reason: "Full stack", score: 8, patterns: [/\bfull[-\s]?stack\b/i, /\bfullstack\b/i] },
  { reason: "API", score: 6, patterns: [/\bapi\b/i, /\bapis\b/i, /\brest\b/i, /\bgraphql\b/i] },
  { reason: "PostgreSQL", score: 8, patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
  { reason: "AWS", score: 7, patterns: [/\baws\b/i, /\bamazon web services\b/i] },
  { reason: "Laravel", score: 6, patterns: [/\blaravel\b/i] },
  { reason: "PHP", score: 6, patterns: [/\bphp\b/i] },
  { reason: "Go", score: 8, patterns: [/\bgolang\b/i, /\bgo\b/i] },
  { reason: "AI", score: 8, patterns: [/\bai\b/i, /\bartificial intelligence\b/i, /\bmachine learning\b/i, /\bml\b/i] },
  { reason: "LLM", score: 8, patterns: [/\bllm\b/i, /\bllms\b/i, /\blarge language model/i] }
];

export function matchJob(job: JobMatcherInput): JobMatchResult {
  const text = buildSearchText(job);
  const acceptedSignals = scoreRules(text, acceptRules, maxApacScore);
  const relevanceSignals = scoreRules(text, relevanceRules, maxRelevanceScore);
  const rejectionReasons = findRejections(text);
  const hasAcceptSignal = acceptedSignals.reasons.length > 0;
  const hasRemoteSignal = hasRemoteWorkSignal(text);
  const accepted = hasAcceptSignal && hasRemoteSignal && rejectionReasons.length === 0;
  const totalScore = accepted ? clampScore(acceptedSignals.score + relevanceSignals.score, 100) : 0;

  return {
    accepted,
    apacScore: acceptedSignals.score,
    relevanceScore: relevanceSignals.score,
    totalScore,
    matchReasons: [...acceptedSignals.reasons, ...relevanceSignals.reasons],
    rejectionReasons
  };
}

export function toJobScoreUpdate(result: JobMatchResult) {
  return {
    apacScore: result.apacScore,
    relevanceScore: result.relevanceScore,
    totalScore: result.totalScore,
    matchReasons: [...result.matchReasons, ...result.rejectionReasons.map((reason) => `Rejected: ${reason}`)]
  };
}

function hasRemoteWorkSignal(text: string): boolean {
  return [
    /\bremote\b/i,
    /\bfully remote\b/i,
    /\b100%\s*remote\b/i,
    /\bremote[-\s]?first\b/i,
    /\bwork from anywhere\b/i,
    /\bremote anywhere\b/i,
    /\bremote globally\b/i,
    /\bworldwide\b/i,
    /\banywhere\b/i,
    /\bglobal(?:ly)?\b/i
  ].some((pattern) => pattern.test(text));
}

function buildSearchText(job: JobMatcherInput): string {
  return [
    job.title,
    job.companyName,
    job.description,
    job.locationText,
    job.remoteText,
    job.employmentType,
    job.salaryText,
    ...(job.tags ?? [])
  ]
    .filter(Boolean)
    .join(" ");
}

function scoreRules(text: string, rules: WeightedRule[], maxScore: number) {
  const matched = rules.filter((rule) => rule.patterns.some((pattern) => pattern.test(text)));
  return {
    score: clampScore(
      matched.reduce((total, rule) => total + rule.score, 0),
      maxScore
    ),
    reasons: matched.map((rule) => rule.reason)
  };
}

function findRejections(text: string): string[] {
  return rejectRules
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(text)))
    .map((rule) => rule.reason);
}

function clampScore(score: number, maxScore: number): number {
  return Math.max(0, Math.min(score, maxScore));
}
