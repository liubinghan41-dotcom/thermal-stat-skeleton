import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, "..", "src", "data");

const allowedStatuses = new Set(["verified", "needs-source", "needs-derivation", "needs-alignment"]);
const allowedRelationTypes = new Set(["definition-dependency", "derivation", "equivalence", "limit-bridge", "application"]);
const allowedDomains = new Set(["thermodynamics", "statistical-mechanics", "bridge", "mathematical-tool", "nonequilibrium"]);
const allowedLevels = new Set(["core", "detail"]);
const allowedSourceKinds = new Set(["textbook", "original", "review", "monograph"]);

function readJson(name) {
  return JSON.parse(readFileSync(join(dataDir, name), "utf8"));
}

function fail(message) {
  throw new Error(message);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function ensureNonEmptyString(value, message) {
  ensure(typeof value === "string" && value.trim().length > 0, message);
}

function ensureStringArray(value, message) {
  ensure(Array.isArray(value), message);
  ensure(value.every((item) => typeof item === "string"), `${message}. Every item should be string.`);
}

const concepts = readJson("concepts.json");
const relations = readJson("relations.json");
const sources = readJson("sources.json");
const meta = readJson("meta.json");

ensure(Array.isArray(concepts), "concepts.json is not an array.");
ensure(Array.isArray(relations), "relations.json is not an array.");
ensure(Array.isArray(sources), "sources.json is not an array.");
ensure(meta && typeof meta === "object", "meta.json is not an object.");

ensure(meta.generatedAt && typeof meta.generatedAt === "string", "meta.generatedAt is required and should be string.");
ensure(meta.conceptCount === concepts.length, `meta.conceptCount mismatch: ${meta.conceptCount} != ${concepts.length}.`);
ensure(meta.relationCount === relations.length, `meta.relationCount mismatch: ${meta.relationCount} != ${relations.length}.`);
ensure(meta.sourceCount === sources.length, `meta.sourceCount mismatch: ${meta.sourceCount} != ${sources.length}.`);

ensure(
  meta.coverage && typeof meta.coverage === "object" && !Array.isArray(meta.coverage),
  "meta.coverage should be an object and contain proof status counts.",
);
for (const status of allowedStatuses) {
  const value = meta.coverage[status];
  ensure(Number.isInteger(value) && value >= 0, `meta.coverage.${status} should be a non-negative integer.`);
}
const coverageSum = [...allowedStatuses].reduce((acc, status) => acc + Number(meta.coverage[status] || 0), 0);
ensure(coverageSum === concepts.length, `meta.coverage total (${coverageSum}) does not equal concept count (${concepts.length}).`);

const conceptIds = new Set();
for (const concept of concepts) {
  ensureNonEmptyString(concept.id, `Concept has invalid id: ${JSON.stringify(concept.id)}`);
  ensure(!conceptIds.has(concept.id), `Duplicate concept id: ${concept.id}`);
  ensureNonEmptyString(concept.title, `Concept ${concept.id} missing title.`);
  ensureNonEmptyString(concept.summary, `Concept ${concept.id} missing summary.`);
  ensureNonEmptyString(concept.sectionId, `Concept ${concept.id} missing sectionId.`);
  ensureNonEmptyString(concept.sectionTitle, `Concept ${concept.id} missing sectionTitle.`);
  ensure(allowedDomains.has(concept.domain), `Concept ${concept.id} has invalid domain ${concept.domain}.`);
  ensure(allowedLevels.has(concept.level), `Concept ${concept.id} has invalid level ${concept.level}.`);
  ensureNonEmptyString(concept.sectionTitle, `Concept ${concept.id} missing sectionTitle.`);
  ensure(Number.isFinite(concept.order), `Concept ${concept.id} has invalid order.`);
  ensure(Array.isArray(concept.aliases), `Concept ${concept.id} aliases should be an array.`);
  ensureStringArray(concept.aliases, `Concept ${concept.id} aliases should be array of strings.`);
  ensureStringArray(concept.sourceRefs ?? [], `Concept ${concept.id} sourceRefs should be array of strings.`);
  ensureStringArray(concept.termRefs ?? [], `Concept ${concept.id} termRefs should be array of strings.`);
  ensure(Array.isArray(concept.articleSections) && concept.articleSections.length > 0, `Concept ${concept.id} has no article sections.`);
  for (const section of concept.articleSections) {
    ensureNonEmptyString(section.heading, `Concept ${concept.id} has section missing heading.`);
    ensureNonEmptyString(section.body, `Concept ${concept.id} has section missing body.`);
  }
  if (concept.formulas) {
    ensure(Array.isArray(concept.formulas), `Concept ${concept.id} formulas should be an array.`);
    for (const formula of concept.formulas) {
      ensureNonEmptyString(formula.label, `Concept ${concept.id} formula missing label.`);
      ensureNonEmptyString(formula.latex, `Concept ${concept.id} formula missing latex.`);
      ensureNonEmptyString(formula.note, `Concept ${concept.id} formula missing note.`);
    }
  }
  ensure(allowedStatuses.has(concept.proofStatus), `Concept ${concept.id} has invalid proofStatus ${concept.proofStatus}.`);

  conceptIds.add(concept.id);
}

const sourceIds = new Set();
for (const source of sources) {
  ensureNonEmptyString(source.id, `Source has invalid id: ${JSON.stringify(source.id)}`);
  ensure(!sourceIds.has(source.id), `Duplicate source id: ${source.id}`);
  ensureNonEmptyString(source.title, `Source ${source.id} missing title.`);
  ensure(allowedSourceKinds.has(source.kind), `Source ${source.id} has invalid kind ${source.kind}.`);
  ensure(Array.isArray(source.authors) && source.authors.length > 0, `Source ${source.id} authors invalid.`);
  ensure(source.authors.every((author) => typeof author === "string" && author.trim().length > 0), `Source ${source.id} has invalid author entries.`);
  ensureNonEmptyString(source.role, `Source ${source.id} missing role.`);
  ensureNonEmptyString(source.status, `Source ${source.id} missing status.`);
  ensure(allowedStatuses.has(source.status), `Source ${source.id} has invalid status ${source.status}.`);
  if (source.year !== undefined) {
    ensure(Number.isInteger(source.year), `Source ${source.id} year should be integer.`);
  }
  sourceIds.add(source.id);
}

const relationIds = new Set();
for (const relation of relations) {
  ensureNonEmptyString(relation.id, `Relation has invalid id: ${JSON.stringify(relation.id)}`);
  ensure(!relationIds.has(relation.id), `Duplicate relation id: ${relation.id}`);
  ensureNonEmptyString(relation.label, `Relation ${relation.id} missing label.`);
  ensureNonEmptyString(relation.statement, `Relation ${relation.id} missing statement.`);
  ensure(allowedRelationTypes.has(relation.type), `Relation ${relation.id} has invalid type ${relation.type}.`);
  ensure(allowedStatuses.has(relation.proofStatus), `Relation ${relation.id} has invalid proofStatus ${relation.proofStatus}.`);
  ensureNonEmptyString(relation.proofStatus, `Relation ${relation.id} has empty proofStatus.`);
  ensureNonEmptyString(relation.sourceId, `Relation ${relation.id} missing sourceId.`);
  ensureNonEmptyString(relation.targetId, `Relation ${relation.id} missing targetId.`);
  ensure(relation.sourceId !== relation.targetId, `Relation ${relation.id} has same source and target.`);
  ensure(conceptIds.has(relation.sourceId), `Relation ${relation.id} missing source concept ${relation.sourceId}`);
  ensure(conceptIds.has(relation.targetId), `Relation ${relation.id} missing target concept ${relation.targetId}`);
  ensureStringArray(relation.assumptions, `Relation ${relation.id} assumptions should be strings.`);
  ensureStringArray(relation.derivationSteps, `Relation ${relation.id} derivationSteps should be strings.`);
  ensure(relation.assumptions.length > 0, `Relation ${relation.id} assumptions cannot be empty.`);
  ensure(relation.derivationSteps.length > 0, `Relation ${relation.id} derivationSteps cannot be empty.`);
  ensureStringArray(relation.sourceRefs, `Relation ${relation.id} sourceRefs should be strings.`);
  for (const sourceId of relation.sourceRefs) {
    ensure(sourceIds.has(sourceId), `Relation ${relation.id} references missing source ${sourceId}`);
  }
  relationIds.add(relation.id);
}

for (const concept of concepts) {
  for (const sourceId of concept.sourceRefs ?? []) {
    ensure(sourceIds.has(sourceId), `Concept ${concept.id} references missing source ${sourceId}`);
  }
  for (const termId of concept.termRefs ?? []) {
    ensure(conceptIds.has(termId), `Concept ${concept.id} references missing term ${termId}`);
  }
}

for (const status of allowedStatuses) {
  const expected = meta.coverage[status] || 0;
  const actual = concepts.filter((c) => c.proofStatus === status).length;
  ensure(expected === actual, `meta.coverage mismatch for ${status}: expected ${expected}, actual ${actual}.`);
}

const requiredConcepts = ["entropy", "partition-function", "helmholtz-free-energy", "thermodynamic-limit"];
for (const conceptId of requiredConcepts) {
  ensure(conceptIds.has(conceptId), `Missing required core concept: ${conceptId}`);
}

ensure(
  relations.some((relation) => relation.id === "rel-entropy-partition-function-bridge"),
  "Missing required bridge relation rel-entropy-partition-function-bridge.",
);
ensure(
  relations.some(
    (relation) =>
      relation.id === "rel-partition-function-helmholtz-free-energy" &&
      relation.type === "derivation",
  ),
  "Missing required bridge relation rel-partition-function-helmholtz-free-energy.",
);
ensure(
  relations.some((relation) => relation.sourceId === "entropy" && relation.targetId === "partition-function"),
  "Missing entropy -> partition-function anchor relation.",
);
ensure(
  relations.some((relation) => relation.sourceId === "partition-function" && relation.targetId === "helmholtz-free-energy"),
  "Missing partition-function -> helmholtz-free-energy anchor relation.",
);
ensure(
  relations.some((relation) => relation.sourceId === "helmholtz-free-energy" && relation.targetId === "entropy"),
  "Missing helmholtz-free-energy -> entropy anchor relation.",
);

console.log(
  `ALL_DATA_OK concepts=${concepts.length} relations=${relations.length} sources=${sources.length} verified=${meta.coverage.verified}`,
);
