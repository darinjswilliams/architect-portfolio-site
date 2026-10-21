# Architecture Decision Records: AI Mortgage Underwriting

*Version 1.0 | Date: 2026-10-17 | All records are Proposed pending review by the architecture board and the AI Governance Committee*

## How to Use These Records

Each ADR captures one significant decision: the context, the choice, the alternatives considered, and the consequences. Records are numbered, immutable once Accepted, and superseded rather than edited. Status values: Proposed, Accepted, Deprecated, Superseded.

## Decision Index

| ID | Decision | Status |
| --- | --- | --- |
| ADR-001 | Human underwriter makes every final credit decision | Proposed |
| ADR-002 | Deterministic code performs all underwriting calculations | Proposed |
| ADR-003 | Multi-agent design with a workflow-bound orchestrator | Proposed |
| ADR-004 | Textract for OCR plus LLM for field interpretation | Proposed |
| ADR-005 | RAG with mandatory citations for guideline checking | Proposed |
| ADR-006 | Foundation models via Amazon Bedrock behind an abstraction layer | Proposed |
| ADR-007 | Tiered model routing with confidence-based escalation | Proposed |
| ADR-008 | Confidence-gated routing to a human exception queue | Proposed |
| ADR-009 | Immutable audit log of every agent action and decision | Proposed |
| ADR-010 | Phased rollout through shadow mode before live recommendations | Proposed |
| ADR-011 | Aurora PostgreSQL with pgvector for guideline retrieval | Proposed |
| ADR-012 | Fair lending controls designed in, not bolted on | Proposed |

---

## ADR-001: Human underwriter makes every final credit decision

**Status:** Proposed

**Context:** Lending decisions carry regulatory obligations under ECOA/Reg B and FCRA, including specific adverse action reasons. Model errors in credit decisions create fair lending and repurchase risk. The business goal is throughput and consistency, not removing accountability.

**Decision:** The AI platform prepares, verifies, and recommends. A licensed underwriter approves, adjusts, or denies every loan. The system cannot issue a final decision.

**Alternatives considered:**

- Full automation of clean files: higher speed, but unacceptable regulatory and explainability risk at launch.
- Automation with sampled review: deferred; revisit at Gate G4 after sustained performance.

**Consequences:**

- (+) Clear accountability and simpler regulatory posture.
- (+) Positions the product as making underwriters more productive.
- (-) Throughput gains are bounded by underwriter capacity.
- (-) Requires anti-complacency controls (QC sampling, seeded errors, override tracking).

---

## ADR-002: Deterministic code performs all underwriting calculations

**Status:** Proposed

**Context:** DTI, LTV, CLTV, qualifying income, and reserves must be exact, reproducible, and testable. LLMs can make arithmetic and rounding errors and are not reproducible by default.

**Decision:** A versioned calculation engine (Lambda or container service) computes all ratios from verified structured facts. LLMs never perform or alter calculations. Each result includes a formula trace.

**Alternatives considered:**

- LLM-computed ratios: rejected for accuracy and auditability.
- LLM with code-interpreter tool: still non-deterministic in orchestration; rejected for the decision path.

**Consequences:**

- (+) Exact, unit-testable, and auditable results.
- (+) Guideline changes to formulas are code changes with regression tests.
- (-) Qualifying-income rules for complex borrowers (self-employed, rental) require explicit engineering.

---

## ADR-003: Multi-agent design with a workflow-bound orchestrator

**Status:** Proposed

**Context:** Underwriting is a known, repeatable process with distinct skills (classify, extract, verify, check policy, draft memo). It needs retries, timeouts, and escalation, and every step must be auditable.

**Decision:** Use specialist agents coordinated by an orchestrator whose control flow is defined in AWS Step Functions. Agents have narrow scopes and typed inputs and outputs. The orchestrator cannot create new workflow paths at runtime.

**Alternatives considered:**

- Single large agent with all tools: harder to test, evaluate, and constrain.
- Fully autonomous agent loop: unpredictable cost and behavior; weak audit story.
- Pure rules and OCR pipeline without agents: cannot handle document variability.

**Consequences:**

- (+) Predictable behavior, per-agent evaluation, and per-agent cost tracking.
- (+) Individual agents can be upgraded or swapped independently.
- (-) More interfaces to define and version.
- (-) Less flexibility for unanticipated document types (handled through the exception queue).

---

