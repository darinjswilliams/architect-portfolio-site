# AI Governance Framework: Autonomous Financial Research Analyst

*Version 1.0 | Applies to all AI components of the research platform*

## 1. Purpose

This framework sets the policies, roles, controls, and evidence needed to use autonomous AI agents safely in investment research. It protects the firm and its clients from inaccurate, misleading, conflicted, or non-compliant research while allowing analysts to cover far more companies.

## 2. Governance Principles

1. **Analyst accountability.** A named analyst owns every published recommendation. The AI assists; it does not publish on its own authority.
2. **Accuracy and grounding.** Figures come from tools and verified sources. Every factual claim is cited.
3. **Transparency.** Reports disclose AI assistance, data sources, data gaps, and confidence.
4. **Fairness and balance.** Reports present counter-arguments and risks, not only supporting evidence.
5. **Integrity of markets.** The system must not use or leak material non-public information, and must not facilitate manipulation.
6. **Security and licensing compliance.** Data is protected and used within vendor license terms.
7. **Bounded autonomy.** Agents act only within an approved, read-only tool set and defined budgets.
8. **Auditability and continuous oversight.** Every run is reproducible and monitored.

## 3. Regulatory and Standards Landscape

| Area | Relevance | Governance implication |
| --- | --- | --- |
| SEC and Investment Advisers Act (fiduciary duty, marketing rule, books and records) | Advisers relying on research must act in clients' interest; communications must not be misleading; records must be kept | Disclosures, supervisory review, retention of reports and underlying data |
| FINRA Rule 2241 and related research rules (for broker-dealers) | Research analyst independence, conflicts, disclosures, supervision | Conflict checks, required disclosures, supervisory approval workflow |
| Regulation FD, insider trading law, MNPI controls | Prevents trading or research based on material non-public information | Public-source-only policy, restricted-list enforcement, detection of suspicious inputs |
| Market manipulation and fraud rules | Misleading research or coordinated sentiment exploitation | Source quality controls, review of recommendation language |
| Recordkeeping (for example SEC Rules 17a-4 and 204-2) | Retention of communications and records | Immutable storage of reports and supporting evidence |
| Copyright and data licensing | News and vendor data terms limit storage, display, and redistribution | License tagging and enforcement in report generation |
| Privacy and security law (GLBA, state laws, GDPR where applicable) | Client and employee data protection | Data minimization and access control; no client data sent to prompts without need |
| Model risk guidance (for example SR 11-7 where applicable) | Validation, documentation, monitoring of models | Treat the agent system and its scoring logic as a model under the firm's program |
| EU AI Act and emerging state AI laws | Transparency and risk-management duties may apply by use and jurisdiction | Track applicability by footprint |
| NIST AI RMF 1.0 and ISO/IEC 42001 | Voluntary frameworks | Organize controls and evidence around them |

*Legal and compliance teams should confirm which rules apply to the firm's registration type and jurisdictions.*

## 4. Roles and Responsibilities

| Role | Responsibilities |
| --- | --- |
| AI Governance Committee | Approves policy, risk appetite, and high-risk use cases; meets monthly |
| Head of Research (executive sponsor) | Owns research quality and business outcomes |
| Chief Compliance Officer and Research Compliance | Disclosures, conflicts, supervision rules, MNPI controls, record retention |
| Model Risk Management | Independent validation, challenger testing, annual review |
| AI Product Owner | Roadmap, metrics, backlog |
| Engineering and MLOps | Build, deploy, monitor, document |
| Information Security and Privacy | Access control, secrets, vendor security, incident response |
| Data and Vendor Management | Licenses, vendor performance, usage limits |
| Analysts and Supervisory Analysts | Review, edit, approve; report errors; maintain quality |
| Internal Audit | Third-line assurance |

The program follows the three lines of defense: builders and analysts, risk and compliance, internal audit.

## 5. Risk Classification

| Tier | Definition | Examples | Required controls |
| --- | --- | --- | --- |
| Tier 1 (High) | Output could reach clients, the public, or trading decisions | Published recommendations, client-facing summaries | Full validation, compliance review, analyst sign-off on every report |
| Tier 2 (Medium) | Internal decision support | Internal screening reports, watchlist alerts | Validation, sampled review, clear internal-use labeling |
| Tier 3 (Low) | Operational assistance | News deduplication, formatting | Standard testing and monitoring |

## 6. Lifecycle Controls

| Stage | Required controls | Evidence |
| --- | --- | --- |
| Intake | Use-case approval, risk tier, intended-use statement, data-source and license review | Use-case record |
| Design | Tool allow-list, autonomy limits, budget limits, prompt-injection threat model | Design review sign-off |
| Build | Version control of prompts, graphs, tools, and models; secure coding | Repository history |
| Validation | Golden-set evaluation, numeric accuracy tests, citation checks, adversarial testing, independent MRM review | Validation report |
| Approval | Committee approval for Tier 1; product owner and compliance for Tier 2 and 3 | Signed approval |
| Deployment | Staged rollout, rollback plan, feature flags per report type | Release record |
| Monitoring | Accuracy, hallucination, failure rates, drift, cost, analyst feedback | Dashboards, monthly report |
| Change management | Re-validation on any model, prompt, tool, or data-source change | Change ticket and regression results |
| Retirement | Decommission and retention handling | Retirement record |

## 7. Autonomy and Human Oversight

