# AI Governance Framework: Mortgage Underwriting

*Version 1.0 | Applies to all AI components in the underwriting platform*

## 1. Purpose

This framework sets the policies, roles, controls, and evidence required to use AI safely and lawfully in mortgage underwriting. It protects borrowers, satisfies regulators, and gives the business confidence to scale AI beyond a pilot.

## 2. Governance Principles

1. **Human accountability.** A licensed underwriter owns every credit decision. AI never issues a final approval or denial.
2. **Fairness.** AI must not create or amplify discrimination on any basis prohibited by ECOA, the Fair Housing Act, or state law.
3. **Transparency and explainability.** Every recommendation can be traced to source documents and cited rules.
4. **Accuracy and reliability.** Performance is measured, monitored, and held to defined thresholds.
5. **Privacy and security.** Borrower data is minimized, protected, and used only for its stated purpose.
6. **Accountability and auditability.** Every AI action is logged and reproducible.
7. **Continuous oversight.** Risk is reviewed throughout the lifecycle, not only at launch.

## 3. Regulatory and Standards Landscape

| Area | Requirement | Governance implication |
| --- | --- | --- |
| ECOA / Regulation B | No discrimination; specific reasons required for adverse action | Reason codes traceable to documented factors; no protected-class inputs or proxies |
| Fair Housing Act | Prohibits discrimination in housing credit | Disparate-impact testing before and after release |
| FCRA | Permissible purpose, accuracy, adverse action notices tied to credit data | Controlled use of credit reports; dispute handling |
| GLBA | Safeguards for nonpublic personal information | Encryption, access control, vendor oversight |
| HMDA | Reporting accuracy | Data lineage from decision to reported fields |
| UDAAP | Unfair, deceptive, or abusive practices | Accurate borrower communications; no misleading AI claims |
| SR 11-7 / OCC 2011-12 (model risk management) | Validation, documentation, ongoing monitoring of models | Treat AI components as models under the MRM program |
| State laws (for example Colorado AI Act, NYC Local Law 144 analogues, state privacy laws) | Emerging high-risk AI duties | Track and map obligations by lending footprint |
| NIST AI RMF 1.0 and ISO/IEC 42001 | Voluntary frameworks | Adopt as the organizing structure for controls |

*Legal and compliance teams should confirm applicability and current requirements for the lender's specific footprint and charter.*

## 4. Roles and Responsibilities

| Role | Responsibilities |
| --- | --- |
| AI Governance Committee | Approves policy, risk appetite, and high-risk use cases; meets monthly; chaired by the Chief Risk Officer |
| Executive Sponsor (COO or Head of Lending) | Owns business outcomes and funding |
| Model Risk Management | Independent validation, challenger testing, annual review |
| Compliance and Fair Lending | Regulatory mapping, disparate-impact testing, adverse-action review |
| Chief Underwriter | Defines override rules and quality standards; owns human review process |
| AI Product Owner | Owns roadmap, performance metrics, and backlog |
| Engineering and MLOps | Builds, deploys, monitors, and documents systems |
| Information Security and Privacy | Security controls, data protection, vendor risk |
| Internal Audit | Third-line assurance over the program |

The organization follows a **three lines of defense** model: the business and engineering teams (first line), risk and compliance (second line), and internal audit (third line).

## 5. AI Risk Classification

Every AI component is tiered at intake.

| Tier | Definition | Examples | Required controls |
| --- | --- | --- | --- |
| Tier 1 (High) | Directly influences credit decisions or borrower outcomes | Guideline checking, risk recommendation, conditions | Full validation, fair lending testing, committee approval, human review of every file |
| Tier 2 (Medium) | Produces data used by Tier 1 components | Extraction, cross-verification | Accuracy validation, confidence gating, sampled QC |
| Tier 3 (Low) | Operational support with no decision influence | Document classification, internal search | Standard testing and monitoring |

## 6. Model and Prompt Lifecycle Controls

| Stage | Required controls | Evidence |
| --- | --- | --- |
| Intake | Use-case approval, risk tier, data-source review, intended-use statement | Use-case record |
| Design | Data minimization, protected-attribute exclusion review, explainability design | Design review sign-off |
| Build | Version control of prompts, schemas, and models; secure coding standards | Repository history |
| Validation | Golden-set evaluation, adversarial testing, bias testing, independent MRM review | Validation report |
| Approval | Governance committee decision for Tier 1; product owner for Tier 2 and 3 | Signed approval |
| Deployment | Staged rollout (shadow, then limited, then full), rollback plan | Release record |
| Monitoring | Accuracy, drift, overrides, fairness metrics, guardrail triggers | Dashboards and monthly report |
| Change management | Re-validation on any model, prompt, or guideline change | Change ticket and regression results |
| Retirement | Decommission plan, data retention handling | Retirement record |

