# Migration Roadmap: From Siloed Analysis to DualLens Analytics

*Version 1.0 | Platform: Microsoft Azure | Approach: phased, evidence-gated, analyst-in-the-loop*

## 1. Objective and Approach

Move from separate, manual analysis of stock data and strategy PDFs to a unified RAG-powered ranking platform without losing analyst trust. The roadmap follows **crawl, walk, run**: prove that retrieval and extraction are accurate on a small universe, validate the scoring rubric with domain experts, then expand coverage and audiences. Each phase ends with a go/no-go gate.

The end state: investors and analysts see every covered company on two lenses, financial growth and AI innovation readiness, with evidence-linked explanations and adjustable weights.

## 2. Current State and Target State

| Dimension | Current state | Target state |
| --- | --- | --- |
| Data | Prices and PDFs in separate silos | One evidence base with shared company identifiers |
| Qualitative analysis | Manual reading of reports | Structured AI-initiative records with citations |
| Quantitative analysis | Ad hoc spreadsheets | Versioned, validated growth and risk metrics |
| Synthesis | Analyst judgment, inconsistent | Transparent composite ranking with sensitivity views |
| Coverage | Limited by reading time | Hundreds of companies, refreshed continuously |
| Auditability | Notes and files | Reproducible rankings tied to data and document versions |

## 3. Roadmap Overview

| Phase | Timing (indicative) | Theme | System role | Gate |
| --- | --- | --- | --- | --- |
| 0. Foundation | Months 0 to 2 | Scope, governance, data | None in production | Rubric draft, licenses, evaluation sets ready |
| 1. Prototype | Months 2 to 4 | RAG and metrics on a small universe | Analyst-checked outputs | Retrieval and faithfulness at target |
| 2. Calibrate | Months 4 to 6 | Rubric scoring and ranking | Scores compared with analyst scores | Agreement and stability at target |
| 3. Pilot | Months 6 to 9 | Analyst-facing product | Internal use on a pilot universe | Adoption, quality, cost within targets |
| 4. Expand | Months 9 to 12 | More companies, sectors, document types | Continuous ingestion and refresh | Reliability and compliance results |
| 5. Publish | Months 12 to 15 | Supervised external or client use | Rankings in client materials under approval | Compliance and MRM sign-off |
| 6. Optimize | Month 15 onward | Continuous improvement | Richer signals, new lenses | Committee approval per expansion |

Timelines depend on firm size, data contracts, and compliance cycles.

## 4. Phase Details

### Phase 0: Foundation (Months 0 to 2)

**Goals:** align on scope, secure data, and define how quality will be measured.

- Charter the AI Governance Committee; approve policies and disclosures approach
- Define the pilot universe (for example 30 to 50 companies in two sectors) and the document set per company
- Confirm licenses: production market data provider and rights to process and display reports
- Draft the innovation rubric with domain experts (dimensions, 0 to 5 scales, evidence requirements)
- Build labeled evaluation sets: questions with expected passages, and analyst-scored companies for rubric calibration
- Stand up the Azure foundation: subscriptions and landing zone, networking, Key Vault, logging, CI/CD
- Establish baseline: analyst hours per company and current coverage

**Exit criteria:** governance approved, licenses confirmed, rubric draft agreed, evaluation sets ready, secure environment live.

### Phase 1: Prototype (Months 2 to 4)

**Goals:** prove the two pipelines work.

- Build the document pipeline: Blob Storage, Document Intelligence parsing, chunking, embeddings, Azure AI Search hybrid index
- Build the financial pipeline: price ingestion, growth and risk metrics, validation checks
- Build the cited Q&A flow with grounding checks
- Extract structured initiative records and review samples with analysts
- Run retrieval and faithfulness evaluations; tune chunking and search settings

**Exit criteria:** recall at 10 at or above 90%; faithfulness and citation validity at or above 98%; metrics match provider data at or above 99.5%.

### Phase 2: Calibrate (Months 4 to 6)

**Goals:** make the qualitative score trustworthy.

- Implement rubric scoring with evidence-only prompts and stored citations
- Compare LLM scores with analyst scores; refine rubric wording and prompts
- Test stability across reruns and prompt variations
- Build the composite ranking, weight controls, and sensitivity views
- Run first bias analysis (size, region, document volume) and AI-washing tests with deliberately promotional documents

**Exit criteria:** scores within one point of analysts on at least 85% of items; stable across reruns; no unresolved bias findings.

### Phase 3: Pilot (Months 6 to 9)

**Goals:** put the platform in analysts' hands for real work.

- Release the dashboard, company profile pages, and evidence-linked Q&A
- Run side by side with the manual process for a defined period
- Add monitoring dashboards, user feedback capture, and a review queue for low-confidence cases
- Complete the first independent model validation of the rubric and ranking
- Tune costs using measured unit economics

**Exit criteria:** analyst time per company at target; analyst-rated usefulness; cost per company within budget; no Severity 1 incidents.

### Phase 4: Expand (Months 9 to 12)

**Goals:** scale coverage and harden operations.

- Add sectors, geographies, and document types (filings, transcripts) with licensing review
- Automate ingestion on document arrival and daily price refresh
- Add peer-group normalization and trend views over time
- Load testing, disaster recovery test, security review
- Apply cost levers from the Cost Optimization Plan

