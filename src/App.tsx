import { useDeferredValue, useMemo, useState } from "react";
import { forceCenter, forceLink, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Download,
  Filter,
  GitBranch,
  Library,
  Link as LinkIcon,
  ListTree,
  MoreHorizontal,
  Network,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  conceptById,
  coreConcepts,
  getAdjacentRelations,
  getNeighborConcepts,
  groupedOutline,
  meta,
  relationById,
  relations,
  searchConcepts,
  sourceById,
  sources,
} from "./lib/data";
import { MathText } from "./lib/mathText";
import { usePwaInstall } from "./usePwaInstall";
import type { Concept, Domain, ProofStatus, Relation, Source } from "./types";

type Mode = "reading" | "graph" | "bridge" | "sources";
type DomainFilter = Domain | "all";
type StatusFilter = ProofStatus | "all";

const defaultConceptId = "entropy";
const defaultRelationId = "rel-entropy-partition-function-bridge";

const modeLabels: Record<Mode, string> = {
  reading: "阅读",
  graph: "图谱",
  bridge: "桥接",
  sources: "来源",
};

const domainLabels: Record<DomainFilter, string> = {
  all: "全部领域",
  thermodynamics: "热力学",
  "statistical-mechanics": "统计力学",
  bridge: "桥接概念",
  "mathematical-tool": "数学工具",
  nonequilibrium: "非平衡",
};

const statusLabels: Record<StatusFilter, string> = {
  all: "全部状态",
  verified: "已核验",
  "needs-source": "待补源",
  "needs-derivation": "待推导",
  "needs-alignment": "待对齐",
};

const relationLabels: Record<Relation["type"], string> = {
  "definition-dependency": "定义依赖",
  derivation: "推导",
  equivalence: "等价",
  "limit-bridge": "极限桥接",
  application: "应用",
};

const FALLBACK_CONCEPT: Concept = {
  id: "__missing-concept",
  title: "Concept unavailable",
  aliases: [],
  domain: "thermodynamics",
  sectionId: "system",
  sectionTitle: "System",
  order: 0,
  level: "core",
  summary: "The referenced concept is missing from the local dataset.",
  articleSections: [
    {
      heading: "数据状态",
      body: "请先执行 npm run validate:data 进行数据一致性校验与修复。",
    },
  ],
  formulas: [],
  termRefs: [],
  sourceRefs: [],
  proofStatus: "needs-source",
  tags: ["system"],
};

const FALLBACK_RELATION: Relation = {
  id: "__missing-relation",
  sourceId: "__missing-concept",
  targetId: "__missing-concept",
  type: "application",
  label: "Missing relation",
  statement: "The relation record is missing in current dataset.",
  derivationSteps: ["Please regenerate and validate data first."],
  assumptions: ["No assumptions available."],
  sourceRefs: [],
  proofStatus: "needs-source",
};