## 7. Human Oversight Standards

- **Decision authority:** only an underwriter can approve, suspend, or deny a loan.
- **Evidence-first review:** the workbench shows source evidence and rule citations next to every AI finding.
- **Mandatory escalation triggers:** low-confidence fields, unresolved discrepancies, rule failures, suspected fraud, non-standard properties or borrowers.
- **Override rights:** underwriters can override any AI output and must record the reason.
- **Anti-complacency controls:** random QC sampling, periodic seeded-error tests, and tracking of acceptance rates by underwriter to detect rubber-stamping.
- **Training:** underwriters complete training on AI limits, failure modes, and escalation before getting access.

## 8. Fair Lending and Bias Management

1. **Input controls:** no protected characteristics, and no known proxies (for example ZIP code used as a demographic stand-in), enter decision logic.
2. **Pre-release testing:** compare outcomes, exception rates, and condition rates across protected groups using proxy methods such as BISG where direct data is not collected.
3. **Ongoing testing:** quarterly disparate-impact analysis; thresholds trigger investigation (for example adverse impact ratio below 0.80).
4. **Less-discriminatory-alternative review:** when disparities appear, document the business need and evaluate alternatives.
5. **Consistency measurement:** track underwriter-to-underwriter and AI-to-underwriter variance. This directly supports the consistency goal.
6. **Remediation:** documented corrective action and re-validation before resuming normal operation.

## 9. Explainability and Adverse Action

- Every recommendation includes cited guideline sections, source documents, and calculation traces.
- Adverse action reasons are drawn from structured reason codes confirmed by the underwriter, never free-form model text.
- Borrower-facing language is reviewed by Compliance and generated from approved templates.
- Records are retained to reconstruct any decision, including model version, prompts, retrieved rules, and human actions.

## 10. Data Governance and Privacy

| Control | Standard |
| --- | --- |
| Data minimization | Send only the fields and text needed for each task to a model |
| Classification | All borrower data treated as NPI; SSN and account numbers receive field-level protection |
| Training use | No borrower data used to train or fine-tune third-party foundation models |
| Retention | Per legal hold and lender retention schedule; automated deletion afterward |
| Access | Role-based, per-loan scoping, quarterly access review |
| Non-production | Synthetic or masked data only |
| Lineage | Every extracted value traces to document, page, and extraction version |
| Third parties | Vendor due diligence, contractual data-use limits, annual reassessment |

## 11. Performance Thresholds and Monitoring

| Metric | Threshold (initial) | Action if breached |
| --- | --- | --- |
| Critical-field extraction accuracy | At least 98% | Pause automation for the field; route to manual |
| Underwriter override rate | Investigate if above 15% or below 2% | Root-cause review (quality or complacency) |
| Guideline citation accuracy | At least 99% | Block release; fix retrieval |
| Hallucinated rule rate | 0 tolerated in QC samples | Immediate incident review |
| Adverse impact ratio | 0.80 or higher | Fair lending investigation |
| Time-to-decision | Tracked against baseline | Report to steering group |
| Drift indicators | Defined per model | Re-validate |

Thresholds are starting values; MRM and Compliance calibrate them during the pilot.

## 12. Incident Management

| Severity | Example | Response |
| --- | --- | --- |
| Sev 1 | Systemic wrong decisions, data breach, evidence of discriminatory outcomes | Suspend AI recommendations; notify CRO and Compliance immediately; regulator assessment |
| Sev 2 | Accuracy below threshold, guardrail failure | Constrain scope; fix and re-validate within 5 business days |
| Sev 3 | Isolated errors, UX issues | Standard ticket; monthly review |

All incidents get a post-incident review, lessons learned, and control updates.

## 13. Third-Party and Foundation Model Management

- Maintain an approved-model register with version, provider, region, and data-handling terms.
- Pin model versions; re-run the golden-set evaluation before adopting any update.
- Require contractual commitments on data use, retention, security, and change notification.
- Maintain a fallback model or manual procedure for provider outages.

## 14. Audit and Reporting

- **Monthly:** governance dashboard to the committee (accuracy, overrides, fairness, incidents, cost).
- **Quarterly:** fair lending report and access review.
- **Annually:** independent MRM revalidation and internal audit review.
- **On demand:** examiner-ready package with policies, validation reports, monitoring history, and decision reconstructions.

## 15. Implementation Checklist

- [ ] Charter the AI Governance Committee and approve this framework
- [ ] Register the platform and its components with risk tiers
- [ ] Complete fair lending design review and select testing methodology
- [ ] Build the golden evaluation set from historical loans
- [ ] Stand up monitoring dashboards and the audit log
- [ ] Train underwriters and QC staff
- [ ] Run shadow mode and complete independent validation before go-live
