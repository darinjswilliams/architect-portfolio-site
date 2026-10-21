# AI Reference Architecture: Mortgage Underwriting

*Version 1.0 | Target platform: AWS | Pattern: human-in-the-loop multi-agent decision support*

## 1. Purpose and Scope

This document defines the reference architecture for an AI-assisted mortgage underwriting platform. It addresses four business problems: manual review of 3-5 days per file, heavy document analysis, inconsistent underwriter conclusions, and high senior-underwriter cost.

**In scope:** document intake, extraction, cross-verification, deterministic calculations, guideline checking, condition generation, and underwriter decision support.

**Out of scope:** automated final credit decisions. The underwriter remains the accountable decision maker.

## 2. Architectural Principles

1. **AI where the bottleneck is.** Most underwriting time is spent converting messy documents into verified facts. Apply AI there, not to a black-box approve/deny model.
2. **Deterministic math.** DTI, LTV, qualifying income, and reserves are computed by versioned code, never by an LLM.
3. **Every finding is traceable.** Each data point links to a source document and page. Each rule check cites a guideline section.
4. **Human accountable for the decision.** AI prepares, recommends, and escalates. Underwriters approve, adjust, or override.
5. **Confidence-gated automation.** Low-confidence extractions and conflicting data route to humans automatically.
6. **Secure and auditable by default.** Encryption, least privilege, and immutable audit logs for all NPI (GLBA).
7. **Model-agnostic.** Foundation models sit behind an abstraction layer so they can be swapped without redesign.

## 3. Logical Architecture

The platform is organized into seven layers.

| Layer | Responsibility | Key AWS services |
| --- | --- | --- |
| Channels | Loan origination system (LOS) integration, borrower and broker portals, underwriter workbench | API Gateway, CloudFront, Cognito |
| Ingestion | Receive, virus-scan, and store loan packages | S3, EventBridge, Lambda, Macie |
| Document Intelligence | Classify documents, OCR, extract structured fields | Textract, Bedrock, Step Functions |
| Agent Layer | Orchestrator and specialist agents | Bedrock AgentCore or Agents, Lambda, ECS Fargate |
| Decision Services | Calculation engine, rules, guideline retrieval | Lambda or ECS, OpenSearch or Aurora pgvector, Bedrock Knowledge Bases |
| Data | Loan file store, extracted facts, audit log, feature store | S3, Aurora PostgreSQL, DynamoDB, QLDB or S3 Object Lock |
| Platform and Governance | Identity, observability, model monitoring, policy enforcement | IAM, KMS, CloudWatch, CloudTrail, Bedrock Guardrails, SageMaker Model Monitor |

## 4. Agent Catalog

| Agent | Function | Inputs | Outputs | Autonomy |
| --- | --- | --- | --- | --- |
| Orchestrator | Plans workflow, routes tasks, handles retries and exceptions | Loan package event | Task graph, status, escalations | Full (workflow only) |
| Intake and Classification | Identifies document types, checks completeness | Raw documents | Document manifest, missing-item list | Full, with confidence gate |
| Extraction (per family) | Pulls structured fields from pay stubs, W-2s, bank statements, appraisals, credit reports | Classified documents | Field values with confidence and page references | Full, with confidence gate |
| Verification and Cross-check | Reconciles across documents: income vs. deposits, employer consistency, large deposits, appraisal vs. price | Extracted facts | Discrepancy report, fraud and risk flags | Recommends only |
| Calculation Engine | Computes DTI, LTV, CLTV, reserves, qualifying income | Verified facts | Calculation results with formula trace | Deterministic code |
| Guideline and Policy | Retrieves Fannie Mae, Freddie Mac, FHA, and lender overlay rules and tests the file | Facts, calculations | Pass/fail per rule with citations | Recommends only |
| Decision Support and Conditions | Drafts risk summary, recommendation, and stipulations | All upstream outputs | Underwriting memo and conditions list | Recommends only |

## 5. End-to-End Processing Flow

1. **Submit.** The LOS posts a loan package; an event lands in EventBridge.
2. **Ingest.** Files are scanned, encrypted, and stored in S3 with object lock and metadata.
3. **Classify.** The Intake agent labels documents and flags missing items. Missing items trigger an automated borrower request.
4. **Extract.** Textract performs OCR; extraction agents interpret layouts and return fields with confidence scores.
5. **Verify.** The Verification agent cross-checks documents and raises discrepancies.
6. **Calculate.** The calculation engine produces ratios and qualifying income from verified data only.
7. **Check guidelines.** The Policy agent retrieves relevant rules and tests the file.
8. **Recommend.** The Decision Support agent assembles the memo, risk grade, and conditions.
9. **Review.** The underwriter reviews in the workbench, sees evidence links, and approves, edits, or overrides.
10. **Learn.** Overrides and corrections feed the evaluation dataset and model-monitoring metrics.