function App() {
  const [mode, setMode] = useState<Mode>("reading");
  const [selectedConceptId, setSelectedConceptId] = useState(defaultConceptId);
  const [selectedRelationId, setSelectedRelationId] = useState(defaultRelationId);
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const deferredQuery = useDeferredValue(query);
  const selectedConcept = conceptById.get(selectedConceptId) ?? conceptById.get(defaultConceptId) ?? coreConcepts[0] ?? FALLBACK_CONCEPT;
  const adjacentRelations = useMemo(() => getAdjacentRelations(selectedConcept.id), [selectedConcept.id]);
  const selectedRelation =
    relationById.get(selectedRelationId) ?? adjacentRelations[0] ?? relationById.get(defaultRelationId) ?? FALLBACK_RELATION;

  const searchResults = useMemo(
    () => searchConcepts(deferredQuery, domainFilter, statusFilter).slice(0, 12),
    [deferredQuery, domainFilter, statusFilter],
  );

  const handleSelectConcept = (conceptId: string) => {
    const next = conceptById.get(conceptId);
    if (!next) return;

    setSelectedConceptId(next.id);
    const nextRelation = relations.find((relation) => relation.sourceId === next.id || relation.targetId === next.id);
    if (nextRelation) {
      setSelectedRelationId(nextRelation.id);
    }
    setQuery("");
  };

  return (
    <div className="app-shell">
      <TopBar
        domainFilter={domainFilter}
        mode={mode}
        query={query}
        searchResults={searchResults}
        statusFilter={statusFilter}
        onDomainChange={setDomainFilter}
        onModeChange={setMode}
        onQueryChange={setQuery}
        onSelectConcept={handleSelectConcept}
        onStatusChange={setStatusFilter}
      />

      <div className="workspace-grid">
        <OutlineSidebar selectedConceptId={selectedConcept.id} onSelectConcept={handleSelectConcept} />

        <main className="main-pane">
          {mode === "reading" && (
            <ArticleView
              concept={selectedConcept}
              relation={selectedRelation}
              onSelectConcept={handleSelectConcept}
              onSelectRelation={setSelectedRelationId}
            />
          )}
          {mode === "graph" && (
            <FullGraphView
              selectedConceptId={selectedConcept.id}
              selectedRelationId={selectedRelation.id}
              onSelectConcept={handleSelectConcept}
              onSelectRelation={setSelectedRelationId}
            />
          )}
          {mode === "bridge" && (
            <BridgeView
              selectedRelation={selectedRelation}
              onSelectConcept={handleSelectConcept}
              onSelectRelation={setSelectedRelationId}
            />
          )}
          {mode === "sources" && <SourcesView activeSourceIds={selectedConcept.sourceRefs} />}
        </main>

        <ContextSidebar
          concept={selectedConcept}
          relation={selectedRelation}
          onSelectConcept={handleSelectConcept}
          onSelectRelation={setSelectedRelationId}
        />
      </div>

      <StatusBar />
      <InstallButton />
    </div>
  );
}

