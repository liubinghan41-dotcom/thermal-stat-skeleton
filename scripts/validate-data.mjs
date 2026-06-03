import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "src", "data");

const allowedStatuses = new Set(["verified", "needs-source", "needs-derivation", "needs-alignment"]);
const allowedRelationTypes = new Set(["definition-dependency", "derivation", "equivalence", "limit-bridge", "application"]);

function readJson(name) {
  return JSON.parse(readFileSync(join(dataDir, name), "utf8"));
}

function fail(message) {
  throw new Error(message);
}

const concepts = readJson("concepts.json");
const relations = readJson("relations.json");
const sources = readJson("sources.json");
const meta = readJson("meta.json");

if (concepts.length < 720) fail(`Expected at least 720 concepts, found ${concepts.length}.`);
if (relations.length < 1400) fail(`Expected at least 1400 relations, found ${relations.length}.`);
if (sources.length < 86) fail(`Expected at least 86 sources, found ${sources.length}.`);
if (meta.conceptCount !== concepts.length) fail("meta.conceptCount does not match concepts.json.");
if (meta.relationCount !== relations.length) fail("meta.relationCount does not match relations.json.");
if (meta.sourceCount !== sources.length) fail("meta.sourceCount does not match sources.json.");

const conceptIds = new Set();
for (const concept of concepts) {
  if (!concept.id || conceptIds.has(concept.id)) fail(`Duplicate or missing concept id: ${concept.id}`);
  conceptIds.add(concept.id);
  if (!allowedStatuses.has(concept.proofStatus)) fail(`Invalid concept proofStatus for ${concept.id}: ${concept.proofStatus}`);
  if (!Array.isArray(concept.articleSections) || concept.articleSections.length === 0) fail(`Concept has no article sections: ${concept.id}`);
  if (!Array.isArray(concept.sourceRefs) || concept.sourceRefs.length === 0) fail(`Concept has no source refs: ${concept.id}`);
  for (const termId of concept.termRefs ?? []) {
    if (!conceptIds.has(termId) && !concepts.some((item) => item.id === termId)) {
      fail(`Concept ${concept.id} references missing term ${termId}.`);
    }
  }
}

const sourceIds = new Set();
for (const source of sources) {
  if (!source.id || sourceIds.has(source.id)) fail(`Duplicate or missing source id: ${source.id}`);
  sourceIds.add(source.id);
  if (!allowedStatuses.has(source.status)) fail(`Invalid source status for ${source.id}: ${source.status}`);
  if (!source.title || !Array.isArray(source.authors) || source.authors.length === 0) fail(`Incomplete source: ${source.id}`);
}

const relationIds = new Set();
for (const relation of relations) {
  if (!relation.id || relationIds.has(relation.id)) fail(`Duplicate or missing relation id: ${relation.id}`);
  relationIds.add(relation.id);
  if (!conceptIds.has(relation.sourceId)) fail(`Relation ${relation.id} has missing source concept ${relation.sourceId}.`);
  if (!conceptIds.has(relation.targetId)) fail(`Relation ${relation.id} has missing target concept ${relation.targetId}.`);
  if (!allowedRelationTypes.has(relation.type)) fail(`Invalid relation type for ${relation.id}: ${relation.type}`);
  if (!allowedStatuses.has(relation.proofStatus)) fail(`Invalid relation proofStatus for ${relation.id}: ${relation.proofStatus}`);
  if (!Array.isArray(relation.derivationSteps) || relation.derivationSteps.length === 0) fail(`Relation has no derivation steps: ${relation.id}`);
  if (!Array.isArray(relation.assumptions) || relation.assumptions.length === 0) fail(`Relation has no assumptions: ${relation.id}`);
  for (const sourceId of relation.sourceRefs ?? []) {
    if (!sourceIds.has(sourceId)) fail(`Relation ${relation.id} references missing source ${sourceId}.`);
  }
}

for (const concept of concepts) {
  for (const sourceId of concept.sourceRefs) {
    if (!sourceIds.has(sourceId)) fail(`Concept ${concept.id} references missing source ${sourceId}.`);
  }
}

const requiredConcepts = ["entropy", "partition-function", "helmholtz-free-energy", "thermodynamic-limit"];
for (const conceptId of requiredConcepts) {
  if (!conceptIds.has(conceptId)) fail(`Missing required bridge concept: ${conceptId}`);
}

const hasEntropyToPartition = relations.some(
  (relation) => relation.sourceId === "entropy" && relation.targetId === "partition-function" && relation.type === "limit-bridge",
);
const hasPartitionToFreeEnergy = relations.some(
  (relation) => relation.sourceId === "partition-function" && relation.targetId === "helmholtz-free-energy",
);
if (!hasEntropyToPartition) fail("Missing core bridge relation entropy -> partition-function.");
if (!hasPartitionToFreeEnergy) fail("Missing core bridge relation partition-function -> helmholtz-free-energy.");

console.log(
  `ALL_DATA_OK concepts=${concepts.length} relations=${relations.length} sources=${sources.length} verified=${meta.coverage.verified}`,
);
