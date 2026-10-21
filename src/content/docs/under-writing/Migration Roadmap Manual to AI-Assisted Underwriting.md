# Migration Roadmap: From Manual to AI-Assisted Underwriting

*Version 1.0 | Approach: phased, risk-gated, human-in-the-loop at every stage*

## 1. Objective and Approach

Move from a fully manual underwriting process to an AI-assisted one without disrupting loan production or compliance. The roadmap follows a **crawl, walk, run** pattern: prove value with low-risk assistance, expand scope as accuracy and trust are demonstrated, and only then optimize for scale. Every phase ends with a go/no-go gate.

The end state keeps the underwriter as the decision maker, supported by AI that prepares the file.

## 2. Current State and Target State

| Dimension | Current state | Target state |
| --- | --- | --- |
| Review time | 3 to 5 days per file | Same-day preliminary review |
| Document handling | Manual reading and keying | Automated classification, extraction, cross-checking |
| Consistency | Varies by underwriter | Uniform guideline checks with cited rules |
| Underwriter role | Data gatherer and decision maker | Exception reviewer and decision maker |
| Cost per file | High, labor-driven | Lower, with controlled AI run cost |
| Audit trail | Notes and emails | Complete, reconstructable record |

## 3. Roadmap Overview

| Phase | Timing (indicative) | Theme | AI role | Gate |
| --- | --- | --- | --- | --- |
| 0. Foundation | Months 0 to 2 | Mobilize, govern, prepare | None in production | Governance approved; data and baselines ready |
| 1. Assist | Months 3 to 5 | Document intelligence | Classifies and extracts; underwriters verify | Extraction accuracy at target |
| 2. Shadow | Months 6 to 8 | Full pipeline in parallel | Produces recommendations; not shown to decide | Agreement and fairness thresholds met |
| 3. Augment | Months 9 to 12 | Live decision support | Recommendations visible to underwriters on a limited book | Quality, compliance, and productivity validated |
| 4. Scale | Months 13 to 18 | Broaden and optimize | Expanded products, channels, and volume | Sustained KPIs; audit clean |
| 5. Optimize | Month 18 onward | Continuous improvement | Advanced automation of low-risk files | Governance committee approval per expansion |

Timelines depend on lender size, LOS complexity, and regulatory review cycles.

## 4. Phase Details

### Phase 0: Foundation (Months 0 to 2)

**Goals:** establish governance, data access, and a measured baseline.

- Charter the AI Governance Committee; approve policies and risk tiers
- Measure baseline: cycle time, touches per file, cost per file, defect and repurchase rates, underwriter variance
- Stand up the AWS landing zone: accounts, networking, KMS, logging, IAM
- Select pilot scope: one loan product (for example conventional purchase) and one region or team
- Assemble the **golden set**: several hundred historical loans with known outcomes and documents
- Ingest and version guideline documents (agency guides and lender overlays)
- Confirm LOS integration approach and vendor contracts; complete security and privacy review

**Exit criteria:** governance approved, baseline documented, golden set ready, secure environment live.

### Phase 1: Assist (Months 3 to 5)

**Goals:** deliver visible time savings with the lowest risk by automating document handling.

- Build ingestion, classification, and extraction pipelines (Textract plus LLM)
- Deploy the underwriter workbench with side-by-side source evidence
- Underwriters verify every extracted field; corrections feed the evaluation set
- Implement the deterministic calculation engine and test against known loans
- Begin missing-document detection and automated borrower requests

**Exit criteria:** critical-field extraction accuracy at or above target (98%); measurable reduction in data-entry time; calculation engine matches golden-set results.

### Phase 2: Shadow Mode (Months 6 to 8)

**Goals:** prove the full pipeline without influencing decisions.

- Add verification, guideline, and decision-support agents
- Run on live loans in parallel; underwriters work as usual and do not see AI conclusions
- Compare AI recommendations with final human decisions; analyze every disagreement
- Run the first fair lending and disparate-impact analysis
- Independent model risk validation of Tier 1 components
- Tune confidence thresholds and exception routing

**Exit criteria:** agreement with final decisions at target on in-scope loans; no unresolved fairness findings; MRM validation signed off; guideline citation accuracy at target.

### Phase 3: Augment (Months 9 to 12)

**Goals:** put recommendations in front of underwriters and capture productivity gains.

- Release to a limited group of underwriters on the pilot product
- Show recommendations, risk flags, and suggested conditions with evidence
- Track override rate, time per file, and quality-control findings
- Run QC sampling at an elevated rate and seed known errors to test attentiveness
- Train underwriters; collect feedback; iterate on the workbench
- Start monthly governance dashboards

**Exit criteria:** cycle time and files-per-underwriter targets met; QC results equal or better than manual; no compliance incidents; underwriter adoption confirmed.

### Phase 4: Scale (Months 13 to 18)

**Goals:** extend coverage and harden operations.

