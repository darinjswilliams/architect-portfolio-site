# AI Reference Architecture: Autonomous Financial Research Analyst

*Version 1.0 | Target platform: Microsoft Azure | Agent framework: LangGraph | Pattern: goal-driven, tool-using research agent with analyst oversight*

## 1. Purpose and Scope

This document defines the reference architecture for an autonomous investment research platform. It addresses the business problem: analysts spend 60-70% of their time collecting data, research takes 4-6 hours per company, and manual synthesis is slow, inconsistent, and hard to scale.

**In scope:** market data retrieval, news search, sentiment analysis, financial metric computation, synthesis into Buy/Hold/Sell recommendations with confidence levels, citations, risk assessments, and audit trails.

**Out of scope:** trade execution, portfolio construction, and client-facing advice without analyst review.

## 2. Architectural Principles

1. **Autonomy within guardrails.** The agent chooses tools and recovers from failures, but only within a defined tool set, budgets, and policy checks.
2. **Numbers from tools, never from the model.** Prices, returns, volume, and ratios come from data APIs and deterministic code. The LLM interprets; it does not recall figures.
3. **Every claim is cited.** Each statement in a report links to a source (data vendor record or article) with timestamp.
4. **Graceful degradation.** Tool failures trigger fallback sources, and the report states what was unavailable and how that lowers confidence.
5. **Transparent recommendations.** Buy/Hold/Sell always carries a confidence level, key drivers, counter-arguments, and risks.
6. **Analyst in the loop.** Output is decision support. Analysts review, edit, and publish.
7. **Reproducible.** Every run stores inputs, tool calls, data snapshots, prompts, and model versions.

## 3. Logical Architecture

| Layer | Responsibility | Key AWS services and components |
| --- | --- | --- |
| Experience | Analyst workspace, report viewer, watchlists, alerts, API | Azure Front Door, API Management, Microsoft Entra ID, web app |
| Orchestration | LangGraph stateful agent graph, checkpoints, retries, human review nodes | LangGraph on Azure Container Apps (or AKS) or Azure AI Foundry Agent Service, Durable Functions for scheduling |
| Agents | Planner, market data agent, news agent, sentiment agent, financial analysis agent, synthesis agent, critic agent | Azure AI Foundry models, LangChain tool wrappers |
| Tools and data access | Market data, fundamentals, news search, filings, analyst reports | Vendor APIs, MCP or tool gateway, Azure Functions |
| Deterministic services | Return, volatility, valuation, and drawdown calculations; citation verifier; policy checker | Azure Functions or Container Apps, Python libraries |
| Data | Raw snapshots, normalized facts, report store, vector index, checkpoints | Blob Storage, Azure Database for PostgreSQL with pgvector, Cosmos DB, Azure Cache for Redis |
| Platform and governance | Identity, secrets, observability, guardrails, evaluation | Entra ID and managed identities, Key Vault, Azure Monitor and Application Insights, OpenTelemetry, LangSmith or equivalent, Azure AI Content Safety |

## 4. LangGraph Agent Design

### 4.1 Graph overview

The workflow is a stateful graph. Nodes are agents or deterministic steps; edges are conditional, driven by state such as data completeness and confidence.

1. **Intake:** parse the request (ticker, horizon, focus), validate the symbol, load the watchlist context.
2. **Planner:** decide which tools are needed and in what order; set budgets for time, tokens, and tool calls.
3. **Parallel gathering:** market data, fundamentals, news, and filings run as parallel branches.
4. **Validation:** check completeness, freshness, and consistency across sources; trigger fallback sources when a branch fails or returns stale data.
5. **Analysis:** compute metrics; run sentiment on news; assess strategic positioning from filings, news, and analyst reports.
6. **Synthesis:** draft the report and the Buy/Hold/Sell recommendation with confidence.
7. **Critic:** challenge the draft (unsupported claims, missing counter-arguments, stale data, contradictions) and request fixes.
8. **Compliance check:** disclosures, prohibited-language filter, citation verification.
9. **Human review:** analyst approves, edits, or rejects; optional for low-stakes internal screening.
10. **Publish and learn:** store report, notify, and record feedback for evaluation.

### 4.2 Agent catalog

| Agent | Function | Tools | Output |
| --- | --- | --- | --- |
| Planner | Decomposes the request, selects tools, sets budgets | None (reasoning only) | Execution plan |
| Market data agent | Prices, 3-year performance, volume, volatility | Market data API, cache | Normalized price facts |
| Fundamentals agent | Financial statements, ratios, estimates | Fundamentals API, filings (SEC EDGAR) | Structured financial facts |
| News agent | Searches recent news and press releases | News search API, web fetch | Deduplicated, dated article set |
| Sentiment agent | Scores sentiment and extracts themes per article and in aggregate | LLM, optional finance-tuned classifier | Sentiment scores with evidence |
| Strategy agent | Assesses initiatives, competitive position, management signals | Filings, news, transcripts | Strategic findings with citations |
| Synthesis agent | Produces report and recommendation | State only | Draft report |
| Critic agent | Red-teams the draft | Citation verifier | Issues list and pass/fail |

### 4.3 State and error handling

- **Typed state** holds facts (with source and timestamp), tool results, errors, confidence inputs, and the plan.
- **Checkpointing** to PostgreSQL enables resume after failure, human interrupts, and replay.
- **Retry policy:** exponential backoff for transient errors; circuit breaker per vendor.
- **Fallback map:** each data need has a ranked list of sources (for example primary price API, secondary price API, exchange delayed quote). The agent selects the next source on failure and records the substitution.
- **Partial-result policy:** the report proceeds with available data, marks gaps explicitly, and caps the confidence level accordingly.
- **Loop and budget guards:** maximum steps, tool calls, and token spend per run; exceeding any triggers a graceful stop and a partial report.

