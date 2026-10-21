# Migration Roadmap: From Manual to Autonomous Research Analysis

*Version 1.0 | Approach: phased, evidence-gated, analyst-in-the-loop*

## 1. Objective and Approach

Move from manual, analyst-driven data gathering and synthesis to an autonomous research workflow without compromising research quality or compliance. The roadmap follows **crawl, walk, run**: begin with internal screening where errors are cheap, prove accuracy and citation integrity, then expand to published research. Every phase ends with a go/no-go gate.

The end state: analysts supervise and refine agent-produced research, covering 10-20x more companies, and spend most of their time on judgment rather than collection.

## 2. Current State and Target State

| Dimension | Current state | Target state |
| --- | --- | --- |
| Time per company | 4 to 6 hours | 5 to 10 minutes for the agent draft, plus analyst review |
| Analyst time split | 60-70% data collection, 30-40% analysis | Majority of time on analysis and judgment |
| Data and news | Manual gathering across sources | Autonomous gathering with fallback sources |
| Consistency | Varies by analyst | Standard structure, metrics, and rating policy |
| Transparency | Notes and spreadsheets | Citations, confidence, risks, full run trace |
| Coverage | Limited by analyst hours | 10-20x per analyst |
| Resilience | Delays when a source is unavailable | Automatic alternative sources and partial reports |

## 3. Roadmap Overview

| Phase | Timing (indicative) | Theme | Agent role | Gate |
| --- | --- | --- | --- | --- |
| 0. Foundation | Months 0 to 2 | Mobilize, govern, prepare | None in production | Governance, data licenses, baseline, golden set ready |
| 1. Prototype | Months 2 to 4 | Core agent on a small universe | Drafts for internal screening, analysts check everything | Numeric and citation accuracy at target |
| 2. Pilot | Months 4 to 7 | Pilot desk, internal use | Reports used internally alongside manual work | Analyst acceptance, quality at or above manual |
| 3. Expand | Months 7 to 10 | More sectors, resilience, monitoring | Broader coverage; watchlist refresh and alerts | Reliability and compliance results |
| 4. Publish | Months 10 to 14 | Supervised release of external or client-facing research | Drafts feed published work under sign-off | Compliance approval, validation passed |
| 5. Optimize | Month 14 onward | Scale and continuous improvement | Proactive monitoring, event-driven updates | Committee approval per expansion |

Timelines depend on firm size, data contracts, and compliance cycles.

## 4. Phase Details

### Phase 0: Foundation (Months 0 to 2)

**Goals:** establish governance, data access, and a measured baseline.

- Charter the AI Governance Committee; approve policies, risk tiers, and the tool allow-list
- Measure baseline: time per report, time split, coverage per analyst, revision cycles, error and rework rates
- Confirm data vendors and licenses (prices, fundamentals, news, filings) including usage rights for AI processing
- Define the rating policy, report template, and disclosure language with Research Compliance
- Stand up the AWS foundation: accounts, networking, secrets, logging, CI/CD
- Build the golden set: reference companies and dates with verified facts and analyst-written reports
- Select the pilot universe (for example 25 to 50 companies in two sectors) and pilot analysts

**Exit criteria:** governance approved, licenses confirmed, baseline documented, golden set ready.

### Phase 1: Prototype (Months 2 to 4)

**Goals:** prove the core agent loop on a small universe.

- Build the LangGraph workflow: planner, market data, news, sentiment, synthesis, critic
- Implement tool gateway, caching, and the fallback source map
- Implement deterministic metrics (returns, volatility, volume, valuation measures)
- Implement citation verifier and report template
- Analysts check every number and citation; corrections feed evaluation sets
- Begin prompt-injection and adversarial testing

**Exit criteria:** numeric accuracy at or above 99.5%; citation validity at or above 98%; zero fabricated sources in the evaluation set; report in under 10 minutes.

### Phase 2: Pilot (Months 4 to 7)

**Goals:** put reports in front of pilot analysts for real work, internally.

- Release the analyst workspace with evidence-first report view and edit tracking
- Run side by side with the manual process for a defined period; compare quality and time
- Add strategic analysis (filings, transcripts) and risk assessment sections
- Tune confidence scoring and escalation rules
- Collect analyst feedback; track edit distance and rejection rate
- Complete first independent model validation of the confidence and rating logic

**Exit criteria:** analyst review time at target; quality rated at or above manual by supervisors; no Severity 1 incidents; cost per report within budget.

### Phase 3: Expand (Months 7 to 10)

**Goals:** scale coverage and harden reliability.

- Add sectors and larger watchlists; add scheduled and event-triggered refreshes
- Add alerting on material news with draft updates
- Harden resilience: circuit breakers, load tests for earnings season, disaster recovery test
- Add monitoring dashboards and monthly governance reporting
- Implement incremental updates and cost controls from the Cost Optimization Plan

**Exit criteria:** run success rate at or above 99%; coverage per analyst target met; DR test passed; compliance sample review clean.

### Phase 4: Publish (Months 10 to 14)

