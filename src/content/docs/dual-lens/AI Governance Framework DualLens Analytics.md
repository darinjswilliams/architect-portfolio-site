# AI Governance Framework: DualLens Analytics

*Version 1.0 | Applies to all AI components of the DualLens platform*

## 1. Purpose

This framework sets the policies, roles, controls, and evidence required to use RAG and LLM-based scoring responsibly in investment analysis. DualLens produces rankings that investors may rely on, so the system must be accurate, transparent, fair in how it treats companies, compliant with financial and data-licensing rules, and honest about its limits.

## 2. Governance Principles

1. **Decision support, not advice.** DualLens informs human judgment. It does not recommend trades or personalize advice.
2. **Grounding.** Qualitative claims come from retrieved documents with citations. Quantitative figures come from data and code.
3. **Transparency of method.** The scoring rubric, weights, data sources, and limitations are documented and visible to users.
4. **Honest signaling.** Evidence gaps, stale documents, and low confidence are shown, never hidden inside a number.
5. **Fairness across companies.** Scoring must not systematically favor companies for reasons unrelated to substance, such as size, language, or how much they publish.
6. **Integrity of markets.** Only public or properly licensed information is used; no material non-public information.
7. **Security, privacy, and licensing compliance.**
8. **Reproducibility and continuous oversight.**

## 3. Regulatory and Standards Landscape

| Area | Relevance | Governance implication |
| --- | --- | --- |
| SEC and FINRA rules on communications, research, and marketing (for example the Investment Advisers Act marketing rule, FINRA research rules where applicable) | Rankings shown to clients or published are communications and must not be misleading | Disclosures, supervisory review, substantiation of performance claims |
| SEC scrutiny of "AI washing" | Overstated AI claims by companies, and by firms describing their own AI, are an enforcement focus | Evidence-based scoring; accurate descriptions of what DualLens does |
| Insider trading and Regulation FD | Prevents use of material non-public information | Public or licensed sources only; source provenance recorded |
| Market data licensing and website terms of use | Yahoo Finance and similar sources restrict automated or commercial use | Licensed provider in production; license tags enforced |
| Copyright | Annual reports, transcripts, and third-party research may be restricted | Store and display within license; short attributed excerpts only |
| Privacy and security law (GLBA, state laws, GDPR where applicable) | User data and any client data | Minimization, access control, no client data in prompts without need |
| Model risk management guidance (for example SR 11-7 where applicable) | Scoring models need validation and monitoring | Treat the rubric and ranking as models under the firm's program |
| EU AI Act and emerging state AI laws | May impose transparency duties depending on use and jurisdiction | Track applicability by footprint |
| NIST AI RMF 1.0 and ISO/IEC 42001 | Voluntary frameworks | Organize controls and evidence around them |

*Legal and compliance teams should confirm applicability for the firm's registration type, audience, and jurisdictions.*

## 4. Roles and Responsibilities

| Role | Responsibilities |
| --- | --- |
| AI Governance Committee | Approves policy, rubric changes, risk appetite; meets monthly |
| Executive Sponsor (Head of Research or Investments) | Owns outcomes and use of the rankings |
| Compliance and Legal | Disclosures, communications review, licensing, MNPI controls |
| Model Risk Management | Independent validation of the rubric, scoring, and ranking logic |
| Product Owner | Roadmap, metrics, user feedback |
| Data Science and Engineering | Build, evaluate, monitor, document |
| Domain Experts (analysts) | Calibrate rubrics, label evaluation sets, review outliers |
| Information Security and Privacy | Access control, vendor risk, incident response |
| Data and Vendor Management | Data licenses, provider performance |
| Internal Audit | Third-line assurance |

## 5. Risk Classification

| Tier | Definition | Examples | Required controls |
| --- | --- | --- | --- |
| Tier 1 (High) | Output reaches clients, the public, or drives investment decisions | Published rankings, client-facing reports | Full validation, compliance review, disclosures, approval workflow |
| Tier 2 (Medium) | Internal analytical use | Analyst-facing rankings and Q&A | Validation, sampled review, internal-use labeling |
| Tier 3 (Low) | Supporting processes | Document tagging, search | Standard testing and monitoring |

## 6. Lifecycle Controls

| Stage | Required controls | Evidence |
| --- | --- | --- |
| Intake | Use-case approval, intended-use statement, data and license review | Use-case record |
| Design | Rubric design with domain experts, weighting rationale, bias and gaming analysis | Design review sign-off |
| Build | Version control of prompts, rubric, chunking, embeddings, and code | Repository history |
| Validation | Retrieval evaluation, faithfulness tests, scoring agreement with analysts, sensitivity analysis, adversarial tests, independent MRM review | Validation report |
| Approval | Committee approval for Tier 1; product owner and compliance for Tier 2 and 3 | Signed approval |
| Deployment | Staged rollout, rollback plan | Release record |
| Monitoring | Retrieval and faithfulness metrics, score drift, data freshness, user feedback | Dashboards and monthly report |
| Change management | Re-validation on any change to the rubric, weights, embeddings, prompts, or models | Change ticket and regression results |
| Retirement | Decommission and retention handling | Retirement record |

