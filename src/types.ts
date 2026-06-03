export type ProofStatus = "verified" | "needs-source" | "needs-derivation" | "needs-alignment";

export type Domain =
  | "thermodynamics"
  | "statistical-mechanics"
  | "bridge"
  | "mathematical-tool"
  | "nonequilibrium";

export type RelationType =
  | "definition-dependency"
  | "derivation"
  | "equivalence"
  | "limit-bridge"
  | "application";

export interface FormulaEntry {
  label: string;
  latex: string;
  note: string;
}

export interface ArticleSection {
  heading: string;
  body: string;
}

export interface Concept {
  id: string;
  title: string;
  notation?: string;
  aliases: string[];
  domain: Domain;
  sectionId: string;
  sectionTitle: string;
  order: number;
  level: "core" | "detail";
  summary: string;
  articleSections: ArticleSection[];
  formulas: FormulaEntry[];
  termRefs: string[];
  sourceRefs: string[];
  proofStatus: ProofStatus;
  tags: string[];
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  label: string;
  statement: string;
  derivationSteps: string[];
  assumptions: string[];
  sourceRefs: string[];
  proofStatus: ProofStatus;
}

export interface Source {
  id: string;
  kind: "textbook" | "original" | "review" | "monograph";
  authors: string[];
  title: string;
  year?: number;
  role: string;
  status: ProofStatus;
}
