# Cost Optimization Plan: AI Mortgage Underwriting

*Version 1.0 | Platform: AWS | All dollar figures are planning assumptions to be validated against the lender's actual volumes and current AWS pricing*

## 1. Objective

Deliver same-day preliminary underwriting at a lower cost per file than the manual process, while keeping the AI platform's own run cost predictable and controlled. The goal is higher files per underwriter, not headcount elimination.

## 2. Baseline: Cost of the Current Process

The business problem cites senior underwriters at $70-100K+ annually. Fully loaded cost (benefits, tools, management overhead) is commonly 1.25x to 1.4x salary.

| Assumption | Value |
| --- | --- |
| Underwriter salary (midpoint) | $85,000 |
| Loaded cost multiplier | 1.3x, or about $110,500 per underwriter |
| Files completed per underwriter per month (manual) | 40 (illustrative) |
| Files per underwriter per year | 480 |
| **Manual underwriting labor cost per file** | **about $230** |

Replace the illustrative throughput with the lender's actual figures before presenting externally.

## 3. Target State Economics

| Scenario | Files per underwriter per month | Labor cost per file | Reduction vs. baseline |
| --- | --- | --- | --- |
| Baseline | 40 | about $230 | n/a |
| Conservative (2x) | 80 | about $115 | 50% |
| Target (3x) | 120 | about $77 | 67% |
| Stretch (4x) | 160 | about $58 | 75% |

Platform run cost per file is added on top (see section 4). Even at the conservative case, the net saving per file is meaningful once AI run cost is kept below roughly $10 to $20 per file.

## 4. Platform Cost Model

### 4.1 Run-cost drivers per loan file

| Driver | Unit | Planning estimate per file | Optimization lever |
| --- | --- | --- | --- |
| OCR (Textract) | Pages (a typical file is 80 to 200 pages) | $1.50 to $6.00 | Skip OCR for digital-native PDFs; process only needed pages; use the cheapest feature tier per document type |
| LLM classification | Tokens | $0.05 to $0.20 | Small model; batch inference |
| LLM extraction | Tokens | $0.50 to $3.00 | Structured outputs; send only relevant pages; prompt caching |
| LLM cross-check and guidelines | Tokens | $1.00 to $5.00 | Retrieve only relevant rule chunks; reserve strong models for hard cases |
| LLM memo and conditions | Tokens | $0.30 to $1.50 | Mid-tier model; template-driven output |
| Compute, storage, networking | Hours and GB | $0.50 to $2.00 | Right-sizing, serverless, lifecycle policies |
| Third-party data | Per pull | Varies by vendor contract | Pull once and cache; avoid duplicate pulls |
| **Estimated total** |  | **about $4 to $18 per file** |  |

These estimates should be replaced with measured values from the pilot. Track them from day one.

### 4.2 Fixed and semi-fixed costs

- Platform engineering and MLOps team
- Vector store and search cluster
- Observability, security tooling, and compliance testing
- Model validation and fair lending testing (annual)
- Support and change management

## 5. Cost Optimization Levers

### 5.1 Model strategy

1. **Tiered model routing.** Use small models for classification and routine extraction, mid-tier for summarization, and strong models only for cross-document reasoning and ambiguous cases. This is typically the largest single saving.
2. **Cascade pattern.** Attempt the cheaper model first; escalate to a stronger model only when confidence is low.
3. **Prompt caching.** Cache static system prompts and guideline context to cut repeated input token cost.
4. **Batch inference** for work that does not need real-time results (overnight QC reviews, backfills, evaluation runs).
5. **Output control.** Enforce JSON schemas and length limits to avoid verbose outputs.

### 5.2 Document processing

1. Detect digital-native PDFs and extract text directly instead of paying for OCR.
2. Classify first, then run extraction only on relevant pages, since credit reports and appraisals contain many pages that carry no underwriting facts.
3. De-duplicate documents (borrowers often upload the same statement more than once).
4. Cache results by document hash so reprocessing costs nothing.

### 5.3 Retrieval and data

1. Pre-index guidelines once per version; retrieve a small, targeted set of chunks per query.
2. Use a right-sized vector store (Aurora pgvector can be cheaper than a dedicated OpenSearch cluster at moderate scale).
3. Apply S3 lifecycle policies: Standard to Infrequent Access to Glacier by document age and retention requirement.

### 5.4 Compute and infrastructure

1. Serverless first (Lambda, Step Functions, Fargate) so cost scales with volume.
2. Right-size and schedule non-production environments (shut down nights and weekends).
3. Savings Plans for the steady baseline; on-demand for peaks.
4. Use VPC endpoints to reduce NAT gateway data charges.
5. Review CloudWatch log retention and verbosity.

### 5.5 Process and quality

1. **Reduce rework.** Better first-pass completeness checks and automated borrower requests cut costly back-and-forth.
2. **Calibrate the exception queue.** Over-escalation wastes underwriter time; under-escalation creates risk. Tune thresholds with real data.
3. **Reduce QC cost** through risk-based sampling.

## 6. FinOps Operating Model

| Practice | Description |
| --- | --- |
| Tagging | Tag every resource by environment, component, and agent; enforce with policy |
| Unit economics | Dashboard: cost per file, per agent, per document type, per model |
| Budgets and alerts | Monthly budgets with alerts at 70%, 90%, and 100%; anomaly detection |
| Token governance | Per-agent token budgets; alerts on spikes and runaway loops |
| Showback | Report platform cost against underwriter throughput and loan volume |
| Monthly review | FinOps, product, and engineering review with action items |
| Architecture reviews | Re-evaluate model choices quarterly as new, cheaper models appear |

## 7. Investment and Payback Framework

| Category | Components |
| --- | --- |
| One-time | Design, build, integration with LOS, data preparation, golden-set creation, validation and fair lending testing, training |
| Recurring | Cloud and model usage, platform team, monitoring, annual validation, vendor fees |
| Benefits | Labor productivity, reduced cycle time (faster closings, fewer pipeline fall-outs), lower rework, lower QC cost, improved consistency, reduced repurchase risk |

**Payback formula**

*Annual net benefit = (baseline cost per file minus new cost per file, including AI run cost) × annual file volume, minus recurring platform costs.*

*Payback period = one-time investment divided by annual net benefit.*

Example for illustration only: 10,000 files per year, labor cost drops from $230 to $77 per file with $12 AI run cost, giving a saving of about $141 per file, or about $1.4M per year before fixed platform costs. Actual figures depend on the lender's volumes and productivity gains.

## 8. Cost Guardrails

- A hard per-file cost ceiling triggers escalation to a human rather than repeated model retries.
- Maximum retry and loop counts on every agent.
- Automatic fallback to cheaper models when budget thresholds are reached for non-critical tasks.
- No model upgrade goes live without a cost-per-file impact assessment.

## 9. Optimization Roadmap

| Phase | Focus | Expected outcome |
| --- | --- | --- |
| Pilot | Measure true per-file cost; instrument everything | Reliable baseline and unit economics |
| Scale | Model routing, OCR avoidance, caching, batch inference | 30% to 50% reduction in AI run cost per file |
| Optimize | Savings Plans, lifecycle policies, threshold tuning | Further reduction in infrastructure and rework cost |
| Continuous | Quarterly model and architecture review | Sustained cost per file as volume grows |

## 10. Key Metrics

- Cost per file (total, AI run, labor)
- Files per underwriter per month
- Tokens and Textract pages per file
- Exception-queue rate and rework rate
- Cycle time (submission to preliminary decision)
- Payback period and cumulative net benefit
