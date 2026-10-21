# Architecture Decision Records: DualLens Analytics

*Version 1.0 | Date: 2026-10-17 | All records are Proposed pending architecture board and AI Governance Committee review*

## How to Use These Records

Each ADR captures one significant decision: context, choice, alternatives, and consequences. Records are numbered, immutable once Accepted, and superseded rather than edited. Status values: Proposed, Accepted, Deprecated, Superseded.

## Decision Index

| ID | Decision | Status |
| --- | --- | --- |
| ADR-001 | RAG over fine-tuning for strategic document insight | Proposed |
| ADR-002 | Azure AI Search with hybrid retrieval and semantic reranking | Proposed |
| ADR-003 | Layout-aware PDF parsing with Azure AI Document Intelligence | Proposed |
| ADR-004 | Structure-aware chunking with citation metadata | Proposed |
| ADR-005 | Structured initiative extraction into a queryable store | Proposed |
| ADR-006 | Published rubric with evidence-only LLM scoring | Proposed |
| ADR-007 | Transparent weighted composite ranking with sensitivity analysis | Proposed |
| ADR-008 | All financial metrics computed by deterministic code | Proposed |
| ADR-009 | Market data provider abstraction; licensed provider in production | Proposed |
| ADR-010 | Mandatory citations with automated grounding checks | Proposed |
| ADR-011 | Documents treated as untrusted input | Proposed |
| ADR-012 | Azure AI Foundry models behind an abstraction layer | Proposed |
| ADR-013 | Evaluation harness as a release gate | Proposed |
| ADR-014 | Decision support positioning with required disclosures | Proposed |

---

## ADR-001: RAG over fine-tuning for strategic document insight

**Status:** Proposed

**Context:** Strategy reports change every year and differ by company. The system must trace every claim to a source passage. The problem statement explicitly calls for a Retrieval-Augmented Generation approach.

**Decision:** Use RAG: index documents, retrieve relevant passages at query time, and generate answers or scores only from retrieved evidence. Do not fine-tune models on company reports for factual recall.

**Alternatives considered:**

- Fine-tuning on reports: facts go stale, no citations, costly to refresh, and hard to audit.
- Long-context prompting with whole reports: simple for a pilot, but expensive at scale and weaker on precision across hundreds of documents.

**Consequences:**

- (+) Fresh, citable, and auditable answers; new documents are searchable on ingestion.
- (+) Models can be swapped without losing knowledge.
- (-) Retrieval quality becomes the main quality driver and needs its own evaluation.
- (-) Requires disciplined document and index management.

---

## ADR-002: Azure AI Search with hybrid retrieval and semantic reranking

**Status:** Proposed

**Context:** Queries mix concepts ("generative AI deployment") with exact terms (company names, product names, figures). Vector search alone misses exact matches; keyword search alone misses paraphrases.

**Decision:** Use Azure AI Search combining keyword (BM25) and vector search with reciprocal rank fusion, followed by semantic reranking. Use metadata filters for company, year, document type, and section.

**Alternatives considered:**

- PostgreSQL with pgvector: lower cost and simpler, but weaker built-in hybrid search and reranking; viable for a small prototype.
- Vector-only database: faster to start, lower recall on names and figures.
- Self-managed OpenSearch: flexible, higher operations burden.

**Consequences:**

- (+) Higher recall and precision, with managed scaling and security integration.
- (-) The search tier is a significant fixed cost; right-sizing is required.
- (-) Some platform lock-in; keep retrieval behind an interface.

---

## ADR-003: Layout-aware PDF parsing with Azure AI Document Intelligence

**Status:** Proposed

**Context:** Strategy and annual reports contain multi-column text, tables, sidebars, and charts. Plain text extraction scrambles reading order and loses table structure, which corrupts the facts the system depends on.

**Decision:** Parse PDFs with Azure AI Document Intelligence (Layout model) to produce text, headings, reading order, and tables with page references. Run OCR only where needed. Add quality gates for parsing confidence.

**Alternatives considered:**

- Open-source parsers (for example PyMuPDF, pdfplumber): cheaper, adequate for clean digital PDFs, weaker on complex layouts and scans; keep as a fallback.
- Multimodal LLM reading of page images: strong on charts but expensive at scale; reserve for selected pages.

**Consequences:**

- (+) Better table and structure fidelity, which improves extraction and citations.
- (-) Per-page cost and a vendor dependency; mitigated by parse-once caching.
- (-) Some charts still need special handling.

---

## ADR-004: Structure-aware chunking with citation metadata

**Status:** Proposed

**Context:** Chunk design drives retrieval quality and the ability to cite sources. Fixed-size splits can cut sentences and tables apart and lose headings that give meaning.

