# RegTech and compliance software: vendors, buyers and pricing (as of November 2026)

Scope note: researched 4 November 2026 with web search (about 15 queries). Most pricing figures come from third-party aggregators (Vendr, SpendHound, CostBench, ERPResearch, G2, Capterra) because almost no vendor in this market publishes list prices. Vendor-adjacent blogs and lead-generation sites gave conflicting numbers, and I flag them. Older data is marked with its year. Anything I could not confirm with a source this session is in a Gaps section, not stated as fact.

Plain-language glossary for the beginner reader:
- **RegTech**: software that helps regulated companies (banks, insurers, payments firms, listed companies, employers) follow the law and prove they have.
- **AML/KYC**: anti-money-laundering / know-your-customer. Checking who a customer is (ID document, selfie, company registry) and screening them against sanctions and "politically exposed person" lists, then watching their transactions.
- **GRC**: governance, risk and compliance. A central register of risks, controls, policies, audits, incidents and who owns each one.
- **Compliance automation**: software that connects to a company's cloud, HR and code tools, checks security settings automatically and collects evidence for audits such as SOC 2 or ISO 27001.
- **Regulatory reporting**: producing the standard data returns banks must file with regulators (capital, liquidity, statistics).
- **Horizon scanning / regulatory change**: tracking new and changed rules and mapping them to the company's own policies and controls.
- **EHS/WHS**: environment, health and safety / work health and safety (the Australian term). Incident reports, inspections, permits, training records.
- **IRAP**: the Australian Government's security assessment scheme for cloud services. Needed to hold government data classified OFFICIAL: Sensitive or PROTECTED.

## Which vendors lead each segment, what their products do, and who they sell to

### Takeaway
The market splits into seven segments with different buyers and price shapes. AML/identity is priced per check or per monitored customer. Compliance automation (Vanta, Drata) is a fast-growing mid-market subscription. Enterprise GRC and regulatory reporting are six-figure enterprise deals. The big story of 2024 to 2026 is consolidation: private-equity-backed platforms (Regnology, CUBE, Riskonnect, Archer, Diligent, Entrust) buying specialists, including the Australian firm Camms.

### Cited Findings

