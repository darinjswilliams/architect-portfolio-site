# Cost Optimization Plan: Autonomous Financial Research Analyst

*Version 1.0 | Platform: AWS with LangGraph | All dollar figures are planning assumptions to validate against the firm's actual salaries, vendor contracts, and current pricing*

## 1. Objective

Deliver investment-grade research in minutes at a cost per report far below manual research, while keeping model, data, and infrastructure spend predictable. The business case rests on analyst capacity: covering 10-20x more companies with the same team, or redeploying analyst time from data collection to analysis.

## 2. Baseline: Cost of the Current Process

The business problem states 4-6 hours of research per company, with 60-70% of analyst time spent on data collection.

| Assumption | Value |
| --- | --- |
| Analyst salary (illustrative) | $150,000 |
| Loaded cost multiplier | 1.3x, or about $195,000 |
| Working hours per year | 2,080 |
| **Loaded hourly cost** | **about $94** |
| Research time per company (midpoint of 4-6 hours) | 5 hours |
| **Manual labor cost per company report** | **about $470** |
| Share of time on data collection | 60-70% (about $280 to $330 per report) |

Replace salary and hours with the firm's actual figures before presenting externally.

## 3. Target State Economics

The target process has the agent produce the report in 5-10 minutes, followed by analyst review and refinement.

| Scenario | Analyst review time per report | Labor cost per report | Reduction vs. baseline |
| --- | --- | --- | --- |
| Baseline (manual) | 5 hours | about $470 | n/a |
| Conservative | 1.5 hours | about $140 | 70% |
| Target | 1 hour | about $94 | 80% |
| Stretch (screening reports) | 30 minutes | about $47 | 90% |

AI run cost and data cost per report are added on top (section 4). Even with generous allowances for both, the net saving per report remains large. The larger value is capacity: the same team can cover many more companies, update coverage more often, and spend time on judgment instead of collection.

## 4. Platform Cost Model

### 4.1 Run-cost drivers per report

| Driver | Unit | Planning estimate per report | Optimization lever |
| --- | --- | --- | --- |
| Planning and routing LLM calls | Tokens | $0.02 to $0.15 | Mid-tier model; short prompts; cached system prompts |
| News relevance and deduplication | Articles | $0.05 to $0.30 | Embeddings and small models; dedupe before LLM use |
| Sentiment analysis | Articles | $0.10 to $0.80 | Small model or finance-tuned classifier; batch scoring |
| Strategic analysis and synthesis | Tokens | $0.30 to $2.50 | Send summaries and relevant passages, not full documents; stronger model only here |
| Critic pass | Tokens | $0.15 to $1.00 | Targeted checks; skip full rerun when confidence is high |
| Market and fundamentals data | API calls | $0.01 to $0.50 | Caching; batch endpoints; contract tiers |
| News search and content APIs | Queries | $0.05 to $0.50 | Query planning; reuse results across a watchlist run |
| Compute, storage, networking | Run time | $0.05 to $0.30 | Serverless, right-sizing, lifecycle policies |
| **Estimated total** |  | **about $1 to $6 per report** |  |

Replace these with measured values from the pilot.

### 4.2 Fixed and semi-fixed costs

- Market data, fundamentals, news, and research licenses (often the largest fixed cost)
- Platform engineering and MLOps team
- Observability and evaluation tooling
- Compliance review, validation, and audit
- Support and training

## 5. Cost Optimization Levers

### 5.1 Model strategy

1. **Tiered routing:** small models for filtering, deduplication, and sentiment; mid-tier for planning; strongest model only for synthesis and critique.
2. **Cascade:** try the cheaper model first; escalate on low confidence or critic failure.
3. **Prompt caching** for static instructions, rating policy, and disclosure text.
4. **Batch inference** for overnight watchlist refreshes and backfills, which do not need real-time latency.
5. **Structured outputs and length limits** to prevent verbose responses.
6. **Context discipline:** summarize and rank evidence before synthesis rather than passing whole articles and filings.

### 5.2 Data and tool cost

