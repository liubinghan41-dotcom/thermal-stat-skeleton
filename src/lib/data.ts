import conceptsJson from "../data/concepts.json";
import relationsJson from "../data/relations.json";
import sourcesJson from "../data/sources.json";
import metaJson from "../data/meta.json";
import type { Concept, Domain, ProofStatus, Relation, Source } from "../types";

export const concepts = conceptsJson as Concept[];
export const relations = relationsJson as Relation[];
export const sources = sourcesJson as Source[];
export const meta = metaJson as {
  conceptCount: number;
  relationCount: number;
  sourceCount: number;
  generatedAt: string;
  coverage: Record<ProofStatus, number>;
};

export const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
export const sourceById = new Map(sources.map((source) => [source.id, source]));
export const relationById = new Map(relations.map((relation) => [relation.id, relation]));

export const coreConcepts = concepts.filter((concept) => concept.level === "core");

export function getAdjacentRelations(conceptId: string) {
  return relations.filter((relation) => relation.sourceId === conceptId || relation.targetId === conceptId);
}

export function getNeighborConcepts(conceptId: string, limit = 8) {
  const neighbors = new Map<string, Concept>();

  for (const relation of getAdjacentRelations(conceptId)) {
    const neighborId = relation.sourceId === conceptId ? relation.targetId : relation.sourceId;
    const neighbor = conceptById.get(neighborId);
    if (neighbor && neighbor.level === "core") {
      neighbors.set(neighbor.id, neighbor);
    }
    if (neighbors.size >= limit) {
      break;
    }
  }

  return Array.from(neighbors.values());
}

export function groupedOutline() {
  const groups = new Map<string, { id: string; title: string; concepts: Concept[] }>();

  for (const concept of coreConcepts) {
    if (!groups.has(concept.sectionId)) {
      groups.set(concept.sectionId, { id: concept.sectionId, title: concept.sectionTitle, concepts: [] });
    }
    groups.get(concept.sectionId)!.concepts.push(concept);
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    concepts: [...group.concepts].sort((a, b) => a.order - b.order),
  }));
}

export function searchConcepts(query: string, domain: Domain | "all", status: ProofStatus | "all") {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");

  return concepts
    .filter((concept) => {
      const matchesDomain = domain === "all" || concept.domain === domain;
      const matchesStatus = status === "all" || concept.proofStatus === status;
      const matchesText =
        !normalized ||
        `${concept.title} ${concept.notation ?? ""} ${concept.aliases.join(" ")} ${concept.summary} ${concept.tags.join(" ")}`
          .toLocaleLowerCase("zh-CN")
          .includes(normalized);

      return matchesDomain && matchesStatus && matchesText;
    })
    .sort((a, b) => {
      const scoreDelta = searchScore(b, normalized) - searchScore(a, normalized);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      if (a.level !== b.level) {
        return a.level === "core" ? -1 : 1;
      }
      return a.order - b.order;
    });
}

function searchScore(concept: Concept, normalized: string) {
  if (!normalized) return 0;

  const title = concept.title.toLocaleLowerCase("zh-CN");
  const aliases = concept.aliases.join(" ").toLocaleLowerCase("zh-CN");
  const notation = (concept.notation ?? "").toLocaleLowerCase("zh-CN");
  const tags = concept.tags.join(" ").toLocaleLowerCase("zh-CN");
  const summary = concept.summary.toLocaleLowerCase("zh-CN");
  let score = 0;

  if (title === normalized || aliases.split(" ").includes(normalized)) score += 140;
  if (title.startsWith(normalized)) score += 120;
  if (title.includes(normalized)) score += 100;
  if (aliases.includes(normalized)) score += 70;
  if (notation.includes(normalized)) score += 45;
  if (tags.includes(normalized)) score += 30;
  if (summary.includes(normalized)) score += 8;
  if (concept.level === "core") score += 20;

  return score;
}