- Add loan products (for example FHA, VA, refinance) and additional teams and regions
- Add document types and additional income structures (self-employed, rental) with specialized extraction
- Integrate additional vendors (verification of employment, IRS transcripts, AVMs)
- Implement multi-AZ resilience, disaster recovery testing, and capacity planning
- Complete the first full audit cycle and examiner-readiness package
- Apply the cost levers from the Cost Optimization Plan

**Exit criteria:** KPIs sustained across products; internal audit review passed; DR test passed; cost per file at target.

### Phase 5: Optimize (Month 18 onward)

**Goals:** continuous improvement and carefully governed automation.

- Quarterly model and architecture reviews as new models become available
- Consider straight-through preliminary clearance for low-risk, clean files, with sampled human QC, subject to committee and compliance approval
- Expand borrower-facing automation (status updates, document requests)
- Use accumulated data for pricing, pipeline forecasting, and quality analytics

## 5. Workstreams

| Workstream | Key activities across phases |
| --- | --- |
| Governance and compliance | Policies, risk tiering, fair lending testing, regulator engagement |
| Platform and data | AWS foundation, pipelines, knowledge base, audit log |
| AI and agents | Extraction, verification, guideline, decision-support agents; evaluation harness |
| Integration | LOS, credit and verification vendors, workbench |
| Change management | Underwriter involvement, training, communications, role evolution |
| Operations and FinOps | Monitoring, incident response, cost control, support model |

## 6. Change Management and People

- **Position it correctly:** the goal is making each underwriter more productive and the work more interesting, not replacing underwriters.
- **Involve senior underwriters early** as design partners and validators; their overrides and feedback shape the product.
- **Train** on how the system works, what it gets wrong, and when to escalate.
- **Redefine roles:** shift effort from data gathering to exception handling, complex files, and mentoring.
- **Communicate** progress and results regularly; publish wins and lessons learned.
- **Capacity planning:** use productivity gains to absorb volume growth and reduce overtime and contractor spend.

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Extraction quality below target on poor scans | Medium | High | Confidence gating, borrower re-upload, human exception queue |
| Underwriter distrust or low adoption | Medium | High | Co-design, evidence-first UI, transparent metrics |
| Fair lending finding delays launch | Low to medium | High | Early testing, documented alternatives, remediation plan |
| LOS integration complexity | Medium | Medium | Early technical discovery, API-first or file-based fallback |
| Guideline changes break rule checks | High | Medium | Versioned knowledge base, regression suite, change alerts |
| Model vendor changes or deprecations | Medium | Medium | Pinned versions, abstraction layer, tested alternates |
| Cost overruns | Medium | Medium | Per-file cost tracking, budgets, guardrails |
| Over-reliance on AI (automation bias) | Medium | High | QC sampling, seeded errors, override monitoring |
| Data breach | Low | Very high | Defense in depth, least privilege, monitoring, incident plan |

## 8. Success Metrics by Phase

| Metric | Baseline | Phase 1 | Phase 3 | Phase 4 target |
| --- | --- | --- | --- | --- |
| Preliminary review time | 3 to 5 days | 2 to 3 days | Same day for clean files | Same day for most files |
| Critical-field extraction accuracy | n/a | 98% or higher | 98% or higher | 99% or higher |
| Files per underwriter per month | Baseline | 1.3x | 2x | 3x |
| Underwriter override rate | n/a | n/a | Monitored (2% to 15% band) | Stable within band |
| QC defect rate | Baseline | No worse | No worse | Improved |
| Disparate impact ratio | n/a | n/a | 0.80 or higher | 0.80 or higher |
| Cost per file | Baseline | Tracking | 30% lower | 50% to 65% lower |

Targets are planning values to be refined with pilot data.

## 9. Dependencies and Assumptions

- Executive sponsorship and a funded cross-functional team (product, engineering, risk, compliance, underwriting)
- Access to historical loan files for the golden set, with appropriate privacy handling
- LOS vendor support for API access or structured export
- Legal and compliance review of AI use in underwriting for the lender's jurisdictions
- Agreement from investors or agencies on documentation requirements where relevant

## 10. Decision Gates

Each gate is reviewed by the AI Governance Committee with evidence from the monitoring dashboards.

| Gate | Decision | Evidence required |
| --- | --- | --- |
| G0 | Begin build | Governance charter, baseline, secure environment |
| G1 | Move to shadow mode | Extraction accuracy, calculation accuracy, workbench adoption |
| G2 | Go live with recommendations | Agreement rates, MRM validation, fair lending results |
| G3 | Expand scope | Productivity, QC, compliance, cost results |
| G4 | Consider limited straight-through processing | Sustained performance over multiple quarters, regulatory comfort |

## 11. Immediate Next Steps (First 30 Days)

1. Confirm executive sponsor and name the product owner
2. Charter the governance committee and schedule the first meeting
3. Select the pilot product, region, and underwriting team
4. Start baseline measurement
5. Request historical files and begin golden-set assembly
6. Begin LOS integration discovery and security review
