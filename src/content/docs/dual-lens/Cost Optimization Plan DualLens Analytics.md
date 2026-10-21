# Cost Optimization Plan: DualLens Analytics

*Version 1.0 | Platform: Microsoft Azure | All dollar figures are planning assumptions to validate against the firm's actual salaries, data contracts, and current Azure pricing*

## 1. Objective

Deliver combined financial and strategic analysis for many companies at a small fraction of the manual cost, while keeping document-processing, search, model, and data-license spend predictable. The value is analyst capacity and coverage: ranking hundreds of companies on both lenses, refreshed as new documents and prices arrive.

## 2. Baseline: Cost of the Current Process

The problem statement does not give manual effort figures, so this plan uses clearly labeled assumptions.

| Assumption | Value |
| --- | --- |
| Analyst salary (illustrative) | $150,000 |
| Loaded cost multiplier | 1.3x, or about $195,000 |
| Loaded hourly cost | about $94 |
| Manual effort per company: pull prices and compute growth (1 hour) plus read and summarize AI initiatives in strategy reports (5 hours) | about 6 hours |
| **Manual cost per company profile** | **about $565** |
| Coverage | One analyst profiles perhaps 300 companies a year at most |

Replace with the firm's measured effort before external use.

## 3. Target State Economics

After the corpus is ingested, each company profile is generated from indexed documents and computed metrics. Analysts review and calibrate rather than read every page.

| Scenario | Analyst time per company | Labor cost per company | Reduction vs. baseline |
| --- | --- | --- | --- |
| Baseline (manual) | 6 hours | about $565 | n/a |
| Conservative | 1.5 hours | about $140 | 75% |
| Target | 45 minutes | about $70 | 88% |
| Stretch (refresh of a reviewed company) | 15 minutes | about $24 | 96% |

Platform and data costs (section 4) are added on top. The larger benefit is breadth: the same team can cover many more companies and refresh them continuously.

## 4. Platform Cost Model

### 4.1 One-time and per-document costs (ingestion)

| Driver | Unit | Planning estimate | Optimization lever |
| --- | --- | --- | --- |
| Document parsing (Azure AI Document Intelligence) | Pages | roughly $1.50 per 1,000 pages for layout parsing at list price; a 150-page report costs well under $1 | Use the cheapest model that preserves tables; skip OCR for digital-native PDFs; parse each document once and cache by hash |
| Embeddings | Tokens | A 150-page report is about 100K tokens, typically a few cents | Batch embedding; embed only meaningful chunks; avoid re-embedding unchanged documents |
| Initiative extraction (LLM) | Tokens | $0.10 to $1.00 per document | Mid-tier model; extract only from AI-relevant chunks identified by classification |
| Rubric scoring (LLM) | Tokens | $0.10 to $0.60 per company | Evidence-only input; small context; cache scores until new documents arrive |

### 4.2 Ongoing run costs

| Driver | Unit | Planning estimate | Optimization lever |
| --- | --- | --- | --- |
| Azure AI Search | Search units (replicas and partitions) | Fixed monthly cost by tier; often the largest platform line | Right-size the tier; use one index with metadata filters; scale replicas only for peak load |
| Q&A queries (retrieval plus LLM) | Per query | $0.02 to $0.20 | Retrieve fewer, better passages; semantic reranking before generation; response caching for repeated questions |
| Market data provider | Subscription or calls | Varies by contract | Daily batch pulls; cache; one provider contract for all uses |
| Storage (Blob, ADLS, PostgreSQL) | GB | Low | Lifecycle tiering; Parquet for time series |
| Compute (Container Apps, Functions) | Execution time | Low | Scale to zero; consumption plans for batch jobs |
| Observability and security tooling | Logs and scans | Moderate | Sampling and retention policies |

### 4.3 Illustrative annual run cost

For a universe of 500 companies with about 6 documents each (3,000 documents), initial ingestion, extraction, and scoring should cost in the low thousands of dollars. Steady-state costs are dominated by the AI Search tier, the market data license, and engineering time, not by model tokens. Replace these estimates with pilot measurements.

## 5. Cost Optimization Levers

### 5.1 Document pipeline