## 7. Scoring Integrity and Fairness

- **Published rubric.** The innovation rubric (dimensions, scale, evidence requirements) is documented and versioned. Changes need committee approval and a re-score of the evaluation set.
- **Evidence-only scoring.** The LLM scores from retrieved passages only; every score stores its citations. Unsupported scores are rejected.
- **AI-washing defense.** Stated intent scores below demonstrated execution. Claims are weighted by specificity (named deployments, quantified outcomes, disclosed spend).
- **Size and disclosure bias.** Large companies publish more, and some use richer language. Controls: peer-group normalization, per-dimension caps on evidence volume, an "insufficient documentation" status instead of a silent low score, and regular analysis of score versus company size and region.
- **Language and format bias.** Non-English or poorly formatted reports are flagged and routed to review rather than scored low.
- **Consistency.** Double-scoring on a sample; inter-run stability thresholds; fixed temperature and pinned model versions.
- **Weight transparency.** Default weights and rationale are published; users can change weights and see rank sensitivity.
- **Human review.** Analysts review the top and bottom ranked companies and any large rank changes before publication.

## 8. Transparency and Disclosures

Every ranking view and report states:

- The two lenses, the data sources, the as-of dates, and the version of the rubric and models.
- That qualitative scores derive from company-published materials and AI-assisted analysis and may contain errors or reflect company framing.
- That the ranking is not investment advice and does not predict returns.
- Evidence coverage per company and any gaps.

Performance claims about the ranking (including back-tests) require Compliance approval and balanced presentation.

## 9. Data Governance and Licensing

| Control | Standard |
| --- | --- |
| Provenance | Every document and price series records source, date, version, and license tag |
| Licensing | Production market data from licensed providers; Yahoo Finance and scraped sources limited to prototyping where terms allow |
| Document rights | Store and display within license; excerpts are short and attributed |
| Quality | Parsing quality gates, duplicate control, freshness rules |
| Retention | Per recordkeeping and license terms; rankings reproducible from snapshots |
| Access | Role-based; document-level security where required; quarterly review |
| Cataloging | Microsoft Purview (or equivalent) for lineage and classification |
| Privacy | No personal or client data in prompts unless necessary |
| Vendors | Due diligence, data-use limits, no training on firm data |

## 10. Security and Safety Controls

- PDFs and web content are treated as untrusted input; instruction-like text is flagged; the generation step has no external-action tools.
- Private network access, managed identities, key management, and encryption.
- Content safety filtering on inputs and outputs.
- Immutable logs of queries, retrieved passages, prompts, model versions, and outputs.

## 11. Performance Thresholds and Monitoring

| Metric | Initial threshold | Action if breached |
| --- | --- | --- |
| Retrieval recall at 10 | 90% or higher on the evaluation set | Tune chunking, hybrid weights, or embeddings; block release |
| Faithfulness (claims supported by passages) | 98% or higher | Block release; fix prompts or retrieval |
| Citation validity | 98% or higher | Block release |
| Fabricated initiative rate | 0 tolerated in QC samples | Incident review |
| Analyst agreement on rubric scores | Within one point on 85% of items | Recalibrate rubric or prompts |
| Score stability across reruns | Within 0.5 points | Investigate prompts and model settings |
| Numeric accuracy against provider data | 99.5% or higher | Pause the affected metric |
| Data freshness | Prices within one business day; documents within defined age | Alert and flag affected companies |
| Rank sensitivity | Reported for each release | Review unstable ranks |

Thresholds are starting values to calibrate during the pilot.

## 12. Incident Management

| Severity | Example | Response |
| --- | --- | --- |
| Sev 1 | Published ranking with fabricated evidence, MNPI exposure, license breach, data breach | Suspend publication; notify Compliance and CRO; assess obligations |
| Sev 2 | Systematic scoring error, citation failures, material bias finding | Constrain scope; fix and re-validate within 5 business days |
| Sev 3 | Isolated errors, vendor outage, UX issues | Standard ticket; monthly review |

Every incident receives a post-incident review and control update.

## 13. Third-Party and Model Management

- Approved register of models, data vendors, and parsing services with versions, regions, and terms.
- Pinned model and embedding versions; re-evaluation before upgrades; planned re-indexing when embeddings change.
- Contractual commitments on data use, security, and change notification.
- Fallback providers and a manual process for outages.

## 14. Audit and Reporting

- **Monthly:** governance dashboard (retrieval, faithfulness, drift, coverage, incidents, cost).
- **Quarterly:** bias and size-effect review; sampled analyst audit of qualitative scores; access review.
- **Annually:** independent model validation and internal audit.
- **On demand:** examiner-ready package with rubric history, validation results, data lineage, and reproducible rankings.

## 15. Implementation Checklist

- [ ] Charter the AI Governance Committee and approve this framework
- [ ] Finalize the innovation rubric and default weights with domain experts
- [ ] Confirm data licenses (market data and documents) for AI processing and display
- [ ] Build the labeled evaluation sets for retrieval, faithfulness, and rubric scoring
- [ ] Define disclosure language with Compliance
- [ ] Stand up monitoring, logging, and lineage tooling
- [ ] Complete independent validation and a shadow period before wider release