**Decision:** Chunk by document structure (sections, then paragraphs), targeting 400 to 800 tokens with modest overlap. Keep tables intact where possible. Attach metadata to each chunk: company, document, publication date, section path, page range, and license tag. Prepend the heading path to chunk text for embedding.

**Alternatives considered:**

- Fixed-size token windows: simplest, lower quality.
- Very large chunks: better context, worse precision and higher generation cost.

**Consequences:**

- (+) Better retrieval and exact page-level citations.
- (-) Chunking logic is more complex and must be re-evaluated whenever it changes.

---

## ADR-005: Structured initiative extraction into a queryable store

**Status:** Proposed

**Context:** Narrative text is hard to compare across companies. Ranking needs structured, comparable signals about AI initiatives.

**Decision:** Run an extraction pass over AI-relevant chunks using a structured output schema: initiative name, category, stage (announced, pilot, deployed, scaled), disclosed investment or outcomes, partners, timeline, and supporting citation. Store records in PostgreSQL linked to chunk IDs. Review samples with analysts.

**Alternatives considered:**

- Score directly from raw retrieved passages with no intermediate records: less work, but weaker auditability and comparability.
- Manual tagging by analysts: highest quality, does not scale.

**Consequences:**

- (+) Comparable, auditable evidence that supports both scoring and analytics.
- (+) Enables queries like "companies with deployed generative AI and disclosed spend."
- (-) Schema design needs domain input and will evolve; version it.

---

## ADR-006: Published rubric with evidence-only LLM scoring

**Status:** Proposed

**Context:** Innovation readiness is qualitative. A free-form LLM opinion would be inconsistent, hard to defend, and vulnerable to AI-washing language in reports.

**Decision:** Define a versioned rubric (strategic clarity, commitment, execution, capability, governance), each scored 0 to 5 from retrieved evidence only. The scoring prompt receives the evidence set and rubric, returns scores with citations, and uses low temperature and pinned models. Stated intent without evidence of execution scores lower. Sample double-scoring and analyst calibration track reliability.

**Alternatives considered:**

- Free-form LLM score: easy, inconsistent, unauditable.
- Keyword counting of AI terms: transparent but trivially gamed and shallow.
- Trained classifier on analyst labels: possible later when labeled data exists.

**Consequences:**

- (+) Consistent, explainable scores with evidence trails.
- (+) Resistant to promotional language when execution is weighted.
- (-) Rubric design is a governance matter; changes require re-scoring and approval.
- (-) LLM scoring can still drift; monitoring is required.

---

## ADR-007: Transparent weighted composite ranking with sensitivity analysis

**Status:** Proposed

**Context:** The core promise is a ranking that combines growth trajectory and innovation capacity. Users need to understand and challenge how the two lenses combine.

**Decision:** Compute a composite from the normalized Financial Growth Score and Innovation Readiness Score using documented weights (default 50/50, user adjustable). Normalize within peer groups. Display components, weights, rank sensitivity to weights, and evidence coverage. Flag companies with insufficient documentation instead of scoring them silently low.

**Alternatives considered:**

- Learned model predicting returns: small data, high overfitting risk, poor explainability, and regulatory sensitivity.
- Single combined LLM judgment: not reproducible or explainable.

**Consequences:**

- (+) Explainable and adjustable; supports different investor philosophies.
- (-) Weights embed value judgments and must be documented and governed.
- (-) Peer-group definitions affect results and need maintenance.

---

## ADR-008: All financial metrics computed by deterministic code

**Status:** Proposed

**Context:** Returns, CAGR, volatility, drawdown, and momentum must be exact and reproducible. LLMs can misstate or misremember numbers.

**Decision:** Compute all quantitative metrics in tested code from price data, with adjustments for splits and dividends and documented formulas. The LLM may describe metrics it is given but must not generate or modify them. A grounding check verifies that numbers in responses match the metrics store.

**Alternatives considered:**

- LLM-calculated metrics: rejected for accuracy.
- Spreadsheet calculations: not scalable or reproducible.

**Consequences:**

- (+) Accurate, testable, and auditable numbers.
- (-) New metrics require engineering work, which is acceptable for a controlled metric set.

---

## ADR-009: Market data provider abstraction; licensed provider in production

**Status:** Proposed

**Context:** The problem statement cites Yahoo Finance. Yahoo does not offer an official public API for commercial use, and its terms restrict automated and commercial use. Data reliability and licensing matter for investment research.

**Decision:** Define a provider interface for prices, splits, dividends, and fundamentals. Use Yahoo Finance data (for example via community libraries) only for prototyping where terms allow. Use a licensed provider in production, with a secondary source for cross-checks. Store raw responses and license tags.

**Alternatives considered:**