## ADR-004: Textract for OCR plus LLM for field interpretation

**Status:** Proposed

**Context:** Loan packages mix scans, photos, and digital PDFs across many layouts. Accurate extraction of income, balances, and property values is the main driver of time savings.

**Decision:** Use Amazon Textract for OCR, tables, and forms; use LLMs with structured output schemas to interpret fields and resolve layout variation. Every extracted value stores document, page, bounding box, confidence, and model version. Digital-native PDFs bypass OCR.

**Alternatives considered:**

- LLM vision only: higher cost per page and harder to produce bounding-box evidence.
- Third-party IDP platform: faster start, but less control and higher unit cost at scale.
- Custom-trained extraction models: high effort; revisit for high-volume document families.

**Consequences:**

- (+) Strong evidence trail and lower cost on clean documents.
- (+) Handles layout variation without per-template rules.
- (-) Two-stage pipeline adds latency and integration points.
- (-) Requires a golden set and per-field accuracy tracking.

---

## ADR-005: RAG with mandatory citations for guideline checking

**Status:** Proposed

**Context:** Fannie Mae, Freddie Mac, FHA, VA, and lender overlay guidelines change frequently and vary by effective date and product. Findings must cite the rule applied to satisfy underwriters, QC, and examiners.

**Decision:** Index guidelines as versioned, effective-dated chunks. The Policy agent retrieves relevant sections per check and must return a pass/fail result with the section citation. Responses without a valid citation are rejected and routed to a human.

**Alternatives considered:**

- Fine-tuning a model on guidelines: stale on update, no citations, expensive to refresh.
- Hard-coded rules engine only: precise but costly to maintain across all guideline text; may be added for the highest-volume, stable rules.

**Consequences:**

- (+) Guideline updates are a content refresh, not a model retrain.
- (+) Every rule check is traceable.
- (-) Retrieval quality becomes a critical metric (citation accuracy of at least 99%).
- (-) Requires disciplined guideline ingestion and version management.

---

## ADR-006: Foundation models via Amazon Bedrock behind an abstraction layer

**Status:** Proposed

**Context:** Model quality, price, and availability change quickly. The lender needs strong security posture (private connectivity, no training on customer data) and the ability to switch models without redesign.

**Decision:** Access foundation models through Amazon Bedrock using VPC endpoints. Wrap model calls in an internal interface that handles model selection, prompt versions, structured output, logging, and guardrails. Pin model versions and re-run the golden-set evaluation before any change.

**Alternatives considered:**

- Direct provider APIs: more model choice per vendor, but separate security and contract review.
- Self-hosted open-weight models: more control, much higher operational burden.

**Consequences:**

- (+) Fast time to market, consistent security controls, model flexibility.
- (+) Swap or add models with limited code change.
- (-) Dependence on Bedrock model availability and regional capacity.
- (-) Abstraction layer must be maintained.

---

## ADR-007: Tiered model routing with confidence-based escalation

**Status:** Proposed

**Context:** Per-file AI run cost must stay well below manual labor cost. Tasks differ widely in difficulty: classification is simple, cross-document reasoning is hard.

**Decision:** Route tasks to the smallest adequate model. Use small models for classification, mid-tier for extraction and memo drafting, and stronger models for cross-document reasoning and ambiguous cases. A cascade escalates to a stronger model when confidence is low. Use prompt caching and batch inference where latency permits.

**Alternatives considered:**

- One premium model for everything: simpler, but materially higher cost.
- One small model for everything: lower cost, but lower accuracy on hard cases.

**Consequences:**

- (+) Meaningful reduction in cost per file without sacrificing accuracy on hard tasks.
- (-) Routing logic and thresholds need tuning and monitoring.
- (-) More model versions to validate and govern.

---

## ADR-008: Confidence-gated routing to a human exception queue

**Status:** Proposed

**Context:** Automation must not silently pass low-quality extractions, unresolved discrepancies, or unusual files. Over-escalation wastes underwriter time; under-escalation creates risk.

**Decision:** Every extracted field and agent finding carries a confidence score. Fields below threshold, unresolved cross-document discrepancies, rule failures, suspected fraud, and non-standard property or borrower types route to a human exception queue with the evidence attached. Thresholds are configurable per field and tuned during shadow mode.

**Alternatives considered:**

- Route everything to humans: no productivity gain.
- Single global threshold: too blunt across critical vs. minor fields.