## 5. Recommendation Logic and Confidence

- The recommendation is produced by the synthesis agent from structured evidence, not from free recall.
- **Confidence** is a computed value combining data completeness, source agreement, recency, sentiment dispersion, and critic findings, calibrated against historical reports.
- Each report includes: thesis, key supporting evidence, counter-arguments, risk factors (market, company, sector, data), what would change the view, and data gaps.
- Wording is constrained to approved templates and disclosure language reviewed by Compliance.

## 6. Data Architecture

- **Raw zone:** immutable snapshots of vendor responses and fetched articles per run (Blob Storage with versioning and immutability policies where required).
- **Normalized facts:** entity, metric, value, as-of time, source, retrieval time, license tag.
- **Report store:** versioned reports with links to the fact IDs and articles that support each claim.
- **Vector index:** embeddings of articles, filings, and past reports for retrieval and deduplication (pgvector).
- **Cache:** short-TTL market data cache and longer-TTL fundamentals cache to cut vendor cost and latency.
- **Licensing metadata:** each source record carries usage rights; the report generator enforces display and redistribution limits.

## 7. Model Strategy

| Task | Approach | Rationale |
| --- | --- | --- |
| Planning and routing | Mid-tier LLM | Needs reliable tool selection |
| Article relevance and deduplication | Small LLM or embeddings | High volume, low cost |
| Sentiment | Small or mid LLM, with a finance-tuned classifier as baseline | Cost and consistency |
| Strategic analysis and synthesis | Stronger LLM | Multi-source reasoning and writing |
| Critic | Stronger LLM (different from the synthesis model where practical) | Independent challenge |
| Numeric work | Code | Exactness |

Models are accessed through Azure AI Foundry (Azure OpenAI and other catalog models) behind an abstraction layer. Versions are pinned and re-evaluated against a golden set before change.

## 8. Security and Access

- **Secrets:** API keys in Azure Key Vault with rotation; tools receive scoped credentials.
- **Network:** private subnets, Private Endpoints for Azure services, Azure Firewall, egress allow-list for vendor domains.
- **Tool safety:** read-only tools only; no tool can place trades or send external messages without human approval.
- **Prompt-injection defenses:** treat all fetched web and news content as untrusted data; isolate it from instructions; strip or flag instruction-like text; output filtering.
- **Data protection:** encryption at rest and in transit; role-based access; per-team report visibility; audit of all access.
- **Information barriers:** if the firm has restricted lists or material non-public information controls, the platform must enforce them (see the governance framework).

## 9. Integration Architecture

- **Market data vendors:** primary and secondary APIs for prices, volume, and fundamentals.
- **News and research:** news search APIs, SEC EDGAR, earnings transcripts, licensed analyst reports where contracted.
- **Internal systems:** research management system, portfolio and watchlist systems, document management, and email or chat for alerts.
- **Tool gateway:** a single governed layer (Lambda or MCP gateway) so every tool call is logged, rate limited, and cost attributed.

## 10. Non-Functional Requirements

| Attribute | Target |
| --- | --- |
| Report latency | 5 to 10 minutes per company end to end; under 2 minutes for a quick screen |
| Concurrency | 100 or more simultaneous report runs; burst for earnings season |
| Data freshness | Prices within vendor delay limits; news within minutes of publication |
| Availability | 99.9% for the API and workspace |
| Citation coverage | 100% of factual claims linked to a source; at least 98% verified by the automated checker |
| Run success rate | At least 99% of runs produce a report, full or partial, without manual intervention |
| Recoverability | RPO 15 minutes, RTO 4 hours |

## 11. Observability and Evaluation

- **Tracing:** end-to-end trace per run (nodes, tool calls, latency, tokens, cost).
- **Quality metrics:** numeric accuracy against vendor truth, citation validity, hallucination rate, critic pass rate, analyst edit distance and rejection rate.
- **Outcome tracking:** recommendation outcomes against subsequent performance, to calibrate confidence (not to claim predictive skill).
- **Reliability metrics:** tool failure rate per vendor, fallback usage, partial-report rate.
- **Evaluation harness:** a golden set of companies and dates with reference facts, run on every prompt, model, or tool change; adversarial tests for prompt injection and stale data.

## 12. Key Architecture Decisions

| Decision | Choice | Alternative | Reason |
| --- | --- | --- | --- |
| Orchestration | LangGraph stateful graph | Single ReAct loop | Checkpointing, parallel branches, explicit error paths |
| Numbers | Tools and code | LLM recall | Accuracy |
| Recommendation authority | Decision support, analyst sign-off | Fully autonomous publishing | Regulatory and reputational risk |
| Error handling | Ranked fallback sources and partial reports | Fail the run | Resilience and continuity |
| Model access | Azure AI Foundry behind abstraction | Single-vendor lock-in | Flexibility and security |

Full rationale is in the Architecture Decision Records.

## 13. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Hallucinated facts or figures | Tool-sourced numbers, citation verifier, critic agent |
| Stale or conflicting data | Timestamps, cross-source checks, freshness rules |
| Prompt injection via news or web pages | Untrusted-content isolation, tool allow-lists, read-only tools |
| Vendor outages or rate limits | Fallback map, circuit breakers, caching |
| Biased or herd-like sentiment | Multiple sources, dispersion metrics, critic review |
| Over-reliance by analysts | Evidence-first UI, edit tracking, periodic spot checks |
| Data licensing violations | License tags enforced at report generation |