1. **Parse once, reuse many times.** Hash documents, cache parsed text and chunks, and re-process only when a new version arrives.
2. **Filter before the LLM.** Classify chunks by AI relevance with embeddings or a small model, then run expensive extraction only on relevant chunks (often 5 to 15% of a report).
3. **Right-size chunking.** Smaller, well-structured chunks reduce tokens sent to generation without hurting recall.
4. **Skip low-value documents.** Prioritize annual reports, strategy documents, and filings; deprioritize marketing material.

### 5.2 Model strategy

1. **Tiered models.** Small models for tagging, mid-tier for extraction and Q&A, stronger models only for rubric scoring and hard questions.
2. **Prompt caching and batch inference** for large ingestion and re-scoring runs, which are not latency sensitive.
3. **Structured outputs and token limits** to avoid verbose responses.
4. **Cache answers** to frequent queries and invalidate when new documents or prices arrive.
5. **Re-embedding discipline.** Treat an embedding-model change as a planned project with a cost estimate, since it requires re-indexing the corpus.

### 5.3 Search and storage

1. Choose the smallest Azure AI Search tier that meets recall and latency targets; revisit when the corpus grows.
2. Use compressed or quantized vectors where recall tests allow.
3. Store raw PDFs in cool or archive tiers after processing, within retention rules.
4. Use vector dimensions that balance cost and quality; evaluate before switching.

### 5.4 Financial data

1. Daily end-of-day pulls rather than intraday unless required.
2. Store history once and update incrementally.
3. Negotiate a single enterprise data contract that covers prices, fundamentals, and licensed display rights.
4. Use a secondary source only as a fallback.

### 5.5 Infrastructure

1. Scale-to-zero for non-production and low-traffic services.
2. Azure Savings Plans or reservations for steady compute and database baselines.
3. Private Endpoints with a shared network design to limit data transfer charges.
4. Control log retention and verbosity in Azure Monitor.
5. Use dev and test pricing and schedules for non-production resources.

## 6. FinOps Operating Model

| Practice | Description |
| --- | --- |
| Tagging | Tag by environment, pipeline stage, and team; enforce with Azure Policy |
| Unit economics | Dashboard: cost per document ingested, per company scored, per query |
| Budgets and alerts | Monthly budgets with alerts at 70%, 90%, and 100%; anomaly detection for token and search spikes |
| Ingestion guardrails | Page and token caps per document; alert on unusual volumes |
| Vendor review | Quarterly review of data and platform usage against contracts |
| Architecture review | Quarterly reassessment of model, embedding, and search choices |

## 7. Investment and Payback Framework

| Category | Components |
| --- | --- |
| One-time | Design and build, rubric development with domain experts, evaluation set labeling, data integrations, compliance and validation, training |
| Recurring | Azure services (Search, models, compute, storage), market data and document licenses, platform team, monitoring, annual validation |
| Benefits | Analyst time saved or redeployed, wider coverage, faster refresh, consistent scoring, discovery of overlooked companies |

**Payback formula**

*Annual net benefit = (baseline cost per company minus new cost per company including variable AI cost) × companies analyzed per year, minus recurring fixed costs.*

*Payback period = one-time investment divided by annual net benefit.*

Example for illustration only: profiling 1,000 companies a year manually would cost about $565,000 at baseline. At about $70 of labor and a few dollars of variable cost each, the labor cost falls to roughly $75,000, a saving near $490,000 before fixed platform and license costs. If the firm instead expands coverage, the value shows up as breadth and speed. The firm should choose which benefit it is pursuing.

## 8. Cost Guardrails

- Per-document and per-query token budgets with hard stops.
- Maximum retries on parsing and extraction to avoid repeated spend on bad PDFs.
- Alerts when AI Search utilization or storage growth exceeds plan.
- No change to chunking, embeddings, rubric, or models without a cost impact estimate.

## 9. Optimization Roadmap

| Phase | Focus | Expected outcome |
| --- | --- | --- |
| Pilot | Measure true cost per document, company, and query | Reliable unit economics |
| Scale | Relevance filtering, caching, batch jobs, tier right-sizing | 30% to 50% lower run cost per company |
| Optimize | Vector compression, data contract consolidation, reservations | Lower fixed and variable cost per covered company |
| Continuous | Quarterly model, embedding, and search reviews | Sustained cost as coverage grows |

## 10. Key Metrics

- Cost per company profile (total, AI, data, labor)
- Cost per document ingested and per query
- Analyst minutes per company
- Companies covered per analyst
- Cache hit rate and re-processing rate
- Search tier utilization
- Payback period and cumulative net benefit
