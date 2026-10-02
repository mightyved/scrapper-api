import assert from "node:assert/strict";
import { matchJob } from "./jobMatcher.js";

const strongApacMatch = matchJob({
  title: "Senior Backend Engineer - Node.js / TypeScript",
  description: "Fully remote role for APAC time zones. Build APIs with PostgreSQL and AWS.",
  locationText: "APAC",
  remoteText: "Fully remote",
  tags: ["Node.js", "TypeScript", "backend", "API", "PostgreSQL", "AWS"]
});

assert.equal(strongApacMatch.accepted, true);
assert.equal(strongApacMatch.rejectionReasons.length, 0);
assert.ok(strongApacMatch.totalScore >= 80);
assert.ok(strongApacMatch.matchReasons.includes("APAC friendly"));
assert.ok(strongApacMatch.matchReasons.includes("Node.js"));

const hybridJapanRole = matchJob({
  title: "Full Stack Engineer",
  description: "Japan role using React and TypeScript.",
  locationText: "Japan",
  remoteText: "Hybrid"
});

assert.equal(hybridJapanRole.accepted, false);
assert.ok(hybridJapanRole.rejectionReasons.includes("Hybrid"));

const usOnlyRole = matchJob({
  title: "Node.js Engineer",
  description: "Fully remote, United States only.",
  remoteText: "Fully remote",
  tags: ["Node.js"]
});

assert.equal(usOnlyRole.accepted, false);
assert.ok(usOnlyRole.rejectionReasons.includes("US only"));

const worldwideAiRole = matchJob({
  title: "AI Full Stack Engineer",
  description: "Work from anywhere. Build LLM APIs with Go, React, and PostgreSQL.",
  locationText: "Worldwide",
  remoteText: "100% remote"
});

assert.equal(worldwideAiRole.accepted, true);
assert.ok(worldwideAiRole.matchReasons.includes("Worldwide"));
assert.ok(worldwideAiRole.matchReasons.includes("LLM"));

const japanFullyRemoteRole = matchJob({
  title: "React TypeScript Engineer",
  description: "Fully remote role open to Japan time zone.",
  locationText: "Japan",
  remoteText: "Fully remote"
});

assert.equal(japanFullyRemoteRole.accepted, true);
assert.ok(japanFullyRemoteRole.matchReasons.includes("Japan friendly"));

const vietnamFullyRemoteRole = matchJob({
  title: "Laravel PHP Backend Engineer",
  description: "100% remote role open to Vietnam and ICT hours.",
  locationText: "Vietnam",
  remoteText: "100% remote"
});

assert.equal(vietnamFullyRemoteRole.accepted, true);
assert.ok(vietnamFullyRemoteRole.matchReasons.includes("Vietnam friendly"));

const relocationRole = matchJob({
  title: "PHP Laravel Engineer",
  description: "Relocation required to London. Onsite role.",
  locationText: "UK only",
  tags: ["PHP", "Laravel"]
});

assert.equal(relocationRole.accepted, false);
assert.ok(relocationRole.rejectionReasons.includes("Relocation required"));
assert.ok(relocationRole.rejectionReasons.includes("Onsite"));

const latamFullyRemoteRole = matchJob({
  title: "Senior React Engineer",
  description: "Fully remote role open to LATAM hours.",
  locationText: "Latin America",
  remoteText: "Fully remote"
});

assert.equal(latamFullyRemoteRole.accepted, true);
assert.ok(latamFullyRemoteRole.matchReasons.includes("LATAM friendly"));

const emeaFullyRemoteRole = matchJob({
  title: "Backend TypeScript Engineer",
  description: "Remote-first team hiring across EMEA.",
  locationText: "Europe Middle East Africa",
  remoteText: "Remote-first"
});

assert.equal(emeaFullyRemoteRole.accepted, true);
assert.ok(emeaFullyRemoteRole.matchReasons.includes("EMEA friendly"));

const nonRemoteEmeaRole = matchJob({
  title: "Backend TypeScript Engineer",
  description: "Engineering team hiring across Germany.",
  locationText: "Berlin",
  remoteText: null
});

assert.equal(nonRemoteEmeaRole.accepted, false);

const excludedApacRole = matchJob({
  title: "Software Engineer",
  description: "Fully remote role for APAC.",
  locationText: "India",
  remoteText: "Fully remote"
});

assert.equal(excludedApacRole.accepted, false);
assert.ok(excludedApacRole.rejectionReasons.includes("Excluded APAC market"));

const urgentHiringRole = matchJob({
  title: "Senior Full Stack Engineer",
  description: "Actively hiring. Immediate start for a fully remote global role.",
  locationText: "Worldwide",
  remoteText: "Fully remote",
  tags: ["React", "TypeScript"]
});

assert.equal(urgentHiringRole.accepted, true);
assert.ok(urgentHiringRole.matchReasons.includes("Urgent hiring"));

console.log("Job matcher checks passed.");