- **Tool boundaries:** only approved read-only tools. No trade execution, no outbound communications, and no writes to external systems without human approval.
- **Budgets:** per-run limits on steps, tool calls, time, and spend; breaches end the run with a partial report.
- **Human review points:** analyst approval is required before any report is distributed outside the research team; Tier 1 reports also need supervisory or compliance sign-off per firm policy.
- **Override rights:** analysts can edit any content and must not publish unreviewed AI text as their own analysis.
- **Escalation triggers:** low confidence, major data gaps, conflicting sources, critic failures, restricted-list matches, or unusual market events route to a human.
- **Anti-complacency:** edit-rate tracking, seeded-error tests, and periodic blind reviews of reports.
- **Training:** analysts complete training on AI limits, hallucination risk, and review standards.

## 8. Content Integrity: Accuracy, Citations, and Hallucination Control

1. All prices, returns, volumes, and ratios come from tools or deterministic code.
2. Every factual statement links to a fact record or article with timestamp.
3. An automated citation verifier checks that cited sources support the claims; unsupported claims block publication.
4. A critic agent challenges drafts for missing counter-arguments, stale data, and contradictions.
5. Reports state data freshness and gaps and cap confidence when data is incomplete.
6. Zero tolerance for fabricated sources; any occurrence is a Severity 1 or 2 incident.

## 9. Recommendation Standards

- Buy, Hold, and Sell labels use a documented rating policy defined by Research Compliance.
- Each recommendation includes confidence level, key drivers, counter-arguments, risks, time horizon, and what would change the view.
- Language is constrained to approved templates; promissory or guarantee-style language is blocked.
- Required disclosures (AI assistance, conflicts, general-information notices) are appended automatically.
- Back-testing and outcome tracking are used to calibrate confidence and spot systematic bias, not to market predictive performance.

## 10. Market Integrity and Conflicts

- **Public sources only:** the platform ingests only licensed or public information. Sources that may contain MNPI are blocked.
- **Restricted and watch lists:** requests on restricted securities are blocked or routed to Compliance.
- **Conflict checks:** holdings, investment banking relationships, and analyst positions are checked before publication where the firm requires it.
- **Prompt-injection and manipulation defense:** fetched content is treated as untrusted; suspicious or coordinated promotional content is flagged; source reputation scoring informs sentiment weight.
- **Information barriers:** access controls mirror the firm's existing barriers.

## 11. Data Governance and Licensing

| Control | Standard |
| --- | --- |
| License tagging | Every source record carries usage rights; display, storage, and redistribution limits are enforced |
| Data minimization | No client or personal data in prompts unless required |
| Retention | Reports and supporting snapshots retained per recordkeeping rules, then deleted on schedule |
| Access | Role-based; team-level report visibility; quarterly review |
| Lineage | Every claim traces to fact, source, and retrieval time |
| Vendors | Due diligence, contractual data-use limits, no training on firm data, annual reassessment |
| Secrets | Rotating credentials, scoped per tool |

## 12. Performance Thresholds and Monitoring

| Metric | Initial threshold | Action if breached |
| --- | --- | --- |
| Numeric accuracy against vendor truth | 99.5% or higher | Pause the affected tool or agent; investigate |
| Citation validity | 98% or higher verified | Block release; fix retrieval or prompts |
| Fabricated source rate | 0 tolerated | Immediate incident review |
| Analyst rejection rate | Investigate above 20% | Root-cause review |
| Analyst edit rate | Investigate if near zero | Check for rubber-stamping |
| Run success rate | 99% or higher produce a report | Reliability review |
| Fallback usage by vendor | Tracked | Vendor review if persistent |
| Confidence calibration | Reviewed quarterly | Recalibrate scoring |
| Cost per report | Within budget | FinOps review |

Thresholds are starting values to be calibrated during the pilot.

## 13. Incident Management

| Severity | Example | Response |
| --- | --- | --- |
| Sev 1 | Published report with fabricated data or sources; MNPI exposure; data breach | Suspend publication; notify Compliance and CRO; assess regulatory obligations and client notification |
| Sev 2 | Systematic numeric error, citation failures, license violation | Constrain scope; fix and re-validate within 5 business days |
| Sev 3 | Isolated errors, UX issues, vendor outage | Standard ticket; monthly review |

Every incident gets a post-incident review and control update.

## 14. Third-Party and Model Management

- Maintain an approved register of models, data vendors, and tools with versions, regions, and data-handling terms.
- Pin model versions; run the golden-set evaluation before adopting updates.
- Require contractual commitments on data use, retention, security, and change notification.
- Maintain fallback vendors and a manual research procedure for outages.

## 15. Audit and Reporting

- **Monthly:** governance dashboard (accuracy, citations, incidents, edits, cost).
- **Quarterly:** compliance review of sampled reports; calibration review; access review.
- **Annually:** independent model validation and internal audit review.
- **On demand:** examiner-ready package with policies, validation results, run traces, and reproducible reports.

## 16. Implementation Checklist

- [ ] Charter the AI Governance Committee and approve this framework
- [ ] Define the firm's rating policy, disclosures, and approved language with Research Compliance
- [ ] Approve the tool allow-list and vendor licenses
- [ ] Build the golden evaluation set and adversarial test suite
- [ ] Stand up tracing, dashboards, and immutable report storage
- [ ] Train analysts and supervisors
- [ ] Complete independent validation and a shadow period before wider release