**Routing rules:** any field under the confidence threshold, any unresolved discrepancy, any rule failure, or any non-standard property or borrower type routes to a human exception queue.

## 6. Data Architecture

- **Raw zone:** immutable original documents (S3, Object Lock, KMS per-tenant keys).
- **Structured zone:** extracted facts, each with source document, page, bounding box, confidence, and extraction model version.
- **Decision zone:** calculation results, rule evaluations, recommendations, underwriter actions.
- **Audit zone:** append-only record of every agent action, prompt, model version, retrieved guideline text, and human decision.
- **Knowledge base:** versioned guideline corpus (agency guides, lender overlays) chunked with effective dates so the correct rule version applies to each loan.
- **Retention:** aligned to lender policy and regulatory requirements; PII minimization and masking in non-production.

## 7. Model Strategy

| Task | Approach | Rationale |
| --- | --- | --- |
| OCR | Amazon Textract | Proven accuracy on forms and tables |
| Classification | Small, fast LLM or fine-tuned classifier | Low cost, high volume |
| Field interpretation | Mid-tier LLM with structured output schemas | Handles layout variation |
| Cross-check reasoning | Stronger LLM | Multi-document reasoning |
| Guideline checking | RAG plus stronger LLM, with rule citations | Grounded, auditable |
| Memo drafting | Mid-tier LLM | Summarization of verified facts |
| Math | Code | Exactness and testability |

Prompts, schemas, and model versions are version-controlled and promoted through dev, test, and production with regression evaluations at each gate.

## 8. Security Architecture

- **Network:** private VPC, VPC endpoints for Bedrock, S3, and Textract; no public data paths.
- **Identity:** SSO with MFA, role-based access (underwriter, QC, admin, auditor), and per-loan access scoping.
- **Encryption:** KMS at rest and TLS 1.2+ in transit; field-level encryption for SSN and account numbers.
- **Data protection:** PII detection and redaction before any text reaches prompts where not required; Bedrock Guardrails for output filtering.
- **Model data handling:** no customer data used to train foundation models.
- **Monitoring:** CloudTrail, GuardDuty, Security Hub, and SIEM integration.
- **Compliance mapping:** GLBA, ECOA/Reg B, FCRA, HMDA, SOC 2, and applicable state requirements.

## 9. Integration Architecture

- **LOS:** bidirectional via API or MISMO XML (for example Encompass or Blend).
- **Credit bureaus and verification vendors:** The Work Number, IRS transcripts (4506-C), flood and title vendors.
- **Automated valuation models:** for appraisal sanity checks.
- **Underwriter workbench:** a single pane showing the file, evidence, flags, calculations, and AI recommendation.
- **Event bus:** EventBridge for decoupled status updates to downstream systems.

## 10. Non-Functional Requirements

| Attribute | Target |
| --- | --- |
| Preliminary review latency | Under 30 minutes for a complete package |
| Availability | 99.9% for the workbench and API |
| Extraction accuracy | At least 98% on critical fields (income, balances, property value) after tuning |
| Scalability | Elastic to 5x seasonal peak volume |
| Recoverability | RPO 15 minutes, RTO 4 hours, multi-AZ with cross-region backup |
| Traceability | 100% of findings linked to a source and a rule |

## 11. Observability and Operations (LLMOps)

- **Quality:** per-field extraction accuracy, underwriter override rate, exception-queue rate.
- **Performance:** time-to-decision, per-agent latency, queue depth.
- **Cost:** tokens and Textract pages per loan, cost per file.
- **Safety and fairness:** drift detection, guardrail triggers, disparate-impact reports.
- **Evaluation harness:** a golden set of historical loans with known outcomes, run on every prompt, model, or guideline change.

## 12. Key Architecture Decisions

| Decision | Choice | Alternative considered | Reason |
| --- | --- | --- | --- |
| Decision authority | Human final decision | Full automation | Regulatory risk, explainability, adverse action |
| Math | Deterministic engine | LLM calculation | Accuracy and auditability |
| Guideline checks | RAG with citations | Fine-tuned model | Rules change often; citations required |
| Orchestration | Step Functions plus agents | Fully autonomous agent loop | Predictability, retries, audit |
| Model access | Bedrock behind abstraction | Self-hosted models | Speed to market, security posture, flexibility |

## 13. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Extraction errors on poor scans | Confidence gates, human exception queue, borrower re-upload prompts |
| Hallucinated guideline rules | Retrieval grounding, mandatory citations, rule-level evaluation |
| Model drift or vendor model changes | Pinned versions, regression suite, staged rollout |
| Fraudulent documents | Cross-document checks, metadata analysis, third-party verification |
| Underwriter over-reliance | Evidence-first UI, sampled QC, override tracking |