- Scraping Yahoo Finance in production: legal and reliability risk.
- Single-vendor hard-coding: simpler, but creates lock-in and outage risk.

**Consequences:**

- (+) Reduced legal risk and better data quality and continuity.
- (-) Data license cost and an additional integration to build.

---

## ADR-010: Mandatory citations with automated grounding checks

**Status:** Proposed

**Context:** Investors need to see why a company was ranked and verify claims. Uncited or miscited statements create reputational and compliance risk.

**Decision:** Every qualitative statement cites a passage (document, page, excerpt ID). A verifier checks that cited passages exist and support the claim; numeric claims are checked against the metrics store. Answers that fail verification are corrected or withheld.

**Alternatives considered:**

- Citations as best effort: fails the transparency goal.
- Manual verification only: does not scale.

**Consequences:**

- (+) Traceable, defensible outputs.
- (-) Added latency and cost; the verifier itself needs evaluation.

---

## ADR-011: Documents treated as untrusted input

**Status:** Proposed

**Context:** PDFs from external sources can contain hidden or visible instructions intended to manipulate LLM behavior, and promotional text intended to inflate perceived innovation.

**Decision:** Pass document text to models as delimited data, never as instructions. Flag instruction-like text. Give the generation and scoring steps no tools that perform external actions. Apply Azure AI Content Safety and Prompt Shields. Include adversarial documents in the evaluation set.

**Alternatives considered:**

- Trust curated documents: insufficient; sources vary in quality.
- Block all external documents: defeats the purpose.

**Consequences:**

- (+) Lower injection and manipulation risk.
- (-) Residual risk remains; defense in depth and review of extreme scores are required.

---

## ADR-012: Azure AI Foundry models behind an abstraction layer

**Status:** Proposed

**Context:** Model price and quality change quickly. The firm requires strong security controls and the ability to change models or embeddings without redesign.

**Decision:** Access chat and embedding models through Azure AI Foundry (Azure OpenAI and other catalog models) over Private Endpoints, behind an internal interface that manages model selection, versions, prompts, logging, and safety filters. Pin versions; route tasks by difficulty (small models for tagging, mid-tier for extraction and Q&A, stronger models for scoring).

**Alternatives considered:**

- Direct provider APIs: more model choice, separate security review.
- Self-hosted open models: more control, higher operations burden.

**Consequences:**

- (+) Faster delivery, consistent security, and flexibility.
- (-) Changing the embedding model requires re-indexing the corpus; plan and cost it as a project.

---

## ADR-013: Evaluation harness as a release gate

**Status:** Proposed

**Context:** RAG systems degrade silently when chunking, embeddings, prompts, or models change. Qualitative scoring can drift.

**Decision:** Maintain labeled evaluation sets for retrieval (questions with expected passages), faithfulness, extraction accuracy, and rubric scoring (analyst-scored companies). Run the full harness on every relevant change and as a scheduled regression. Releases are blocked below defined thresholds.

**Alternatives considered:**

- Ad hoc spot checks: miss regressions.
- Production monitoring only: finds problems after users see them.

**Consequences:**

- (+) Safe, fast iteration with evidence of quality.
- (-) Labeling effort and upkeep; analysts must contribute time.

---

## ADR-014: Decision support positioning with required disclosures

**Status:** Proposed

**Context:** Rankings can be mistaken for recommendations or predictions. Financial communications face regulatory scrutiny, including around AI claims.

**Decision:** Position DualLens as decision support. Every view and export shows data sources, as-of dates, rubric and model versions, evidence coverage, and a statement that rankings are not investment advice or return predictions. Compliance approves language and any performance claims. No trade recommendations are generated.

**Alternatives considered:**

- Generate Buy or Sell labels: higher perceived value, materially higher regulatory risk.
- Minimal disclosures: higher misuse risk.

**Consequences:**

- (+) Clear boundaries and reduced regulatory exposure.
- (-) Some users may want direct recommendations; this can be revisited with Compliance and committee approval.

---

## Open Questions for Review

1. Who are the intended users: internal analysts, advisers, or retail investors?
2. Which companies, sectors, and geographies form the first universe?
3. Which licensed market data provider will be used in production?
4. Which documents are in scope (annual reports, strategy decks, filings, transcripts), and are processing and display rights confirmed?
5. How should the default weights between financial growth and innovation readiness be set and governed?
6. Does an enterprise standard constrain cloud region, model providers, or search technology?

## ADR Template

**ADR-NNN: Title**

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN

**Context:** What problem or force requires a decision?

**Decision:** What are we doing, stated plainly?

**Alternatives considered:** What else was evaluated, and why not?

**Consequences:** What gets better, what gets harder, what must we monitor?
