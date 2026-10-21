# AI Reference Architecture: DualLens Analytics

*Version 1.0 | Target platform: Microsoft Azure | Pattern: Retrieval-Augmented Generation (RAG) over strategy documents, fused with quantitative financial analytics*

## 1. Purpose and Scope

DualLens Analytics ranks organizations by two lenses at once: **financial growth** (stock performance and momentum) and **innovation readiness** (AI initiatives described in strategy reports). It addresses three problems: financial and strategic data live in silos, manual analysis of trends and PDFs is slow and error-prone, and investors miss opportunities when only one lens is used.

**In scope:** ingestion of PDF reports, structured extraction of AI initiatives, retrieval-grounded question answering, stock data ingestion and growth metrics, a transparent composite ranking, and an analyst-facing explorer.

**Out of scope:** trade execution, personalized investment advice, and portfolio construction.

## 2. Architectural Principles

1. **Two lenses, one evidence base.** Numbers and narratives are stored, versioned, and cited in the same way so they can be combined without hand-waving.
2. **Numbers from data, narratives from documents.** Growth metrics are computed by code from price data. AI-initiative claims come only from retrieved passages, never from model memory.
3. **Every qualitative claim carries a citation** (document, page, passage).
4. **Transparent scoring.** The ranking is a documented formula with visible components, weights, and sensitivity, not a black box.
5. **Skepticism about claims.** Corporate documents are marketing-adjacent; the system distinguishes stated intent from evidence of deployment.
6. **Reproducible.** Every ranking is tied to a data snapshot, document versions, prompts, and model versions.
7. **Decision support, not advice.** Output informs analysts and investors; it does not recommend trades.

## 3. Logical Architecture

| Layer | Responsibility | Key Azure services and components |
| --- | --- | --- |
| Experience | Ranking dashboard, company profile, evidence-linked Q&A, what-if weights | Azure Front Door, Static Web Apps or Container Apps, Microsoft Entra ID, Power BI (optional) |
| API and orchestration | RAG pipeline, query planning, scoring workflow, scheduling | Azure Container Apps, Azure Functions, Durable Functions, API Management |
| Document pipeline | Ingest PDFs, parse layout and tables, chunk, enrich, embed, index | Blob Storage, Azure AI Document Intelligence, Event Grid, Functions |
| Retrieval | Hybrid keyword plus vector search, semantic reranking, metadata filters | Azure AI Search |
| Generation and extraction | LLM answers, structured extraction of AI initiatives, scoring rationale | Azure AI Foundry models (Azure OpenAI and others) |
| Financial data | Price history ingestion, growth and risk metrics, benchmarks | Data provider APIs, Functions, Azure Database for PostgreSQL, Blob/ADLS Gen2 (Parquet) |
| Scoring and ranking | Normalize, weight, combine, rank, sensitivity analysis | Python scoring service (Container Apps) |
| Platform and governance | Identity, secrets, catalog, monitoring, safety, evaluation | Key Vault, Managed Identities, Microsoft Purview, Azure Monitor and Application Insights, Azure AI Content Safety |

## 4. Data Sources

| Source | Content | Notes |
| --- | --- | --- |
| Market data | Daily prices, volume, splits and dividends | Yahoo Finance is acceptable for prototyping only; production needs a licensed provider because Yahoo's terms restrict commercial and automated use. Keep a provider abstraction. |
| Strategy and annual reports | PDFs on AI strategy, innovation, capex, R&D | Public company documents; track version and publication date |
| Regulatory filings | 10-K, 20-F, risk factors, MD&A | Structured, high-quality text; SEC EDGAR is free and official |
| Earnings call transcripts | Management commentary on AI | Licensing varies |
| Reference data | Ticker to company mapping, sector, market cap | Needed for peer-group normalization |

## 5. The Document (Qualitative) Pipeline

1. **Ingest.** PDFs land in Blob Storage with metadata: company, document type, publication date, source URL, license tag. Event Grid triggers processing.
2. **Parse.** Azure AI Document Intelligence (Layout model) extracts text, reading order, headings, and tables. Scanned PDFs are OCR'd. Charts and images are captioned only when they carry initiative information.
3. **Chunk.** Structure-aware chunks (section-based, 400 to 800 tokens, with overlap) that keep heading paths, page numbers, and table context.
4. **Enrich.** Each chunk gets metadata (company, year, section, document type) and optional tags (AI topic classification such as generative AI, computer vision, automation, infrastructure).
5. **Embed and index.** Embeddings stored in Azure AI Search alongside keyword fields, supporting hybrid search with semantic reranking.
6. **Extract initiatives.** An extraction pass pulls structured records per company: initiative name, category, stage (announced, pilot, deployed, scaled), quantified investment or outcomes, partners, timeline, and supporting citation.
7. **Quality gates.** Duplicate detection, language detection, parsing-quality checks, and a review queue for low-confidence documents.

## 6. The Financial (Quantitative) Pipeline

1. **Ingest** daily price history on a schedule; store raw responses and normalized series.
2. **Compute** deterministic metrics: 1, 3, and 5-year total return and CAGR, annualized volatility, maximum drawdown, momentum (for example 6 and 12-month), and return versus sector benchmark. Optional fundamentals: revenue growth, margins, R&D intensity.
3. **Validate:** split and dividend adjustments, missing-data handling, outlier checks, and cross-checks against a second source.
4. **Store** metrics with as-of date and data version for reproducibility.

## 7. The Fusion Layer: Ranking