interface TopBarProps {
  mode: Mode;
  query: string;
  domainFilter: DomainFilter;
  statusFilter: StatusFilter;
  searchResults: Concept[];
  onModeChange: (mode: Mode) => void;
  onQueryChange: (query: string) => void;
  onDomainChange: (domain: DomainFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
  onSelectConcept: (id: string) => void;
}

function TopBar({
  mode,
  query,
  domainFilter,
  statusFilter,
  searchResults,
  onModeChange,
  onQueryChange,
  onDomainChange,
  onStatusChange,
  onSelectConcept,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="brand-text">热统骨架</div>

      <div className="search-wrap">
        <Search size={17} />
        <input
          aria-label="搜索概念、公式、来源"
          placeholder="搜索概念、公式、来源"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <kbd>⌘K</kbd>
        {query.trim() ? (
          <div className="search-popover">
            {searchResults.length === 0 ? (
              <p className="search-empty">No matched concept for current query/filter.</p>
            ) : (
              searchResults.map((concept) => (
                <button key={concept.id} type="button" onClick={() => onSelectConcept(concept.id)}>
                  <span>{concept.title}</span>
                  <small>{concept.sectionTitle}</small>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <nav className="mode-tabs" aria-label="主视图">
        {(Object.keys(modeLabels) as Mode[]).map((key) => (
          <button className={mode === key ? "active" : ""} key={key} type="button" onClick={() => onModeChange(key)}>
            {modeLabels[key]}
          </button>
        ))}
      </nav>

      <div className="toolbar">
        <label className="select-control">
          <Filter size={15} />
          <select value={domainFilter} onChange={(event) => onDomainChange(event.target.value as DomainFilter)}>
            {(Object.keys(domainLabels) as DomainFilter[]).map((key) => (
              <option key={key} value={key}>
                {domainLabels[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="select-control">
          <ShieldCheck size={15} />
          <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value as StatusFilter)}>
            {(Object.keys(statusLabels) as StatusFilter[]).map((key) => (
              <option key={key} value={key}>
                {statusLabels[key]}
              </option>
            ))}
          </select>
        </label>
        <button className="icon-button" type="button" title="导出">
          <Download size={16} />
        </button>
        <button className="icon-button" type="button" title="更多">
          <MoreHorizontal size={17} />
        </button>
      </div>
    </header>
  );
}

function InstallButton() {
  const { state, promptInstall } = usePwaInstall();
  const [showHint, setShowHint] = useState(false);

  if (state === "installed" || state === "unsupported") return null;

  if (state === "ios-manual") {
    return (
      <div className="install-fab">
        {showHint && (
          <div className="install-hint" role="dialog">
            在 Safari 中点击底部 <strong>分享</strong> 按钮，选择<strong>「添加到主屏幕」</strong>即可安装到手机。
          </div>
        )}
        <button
          className="install-button"
          type="button"
          title="安装到主屏幕"
          onClick={() => setShowHint((value) => !value)}
        >
          <Smartphone size={16} />
          <span>安装到手机</span>
        </button>
      </div>
    );
  }

  return (
    <div className="install-fab">
      <button className="install-button" type="button" title="安装应用" onClick={() => void promptInstall()}>
        <Smartphone size={16} />
        <span>安装到手机</span>
      </button>
    </div>
  );
}

interface OutlineSidebarProps {
  selectedConceptId: string;
  onSelectConcept: (id: string) => void;
}

function OutlineSidebar({ selectedConceptId, onSelectConcept }: OutlineSidebarProps) {
  const groups = useMemo(() => groupedOutline(), []);

  return (
    <aside className="outline-pane">
      <div className="pane-title">
        <span>目录</span>
        <ListTree size={16} />
      </div>
      <div className="outline-scroll">
        {groups.map((group) => (
          <details key={group.id} open={group.concepts.some((concept) => concept.id === selectedConceptId)}>
            <summary>
              <span>{group.title}</span>
              <small>{group.concepts.length}</small>
            </summary>
            {group.concepts.map((concept, index) => (
              <button
                className={concept.id === selectedConceptId ? "outline-row active" : "outline-row"}
                key={concept.id}
                type="button"
                onClick={() => onSelectConcept(concept.id)}
              >
                <span className="outline-index">{index + 1}</span>
                <span className="outline-label">{concept.title}</span>
                <StatusDot status={concept.proofStatus} />
              </button>
            ))}
          </details>
        ))}
      </div>
    </aside>
  );
}

interface ArticleViewProps {
  concept: Concept;
  relation: Relation;
  onSelectConcept: (id: string) => void;
  onSelectRelation: (id: string) => void;
}

function ArticleView({ concept, relation, onSelectConcept, onSelectRelation }: ArticleViewProps) {
  const sourceRows = (concept.sourceRefs ?? []).map((id) => sourceById.get(id)).filter(Boolean) as Source[];

  return (
    <article className="article-sheet">
      <div className="article-actions">
        <button type="button" title="收藏">
          ★
        </button>
        <button type="button" title="复制链接">
          <LinkIcon size={16} />
        </button>
        <button type="button" title="更多">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <header className="article-header">
        <h1>{concept.title || "未命名概念"}</h1>
        <div className="chips-line">
          <span className={`domain-chip ${concept.domain}`}>{domainLabels[concept.domain] ?? "未知领域"}</span>
          <StatusBadge status={concept.proofStatus ?? "needs-source"} />
          <span className="quiet-chip">{concept.sectionTitle || "未分类章节"}</span>
        </div>
        <p>{concept.summary || "本条目缺少摘要，请补充并校验数据。"}</p>
      </header>

      {concept.formulas.length > 0 ? (
        <FormulaBand concept={concept} />
      ) : (
        <p className="panel-empty">No formulas to display.</p>
      )}

      <section className="article-columns">
        <div className="article-copy">
          {concept.articleSections.length > 0 ? (
            concept.articleSections.map((section) => (
              <section className="article-section" key={section.heading || "section"}>
                <h2>{section.heading || "节名缺失"}</h2>
                <p>
                  <MathText text={section.body || "章节内容为空。"} onTermClick={onSelectConcept} />
                </p>
              </section>
            ))
          ) : (
            <p className="panel-empty">No article sections available.</p>
          )}
        </div>

        <BridgeBlock relation={relation} onSelectRelation={onSelectRelation} />
      </section>

      <section className="keyword-box">
        <h2>关键词链接</h2>
        <div className="keyword-grid">
          {concept.termRefs.length === 0 ? <p className="panel-empty">No linked keywords in this concept.</p> : null}
          {concept.termRefs.map((id) => {
            const term = conceptById.get(id);
            if (!term) return null;
            return (
              <button key={id} type="button" onClick={() => onSelectConcept(id)}>
                {term.title}
              </button>
            );
          })}
        </div>
      </section>

      <section className="source-strip">
        <h2>来源</h2>
        <div>
          {sourceRows.length === 0 ? <p className="panel-empty">No source references for this concept.</p> : null}
          {sourceRows.slice(0, 7).map((source) => (
            <SourcePill key={source.id} source={source} />
          ))}
        </div>
      </section>
    </article>
  );
}

function FormulaBand({ concept }: { concept: Concept }) {
  return (
    <section className="formula-band">
      {concept.formulas.map((formula) => (
        <div className="formula-card" key={formula.label}>
          <span>{formula.label}</span>
          <div>
            <MathText text={`$${formula.latex}$`} />
          </div>
          <small>{formula.note}</small>
        </div>
      ))}
    </section>
  );
}

interface BridgeBlockProps {
  relation: Relation;
  onSelectRelation: (id: string) => void;
}

function BridgeBlock({ relation, onSelectRelation }: BridgeBlockProps) {
  const bridge = relation.type === "limit-bridge" ? relation : relationById.get(defaultRelationId) ?? FALLBACK_RELATION;
  const derivationSteps = bridge.derivationSteps?.length ? bridge.derivationSteps : ["No derivation steps available in current relation."];
  const statement = bridge.statement || "No statement text is available for this relation.";
  const assumptions = bridge.assumptions?.length ? bridge.assumptions : ["No assumptions provided."];

  return (
    <aside className="bridge-block">
      <button className="bridge-title" type="button" onClick={() => onSelectRelation(bridge.id)}>
        <GitBranch size={17} />
        桥接: {bridge.label}
      </button>
      <p>{statement}</p>
      {assumptions.length > 0 ? <small>{assumptions.join(" / ")}</small> : null}
      <ol>
        {derivationSteps.slice(0, 4).map((step) => (
          <li key={step}>
            <MathText text={step} />
          </li>
        ))}
      </ol>
    </aside>
  );
}

interface ContextSidebarProps {
  concept: Concept;
  relation: Relation;
  onSelectConcept: (id: string) => void;
  onSelectRelation: (id: string) => void;
}

function ContextSidebar({ concept, relation, onSelectConcept, onSelectRelation }: ContextSidebarProps) {
  return (
    <aside className="context-pane">
      <MiniGraph concept={concept} relation={relation} onSelectConcept={onSelectConcept} onSelectRelation={onSelectRelation} />
      <RelationInspector relation={relation} onSelectConcept={onSelectConcept} />
      <ReferencePanel concept={concept} relation={relation} />
    </aside>
  );
}

function MiniGraph({
  concept,
  relation,
  onSelectConcept,
  onSelectRelation,
}: {
  concept: Concept;
  relation: Relation;
  onSelectConcept: (id: string) => void;
  onSelectRelation: (id: string) => void;
}) {
  const neighbors = useMemo(() => getNeighborConcepts(concept.id, 7), [concept.id]);
  const nearbyRelations = useMemo(() => getAdjacentRelations(concept.id), [concept.id]);
  const center = { x: 170, y: 128 };
  const radius = 92;
  const nodes = neighbors.map((neighbor, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(neighbors.length, 1)) * Math.PI * 2;
    return {
      concept: neighbor,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      relation: nearbyRelations.find((item) => item.sourceId === neighbor.id || item.targetId === neighbor.id),
    };
  });

  return (
    <section className="side-section graph-section">
      <div className="side-title">
        <span>邻近关系</span>
        <Network size={16} />
      </div>
      {nodes.length === 0 ? (
        <p className="panel-empty">No related concepts found for current concept.</p>
      ) : (
        <svg className="mini-graph" viewBox="0 0 340 250" role="img" aria-label={`${concept.title} 的邻近图谱`}>
          {nodes.map((node) => (
            <line
              className={node.relation?.id === relation.id ? "edge active" : `edge ${node.relation?.type ?? ""}`}
              key={`edge-${node.concept.id}`}
              x1={center.x}
              x2={node.x}
              y1={center.y}
              y2={node.y}
              onClick={() => node.relation && onSelectRelation(node.relation.id)}
            />
          ))}
          <g className="center-node" onClick={() => onSelectConcept(concept.id)}>
            <circle cx={center.x} cy={center.y} r="38" />
            <text x={center.x} y={center.y - 2}>
              {concept.title ? concept.title.replace(/\s.+$/, "") : "Concept"}
            </text>
            <text className="notation" x={center.x} y={center.y + 16}>
              {concept.notation ?? ""}
            </text>
          </g>
          {nodes.map((node) => (
            <g
              className={`mini-node ${node.concept.domain}`}
              key={node.concept.id}
              onClick={() => onSelectConcept(node.concept.id)}
            >
              <rect height="30" rx="7" width="92" x={node.x - 46} y={node.y - 15} />
              <text x={node.x} y={node.y + 4}>
                {node.concept.title ? node.concept.title.replace(/\s.+$/, "") : "Missing"}
              </text>
            </g>
          ))}
        </svg>
      )}
      <div className="edge-legend">
        <span className="legend-definition">定义依赖</span>
        <span className="legend-derivation">推导</span>
        <span className="legend-bridge">桥接</span>
      </div>
    </section>
  );
}

function RelationInspector({ relation, onSelectConcept }: { relation: Relation; onSelectConcept: (id: string) => void }) {
  const source = conceptById.get(relation.sourceId);
  const target = conceptById.get(relation.targetId);
  const assumptions = relation.assumptions?.length ? relation.assumptions : ["未提供关键假设。"];
  const derivationSteps = relation.derivationSteps?.length ? relation.derivationSteps : ["未提供推导步骤。"];

  return (
    <section className="side-section relation-section">
      <div className="side-title">
        <span>选中连线</span>
        <GitBranch size={16} />
      </div>
      <div className="relation-head">
        <button type="button" onClick={() => source && onSelectConcept(source.id)}>
          {source?.title ?? relation.sourceId}
        </button>
        <span>↔</span>
        <button type="button" onClick={() => target && onSelectConcept(target.id)}>
          {target?.title ?? relation.targetId}
        </button>
      </div>
      <div className="relation-meta">
        <span>{relationLabels[relation.type] ?? relation.type}</span>
        <StatusBadge status={relation.proofStatus ?? "needs-source"} />
      </div>
      <p className="relation-statement">{relation.statement || "关系说明缺失。请补齐 statement 字段。"}</p>
      <div className="assumption-list">
        {assumptions.map((assumption) => (
          <span key={assumption}>{assumption}</span>
        ))}
      </div>
      <h3>推导步骤</h3>
      <ol className="compact-steps">
        {derivationSteps.slice(0, 5).map((step) => (
          <li key={step}>
            <MathText text={step} onTermClick={onSelectConcept} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReferencePanel({ concept, relation }: { concept: Concept; relation: Relation }) {
  const sourceIds = [...new Set([...(concept.sourceRefs ?? []), ...(relation.sourceRefs ?? [])])];
  const sourceRows = sourceIds.map((id) => sourceById.get(id)).filter(Boolean) as Source[];

  return (
    <section className="side-section references-section">
      <div className="side-title">
        <span>来源</span>
        <Library size={16} />
      </div>
      <div className="reference-table">
        {sourceRows.length === 0 ? <p className="panel-empty">No source references for selected context.</p> : null}
        {sourceRows.slice(0, 8).map((source) => (
          <SourceRow key={source.id} source={source} />
        ))}
      </div>
    </section>
  );
}

function FullGraphView({
  selectedConceptId,
  selectedRelationId,
  onSelectConcept,
  onSelectRelation,
}: {
  selectedConceptId: string;
  selectedRelationId: string;
  onSelectConcept: (id: string) => void;
  onSelectRelation: (id: string) => void;
}) {
  const graph = useMemo(() => {
    type GraphNode = { id: string; title: string; domain: Domain; x?: number; y?: number };
    type GraphLink = { id: string; source: string | GraphNode; target: string | GraphNode; type: Relation["type"] };

    const nodes: GraphNode[] = coreConcepts.map((concept) => ({
      id: concept.id,
      title: concept.title,
      domain: concept.domain,
    }));
    const nodeIds = new Set(nodes.map((node) => node.id));
    const links: GraphLink[] = relations
      .filter((relation) => nodeIds.has(relation.sourceId) && nodeIds.has(relation.targetId))
      .slice(0, 260)
      .map((relation) => ({
        id: relation.id,
        source: relation.sourceId,
        target: relation.targetId,
        type: relation.type,
      }));

    const xByDomain: Record<Domain, number> = {
      thermodynamics: 230,
      "mathematical-tool": 430,
      bridge: 520,
      "statistical-mechanics": 700,
      nonequilibrium: 800,
    };

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(links)
          .id((node) => node.id)
          .distance((link) => (link.type === "limit-bridge" ? 82 : 58)),
      )
      .force("charge", forceManyBody().strength(-120))
      .force("x", forceX<GraphNode>((node) => xByDomain[node.domain]).strength(0.12))
      .force("y", forceY<GraphNode>(260).strength(0.08))
      .force("center", forceCenter(520, 280))
      .stop();

    for (let tick = 0; tick < 160; tick += 1) {
      simulation.tick();
    }

    return { links, nodes };
  }, []);

  const nodeById = useMemo(() => new Map(graph.nodes.map((node) => [node.id, node])), [graph.nodes]);
  const selectedNode = nodeById.get(selectedConceptId) ?? FALLBACK_CONCEPT;

  return (
    <section className="graph-view">
      <header className="view-header">
        <div>
          <Network size={18} />
          <h1>全局图谱</h1>
        </div>
        <p>展示核心节点与高优先级关系；左侧目录和搜索仍可跳转到完整概念。</p>
      </header>
      {graph.nodes.length === 0 ? (
        <p className="panel-empty">No graph nodes available for rendering.</p>
      ) : (
        <svg className="full-graph" viewBox="0 0 1040 560" role="img" aria-label="热统骨架全局图谱">
          {graph.links.map((link) => {
            const source = typeof link.source === "string" ? nodeById.get(link.source) : link.source;
            const target = typeof link.target === "string" ? nodeById.get(link.target) : link.target;
            if (!source || !target) return null;
            return (
              <line
                className={link.id === selectedRelationId ? "graph-edge active" : `graph-edge ${link.type}`}
                key={link.id}
                x1={source.x}
                x2={target.x}
                y1={source.y}
                y2={target.y}
                onClick={() => onSelectRelation(link.id)}
              />
            );
          })}
          {graph.nodes.map((node) => (
            <g
              className={node.id === selectedNode?.id ? `graph-node ${node.domain} active` : `graph-node ${node.domain}`}
              key={node.id}
              onClick={() => onSelectConcept(node.id)}
            >
              <circle cx={node.x} cy={node.y} r={node.id === selectedNode?.id ? 13 : 8} />
              <text x={(node.x ?? 0) + 12} y={(node.y ?? 0) + 4}>
                {node.title ? node.title.replace(/\s.+$/, "") : "Missing"}
              </text>
            </g>
          ))}
        </svg>
      )}
    </section>
  );
}

function BridgeView({
  selectedRelation,
  onSelectConcept,
  onSelectRelation,
}: {
  selectedRelation: Relation;
  onSelectConcept: (id: string) => void;
  onSelectRelation: (id: string) => void;
}) {
  const bridgeIds = [
    "rel-entropy-partition-function-bridge",
    "rel-partition-function-helmholtz-free-energy",
    selectedRelation.id,
  ];

  const bridgeRelations = Array.from(
    new Map(
      bridgeIds
        .map((id) => relationById.get(id))
        .filter((relation): relation is Relation => Boolean(relation))
        .map((relation) => [relation.id, relation] as const),
    ).values(),
  );

  return (
    <section className="bridge-view">
      <header className="view-header">
        <div>
          <GitBranch size={18} />
          <h1>热力学与统计力学桥接</h1>
        </div>
        <p>把宏观状态函数、微观分布、配分函数和热力学极限放在同一条可追溯路径里。</p>
      </header>
      <div className="bridge-path">
        {["entropy", "partition-function", "helmholtz-free-energy", "thermodynamic-limit"].map((id) => {
          const concept = conceptById.get(id) ?? FALLBACK_CONCEPT;
          return (
            <button key={id} type="button" onClick={() => onSelectConcept(id)}>
              {concept.title}
            </button>
          );
        })}
      </div>
      <div className="bridge-cards">
        {bridgeRelations.length === 0 ? <p className="panel-empty">No bridge relations available.</p> : null}
        {bridgeRelations.map((relation) => (
          <button className="bridge-card" key={relation.id} type="button" onClick={() => onSelectRelation(relation.id)}>
            <span>{relation.label}</span>
            <strong>{relation.statement || "No statement text."}</strong>
            <small>{(relation.assumptions ?? []).join(" / ") || "No assumption text."}</small>
          </button>
        ))}
      </div>
      <RelationInspector relation={selectedRelation} onSelectConcept={onSelectConcept} />
    </section>
  );
}

function SourcesView({ activeSourceIds }: { activeSourceIds: string[] }) {
  const active = new Set(activeSourceIds ?? []);

  return (
    <section className="sources-view">
      <header className="view-header">
        <div>
          <Library size={18} />
          <h1>来源库</h1>
        </div>
        <p>教材和原典分层保存；第一版未做页码级核验的来源会保留待补状态。</p>
      </header>
      <div className="sources-list">
        {active.size === 0 ? <p className="panel-empty">No active sources for this concept.</p> : null}
        {sources.map((source) => (
          <div className={active.has(source.id) ? "source-entry active" : "source-entry"} key={source.id}>
            <SourceRow source={source} />
            <p>{source.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SourceRow({ source }: { source: Source }) {
  return (
    <div className="source-row">
      <StatusDot status={source.status} />
      <span>{source.authors[0] ?? "Unknown"}</span>
      <em>{source.title}</em>
      <small>{source.year ?? "n.d."}</small>
    </div>
  );
}

function SourcePill({ source }: { source: Source }) {
  return (
    <span className="source-pill">
      <StatusDot status={source.status} />
      {source.authors[0] ?? "Unknown"}
    </span>
  );
}

function StatusBadge({ status }: { status: ProofStatus }) {
  return (
    <span className={`status-badge ${status}`}>
      <StatusIcon status={status} />
      {statusLabels[status]}
    </span>
  );
}

function StatusDot({ status }: { status: ProofStatus }) {
  return <span className={`status-dot ${status}`} title={statusLabels[status]} />;
}

function StatusIcon({ status }: { status: ProofStatus }) {
  if (status === "verified") return <CheckCircle2 size={14} />;
  if (status === "needs-source") return <CircleAlert size={14} />;
  return <CircleDashed size={14} />;
}

function StatusBar() {
  const conceptCountSafe = Number.isFinite(meta.conceptCount) ? meta.conceptCount : 0;
  const relationCountSafe = Number.isFinite(meta.relationCount) ? meta.relationCount : 0;
  const sourceCountSafe = Number.isFinite(meta.sourceCount) ? meta.sourceCount : 0;
  const generatedAt = typeof meta.generatedAt === "string" ? meta.generatedAt.slice(0, 10) : "unknown";
  const safeCoverage = meta.coverage ?? ({} as Record<ProofStatus, number>);
  const verified = conceptCountSafe === 0 ? 0 : Math.round(((safeCoverage.verified ?? 0) / conceptCountSafe) * 100);
  const needsSource =
    conceptCountSafe === 0 ? 0 : Math.round(((safeCoverage["needs-source"] ?? 0) / conceptCountSafe) * 100);
  const needsDerivation =
    conceptCountSafe === 0 ? 0 : Math.round(((safeCoverage["needs-derivation"] ?? 0) / conceptCountSafe) * 100);

  return (
    <footer className="status-bar">
      <span>
        <BookOpen size={15} /> 概览
      </span>
      <span>概念 {conceptCountSafe}</span>
      <span>关系 {relationCountSafe}</span>
      <span>来源 {sourceCountSafe}</span>
      <span className="status-text verified">已核验 {verified}%</span>
      <span className="status-text needs-source">待补源 {needsSource}%</span>
      <span className="status-text needs-derivation">待推导 {needsDerivation}%</span>
      <span className="grow" />
      <span>本地数据集</span>
      <span>最后生成: {generatedAt}</span>
    </footer>
  );
}

export default App;