**Exit criteria:** ingestion and refresh reliability at target; DR test passed; compliance sample review clean.

### Phase 5: Publish (Months 12 to 15)

**Goals:** allow supervised use beyond the research team.

- Complete Compliance review of disclosures, descriptions of method, and any performance claims
- Add approval workflow and export of ranking reports with embedded citations and disclosures
- Provide analyst training and investor-facing explanations of the two lenses
- Produce the audit-ready evidence package

**Exit criteria:** Compliance and MRM sign-off; evidence package accepted; analyst adoption confirmed.

### Phase 6: Optimize (Month 15 onward)

**Goals:** continuous improvement.

- Quarterly reviews of models, embeddings, search configuration, and rubric
- Additional lenses (for example ESG, talent, patent signals) added through the same pipeline
- Alerting when a company's documents or prices change materially
- Study how rankings relate to later outcomes, interpreted cautiously

## 5. Workstreams

| Workstream | Key activities |
| --- | --- |
| Governance and compliance | Policies, disclosures, licensing, bias and AI-washing controls, validation |
| Data and documents | Provider integration, document sourcing, parsing quality, lineage |
| RAG and AI | Chunking, embeddings, retrieval, extraction, scoring, evaluation harness |
| Ranking and analytics | Metrics, composite logic, sensitivity, back-testing |
| Platform | Azure foundation, security, observability, FinOps |
| Product and UX | Dashboard, explainability views, analyst workflows |
| Change management | Analyst involvement, training, communications |

## 6. Change Management and People

- **Co-design the rubric with analysts.** Their judgment is the benchmark; the system scales it rather than replaces it.
- **Show the evidence, not only the score.** Every score links to passages so analysts can disagree productively.
- **Position correctly:** investors and analysts spend less time collecting and more time challenging, comparing, and deciding.
- **Train** on what the scores mean, what they do not mean, and how to read sensitivity and coverage warnings.
- **Capture feedback** as labeled data to improve prompts and rubric.
- **Share results** of the pilot, including errors and lessons.

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Poor PDF parsing corrupts tables and facts | Medium | High | Layout-aware parsing, quality gates, manual review queue |
| AI washing inflates scores | High | High | Execution-weighted rubric, adversarial test documents, analyst review of extremes |
| Rubric disputes among stakeholders | Medium | Medium | Co-design, versioning, publish rationale and sensitivity |
| Data licensing blocks use or display | Medium | High | Early legal review; licensed providers; license tags |
| Bias toward large or verbose companies | Medium | High | Peer normalization, evidence caps, size-effect monitoring |
| Hallucinated initiatives | Medium | High | Evidence-only generation, citation verification |
| Analyst distrust or low adoption | Medium | High | Co-design, transparency, side-by-side pilot |
| Cost growth from search tier or token use | Medium | Medium | Budgets, caching, relevance filtering |
| Model or embedding changes break quality | Medium | Medium | Pinned versions, regression suite, planned re-indexing |
| Over-interpretation of rankings | Medium | High | Disclosures, sensitivity views, no trade recommendations |

## 8. Success Metrics by Phase

| Metric | Baseline | Phase 1 | Phase 3 | Phase 5 target |
| --- | --- | --- | --- | --- |
| Analyst time per company | About 6 hours (assumed) | 3 hours | 1 hour or less | 45 minutes or less |
| Recall at 10 | n/a | 90% or higher | 90% or higher | 92% or higher |
| Faithfulness and citation validity | n/a | 98% or higher | 98% or higher | 99% or higher |
| Rubric agreement with analysts (within one point) | n/a | n/a | 85% or higher | 90% or higher |
| Numeric accuracy | n/a | 99.5% or higher | 99.5% or higher | 99.5% or higher |
| Companies covered | Baseline | Pilot universe | 100 or more | Hundreds |
| Time from new report to updated score | Days to weeks | Under 1 day | Under 1 hour | Under 1 hour |
| Cost per company | Baseline | Tracking | 60% lower | 80% or more lower |

Targets are planning values to refine with pilot data.

## 9. Dependencies and Assumptions

- Executive sponsorship and a funded cross-functional team (research, data science, engineering, compliance)
- Access to strategy and annual report PDFs with rights to process them
- A licensed market data source for production
- Analyst time to build evaluation sets and calibrate the rubric
- Compliance agreement on disclosures and permitted audiences

## 10. Decision Gates

Each gate is reviewed by the AI Governance Committee using dashboard evidence.

| Gate | Decision | Evidence required |
| --- | --- | --- |
| G0 | Begin build | Governance charter, licenses, rubric draft, evaluation sets |
| G1 | Move to calibration | Retrieval, faithfulness, and metric accuracy results |
| G2 | Release to pilot analysts | Rubric agreement, stability, bias analysis |
| G3 | Expand coverage | Adoption, quality, cost, and compliance results |
| G4 | Allow supervised external use | Compliance and MRM sign-off, audit-ready package |

## 11. Immediate Next Steps (First 30 Days)

1. Name the executive sponsor and product owner
2. Charter the governance committee and engage Compliance
3. Choose the pilot universe and the document set
4. Review data licenses for market data and documents
5. Convene analysts to draft the innovation rubric
6. Begin the baseline measurement of analyst time per company
