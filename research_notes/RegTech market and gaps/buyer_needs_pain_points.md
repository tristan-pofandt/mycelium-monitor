# RegTech and compliance software: what buyers want and what frustrates them (as of November 2026)

Research notes, compiled 2026-11-04 by Claude (research subagent). Human review required. Every survey figure is labelled with its survey or publication year. Several sources are vendor-run or secondary; they are flagged where so. Paywalled primary reports (PwC GCS 2025 full text, Gartner, Hyperproof 2026, Thomson Reuters Cost of Compliance 2025) could not be read in full.

## 1. What does compliance cost companies (staff time, spend, fines)?

### Takeaway
Financial-crime compliance alone costs financial institutions hundreds of billions of US dollars a year worldwide (about USD 206 billion, LexisNexis 2023 edition), labour is the biggest cost line, and almost every institution reports costs rising. In Australia, financial-crime compliance cost about AU$5.37 billion (2023), with Australia spending a larger share on technology than any other Asia Pacific country surveyed.

### Plain-language explanation
"Cost of compliance" means the money and staff time a company spends proving it follows the rules: checking customers (KYC, "know your customer"), screening payments against sanctions lists, collecting evidence for auditors, and keeping up with new rules. Most of that cost is people doing repetitive checking work, which is why software vendors pitch automation.