**AML / KYC / identity verification**
- Sumsub publishes per-verification prices: Basic $1.35 per verification (minimum about $149/month) and Compliance $1.85 per verification (minimum about $299/month); Enterprise is quote-based. A second source lists a $300/month minimum, so the minimums conflict — [Sumsub pricing page](https://sumsub.com/pricing/); [xpay.sh snapshot, May 2026](https://www.xpay.sh/saas-pricing/sumsub); [Brokerage Atlas review](https://brokerage-atlas.pages.dev/setup/kyc-aml/reviews/sumsub/)
- Sumsub add-ons are charged separately: ongoing AML monitoring about $0.08 per initial check plus per checked match; email verification about $0.04 per applicant — [CostBench](https://costbench.com/software/kyc-aml/sumsub/hidden-costs/)
- A comparison of Sumsub, Onfido, Jumio and Veriff for iGaming puts ID checks across these vendors in a range of about $0.80 to $3.80 per check (2026, third-party estimate) — [Tech-Insider](https://tech-insider.org/igt-sumsub-vs-onfido-vs-jumio-vs-veriff-for-igaming-kyc-202-en-d169/)
- ComplyAdvantage prices screening per monitored entity (customer), not per check. G2 lists a Starter Plan at $99.99 for 1,000 monitored entities — [G2 compare](https://www.g2.com/compare/complyadvantage-vs-sumsub)
- ComplyAdvantage's data layer ("Mesh") is reported to power Sumsub's AML screening, so the two are partly suppliers to each other as well as competitors — [Brokerage Atlas](https://brokerage-atlas.pages.dev/setup/kyc-aml/reviews/complyadvantage/)
- Entrust (a digital identity and security company) announced exclusive talks to buy London-based Onfido in early 2024, with press reporting a price above US$400 million (sourced, not official); IBS Intelligence reported completion in April 2024, terms undisclosed. Onfido is now part of Entrust — [FinTech Futures](https://www.fintechfutures.com/biometrics-id-verification/entrust-in-exclusive-talks-to-acquire-id-verification-solutions-provider-onfido); [Fintechnews SG](https://fintechnews.sg/84791/regtech/entrust-in-talks-to-acquire-ai-powered-regtech-firm-onfido-for-over-us400-million/); [IBS Intelligence](https://ibsintelligence.com/ibsi-news/entrust-completes-acquisition-of-id-verification-provider-onfido)
- Silent Eight (Singapore-founded, real and current) sells AI that clears false-positive alerts from name screening and transaction monitoring for banks; its product is Iris. It won ICA Compliance AI Solution of the Year (Europe) in 2025. Total funding is reported as about $55M or $40M depending on the source — [Silent Eight awards](https://www.silenteight.com/award-and-accreditations); [CB Insights](https://www.cbinsights.com/investor/silent-eight); [Silent Eight](https://www.silenteight.com/why-silent-eight)
- Arctic Intelligence (Sydney, founded 2015, CEO Anthony Quinn) sells financial-crime risk assessment software: AML Accelerate, Risk Assessment and Health Check. It is used by reporting entities to write and maintain their AML/CTF risk assessment and programme. Named Australian-founded RegTech of the Year 2020; Finnies 2024 finalist — [Stone & Chalk](https://www.stoneandchalk.com.au/articles/how-arctic-intelligence-is-revolutionising-regtech); [Arctic Intelligence](https://arctic-intelligence.com/insights/blog/arctic-intelligence-named-finalist-for-excellence-in-regtech-at-finnies-2024)
- A 2026 market-research listing names Arctic Intelligence, Global Data and FrankieOne among leading Australian RegTech companies (FrankieOne is an Australian KYC/identity orchestration vendor) — [MarkNtel Advisors](https://www.marknteladvisors.com/query/report-enquiry/regtech-market-australia.html)

**Regulatory reporting (banks, insurers)**
- Regnology (backed by Nordic Capital) bought Wolters Kluwer's Finance, Risk and Regulatory Reporting (FRR) unit, including the OneSumX products, completing by late 2025; Wolters Kluwer FRR product pages now redirect to Regnology. Regnology has also agreed to buy Moody's Regulatory Reporting & ALM business, extending coverage to 50+ jurisdictions — [Wolters Kluwer / Chartis page](https://www.wolterskluwer.com/en/know/chartis-regulatory-reporting-solutions); [PrivSource Regnology profile](https://www.privsource.com/firms/regnology-aorg_rW0fUzbR8q)
- Wolters Kluwer had earlier launched a SaaS (cloud) version of OneSumX regulatory reporting — [A-Team Insight](https://a-teaminsight.com/blog/wolters-kluwer-launches-onesumx-saas-regulatory-reporting-solution)
- AxiomSL (under the Adenza brand) was cited in a 2023 industry survey as a commonly used vendor for producing and submitting regulatory reports (2023 data) — [airframe.ai summary, vendor-aggregator, treat with caution](https://www.airframe.ai/product/wolterskluwer-com-en-solutions-onesumx-for-finance-risk-and-regulatory-reporting/analysis)
- Result: the old "Wolters Kluwer vs AxiomSL vs Regnology" field is now effectively Regnology (with OneSumX and Moody's) vs Nasdaq's AxiomSL (see Gaps for the Nasdaq ownership).

**Regulatory change and horizon scanning**
- CUBE (owned by Hg) sells "Automated Regulatory Intelligence" and regulatory change management: it collects rules from regulators worldwide and maps them to a client's obligations. Its deals: Thomson Reuters Regulatory Intelligence and Oden businesses (May 2024), Reg-Room (New York, May 2024), Acin (operational risk analytics, June 2025), 4CRisk.ai (Silicon Valley, February 2026, maps rule changes to policies and controls) — [PrivSource deal record](https://www.privsource.com/acquisitions/deal/7YSLxm); [Hg Capital](https://hgcapital.com/insights/cube-acquires-reg-room-to-further-extend-its-regulatory-intelligence-and/); [A-Team Insight on Acin](https://a-teaminsight.com/blog/cubes-acquisition-of-acin-integrates-ai-powered-compliance-and-operational-risk-management/?brand=rti); [A-Team Insight on 4CRisk](https://a-teaminsight.com/briefs/cube-acquires-silicon-valley-regtech-4crisk-delivering-next-generation-compliance-and-risk-mapping-automation/)
- So "Thomson Reuters Regulatory Intelligence" as a separate vendor no longer exists; it is part of CUBE (since 2024) — [PrivSource](https://www.privsource.com/acquisitions/deal/7YSLxm)
- CUBE also distributes through partners: a horizon-scanning capability inside IBM watsonx.governance, following earlier tie-ups with Microsoft and ServiceNow — [FinTech Global](https://fintech.global/?p=256443)
- Revolut is a named CUBE customer for global regulatory intelligence — [IBS Intelligence](https://ibsintelligence.com/ibsi-news/cube-to-supply-global-regulatory-compliance-intelligence-services-to-revolut)
- Compliance.ai (San Francisco, about 50 staff, AI regulatory change management for banks and insurers) was bought by Archer on 20 February 2024, terms undisclosed. It is now part of Archer, not a standalone vendor — [Archer press release](https://www.archerirm.com/press-releases/archer-acquires-compliance-ai-to-drive-ai-powered-regulatory-compliance-and-risk-management); [Business Wire](https://businesswire.com/news/home/20240220502745/en/Archer-Acquires-Compliance.ai-to-Drive-AI-Powered-Regulatory-Compliance-and-Risk-Management)
- Ascent RegTech is still trading (exhibiting at the Mortgage Bankers Association), selling a regulatory knowledge platform combining AI and human experts; the only funding found is a $6M Series A from 2018 — [MBA exhibitor listing](https://www.mba.org/detail-pages/exhibitor/ascent-regtech-74536-9745359); [Built In](https://builtin.com/articles/ascent-raises-6m-series-rd)

**Enterprise GRC**
- Archer: Cinven agreed to buy Archer from RSA Security (then owned by Clearlake and STG), dated April 2023, terms undisclosed. Verdantix describes Archer as pivoting from IT GRC towards enterprise risk management — [Cinven](https://www.cinven.com/news-insights/cinven-agrees-to-acquire-archer/); [CB Insights](https://www.cbinsights.com/company/archer-3/financials); [Verdantix Green Quadrant GRC 2025](https://www.verdantix.com/vantage/report/green-quadrant-grc-software-2025)
- Verdantix's 2025 Green Quadrant for GRC software profiles Archer, Diligent, MetricStream and Riskonnect among others — [Verdantix](https://www.verdantix.com/vantage/report/green-quadrant-grc-software-2025)
- Diligent (board portal and GRC) bought 3rdRisk (AI third-party risk management) on 14 January 2026 — [Pulse/B2B Growth News](https://www.pulse.bot/b2b-growth/news/diligent-acquires-3rdrisk-to-deliver-ai-native-third-party-risk-management-at-scale-d4ade95f-8ff2-4025-953f-4c6ea5a67e82)
- MetricStream has Clearlake Capital among its investors; last recorded funding round September 2024 — [CB Insights](https://www.cbinsights.com/company/metricstream/financials)
- Riskonnect (TA Associates-backed integrated risk management) bought Camms (Melbourne, cloud GRC) on 18 June 2024, terms undisclosed, explicitly to grow in Australia, New Zealand and Asia Pacific. Both product lines continue to be sold; Camms operates under the Riskonnect brand. Riskonnect also bought Sword GRC — [Riskonnect press release](https://riskonnect.com/press/riskonnect-acquires-camms-grc/); [TA Associates](https://www.ta.com/news/riskonnect-acquires-camms-to-fuel-grc-innovation-and-global-growth/); [PrivSource Sword GRC](https://www.privsource.com/acquisitions/deal/x7SVL3)
- ServiceNow sells GRC/IRM as applications on its own platform, in Standard, Professional and Enterprise tiers, all by quote — [FitGap](https://us.fitgap.com/products/servicenow-integrated-risk-management)
- AuditBoard and LogicGate are mid-to-large-enterprise GRC/audit platforms; G2 compares them head to head — [G2](https://www.g2.com/compare/auditboard-vs-logicgate-risk-cloud)
- 6clicks (Melbourne, founded by ex-KPMG executives) sells an AI GRC platform and is IRAP-assessed for Australian government use; it sells heavily through MSPs and consultancies. Reported funding: $17.2M across three rounds, including a $10M raise (date not confirmed) — [SmartCompany](https://www.smartcompany.com.au/startupsmart/cyber-regtech-startup-6clicks-capital-raise/); [StartupIntros](https://startupintros.com/orgs/6clicks); [6clicks IRAP blog](https://www.6clicks.com/resources/blog/an-overview-of-the-irap-assessed-grc-platform-for-australian-government)
- Protecht (Sydney-founded risk management, ERM and compliance) is real and current, compared with SafetyCulture on G2, with no public pricing; one review says full risk features sit in higher-priced plans — [G2](https://www.g2.com/compare/protecht-protecht-vs-safetyculturehq); [IntelliPermit review 2025](https://www.intellipermit.com/blog/best-risk-management-software-in-australia-2025-review/)

**Compliance automation for security frameworks (SOC 2, ISO 27001, Essential Eight etc.)**
- Vanta reached about $300M annual recurring revenue in April 2026 (Fortune exclusive; Sacra estimates about 69% year-on-year growth), with more than 16,000 customers including Snowflake, Atlassian, Duolingo, Ramp, Cursor and Harvey; net revenue retention above 100% — [Fortune, 29 April 2026](https://fortune.com/2026/04/29/exclusive-vanta-arr-300-million-sequoia-shadow-ai-claude-cursor/); [Sacra](https://sacra.com/research/vanta-at-300m-year/)
- Vanta's last priced round was a $150M Series D in July 2025 at a $4.15B valuation, led by Wellington Management — [Sacra](https://sacra.com/research/vanta-at-300m-year/); [TechStackIPO](https://techstackipo.com/company/vanta)
- Drata reached about $100M ARR in February 2025 (up 61% year on year) with 7,000 to 8,000 customers; last widely reported valuation $2B (Series C, December 2022) — [geo.sig.ai Drata profile](https://geo.sig.ai/brands/drata); [PremierAlts](https://www.premieralts.com/companies/drata/funding-history)
- YipitData (to February 2026) observes Vanta leading in mid-market customers and Drata leading in enterprise (45 vs 31 observed enterprise customers) — [YipitData](https://www.yipitdata.com/resources/vanta-vs-drata-compliance-software-2026)
- A 2025 benchmark report on the compliance automation segment covers Centraleyes, CyberSaint, Drata, LogicGate, Scytale, Sprinto, Strike Graph, Thoropass and Vanta, confirming Sprinto and Thoropass as current players — [GlobeNewswire, September 2025](https://www.globenewswire.com/news-release/2025/09/02/3142533/28124/en/Compliance-Automation-Company-Benchmark-Report-2025-Featuring-Centraleyes-CyberSaint-Drata-LogicGate-Scytale-Sprinto-Strike-Graph-Thoropass-and-Vanta.html)

**ESG / carbon reporting**
- Workiva (financial and ESG reporting, listed company) publishes no list prices — [SpendHound/ERPResearch](https://erpresearch.com/erp-add-ons/esg-sustainability/persefoni-vs-workiva)
- Persefoni (carbon accounting) offers a free "Pro" tier that can build CSRD, ISSB and CDP reports, with paid enterprise plans by quote — [G2](https://www.g2.com/compare/persefoni-vs-workiva-workiva); [PricingSaaS](https://pricingsaas.com/companies/persefoni); [Socious blog 2026](https://socious-marketing-astro.pages.dev/blog/sustainability-reporting-software-2026)
- Sphera (EHS, product stewardship and sustainability; SpheraCloud modules) publishes no pricing — [SpendHound](https://www.spendhound.com/marketplace/sphera-pricing)

**EHS / WHS**
- SafetyCulture (Sydney-founded, formerly iAuditor) is inspections and checklists on mobile, with a free version and per-user paid plans — [Capterra AU](https://capterra.com.au/software/141080/iauditor)
- Donesafe (now HSI Donesafe) is priced per worker with an initial setup fee, aimed at medium businesses — [IntelliPermit review 2025](https://www.intellipermit.com/blog/best-risk-management-software-in-australia-2025-review/); [Capterra AU](https://www.capterra.com.au/alternatives/155487/cammsrisk)

**Other Australian names checked**
- Daisee (Sydney, founded 2017) is real: AI speech analytics for contact centres that scores calls for compliance (for example, whether agents read mandatory scripts) and flags calls needing review; markets to banks and insurers; sold on AWS Marketplace; product named Lisa — [Insurance Business AU](https://insurancebusinessmag.com/au/news/technology/how-ai-can-predict-a-claim-outcome-from-a-callers-voice-314295.aspx); [Capterra AU](https://www.capterra.com.au/software/196948/lisa); [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-rls3n2uc5j73e)
- Silent Eight is often listed with Australian RegTechs but is Singapore-founded with offices elsewhere; it is not an Australian vendor — [Fintechnews SG](https://fintechnews.sg/40627/fintech-startup-of-the-week/silent-eight-uses-ai-to-fight-financial-crime/)

### Inferences
- The brief's list needs correcting for a beginner: Onfido is part of Entrust; Thomson Reuters Regulatory Intelligence is part of CUBE; Compliance.ai is part of Archer; Wolters Kluwer's regulatory reporting is part of Regnology; Camms is part of Riskonnect. "Kinetic IT" and "CyberCX GRC" look like IT services/consulting firms rather than software vendors (not verified, see Gaps).
- The market has two shapes. Top-down: big PE-backed platforms selling six-figure deals to banks and enterprises (Regnology, CUBE, Archer, MetricStream, ServiceNow, NICE Actimize). Bottom-up: product-led SaaS sold to scale-ups and mid-market (Vanta, Drata, Sumsub, SafetyCulture, Persefoni free tier).
- Australian vendors either get bought by global consolidators (Camms) or win through niches: AML programme risk assessment (Arctic Intelligence), government-grade IRAP-assessed GRC sold via MSPs (6clicks), and safety/inspection (SafetyCulture).

### Gaps
- Not verified this session (from background knowledge only; check before using): Nasdaq bought Adenza (AxiomSL + Calypso) from Thoma Bravo in 2023 for about US$10.5B; Quantexa's latest valuation and 2025 to 2026 funding; NICE Actimize and LexisNexis Risk Solutions product and pricing details; Jumio 2026 status; Napier AI funding; Intelex ownership (Fortive) and Cority ownership; Sphera ownership (Blackstone); OneTrust's 2026 ownership/funding; whether AuditBoard was acquired (reported Hg deal in 2024); Thoropass and Sprinto funding and pricing.
- No sources found on Kinetic IT or CyberCX offering a GRC software product; both may be service providers that implement other vendors' tools.
- Protecht's ownership and 2026 news not found.
- No Gartner Magic Quadrant or Forrester Wave 2026 summaries were retrieved (paywalled).

## Pricing models and published price ranges

### Takeaway
Only the self-serve end publishes prices (Sumsub per check, SafetyCulture per user, Persefoni free tier). Everything else is "contact sales", and the best public benchmarks are Vendr/SpendHound deal data: roughly $8k to $70k a year for compliance automation, $20k to $150k (outliers to $650k) for GRC, $150k to $390k a year for Workiva, and per-check fees of about $1 to $4 for identity verification.

### Cited Findings
- **Pricing models by segment (summary of sources below)**: AML/identity: per verification or per monitored customer plus monthly minimums. Compliance automation: annual subscription by framework count and company size, framework add-ons. GRC: annual platform fee driven by number of "power user"/licensed users and modules. ESG: annual subscription, enterprise tiers. EHS: per user or per worker, plus setup fees.
- Vanta: quote-based, no free trial; reported median contract about $20,000 a year (from 320 purchases); per-framework add-ons reported at $5k+ — [Vendr Vanta](https://www.vendr.com/marketplace/vanta%23what-does-each-vanta-plan-cost); [Tech-Insider comparison 2026](https://tech-insider.org/?p=19984)
- Drata: Vendr-based estimate of $20,000 to $45,000 a year for a mid-sized company's SOC 2 Type II; another source gives an average of about $25,000; framework add-ons from about $1.5k; 2 to 3 year terms commonly give 15 to 25% discounts — [Vendr Drata](https://www.vendr.com/marketplace/Drata); [Tech-Insider](https://tech-insider.org/?p=19984)
- Secureframe: three plans reported at $7,500 to $50,000 a year; other sources say $8,000 to $70,000+ — [UnderDefense, July 2026](https://underdefense.com/blog/secureframe-pricing/); [CostBench](https://costbench.com/software/compliance-management/secureframe/); [Vendr Secureframe](https://vendr.com/marketplace/secureframe)
- A common estimate for a single framework on any of these tools is about $7,500 to $15,000 a year, but sources disagree — [soc2auditors comparison](https://soc2auditors.pages.dev/insights/soc-2-software-pricing-comparison/)
- AuditBoard: Vendr's buyer guide gives an average spend of about $97,000 a year, max about $650,000; Vendr's marketplace page shows a median of $39,548; ERPResearch reports a median about $46,000 with a range $21,000 to $150,000 — [Vendr buyer guide](https://vendr.com/buyer-guides/auditboard); [Vendr marketplace](https://vendr.com/marketplace/auditboard); [ERPResearch](https://erpresearch.com/erp-add-ons/audit-management/auditboard/pricing)
- LogicGate: Vendr median $52,567 (17 purchases), maximum about $270,000; price driven by number of Power User licences; buyers typically save about 17 to 18.6% off list — [Vendr buyer guide](https://www.vendr.com/buyer-guides/logicgate); [SmartSuite](https://www.smartsuite.com/blog/logicgate-pricing)
- ServiceNow IRM: Standard, Professional, Enterprise tiers, all quote-only; no reliable public figure found — [FitGap](https://us.fitgap.com/products/servicenow-integrated-risk-management)
- Sumsub: $1.35 / $1.85 per verification, $149 to $299/month minimums; buyers under about 5,000 verifications a month pay closer to $1.50 (third-party estimate) — [Sumsub](https://sumsub.com/pricing/); [CostBench](https://costbench.com/software/kyc-aml/sumsub/)
- ID verification across Sumsub, Onfido, Jumio and Veriff: about $0.80 to $3.80 per check (2026 estimate) — [Tech-Insider](https://tech-insider.org/igt-sumsub-vs-onfido-vs-jumio-vs-veriff-for-igaming-kyc-202-en-d169/)
- ComplyAdvantage: Starter Plan $99.99 for 1,000 monitored entities — [G2](https://www.g2.com/compare/complyadvantage-vs-sumsub)
- Workiva: SpendHound averages $149,887 a year for SMB and $388,260 a year for enterprise (third-party estimate) — [SpendHound via search snippet](https://www.spendhound.com/marketplace/sphera-pricing); [ERPResearch](https://erpresearch.com/erp-add-ons/esg-sustainability/persefoni-vs-workiva)
- Sphera: SpendHound averages $13,454 a year SMB and $248,112 a year enterprise — [SpendHound](https://www.spendhound.com/marketplace/sphera-pricing)
- Persefoni: free Pro tier (one user); enterprise plans undisclosed — [G2](https://www.g2.com/compare/persefoni-vs-sphera); [PricingSaaS](https://pricingsaas.com/companies/persefoni)
- SafetyCulture: from $29 per user per month with a free version (Capterra); another 2026 source says about $37 per user per month for the paid tier (difference likely currency or tier) — [Capterra AU](https://capterra.com.au/software/141080/iauditor); [TradieScaler, April 2026](https://tradiescaler.pages.dev/safety-compliance)
- Donesafe: per worker plus setup fee; Protecht and Camms: price on application — [IntelliPermit 2025](https://www.intellipermit.com/blog/best-risk-management-software-in-australia-2025-review/); [G2](https://www.g2.com/compare/protecht-protecht-vs-safetyculturehq)

### Inferences
- Implementation (setup) fees are common in enterprise GRC, EHS and regulatory reporting but were not quantified in any source found; buyers should budget for a partner or vendor services fee on top of licences.
- The Vendr gap between "average" and "median" (AuditBoard $97k vs $39.5k) means a few large contracts drag the average up; the median is the better guide for a typical buyer.
- Per-check pricing (identity) scales with customer sign-ups, so it suits fintechs; per-seat and per-module pricing (GRC) scales with organisational complexity.

### Gaps
- No public price data found for NICE Actimize, LexisNexis Risk, Quantexa, Napier, Jumio list prices, Regnology, AxiomSL, CUBE, MetricStream, Archer, OneTrust, Diligent, Riskonnect, Cority, Intelex, Arctic Intelligence, 6clicks, Protecht or Camms.
- No AUD prices found for any Australian vendor.
- Implementation fee ranges not found.

## Who buys, who uses it, sales cycles and procurement hurdles

### Takeaway
The budget holder depends on segment: the CISO or CTO for security compliance automation, the Chief Compliance Officer or MLRO for AML and regulatory change, the CRO and internal audit for enterprise GRC, the CFO/controller for regulatory and ESG reporting, the HSE manager for safety. Sources on sales cycles are thin and vendor-written: about 4 to 8 weeks for mid-market GRC and 60 to 180 days for Australian cybersecurity sales. Vendors themselves must pass security reviews (SOC 2, ISO 27001), and IRAP for Australian government work.

### Cited Findings
- In GRC deals, the CISO owns the compliance programme and evaluates the vendor; a risk or compliance officer runs it day to day; the CFO or COO approves the budget (6clicks MSP guide) — [6clicks](https://www.6clicks.com/resources/blog/msp-guide-selling-cyber-grc-managed-service)
- Typical cybersecurity buying personas: CISO, VP Security, Head of IT, CTO, Compliance Officer — [DevCommX](https://www.devcommx.com/fractional-revops/canberra/cybersecurity)
- Mid-market GRC sales cycle: about 4 to 8 weeks (vendor claim) — [6clicks](https://www.6clicks.com/resources/blog/msp-guide-selling-cyber-grc-managed-service)
- Australian cybersecurity sales cycle: 60 to 180 days (marketing agency claim) — [DevCommX](https://www.devcommx.com/demand-generation/adelaide/cybersecurity)
- G2's 2023 GRC report: average contract length 22 months; user adoption of GRC platforms relatively low at 57% (US-focused, 2023) — [G2](https://www.g2.com/articles/g2-grid-report-grc-platforms)
- IRAP: a SaaS product that stores, processes or transmits Australian Government information at OFFICIAL: Sensitive, PROTECTED or above almost certainly needs an IRAP assessment before an agency can use it; there is no small-business exemption; assessments run on about a two-year cycle — [Cybernion guide](https://cybernion-website.pages.dev/insights/do-we-need-an-irap-assessment/)
- Australian government GRC tenders prefer SaaS and require a current IRAP assessment at PROTECTED level — [AustralianTenders](https://www.australiantenders.com.au/tenders/597633/governance-risk-and-compliance-grc-system)
- 6clicks markets itself as an IRAP-assessed GRC platform for Australian government — [6clicks](https://www.6clicks.com/resources/blog/an-overview-of-the-irap-assessed-grc-platform-for-australian-government)
- OneTrust sells to the UK public sector through the G-Cloud Digital Marketplace (a government procurement framework) — [UK Digital Marketplace](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/660488860974899)
- Vanta grew on demand from AI companies and "shadow AI" governance in 2026 (Cursor, Harvey named as customers): fast-growing startups buy compliance automation to pass their own customers' security reviews — [Fortune](https://fortune.com/2026/04/29/exclusive-vanta-arr-300-million-sequoia-shadow-ai-claude-cursor/)
- Multi-year commitments (2 to 3 years) and competing quotes are common negotiation levers in compliance automation buying — [Vendr Drata](https://www.vendr.com/marketplace/Drata)

### Inferences
- Buyer by segment (inferred from what each product does): AML/KYC: Chief Compliance Officer or MLRO, with fraud and onboarding/product teams; users are AML analysts. Regulatory reporting: CFO, Head of Regulatory Reporting, finance; users are reporting analysts. Regulatory change: CCO and legal; users are compliance officers. Enterprise GRC: CRO, Chief Audit Executive, sometimes company secretary (Diligent's board portal origin); users are risk and audit teams plus control owners across the business. Compliance automation: CISO/CTO/founder; users are engineers and a GRC lead. ESG: CFO, Chief Sustainability Officer; users are sustainability analysts. EHS/WHS: HSE manager; users are frontline workers on mobile.
- Selling compliance software creates a double compliance burden: the vendor has to show its own SOC 2/ISO 27001 report (and IRAP for Australian government, APRA CPS 230/234 third-party due diligence for Australian banks and insurers) before it can sell.
- Low GRC adoption (57%) suggests day-to-day users outside the risk team rarely log in; that is a gap new tools target with embedded workflows in tools people already use (ServiceNow, Jira, Slack).

### Gaps
- No independent data on sales cycle length by segment (enterprise bank deals are commonly said to take 6 to 18 months, but no source was found this session).
- No source tying APRA CPS 230 (operational risk, in force July 2025) to vendor procurement behaviour; needs a separate search.
- No source on how many vendors hold IRAP assessments.

## How products are deployed and integrated

### Takeaway
Almost everything new is multi-tenant SaaS; legacy enterprise products (regulatory reporting, AML transaction monitoring, Archer) still also run on-premise or in a private cloud and are migrating. Integration is by API, pre-built connectors and, increasingly, by running inside a host platform such as ServiceNow or IBM watsonx.

### Cited Findings
- Wolters Kluwer launched a SaaS edition of OneSumX regulatory reporting, a move from installed software to cloud; Regnology describes its portfolio as SaaS — [A-Team Insight](https://a-teaminsight.com/blog/wolters-kluwer-launches-onesumx-saas-regulatory-reporting-solution); [Wolters Kluwer / Regnology](https://www.wolterskluwer.com/en/know/chartis-regulatory-reporting-solutions)
- Camms is described as cloud-based GRC software — [Riskonnect](https://riskonnect.com/press/riskonnect-acquires-camms-grc/)
- Australian government GRC tenders prefer SaaS (with IRAP PROTECTED) — [AustralianTenders](https://www.australiantenders.com.au/tenders/597633/governance-risk-and-compliance-grc-system)
- ServiceNow GRC runs as applications on the customer's own ServiceNow instance; all GRC applications are delivered through the ServiceNow Store and require entitlement — [ServiceNow docs](https://www.servicenow.com/docs/r/governance-risk-compliance/grc-and-store.html)
- Vanta integrates through 300+ pre-built connectors to cloud, identity, HR and code tools, plus APIs — [Vanta developer docs](https://developer.vanta.com/docs/build-integrations)
- Sumsub and similar identity vendors are consumed via API/SDK and dashboards — [API Evangelist Sumsub](https://providers.apievangelist.com/providers/sumsub/)
- Daisee and other vendors also sell through the AWS Marketplace, which lets buyers pay through their AWS bill — [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-rls3n2uc5j73e)
- CUBE delivers its regulatory content inside third-party platforms (IBM watsonx.governance, Microsoft, ServiceNow) — [FinTech Global](https://fintech.global/?p=256443)

### Inferences
- "Content as a feed" (CUBE into ServiceNow, ComplyAdvantage data into Sumsub) is a common pattern: data vendors supply regulatory or risk data to workflow platforms instead of competing for the user interface.
- Cloud marketplaces (AWS, Azure) matter because they let buyers use pre-committed cloud spend and skip a separate procurement round.

### Gaps
- No source quantified the SaaS vs on-premise split, or which AML/transaction monitoring vendors (NICE Actimize, Quantexa) still ship on-premise in 2026.
- No source on self-hosted / data-residency options for Australian customers (for example local AWS Sydney hosting).

## Plug-in and marketplace ecosystems, and how third-party apps plug in

### Takeaway
Three ecosystems are concrete and documented: ServiceNow Store (apps installed on the customer's ServiceNow instance), Vanta's integration marketplace (partners build connectors with a free partner programme and a dedicated "Build Integrations" API), and OneTrust's Integrations Gallery (165+ integrations, validated by OneTrust before listing). A third-party monitoring or evidence tool would most easily plug in as a Vanta/Drata evidence source or a ServiceNow Store app.

### Cited Findings
- Vanta: the Vanta Integration Partner Program is free and lets software companies build and publish a public integration to the Vanta marketplace using the Build Integrations API, the only API open to partners. Customers can also build private integrations for their own tenant, self-serve, in the Developer Console. Partners cannot use the "Manage Vanta" API (for example assigning control owners or managing vendors). Vanta has 300+ pre-built integrations — [Vanta developer docs: build integrations](https://developer.vanta.com/docs/build-integrations); [Vanta: become a partner](https://developer.vanta.com/docs/guides/become-partner.md); [Vanta integrations concepts](https://developer.vanta.com/docs/concepts/integrations)
- Vanta announces integrations in batches (for example "50 new integrations") — [Vanta](https://www.vanta.com/resources/50-new-integrations)
- ServiceNow: all GRC applications, including ServiceNow's own, are distributed through the ServiceNow Store. ServiceNow's own apps use a "GRC:" name prefix; third-party apps that work with ServiceNow GRC do not. A 2019 community post counted 60+ partner GRC apps on the Store (2019 figure, dated) — [ServiceNow docs](https://www.servicenow.com/docs/r/governance-risk-compliance/grc-and-store.html); [ServiceNow Community 2019](https://www.servicenow.com/community/grc-blog/the-servicenow-store-speeds-access-to-new-grc-applications/ba-p/2273910); [ServiceNow Store GRC release notes](https://www.servicenow.com/docs/r/store-release-notes/store-rn-grc.html)
- OneTrust: a Technology Partner Program; partner-built integrations appear in the OneTrust Integrations Gallery after a OneTrust technical resource validates them. OneTrust's developer site claims 165+ integrations, 500+ APIs and 14,000+ customers; a third-party tracker counted 115 listings and 80 ISV partners in May 2025 — [OneTrust Technology Partner Program](https://developer.onetrust.com/onetrust/page/partners); [OneTrust integrations](https://www.onetrust.com/integrations/?integrations=cmp); [AppMarketplace tracker](https://appmarketplace.com/marketplaces/onetrust-integrations-marketplace)
- OneTrust also appears inside other vendors' marketplaces (for example Braze, Auth0), the reverse direction of plug-in — [Braze marketplace](https://marketplace.braze.com/partners/onetrust); [Auth0](https://auth0.com/blog/consent-management-with-auth0-marketplace/)
- 6clicks uses a partner/MSP channel model: MSPs and consultancies resell and run GRC as a managed service on the 6clicks platform — [6clicks MSP guide](https://www.6clicks.com/resources/blog/msp-guide-selling-cyber-grc-managed-service)

### Inferences
- For a small third-party product, the lowest-friction routes are: (1) a public Vanta integration (free programme, scoped API that pushes evidence/resources in), (2) a OneTrust gallery listing (needs OneTrust validation), (3) a ServiceNow Store app (heavier: built on the ServiceNow platform and certified through ServiceNow's store process).
- Marketplaces shift selling: a listing makes a product discoverable to the host's existing customers and lets it ride the host's procurement approval, rather than going through a separate security review.

### Gaps
- Drata, Secureframe, AuditBoard, Archer, MetricStream and Diligent integration/partner programmes were not researched this session.
- ServiceNow Store certification steps, revenue share and current count of GRC partner apps not found (only the 2019 figure).
- No data found on what share of revenue any vendor gets through marketplaces.
