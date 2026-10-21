# Architecture Decision Records: Autonomous Financial Research Analyst

*Version 1.0 | Date: 2026-10-17 | All records are Proposed pending architecture board and AI Governance Committee review*

## How to Use These Records

Each ADR captures one significant decision: context, choice, alternatives, and consequences. Records are numbered, immutable once Accepted, and superseded rather than edited. Status values: Proposed, Accepted, Deprecated, Superseded.

## Decision Index

| ID | Decision | Status |
| --- | --- | --- |
| ADR-001 | LangGraph stateful graph as the agent orchestration framework | Proposed |
| ADR-002 | Specialist agents with a planner, not a single general agent | Proposed |
| ADR-003 | All figures come from tools and deterministic code, never model recall | Proposed |
| ADR-004 | Ranked fallback sources with partial-report degradation | Proposed |
| ADR-005 | Mandatory citations with an automated verifier | Proposed |
| ADR-006 | Analyst sign-off before any report leaves the research team | Proposed |
| ADR-007 | Read-only tool allow-list behind a governed tool gateway | Proposed |
| ADR-008 | Treat all fetched web and news content as untrusted input | Proposed |
| ADR-009 | Tiered model routing through Amazon Bedrock behind an abstraction layer | Proposed |
| ADR-010 | Computed confidence score instead of model self-reported confidence | Proposed |
| ADR-011 | PostgreSQL checkpointing for agent state and run reproducibility | Proposed |
| ADR-012 | Independent critic agent as a pre-publication gate | Proposed |
| ADR-013 | License tagging enforced at report generation | Proposed |

---

## ADR-001: LangGraph stateful graph as the agent orchestration framework

**Status:** Proposed

**Context:** The workflow has parallel data-gathering branches, conditional paths (retry, fallback, escalate), human review points, and a need to resume after failure. The business problem names LangGraph as the intended framework.

**Decision:** Implement the research workflow as a LangGraph graph with typed state, conditional edges, parallel branches, checkpointing, and human-interrupt nodes. Deploy on ECS Fargate (or Bedrock AgentCore) with scheduling through Step Functions or EventBridge.

**Alternatives considered:**

- Single ReAct loop: simple, but weak on parallelism, error paths, and auditability.
- AWS Step Functions only: strong durability, but less natural for LLM tool-calling loops and agent state.
- Other agent frameworks: viable, but LangGraph aligns with the stated direction and has mature checkpointing.

**Consequences:**

- (+) Explicit, testable control flow with resumable runs.
- (+) Natural support for human-in-the-loop and parallel tool use.
- (-) Framework evolves quickly; version pinning and upgrade testing are required.
- (-) Team needs LangGraph expertise.

---

## ADR-002: Specialist agents with a planner, not a single general agent

**Status:** Proposed

**Context:** Research combines distinct skills: market data, news search, sentiment, strategic analysis, synthesis, critique. A single agent with every tool is harder to evaluate, constrain, and cost-control.

**Decision:** Use a planner plus specialist agents (market data, fundamentals, news, sentiment, strategy, synthesis, critic), each with narrow tools and typed inputs and outputs. The planner selects tools and sets budgets but cannot add tools outside the allow-list.

**Alternatives considered:**

- One general agent: fewer components, but poor testability and higher risk of tool misuse.
- Fixed pipeline without a planner: predictable, but cannot adapt tool selection to the request or to failures, which the business problem requires.

**Consequences:**

- (+) Per-agent evaluation, model choice, and cost tracking.
- (+) Autonomous tool selection within a safe boundary.
- (-) More interfaces to version and test.

---

## ADR-003: All figures come from tools and deterministic code, never model recall

**Status:** Proposed

**Context:** Prices, returns, volume, and ratios drive recommendations. LLMs can misremember or invent numbers. Research integrity depends on exact, current data.

**Decision:** Market data and fundamentals are retrieved through tools and stored as facts with source and timestamp. Returns, volatility, and valuation measures are computed by deterministic code. The LLM interprets and writes about facts it is given; it is not permitted to introduce figures that are not in state.

**Alternatives considered:**

- Let the LLM compute or recall figures: rejected for accuracy and auditability.
- LLM with code interpreter for all math: acceptable for ad hoc work, but not for published figures.

**Consequences:**

- (+) Numeric accuracy is measurable against vendor truth.
- (+) Strong audit trail from claim to fact.
- (-) Requires a number-grounding check that flags any figure in the text not present in state.