**Consequences:**

- (+) Risk concentrated where human judgment is needed.
- (+) Queue rate becomes a measurable tuning lever.
- (-) Requires calibration data and ongoing monitoring.

---

## ADR-009: Immutable audit log of every agent action and decision

**Status:** Proposed

**Context:** Examiners, QC, and investors may require reconstruction of any decision, including adverse action reasons. AI systems add model versions, prompts, and retrieved context to what must be preserved.

**Decision:** Write an append-only record for each agent step: inputs, prompt and model version, retrieved guideline text, outputs, confidence, and the human action. Store in S3 with Object Lock (or a ledger database) using per-tenant KMS keys. Retention follows the lender's schedule and legal holds.

**Alternatives considered:**

- Application logs only: mutable, incomplete, hard to query.
- Store only final decisions: cannot reconstruct reasoning.

**Consequences:**

- (+) Examiner-ready reconstruction and supports adverse action reason codes.
- (+) Feeds monitoring, evaluation, and incident review.
- (-) Storage and data-protection overhead; sensitive data inside logs needs masking and access controls.

---

## ADR-010: Phased rollout through shadow mode before live recommendations

**Status:** Proposed

**Context:** The lender needs evidence of accuracy, fairness, and underwriter acceptance before AI recommendations influence credit decisions.

**Decision:** Roll out in phases: foundation, assisted extraction with full human verification, shadow mode on live loans without showing AI conclusions, limited live augmentation, then scale. Each phase has a go/no-go gate reviewed by the AI Governance Committee with defined evidence.

**Alternatives considered:**

- Big-bang launch: faster, but unacceptable regulatory and operational risk.
- Pilot with live recommendations from the start: risks anchoring underwriters before validation is complete.

**Consequences:**

- (+) Evidence-based confidence and clean validation data.
- (+) Early wins from document automation build trust.
- (-) Longer time to full benefit (indicatively 9 to 12 months to live recommendations).

---

## ADR-011: Aurora PostgreSQL with pgvector for guideline retrieval

**Status:** Proposed

**Context:** The guideline corpus is modest in size (thousands to tens of thousands of chunks) and benefits from relational filters such as product, effective date, and investor.

**Decision:** Use Aurora PostgreSQL with pgvector for embeddings and metadata filtering, co-located with structured loan data. Re-evaluate Amazon OpenSearch if the corpus or query volume grows beyond what pgvector serves at target latency.

**Alternatives considered:**

- Amazon OpenSearch Service: stronger at scale and hybrid search, but higher cost and another cluster to operate.
- Bedrock Knowledge Bases managed store: faster to start; less control over filtering and versioning logic.

**Consequences:**

- (+) Lower cost and fewer moving parts at expected scale.
- (+) Single store for metadata filters and vectors.
- (-) May need migration if scale or search needs outgrow it; keep retrieval behind an interface.

---

## ADR-012: Fair lending controls designed in, not bolted on

**Status:** Proposed

**Context:** ECOA, the Fair Housing Act, and state laws prohibit discrimination, including disparate impact. AI components can introduce proxies and uneven error rates across groups.

**Decision:** Exclude protected characteristics and known proxies from decision logic. Run disparate-impact and error-rate analysis before release and quarterly after, using approved proxy methods where direct data is not collected. Document less-discriminatory-alternative reviews when disparities appear. Treat fair lending results as a release gate for Tier 1 components.

**Alternatives considered:**

- Post-launch testing only: unacceptable exposure.
- Rely on the human decision as the only safeguard: does not address biased inputs and recommendations.

**Consequences:**

- (+) Reduced regulatory risk and stronger examiner posture.
- (-) Adds validation effort and may delay a release when findings arise.

---

## Open Questions for Review

1. Which loan product and region form the pilot scope?
2. Which LOS will integrate first, and does it support API access or structured export?
3. What are the lender's investor and overlay requirements that affect guideline indexing?
4. What confidence thresholds and override-rate bands will Model Risk Management approve for go-live?
5. Is there an existing enterprise standard for cloud region, data residency, and model providers that constrains ADR-006?

## ADR Template

For new decisions, copy this structure.

**ADR-NNN: Title**

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN

**Context:** What problem or force requires a decision?

**Decision:** What are we doing, stated plainly?

**Alternatives considered:** What else was evaluated, and why not?

**Consequences:** What gets better, what gets harder, what must we monitor?