**Goals:** allow agent-assisted output into published or client-facing research under supervision.

- Complete compliance review of disclosures, conflicts checks, and supervisory workflow
- Integrate restricted-list and conflict checks
- Connect to research distribution systems with approval gates
- Enable immutable retention of published reports and supporting evidence
- Extend training to all analysts and supervisors

**Exit criteria:** Research Compliance and MRM sign-off; audit-ready evidence package; analyst adoption confirmed.

### Phase 5: Optimize (Month 14 onward)

**Goals:** continuous improvement and carefully governed expansion.

- Quarterly model, vendor, and architecture reviews
- Expand asset classes or geographies, adding data sources and rules as needed
- Explore proactive monitoring: agents watching portfolios and surfacing changes for analysts
- Use outcome data to improve confidence calibration and evidence ranking

## 5. Workstreams

| Workstream | Key activities |
| --- | --- |
| Governance and compliance | Policies, rating policy, disclosures, MNPI and conflicts controls, validation |
| Data and vendors | Licenses, integrations, caching, fallback sources, quality checks |
| Agents and AI | Graph, prompts, tools, evaluation harness, red-teaming |
| Platform | AWS foundation, tracing, security, reliability, FinOps |
| Product and UX | Analyst workspace, report format, alerts, feedback loops |
| Change management | Analyst involvement, training, communications, role evolution |

## 6. Change Management and People

- **Position it correctly:** analysts become supervisors of research agents and focus on judgment, relationships, and original insight.
- **Co-design with senior analysts** and use their reviews to shape report quality.
- **Set review standards** so analysts do not publish unreviewed AI text.
- **Train** on strengths, failure modes (hallucination, stale data, injection), and escalation.
- **Measure and share** time savings and quality improvements; share lessons from errors openly.
- **Update roles and incentives** so coverage expansion and quality are both rewarded.

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Fabricated or incorrect figures reach published research | Low to medium | Very high | Tool-sourced numbers, verifier, critic, mandatory analyst review |
| Data license restricts AI use or storage | Medium | High | Early license review; negotiate terms; enforce license tags |
| Vendor outage or rate limits | High | Medium | Fallback map, caching, circuit breakers |
| Prompt injection via web content | Medium | High | Untrusted-content isolation, read-only tools, allow-listed domains |
| Analyst distrust or low adoption | Medium | High | Co-design, evidence-first UI, transparent metrics |
| Over-reliance on agent output | Medium | High | Edit tracking, spot checks, seeded errors |
| Regulatory change or examiner scrutiny | Medium | High | Early compliance engagement, audit-ready evidence |
| Cost overruns from loops or heavy usage | Medium | Medium | Budgets, guardrails, depth tiers |
| Model changes or deprecations | Medium | Medium | Pinned versions, abstraction layer, regression suite |

## 8. Success Metrics by Phase

| Metric | Baseline | Phase 1 | Phase 3 | Phase 4 target |
| --- | --- | --- | --- | --- |
| Time to first draft | 4 to 6 hours | Under 10 minutes | Under 10 minutes | Under 10 minutes |
| Analyst time per report (including review) | 4 to 6 hours | 2 hours | 1 to 1.5 hours | 1 hour or less |
| Numeric accuracy | n/a | 99.5% or higher | 99.5% or higher | 99.5% or higher |
| Citation validity | n/a | 98% or higher | 98% or higher | 99% or higher |
| Fabricated sources | n/a | 0 | 0 | 0 |
| Companies covered per analyst | Baseline | 2x | 5x to 10x | 10x to 20x |
| Run success rate | n/a | 95% or higher | 99% or higher | 99% or higher |
| Cost per report | Baseline | Tracking | 70% lower labor cost | 80% or more lower |

Targets are planning values to refine with pilot data.

## 9. Dependencies and Assumptions

- Executive sponsorship from Research leadership and a funded cross-functional team
- Data vendor contracts that permit AI processing, caching, and internal display
- Compliance agreement on rating policy, disclosures, and review workflow
- Access to historical reports for the golden set and calibration
- Analyst time commitment for pilot, review, and feedback

## 10. Decision Gates

Each gate is reviewed by the AI Governance Committee using dashboard evidence.

| Gate | Decision | Evidence required |
| --- | --- | --- |
| G0 | Begin build | Governance charter, licenses, baseline |
| G1 | Move to pilot | Accuracy, citation, and reliability results on the evaluation set |
| G2 | Expand coverage | Analyst acceptance, quality versus manual, cost results |
| G3 | Allow published output under supervision | Compliance and MRM sign-off, audit-ready evidence |
| G4 | Expand scope or autonomy | Sustained performance, incident-free period, committee approval |

## 11. Immediate Next Steps (First 30 Days)

1. Name the executive sponsor and the product owner
2. Charter the governance committee and engage Research Compliance
3. Inventory current data sources and review their licenses for AI use
4. Select the pilot universe and pilot analysts
5. Begin baseline measurement of time per report and time split
6. Start assembling the golden evaluation set