---

## ADR-004: Ranked fallback sources with partial-report degradation

**Status:** Proposed

**Context:** Data vendors and news APIs fail, throttle, or return stale data. The business problem requires autonomous error detection, alternative source selection, and continued analysis.

**Decision:** Define for each data need a ranked list of sources. On failure, timeout, rate limit, or staleness, the agent moves to the next source with circuit breakers per vendor. If a need cannot be met, the report proceeds, marks the gap, records substitutions, and caps the confidence level.

**Alternatives considered:**

- Fail the run on any tool error: simple, but defeats resilience goals.
- Retry only: does not help during extended outages.

**Consequences:**

- (+) High run success rate and continuity during vendor incidents.
- (+) Transparent disclosure of data gaps to analysts.
- (-) Different sources may disagree; cross-source checks and normalization are needed.
- (-) Fallback sources add license and cost considerations.

---

## ADR-005: Mandatory citations with an automated verifier

**Status:** Proposed

**Context:** The business problem requires source citations and audit trails. Uncited or miscited claims create compliance and reputational risk.

**Decision:** Every factual statement links to a fact record or article with timestamp. A verifier checks that each citation exists and supports the claim (programmatic for numbers, model-assisted for text). Reports with unsupported claims cannot proceed to review.

**Alternatives considered:**

- Citations as best-effort: fails the audit objective.
- Analyst-only verification: does not scale and is error-prone.

**Consequences:**

- (+) Traceable research and faster analyst review.
- (-) Adds latency and cost per report.
- (-) Verifier quality needs its own evaluation (citation validity of at least 98%).

---

## ADR-006: Analyst sign-off before any report leaves the research team

**Status:** Proposed

**Context:** Investment research is subject to supervision, disclosure, and conflict rules. Errors can reach clients and markets. The target is decision support that makes analysts far more productive, not unsupervised publication.

**Decision:** The agent produces drafts. A named analyst reviews and approves before distribution outside the team; Tier 1 content also follows the firm's supervisory and compliance approval workflow. Internal screening outputs are labeled as AI-generated drafts.

**Alternatives considered:**

- Autonomous publication: unacceptable regulatory and reputational risk at launch.
- Sampled review only: revisit after sustained performance (Gate G4).

**Consequences:**

- (+) Clear accountability and compliance posture.
- (-) Capacity gains are bounded by review time; mitigated by evidence-first report design.
- (-) Requires anti-complacency controls (edit tracking, seeded errors).

---

## ADR-007: Read-only tool allow-list behind a governed tool gateway

**Status:** Proposed

**Context:** Autonomous tool selection raises the risk of misuse, cost overruns, and data leakage. The agents need broad data access but no ability to act on external systems.

**Decision:** All tools are exposed through a single gateway (Lambda or MCP gateway) that enforces an allow-list, read-only access, per-tool credentials, rate limits, logging, and cost attribution. No tool can trade, send messages, or write externally without explicit human approval.

**Alternatives considered:**

- Direct tool access from agent code: faster, but weaker control and audit.
- Broad web browsing tool: flexible, but increases injection and licensing risk; allow only domain-restricted fetch.

**Consequences:**

- (+) Central control, auditing, and cost visibility.
- (+) Smaller blast radius if an agent misbehaves.
- (-) Gateway becomes a critical component needing high availability.

---

## ADR-008: Treat all fetched web and news content as untrusted input

**Status:** Proposed

**Context:** News and web pages can contain instructions, manipulative text, or coordinated promotional content. Agents that read them can be misled or hijacked.

**Decision:** Fetched content is placed in clearly delimited data sections, never in instruction context. Instruction-like text is flagged or stripped, tool calls triggered by fetched content are not permitted to expand tool access, and source reputation informs sentiment weighting. Adversarial test suites run on every release.

**Alternatives considered:**

- Rely on model robustness alone: insufficient.
- Block all web content: removes the real-time intelligence the product exists to provide.

**Consequences:**

- (+) Lower injection and manipulation risk.
- (-) Residual risk remains; defense in depth (read-only tools, allow-lists, critic) is essential.

---

## ADR-009: Tiered model routing through Amazon Bedrock behind an abstraction layer

**Status:** Proposed

**Context:** Tasks vary in difficulty and volume. Model price and quality change quickly. The firm needs a strong security posture and the ability to switch models.