**Financial Growth Score** blends return, momentum, and risk-adjusted measures, normalized within a peer group (percentile or z-score).

**Innovation Readiness Score** is built from the extracted initiative records and a published rubric, for example:

| Dimension | Evidence the rubric looks for |
| --- | --- |
| Strategic clarity | Explicit AI strategy tied to business goals |
| Commitment | Disclosed investment, headcount, or capex tied to AI |
| Execution | Deployed or scaled use cases, with measurable outcomes |
| Capability | Data and platform investments, talent, partnerships |
| Governance | Responsible AI practices, risk disclosures |

Each dimension is scored 0 to 5 by an LLM judge working only from retrieved evidence, with the cited passages stored. Stated intent without evidence of execution scores lower, which guards against "AI washing."

**Composite ranking** = weighted combination (default 50/50, user adjustable). The system shows each component, the weights, rank sensitivity to weights, and the evidence behind each qualitative score. A company with weak evidence is flagged "insufficient documentation" rather than scored low silently.

## 8. Query and Answering Flow (RAG)

1. User asks a question (for example, "Which semiconductor firms combine strong 3-year growth with deployed AI initiatives?").
2. A query planner decides which lens each part needs: structured filters and metric lookups for numbers, hybrid retrieval for narratives.
3. Retrieval returns top passages with metadata filters (company, year), reranked semantically.
4. The LLM answers using only retrieved passages and returned metrics, with inline citations.
5. A grounding check verifies that cited passages support each claim and that every number matches the metrics store.
6. The response shows the answer, evidence panel, and confidence notes (for example, documents are old or sparse).

## 9. Model Strategy

| Task | Approach |
| --- | --- |
| Embeddings | Azure OpenAI embedding model; same model for index and query; version pinned |
| Initiative extraction | Mid-tier LLM with structured output schema |
| Rubric scoring | Stronger LLM, low temperature, evidence-only input, double-scored on a sample |
| Q&A synthesis | Mid-tier or stronger LLM depending on complexity |
| Classification and tagging | Small LLM |
| Numbers | Code only |

Models are accessed through Azure AI Foundry behind an abstraction layer. Re-embedding is a planned operation when the embedding model changes.

## 10. Security and Privacy

- Private Endpoints for Storage, AI Search, PostgreSQL, and model endpoints; no public data paths.
- Managed identities and Key Vault; no keys in code.
- Entra ID roles: viewer, analyst, administrator; document-level security trimming if licensed content has restricted audiences.
- **Prompt injection:** PDFs are untrusted. Document text is passed as delimited data, instruction-like text is flagged, and the generation step has no tools that act externally.
- Content filtering and Prompt Shields via Azure AI Content Safety.
- Encryption at rest and in transit; audit logging through Azure Monitor.

## 11. Non-Functional Requirements

| Attribute | Target |
| --- | --- |
| Document ingestion | A 150-page PDF searchable within 10 minutes |
| Query latency | Under 8 seconds for cited answers; under 2 seconds for metric lookups |
| Ranking refresh | Daily for market data; on document arrival for qualitative scores |
| Citation coverage | 100% of qualitative claims cited; at least 98% verified |
| Retrieval quality | Recall at 10 of at least 90% on the evaluation set |
| Availability | 99.9% for the API and dashboard |
| Recoverability | RPO 1 hour, RTO 4 hours; indexes rebuildable from stored documents |

## 12. Observability and Evaluation

- **Retrieval metrics:** recall, precision, and mean reciprocal rank on a labeled question set.
- **Generation metrics:** faithfulness (claims supported by passages), answer relevance, citation validity.
- **Scoring quality:** agreement between LLM scores and analyst scores on a labeled sample, inter-run stability, sensitivity to prompt changes.
- **Data quality:** parse success rate, missing-price rate, stale-document rate.
- **Ranking validation:** back-test whether ranks relate to subsequent performance, interpreted cautiously and never advertised as predictive.
- **Operations:** latency, token cost per query, error rates, tracing in Application Insights.
- An evaluation harness runs on every change to prompts, chunking, embeddings, rubric, or models.

## 13. Key Architecture Decisions

| Decision | Choice | Alternative | Reason |
| --- | --- | --- | --- |
| Retrieval | Hybrid search with semantic reranking | Vector-only | Better recall on names, figures, and jargon |
| Document parsing | Layout-aware parsing | Plain text extraction | Tables and structure carry key facts |
| Scoring | Published rubric with evidence-only LLM scoring | Free-form LLM opinion | Consistency and auditability |
| Math | Code | LLM calculation | Accuracy |
| Ranking | Transparent weighted composite | Learned black-box model | Explainability, small data |
| Market data | Provider abstraction, licensed in production | Direct Yahoo Finance scraping | Licensing and reliability |

Full rationale appears in the Architecture Decision Records.

## 14. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| AI washing inflates innovation scores | Execution-weighted rubric; separate intent from evidence; analyst review of top and bottom ranks |
| Documents differ in quality, date, and length, biasing scores | Peer normalization, evidence counts, "insufficient documentation" flag, document freshness shown |
| Hallucinated initiatives | Evidence-only generation, citation verification, extraction cross-checks |
| Parsing errors in tables and charts | Layout-aware parsing, quality gates, manual review queue |
| Data provider outages or licensing limits | Provider abstraction, caching, secondary source |
| Over-interpretation of rankings | Disclosures, sensitivity views, no trade recommendations |
| Prompt injection through PDFs | Untrusted-content isolation, no external actions, filtering |