### Cited Findings
- LexisNexis True Cost of Financial Crime Compliance (2023 edition, global): projected global total USD 206.1 billion; the 2021 edition projected USD 213.9 billion (2021), up from USD 180.9 billion (2020). A FutureCFO page dated April 2025 repeats the 2023 figure; no 2025 global edition was found — [LexisNexis search summary via FutureCFO](https://futurecfo.net/?p=15703); [CPO Magazine](https://www.cpomagazine.com/cyber-security/global-cost-of-financial-crime-compliance-over-180-billion-report-reveals/)
- LexisNexis True Cost (2024 edition, US and Canada): USD 61 billion total; 99% of financial institutions reported rising compliance costs — [InvestmentNews](https://www.investmentnews.com/regulation-and-legislation/financial-crime-compliance-costs-reach-61b-for-financial-institutions/249818)
- LexisNexis/Forrester True Cost, Asia Pacific (2023 data, published March 2024), Australia: AU$5.37 billion (US$3.5 billion) total; 98% of institutions report higher costs; technology is 34% of budget (highest of the countries surveyed); labour and resources are 39% of spend — [CFOtech Australia](https://cfotech.com.au/story/australia-s-financial-crime-compliance-costs-reach-5-37bn)
- Same APAC study (2023 data): US$45 billion across surveyed countries; 75% cite labour costs as a primary driver; 79% report rising screening alerts; 70% report higher compliance/KYC software costs; 81% are focused on reducing compliance cost over the next 12 months; 39% cite heightened regulation as the main driver — [CFOtech Australia](https://cfotech.com.au/story/australia-s-financial-crime-compliance-costs-reach-5-37bn)
- Australia, small licensees (Holley Nethercote survey, February 2025, 200+ AFS and credit licence holders): a significant drop in compliance spend; 40% spend under AU$100,000 on internal compliance staff, up from 29% the year before. Other surveys of AFSL/ACL holders report spending of hundreds of thousands of dollars a year on internal and external compliance — [Mondaq](https://www.mondaq.com/australia/compliance/1621992/annual-compliance-trends-survey-results-released); [Money Management](https://www.moneymanagement.com.au/how-much-are-licensees-spending-compliance); [Money Management, internal costs over $1m](https://www.moneymanagement.com.au/internal-compliance-costs-surpassing-1m-annually-licensees)
- Australia, economy-wide (older Deloitte Access Economics estimate, cited secondarily): government rules cost AU$27 billion a year to administer and AU$67 billion a year to comply with — [Money Management, mixed views on regulation costs](https://www.moneymanagement.com.au/mixed-views-regulation-costs)
- Staff time on reporting: GRC 20/20 (analyst/consultancy) estimates GRC reports often take 80+ person-hours to compile; a consultant study cited there found 80% of staff time went on managing and chasing spreadsheets and building reports rather than managing risk — [GRC 20/20](https://www.grc2020.com/?p=390)
- Spend trend: Gartner projected legal and compliance investment in GRC tools would rise 50% by 2026 — [Help Net Security, Gartner](https://www.helpnetsecurity.com/?p=276192). Hyperproof's 2026 IT Risk and Compliance Benchmark (1,002 GRC professionals) says a majority expect GRC spend to rise in 2026, the second year of increases (exact percentage gated) — [Hyperproof](https://hyperproof.io/it-compliance-benchmarks/)
- Thomson Reuters Regulatory Intelligence Cost of Compliance: the 2021 edition found 34% of firms outsource all or part of compliance — [Corporate Compliance Insights](https://www.corporatecomplianceinsights.com/thomson-reuters-cost-of-compliance-2021/). A 2025 "Cost of Compliance" report (publisher unclear in snippets; CUBE also publishes one under that name) says compliance should give regulatory advice earlier and at the highest management levels — [Compliance Week](https://www.complianceweek.com/risk-management/rapid-regulatory-change-requires-investment-in-compliance-processes-in-financial-services-firms/36332.article)
- Market size: Wheelhouse Advisors sizes the GRC software/services segment at USD 17.2 billion in 2026, growing to USD 35.8 billion by 2033 (11.1% CAGR); total integrated risk management (IRM) at USD 69.7 billion in 2026 — [Wheelhouse Advisors press release, 7 Oct 2026](https://www.prweb.com/releases/wheelhouse-advisors-finds-ai-agents-at-work-in-grc-but-full-autonomy-has-not-arrived-302900792.html)

### Inferences
- Labour, not software, is the largest cost line, so the most credible pitch is "fewer hours of repetitive checking", measured in hours saved, not features shipped.
- Australia already spends a high share on compliance technology (34%), suggesting Australian buyers are used to buying tools and will compare on outcomes, not on "have you digitised yet".
- Small Australian licensees appear to be cutting compliance spend (2025), which points to strong price sensitivity at the small end.

### Gaps
- Thomson Reuters Cost of Compliance 2025/2026 headline figures (budget expectations, staff turnover) could not be retrieved; the report page was not reachable.
- No RegTech Association (Australia) survey on compliance cost was found in search results.
- No reliable 2025–2026 global total for regulatory fines was gathered in this pass.
- Deloitte and KPMG compliance cost surveys were not retrieved.

## 2. Most-cited pain points (spreadsheets, audit fatigue, overlapping frameworks, siloed tools, UX, integrations, false positives, cost)

### Takeaway
The recurring complaints are: work still lives in spreadsheets and screenshots, organisations run several overlapping GRC tools, integrations are shallow or brittle (the single most common complaint about Vanta and Drata on G2), reporting for boards is weak, and in AML a large share of alerts are false positives that waste analyst time.

### Plain-language explanation
- **Evidence collection**: gathering proof for an auditor (screenshots of settings, exports of user lists, signed policies). Done by hand, it is slow and must be repeated every audit.
- **Framework**: a set of rules or controls to follow, e.g. SOC 2, ISO 27001, the Essential Eight. Companies often have to meet several that overlap.
- **False positive**: an alert that looks suspicious (e.g. a payment that resembles money laundering) but turns out to be fine. Each one still has to be checked by a person.

### Cited Findings
- Spreadsheets persist even inside GRC tools: a Reddit thread (snapshot Feb 2026) lists inconsistent risk scoring across teams, GRC tools "overly complex but still rely heavily on spreadsheets", and poor export/reporting for board-level visibility — [Reddit snapshot via sentinel-team](https://reddit.sentinel-team.org/posts/1r2tn8q/snapshots/2026-02-14T09%3A33%3A34.007023Z)
- Small-company audit fatigue: a practitioner at a ~120-person company, running security and all of IT alone, said they had a family member help organise screenshots for the last audit because they were so far behind (Reddit, Dec 2025) — [Reddit snapshot via sentinel-team](https://reddit.sentinel-team.org/posts/1ptnc81/snapshots/2025-12-23T22%3A00%3A06.813696Z)
- Tool sprawl and dissatisfaction: Gartner notes 85% of its assurance clients have more than one GRC tool, and only slightly more than 50% of enterprise risk management users are satisfied — [Gartner research note, via search summary](https://www.gartner.com/en/documents/5368963)
- Integration is the top complaint for compliance-automation tools on G2: Vanta's top cons are "Integration Issues" (179 reviews) and "Limited Integrations" (149); Drata's are "Limited Integrations" (43) and "Integration Issues" (38). Counts vary by snapshot — [G2 comparison, Sprinto vs Vanta vs Drata](https://www.g2.com/compare/sprinto-inc-vs-vanta-vs-drata); [G2, OneTrust vs Vanta vs Drata](https://www.g2.com/compare/onetrust-tech-risk-compliance-vs-vanta-vs-drata)
- A G2 reviewer of Vanta: not all services provided by integrated tools (examples given: CrowdStrike) are covered by continuous monitoring — [G2 Vanta review](https://g2.com/products/vanta/reviews/vanta-review-9312561)
- Competitor-reported complaints about Vanta (treat cautiously, written by rival 6clicks): reporting limitations, hard-to-reach support, billing and cancellation friction — [6clicks blog](https://www.6clicks.com/resources/blog/understanding-vantas-limitations-insights-from-real-user-experiences)
- On G2, Drata's top pros are customer support and ease of use; Vanta's are ease of use and compliance coverage — [G2 comparison](https://www.g2.com/compare/drata-vs-vanta-vs-sprinto-inc)
- AML false positives (vendor survey, SymphonyAI FinCrime Frontier 2026–27): 37% of respondents report false-positive rates above 50%, 25.2% above 75%; only 20.5% keep them below 25%; 70.8% say 5% or fewer alerts lead to escalation or a suspicious matter report; 21.3% do not track their false-positive rate at all — [SymphonyAI](https://www.symphonyai.com/resources/compliance-modernization)
- The widely repeated "90–95% of transaction-monitoring alerts are false positives" is attributed to PwC by vendors, but the original could not be verified — [Youverify](https://youverify.co/en/blogs/howreduce-aml-false-positives)
- Alert growth in Asia Pacific: 79% of organisations report rising screening alerts (2023 data) — [CFOtech Australia](https://cfotech.com.au/story/australia-s-financial-crime-compliance-costs-reach-5-37bn)
- Alert fatigue degrades human judgment, not just time (practitioner commentary) — [Hackernoon](https://hackernoon.com/why-aml-transaction-monitoring-fails-when-you-optimise-for-volume-instead-of-decisions); [Flagright](https://www.flagright.com/post/understanding-false-positives-in-transaction-monitoring)
- Complexity rising: PwC Global Compliance Survey 2025 (1,802 executives, 63 territories) ranked technology as the top compliance priority; the largest gap between expected and actual capability was in AI, resilience and critical infrastructure (via Japanese PwC summary) — [PwC Japan](https://www.pwc.com/jp/ja/knowledge/thoughtleadership/global-compliance-survey-2025.html); [PwC GCS 2025](https://pwc.com/gcs2025)

### Inferences
- "Integrations" is the battleground: buyers judge tools by how deep each connector goes (does it monitor every relevant setting, or just a few?). Shallow connectors push work back into screenshots.
- Board reporting is a weak spot even for enterprise GRC suites, which leaves room for a clear, live board-level view.
- In AML, the measurable pain is analyst hours wasted on false alerts; even basic measurement is missing at about one in five institutions.

### Gaps
- No direct Reddit/Gartner Peer Insights quotes were gathered for ServiceNow GRC, Archer, MetricStream, OneTrust or AuditBoard/Optro; their reputations for heavy implementations are commonly stated but not sourced here.
- No survey figure for "number of frameworks managed per company" was retrievable (Hyperproof 2026 is gated).
- Vendor lock-in and data portability complaints were not found in sourced form.

## 3. Why RegTech implementations fail or get abandoned; adoption barriers

### Takeaway
Gartner's research shows GRC tools take over a year to reach full use, most legal functions fail to get the full benefit of technology they buy, and adoption stalls after go-live because risk teams lack influence and change-management resources. Trust, explainability and governance are the main barriers for AI-based tools.

### Plain-language explanation
"Implementation" is the work of setting the software up: connecting it to existing systems, loading controls and policies, and getting people to actually use it. Many projects stall because the software is configured but staff go back to email and spreadsheets.

### Cited Findings
- GRC tool implementations take more than one year from selection to full functionality (Gartner) — [Gartner research, via search summary](https://www.gartner.com/en/documents/5368963)
- Driving GRC tool adoption after implementation is hard because heads of ERM may lack organisational influence and change-management resources (Gartner) — [Gartner research, via search summary](https://www.gartner.com/en/documents/5592959)
- Gartner survey (140 legal functions, 2024): most failed to capture the full benefits of technology investments; only 37% of legal leaders sought input on barriers before rollout; only 23% scored highly on digital readiness — [Lawyers Weekly](https://www.lawyersweekly.com.au/corporate-counsel/42769-legal-teams-struggle-to-fully-leverage-technology-gartner); a September 2025 Gartner release repeats that legal departments are not realising the full benefits — [BizTech Reports](https://www.biztechreports.com/news-archive/2025/9/10/gartner-says-legal-departments-are-not-realizing-the-full-benefits-from-technology-investments-gartner-september-10-2025)
- Explainability and transparency are among the largest constraints on AI adoption in UK financial services (Bank of England/FCA AI survey, published November 2024); nearly half of AI users have only a "partial understanding" of the AI they deploy — [Finextra](https://finextra.com/newsarticle/45100/ai-adoption-in-uk-fs-sector-grows-but-understanding-lags); [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/cm4inotaz04rougzgd9ujkqhx/ai-in-uk-financial-services-insights-from-the-fca-boe-survey)
- Trust: S-RM survey (225 compliance and due-diligence professionals, early 2026): 84% say trust and output reliability remain a challenge when implementing AI — [S-RM](https://www.s-rminform.com/latest-thinking/integrating-ai-into-compliance-and-intelligence-workstreams-key-trends-to-watch-in-2026)
- Ethisphere x Ethena benchmark (134 organisations, June 2026): ethics and compliance leaders cite accuracy/hallucination risk (53%) and data exposure (48%) as the top reasons holding back their AI adoption — [Ethisphere](https://ethisphere.com/ai-data-report/)
- Third-party dependence: ASIC found many licensees relied heavily on third parties for AI models without appropriate governance to manage the risk (REP 798, October 2024) — [ASIC REP 798](https://asic.gov.au/regulatory-resources/find-a-document/reports/rep-798-beware-the-gap-governance-arrangements-in-the-face-of-ai-innovation/)
- Buyer advice from analysts: ask to see an AI agent running at a named customer, and ask who checks its work — [Wheelhouse Advisors, Oct 2026](https://www.prweb.com/releases/wheelhouse-advisors-finds-ai-agents-at-work-in-grc-but-full-autonomy-has-not-arrived-302900792.html)

### Inferences
- Failure is mostly organisational (long setup, weak ownership, little change management), not purely technical. A product that is useful on day one with little setup addresses the most common failure mode.
- For AI features, a visible trail of "what the AI did and who approved it" is a precondition for adoption, not a nice-to-have.

### Gaps
- No direct measured failure or abandonment rate for RegTech/GRC implementations was found.
- Procurement barriers (security questionnaires, vendor due diligence for small RegTechs) and regulator acceptance of RegTech output were not sourced in this pass.

## 4. Features buyers say they want most

### Takeaway
Buyers ask for automated, continuous evidence collection through deep integrations, one set of controls mapped to many frameworks ("test once, comply many"), clear board-level reporting, and, increasingly, AI that does the legwork (evidence checks, questionnaires, control testing) while people keep the final judgment.

### Plain-language explanation
- **Continuous control monitoring**: software checks your settings all the time (e.g. "is multi-factor login turned on for everyone?") instead of once a year before the audit.
- **Cross-framework mapping**: one control (e.g. "encrypt laptops") counts towards several standards at once, so you test it once.
- **Obligations register**: a list of every legal duty that applies to the company, who owns it, and the evidence that it is met.

### Cited Findings
- More than 80% of companies plan to use technology to automate, optimise and speed up compliance processes (PwC GCS 2025, via Taiwanese news summary) — [Yam News](https://n.yam.com/Article/20250407490246)
- 64% of executives named improved risk visibility as the main benefit of RegTech solutions (secondary report) — [RegTech Analyst](https://regtechanalyst.com/?p=73312)
- Reviewers credit Vanta with automating evidence collection; the most frequent complaints concern integration depth, which shows integration coverage is what buyers value — [G2 comparison](https://www.g2.com/compare/sprinto-inc-vs-vanta-vs-drata)
- Practitioners want better export and reporting for board-level visibility and consistent risk scoring across teams — [Reddit snapshot via sentinel-team](https://reddit.sentinel-team.org/posts/1r2tn8q/snapshots/2026-02-14T09%3A33%3A34.007023Z)
- Vendors' 2026 agentic features target exactly these wants: Optro (formerly AuditBoard) agents run framework scoping, evidence collection and control evaluation "across every framework" while teams make judgments and own attestations; an autonomous testing demo had agents execute control tests and flag exceptions (October 2026) — [PR Newswire](https://www.prnewswire.com/news-releases/optro-launches-domain-trained-agents-for-audit-compliance-third-party-risk-and-ai-governance-302907924.html); [Intelligent CISO](https://www.intelligentciso.com/2026/10/20/optro-launches-domain-trained-agents-for-audit-compliance-third-party-risk-and-ai-governance/)
- Third-party/vendor risk is a priority: a Drata October 2026 report headline says 83% report third-party breaches (secondary aggregator, not verified) — [Industry Lens](https://industry-lens.com/reports/drata-83-report-third-party-october-2026)
- Integrated, automated risk management correlates with fewer breaches: 27% of respondents with an integrated, automated approach had a breach in 2025 (comparison figure gated) — [Hyperproof 2026](https://hyperproof.io/it-compliance-benchmarks/)
- Gartner's 2025 Hype Cycle for legal, risk and compliance highlights GenAI and automation as leaders tackle global regulatory complexity — [Gartner press release, 9 Sep 2025](https://www.gartner.com/en/newsroom/press-releases/2025-09-09-gartner-hype-cycle-highlights-rise-in-gen-ai-and-automation-as-legal-risk-and-compliance-leaders-tackle-global-regulatory-complexity)

### Inferences
- The wanted feature set has converged: deep connectors, continuous checks, cross-framework mapping, board reporting, and AI assistance with human sign-off. Differentiation will come from depth and trustworthiness, not the feature list.
- Multi-entity views and regulatory change alerts mapped to obligations are widely marketed but this pass found no buyer survey ranking them.

### Gaps
- No buyer survey that ranks specific features (e.g. obligations register vs regulatory change alerts vs AI policy drafting) was found.
- No sourced data on demand for multi-entity / multi-site views.

## 5. AI in compliance: adoption, regulator views, explainability, risks, agentic products

### Takeaway
AI use is widespread and growing (about three-quarters of UK financial firms used AI in 2024; 71% of PwC 2025 respondents expect AI to be net positive for compliance), but compliance leaders distrust generic AI for decisions and most insist on a human checkpoint. Regulators (ASIC, FCA) expect governance to keep pace with use and firms to be able to explain their AI. In October 2026 several GRC vendors shipped "agentic" products, but an analyst review found agents mostly assist while people verify.

### Plain-language explanation
- **Hallucination**: when an AI states something false with confidence, e.g. inventing a rule or a piece of evidence. In compliance that is dangerous because the output may be shown to a regulator.
- **Human-in-the-loop**: a person reviews and approves what the AI produced before it counts.
- **Agentic AI**: AI that carries out multi-step tasks itself (collect evidence, run a test, file a finding) rather than just answering questions.

### Cited Findings
- Adoption (UK, Bank of England/FCA survey, November 2024): about 75% of UK financial firms use AI, with another 10% planning to within three years; 81% of AI users employ some kind of explainability method — [Finextra](https://finextra.com/newsarticle/45100/ai-adoption-in-uk-fs-sector-grows-but-understanding-lags); [Stephenson Harwood](https://www.stephensonharwood.com/insights/the-bank-of-england-and-the-fcas-survey-on-ai-in-uk-financial-services/)
- PwC GCS 2025: 71% believe AI will have a net positive impact on compliance (secondary summary) — [Libertify summary](https://www.libertify.com/interactive-library/global-compliance-survey-2025/); [PwC GCS 2025](https://pwc.com/gcs2025)
- Australia: 23% of institutions documented heightened AI use in financial-crime compliance (2023 data) — [CFOtech Australia](https://cfotech.com.au/story/australia-s-financial-crime-compliance-costs-reach-5-37bn)
- Vixio, State of AI Trust in Regulatory Compliance 2026 (qualitative interviews, August 2026): 65% of compliance leaders distrust generic AI for regulatory decisions; about 56% require a human checkpoint before acting on AI output; 59% name hallucinations and fabricated confidence as their primary concern — [Vixio press release](https://www.vixio.com/articles/press-release-new-vixio-report-reveals-65-of-compliance-leaders-distrust-generic-ai-for-regulatory-decisions); [Vixio report](https://www.vixio.com/resources-research-and-guides/the-state-of-ai-trust-in-regulatory-compliance-2026)
- Compliance professionals plan to increase AI tool spending by 24% but a trust gap remains (2026) — [Mondo Visione](https://mondovisione.com/news/compliance-professionals-set-to-increase-ai-tool-spending-by-24-but-trust-gap-2026105/)
- S-RM (225 professionals, 2026): only 12% believe AI will do most due-diligence work with limited human oversight within five years — [S-RM](https://www.s-rminform.com/latest-thinking/integrating-ai-into-compliance-and-intelligence-workstreams-key-trends-to-watch-in-2026)
- White & Case 2025 Global Compliance Risk Benchmarking Survey: more organisations deploy AI for investigations and reporting, but accuracy, governance and data privacy concerns persist — [White & Case](https://whitecase.com/insight-our-thinking/2025-global-compliance-risk-benchmarking-survey-artificial-intelligence)
- ASIC REP 798 "Beware the gap" (October 2024, 23 AFS and credit licensees): some licensees adopt AI faster than their risk and governance arrangements are updated; ASIC expects the gap to widen as adoption grows; governance should lead AI use — [ASIC REP 798](https://asic.gov.au/regulatory-resources/find-a-document/reports/rep-798-beware-the-gap-governance-arrangements-in-the-face-of-ai-innovation/); [MinterEllison](https://www.minterellison.com/articles/asic-urges-stronger-ai-governance-for-afs-and-credit-licensees)
- FCA AI Update (April 2024): firms should expect to explain their use of AI to the regulator; the FCA relies on existing rules (Consumer Duty, SM&CR) rather than AI-specific rules — [Bird & Bird](https://twobirds.com/en/insights/2024/uk/the-fca-publishes-its-expectations-of-uk-financial-services-firms-adopting-or-deploying-ai); [FCA AI Update PDF](https://fca.org.uk/publication/corporate/ai-update.pdf). A 2025 commentary says the FCA is sharpening expectations on explainability, fairness and governance (secondary) — [A-Team Insight](https://a-teaminsight.com/blog/fca-ai-update-2025-how-the-regulator-is-embedding-ai-oversight-into-uk-financial-rules/)
- Agentic products (October 2026): Optro (formerly AuditBoard) launched domain-trained agents for audit, compliance, third-party risk and AI governance — [PR Newswire](https://www.prnewswire.com/news-releases/optro-launches-domain-trained-agents-for-audit-compliance-third-party-risk-and-ai-governance-302907924.html). Commugen launched AI agents for cyber GRC — [CIO Influence](https://cioinfluence.com/automation/commugen-launches-ai-agents-for-cyber-grc-bringing-agentic-automation-to-risk-compliance-management/). Vanta brands itself an "agentic trust platform" with an agent for search, evidence checks and policy generation (secondary roundup) — [ISMS Copilot roundup](https://www.ismscopilot.com/learn/best-ai-grc-tools-2026)
- Wheelhouse Advisors 2026–2027 IRM Navigator (33 providers, evidence Sept 2025–Oct 2026): agents that execute compliance work (gathering evidence, executing control tests, mapping obligations, triaging cases) are in production at customers of a few providers, but no provider shows agents across all four GRC areas with independent verification; most agents assist while people verify; the open question is "who verifies the agents" — [Wheelhouse Advisors, 7 Oct 2026](https://www.prweb.com/releases/wheelhouse-advisors-finds-ai-agents-at-work-in-grc-but-full-autonomy-has-not-arrived-302900792.html)

### Inferences
- The market has moved from "AI chat about compliance" to "AI does the evidence work", but buyer trust lags the product launches. A design where AI proposes and a named person approves, with a log of both, matches what buyers and regulators say they want.
- Regulators are not banning AI in compliance; they want governance first, explainability, and accountable humans. That favours tools whose outputs can be traced back to source evidence.

### Gaps
- SEC statements on firms' use of AI for compliance (as opposed to AI-washing enforcement) were not gathered.
- APRA-specific AI guidance (e.g. CPS 230 operational risk links) was not sourced in this pass.
- EU AI Act application dates for high-risk systems as at November 2026, and whether any delay (the proposed "digital omnibus") was adopted, were not verified here.
- Drata's own 2026 agentic launch announcement was not found directly; details are from secondary roundups.

## 6. Differences between enterprise, mid-market and small business needs

### Takeaway
Evidence is thin and mostly indirect: enterprises run several heavy GRC suites with long implementations and mixed satisfaction; small companies have one overloaded person doing audits by screenshot and are highly price-sensitive; mid-market sits between, often using SOC 2/ISO automation tools whose integration depth is the main complaint.

### Plain-language explanation
Enterprises need many teams, entities and frameworks in one view and can afford long projects. Small firms need something that works out of the box, is cheap, and saves the one person doing compliance their evenings.

### Cited Findings
- Enterprise: 85% of Gartner assurance clients run more than one GRC tool; implementations take over a year; just over half of ERM users are satisfied — [Gartner, via search summary](https://www.gartner.com/en/documents/5368963)
- Small business: a sole security/IT person at a ~120-employee company describes audit prep by screenshots with family help (Reddit, Dec 2025) — [Reddit snapshot via sentinel-team](https://reddit.sentinel-team.org/posts/1ptnc81/snapshots/2025-12-23T22%3A00%3A06.813696Z)
- Small Australian licensees are reducing compliance spend; 40% spend under AU$100,000 on internal compliance staff (February 2025) — [Mondaq](https://www.mondaq.com/australia/compliance/1621992/annual-compliance-trends-survey-results-released)
- Mid-market automation tools (Vanta, Drata, Sprinto) are rated well on ease of use and support, with integrations the most common complaint — [G2 comparison](https://www.g2.com/compare/drata-vs-vanta-vs-sprinto-inc)
- Vanta reportedly claims 16,000 customers (secondary, unverified), indicating how large the SMB/mid-market compliance-automation segment has become — [Industry Lens](https://industry-lens.com/reports/drata-83-report-third-party-october-2026)

### Inferences
- A product aimed at mid-sized, multi-site organisations would compete against both heavy enterprise suites (too slow and costly to set up) and SMB automation tools (too shallow for multi-entity work). The gap is fast setup with enterprise-style multi-entity views.

### Gaps
- No survey segmenting compliance pain points or spend by company size was retrievable (Hyperproof 2026 company-size breakdowns are gated).
- No sourced pricing data for enterprise GRC suites vs SMB tools was gathered.