**Decision:** Access models through Amazon Bedrock via VPC endpoints behind an internal interface. Route filtering, deduplication, and sentiment to small models or classifiers; planning to a mid-tier model; synthesis and critique to a stronger model. Pin versions and re-run the golden-set evaluation before any change. Escalate to a stronger model when confidence is low.

**Alternatives considered:**

- One premium model for all tasks: simpler but costly.
- Direct provider APIs: wider model choice, but separate security and contract review.

**Consequences:**

- (+) Lower cost per report and flexibility to adopt new models.
- (-) Routing logic and thresholds need tuning; more model versions to validate.

---

## ADR-010: Computed confidence score instead of model self-reported confidence

**Status:** Proposed

**Context:** The business problem requires recommendations with confidence levels. LLM self-reported confidence is poorly calibrated.

**Decision:** Compute confidence from measurable inputs: data completeness, source agreement, recency, sentiment dispersion, citation verification results, and critic findings. Calibrate periodically against historical reports and outcomes. Display confidence with the contributing factors.

**Alternatives considered:**

- Ask the LLM for a confidence percentage: easy, but unreliable and hard to defend.
- No confidence level: fails the stated requirement.

**Consequences:**

- (+) Explainable and auditable confidence.
- (-) Requires calibration data and periodic review by Model Risk Management.
- (-) Confidence is not a predictive probability; disclosures must say so.

---

## ADR-011: PostgreSQL checkpointing for agent state and run reproducibility

**Status:** Proposed

**Context:** Runs must resume after failure, pause for human review, and be reproducible for audit.

**Decision:** Persist LangGraph checkpoints to Aurora PostgreSQL. Store raw tool responses and article snapshots in S3 with versioning. Record prompts, model versions, and tool calls per run. Retain per recordkeeping rules.

**Alternatives considered:**

- In-memory state only: fails on restart and cannot support audit.
- DynamoDB checkpoints: viable; PostgreSQL chosen for transactional queries alongside facts and the vector index.

**Consequences:**

- (+) Resume, replay, and examiner-ready reconstruction.
- (-) Storage growth and sensitive-content handling require lifecycle and access controls.

---

## ADR-012: Independent critic agent as a pre-publication gate

**Status:** Proposed

**Context:** Single-pass synthesis can contain unsupported claims, one-sided arguments, stale data, or internal contradictions.

**Decision:** A critic agent, using a different prompt (and a different model where practical), reviews each draft for unsupported claims, missing counter-arguments, stale or conflicting data, and unbalanced language. Failures return the draft to synthesis with specific fixes, up to a limited number of rounds, then escalate to an analyst.

**Alternatives considered:**

- Self-review by the synthesis agent: weaker independence.
- Human review only: does not scale and delays first drafts.

**Consequences:**

- (+) Higher quality drafts and less analyst rework.
- (-) Added cost and latency; mitigated by targeted checks and skipping a full rerun when confidence is high.

---

## ADR-013: License tagging enforced at report generation

**Status:** Proposed

**Context:** News and market data licenses limit storage, display, derivative use, and redistribution. Violations create legal and financial exposure.

**Decision:** Each source record carries a license tag describing permitted uses. The report generator and distribution layer enforce display limits (for example summaries and short attributed excerpts rather than full text) and block redistribution of restricted content.

**Alternatives considered:**

- Rely on analyst awareness: error-prone at scale.
- Use only open sources: reduces quality and coverage.

**Consequences:**

- (+) Reduced legal risk and clearer vendor negotiations.
- (-) Requires accurate license metadata and legal review of vendor terms.

---

## Open Questions for Review

1. Is the firm a broker-dealer, investment adviser, or both, and which research rules apply?
2. Which market data, fundamentals, and news vendors are under contract, and do the licenses allow AI processing and caching?
3. Will outputs be internal only, client-facing, or published?
4. What rating policy defines Buy, Hold, and Sell, and what disclosures are required?
5. Which asset classes and geographies are in the first release?
6. Does an enterprise standard constrain cloud region, model providers, or the agent framework version?

## ADR Template

**ADR-NNN: Title**

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN

**Context:** What problem or force requires a decision?

**Decision:** What are we doing, stated plainly?

**Alternatives considered:** What else was evaluated, and why not?

**Consequences:** What gets better, what gets harder, what must we monitor?