1. **Cache by freshness class:** short TTL for prices, longer for fundamentals and filings, article cache for repeated stories.
2. **Incremental updates:** on refresh, fetch only new articles and changed metrics, then update the prior report rather than regenerating from scratch.
3. **Share work across a watchlist:** sector news and macro context are gathered once and reused by many company reports.
4. **Negotiate tiers:** consolidate vendors, use enterprise licenses, and align contract limits with measured call volumes.
5. **Source cost-aware fallback:** the fallback map prefers lower-cost sources when quality is equivalent.
6. **Deduplicate queries:** avoid repeated searches for the same entity in a short window.

### 5.3 Agent behavior and orchestration

1. Hard per-run budgets on steps, tool calls, and tokens to stop loops.
2. Parallel branches to cut latency without increasing token spend.
3. Early exit: stop gathering when completeness thresholds are met.
4. Report depth tiers: quick screen, standard report, deep dive, each with a different budget.
5. Reuse recent results: if a report is less than a defined age with no material news, serve the cached version with a freshness note.

### 5.4 Infrastructure

1. Serverless and containers that scale with demand, including scale-to-zero outside market hours for non-critical environments.
2. Savings Plans for the steady baseline; on-demand for earnings-season bursts.
3. Right-size Aurora and cache clusters; evaluate Serverless v2.
4. S3 lifecycle policies for raw snapshots, within retention rules.
5. VPC endpoints to cut NAT data charges.
6. Control log verbosity and retention in CloudWatch and tracing tools.

### 5.5 Process

1. Reduce review time through evidence-first report layout and diff views against the previous report.
2. Calibrate escalation rules so analysts see only reports needing attention.
3. Use quick screens to triage which companies deserve a deep dive.

## 6. FinOps Operating Model

| Practice | Description |
| --- | --- |
| Tagging | Tag by environment, agent, tool, and team; enforce by policy |
| Unit economics | Dashboard of cost per report by depth tier, agent, model, vendor |
| Budgets and alerts | Monthly budgets with alerts at 70%, 90%, 100%; anomaly detection for token and API spikes |
| Token and call governance | Per-agent budgets; alerts on runaway loops |
| Showback | Allocate platform and data cost to desks or teams |
| Vendor review | Quarterly review of data usage versus contract |
| Architecture review | Quarterly reassessment as cheaper or better models appear |

## 7. Investment and Payback Framework

| Category | Components |
| --- | --- |
| One-time | Design and build, vendor integrations, evaluation set creation, compliance and validation work, analyst training |
| Recurring | Cloud and model usage, data licenses, platform team, monitoring, annual validation |
| Benefits | Analyst time saved or redeployed, wider coverage, faster time to insight, more consistent research, reduced missed-opportunity risk |

**Payback formula**

*Annual net benefit = (baseline cost per report minus new cost per report including AI and variable data cost) × annual report volume, minus recurring fixed costs.*

*Payback period = one-time investment divided by annual net benefit.*

Example for illustration only: 20 analysts each producing 300 manual reports a year is 6,000 reports. If cost falls from $470 to $94 labor plus $5 variable cost, the saving is about $370 per report, or about $2.2M per year before fixed platform and license costs. If coverage expands instead (10x more reports), the value shows up as capacity and opportunity rather than cost reduction. The firm should decide which benefit it is pursuing.

## 8. Cost Guardrails

- A per-report cost ceiling ends the run gracefully with a partial report.
- Maximum retries per tool and circuit breakers per vendor, so failures do not multiply spend.
- Automatic downgrade to cheaper models or lighter depth tiers when monthly budgets near limits, for non-critical use.
- No model, prompt, or vendor change goes live without a cost-per-report impact check.

## 9. Optimization Roadmap

| Phase | Focus | Expected outcome |
| --- | --- | --- |
| Pilot | Instrument every call; measure true cost per report | Reliable unit economics |
| Scale | Model routing, caching, incremental refresh, batch jobs | 30% to 50% lower run cost per report |
| Optimize | Vendor consolidation, Savings Plans, depth tiers | Lower fixed and variable cost per covered company |
| Continuous | Quarterly model and vendor review | Sustained cost per report as coverage grows |

## 10. Key Metrics

- Cost per report (total, AI, data, labor) by depth tier
- Analyst review minutes per report
- Companies covered per analyst
- Tokens and vendor calls per report
- Cache hit rate and fallback usage
- Time from news event to updated report
- Payback period and cumulative net benefit
