# Gaps, underserved segments and white space in RegTech and compliance software (as of November 2026)

Point of view: a solo founder or tiny team in Australia who already runs an operations monitoring hub (software, sites, people, rosters, CCTV, door access, Intune devices, Xero and MYOB) and wants a compliance app that plugs into it. First targets are large multi-site manufacturers.

Method note: about 19 web searches and fetches on 4 November 2026. Most sources found are vendor blogs, law-firm notes and trade press, not regulators. Where only a vendor or secondary source exists, it is flagged. Nothing here was checked against legislation text directly. Treat every date and threshold as "verify with the regulator before you build on it".

Plain-language glossary for a beginner:
- **RegTech**: software that helps a business meet laws and rules (regulation + technology).
- **GRC**: governance, risk and compliance. Tools that keep a list of rules (controls), who owns each, and proof (evidence) that each is being met.
- **Control**: one thing you promise to do, such as "only staff with a badge can enter the server room".
- **Evidence**: the proof an auditor accepts, such as a door-access log export or a signed inspection.
- **Continuous control monitoring (CCM)**: checking controls automatically and often, from live data, instead of a yearly questionnaire.
- **Reporting entity** (AML/CTF): a business AUSTRAC regulates, which must enrol, run an AML/CTF program, check customers and report suspicious matters.
- **Scope 1/2/3**: greenhouse emissions from your own operations (1), from the energy you buy (2), and from your whole supply chain and product use (3).
- **SOCI / CIRMP**: Security of Critical Infrastructure Act 2018, and its Critical Infrastructure Risk Management Program, a written plan covering cyber, personnel, supply-chain and physical hazards.
- **IRAP**: the Australian Government's security assessment scheme for cloud and IT services.

## Q1. Ranked list of gaps (synthesis across the questions below)

### Takeaway
The strongest fit for this founder is not a crowded horizontal GRC tool but "evidence from operations": pulling proof for physical security, people/licence and device controls straight from systems the hub already watches (door access, CCTV health, rosters, Intune), mapped to ISO 27001 Annex A 7, SOCI CIRMP physical and personnel hazards, and WHS licence rules. No source found shows a mainstream GRC platform with native door-access or CCTV connectors. Time-boxed regulatory deadlines (Privacy Act automated decisions on 10 Dec 2026, AASB S2 Group 2/3, AML/CTF Tranche 2) are real demand spikes but are either crowded already (Tranche 2) or a poor fit with the hub.

### Cited Findings
- Search for GRC platforms that collect evidence natively from physical access control or CCTV found none; documented GRC connectors are mostly cloud and identity providers, e.g. Drata connects to cloud infrastructure and identity providers — [Vanta enterprise GRC list](https://www.vanta.com/resources/best-grc-software-solutions-for-enterprises); [Mitratech GRC list](https://mitratech.com/resource-hub/blog/top-9-grc-software-platforms-for-global-risk-management-2026/)
- ISO 27001 auditors ask whether badge-reader logs are kept and reviewed, how long CCTV footage is kept and who can see it — [HighTable A.7.4](https://hightable.io/iso-27001-annex-a-7-4-physical-security-monitoring/); [ISMS.online A.7.4](https://www.isms.online/iso-27001/annex-a-2022/7-4-physical-security-monitoring-2022/)
- The SOCI CIRMP must cover cyber, personnel, supply chain and physical hazards, not cyber only — [CISC CIRMP guidance](https://www.cisc.gov.au/resources-subsite/Documents/guidance-for-the-critical-infrastructure-risk-management-program.pdf); [Invicti SOCI guide](https://www.invicti.com/blog/web-security/soci-act-explained-compliance-rules-and-requirements)
- SOC 2 automation is heavily funded and crowded: Vanta valued at $4.15B (July 2025), estimated ~$300M ARR by April 2026 (secondary estimate); Comp AI raised a $34M Series A in September 2026 claiming 1,000+ customers — [ValueAddVC](https://valueaddvc.com/pulse/comp-ai-34m-series-a-agentic-compliance-2026); [Comp AI press](https://www.trycomp.ai/press/series-a)

### Inferences
Proposed ranking for this founder (fit with the hub, room in the market, barrier for a small entrant). This is my judgement from the evidence below, not a sourced ranking.

| Rank | Gap | Fit with hub | Crowding | Small-entrant difficulty |
|---|---|---|---|---|
| 1 | Physical and operational evidence feed for ISO 27001 Annex A 7 / SOCI CIRMP physical and personnel hazards (door access, CCTV uptime and retention, visitor logs, comms-room checks) | Very high: hub already has these feeds | Sparse: no native connectors found | Medium: needs auditor acceptance; selling to security/compliance managers at large manufacturers is slow |
| 2 | Multi-site licence, ticket and induction compliance linked to rosters and door access (block a shift or a door when a ticket lapses) | Very high: rosters, people and door access already in hub | Partly covered by roster tools (RosterElf, WorkPro, Lucidity) but not tied to access control | Low-medium: WHS rules are public; no certification needed |
| 3 | "Compliance as a by-product of operations" CCM layer that exports evidence into existing GRC tools (Vanta, Drata, 6clicks, CISO Assistant) instead of competing with them | High | GRC is crowded, but connectors for non-cloud evidence are missing | Medium: integration work with each GRC tool |
| 4 | Privacy Act APP 1.7–1.9 automated-decision inventory (deadline 10 Dec 2026) | Medium: hub knows which apps and data stores exist | Mostly law firms and small vendors publishing guides | Low regulatory barrier; demand peaks then fades; very short runway now |
| 5 | AI-use inventory and evidence (ISO 42001, shadow AI) from device and app telemetry (Intune, SaaS logs) | Medium-high | Fast-growing, well-funded vendors (Credo AI, Modulos, WitnessAI, Cranium) | Medium: crowded at the top end; mid-market AU less so |
| 6 | Data-sovereign / self-hosted compliance tooling for AU | High if the hub is self-hostable | 6clicks holds IRAP for its government instance; open-source CISO Assistant can be self-hosted | High if IRAP is needed (cost and time); low if "AU-hosted, self-hostable" is enough |
| 7 | OT/plant network compliance (IEC 62443, SOCI) for manufacturers | Low-medium: needs OT network visibility the hub does not have | Specialist OT security vendors (e.g. Industrial Defender) and consultancies | High: deep OT expertise, safety-critical, many manufacturers are not SOCI entities |
| 8 | Supplier evidence: Scope 3 data requests and modern slavery due diligence for mid-market suppliers | Low-medium (Xero/MYOB spend data helps spend-based Scope 3) | Many ESG and carbon vendors | Medium; reform still proposed for modern slavery |
| 9 | Regulatory change / obligations registers mapped to AU law for SMEs and non-financial industries | Low | LexisNexis dominates content; Reguladar targets SMEs | High: needs legal content and constant upkeep |
| 10 | AML/CTF Tranche 2 tools for small professional firms | Low | Already crowded with AU/NZ vendors | Medium-high: legal liability, AUSTRAC expectations |
| — | Psychosocial / right-to-disconnect monitoring | Risky: monitoring staff collides with Mycelium's own no-surveillance rule | Mostly HR consultants and EAP providers | High reputational risk; better as aggregate, non-personal signals only |

- Common thread: the hub's unfair advantage is live operational data. Gaps that need legal content (obligations registers, Tranche 2 programs) play to someone else's strength.
- Integrating with GRC incumbents (being their missing physical/OT/people evidence source) looks less risky than fighting them.

### Gaps
- No analyst sizing (Gartner, IDC) for "physical security evidence for GRC" was found; size estimates for each gap are not sourced.
- Did not find Blackbird, Square Peg, Airtree, a16z, Sequoia or Bessemer theses on these specific niches in this session.
- Did not check whether Vanta, Drata, 6clicks or ServiceNow offer custom connectors that customers already use for door access systems (e.g. Gallagher, Genetec). Ask vendors directly.

## Q2. AML/CTF Tranche 2: how many new reporting entities, how ready, what tools exist for small professional firms?

### Takeaway
Tranche 2 is live: enrolment opened 31 March 2026, obligations began 1 July 2026, and the initial enrolment deadline was 29 July 2026. Fewer than half the expected entities had enrolled by mid-August and AUSTRAC has started sending information notices. But the small-firm tool market is already crowded with AU/NZ vendors, so this is a poor niche for this founder.

### Cited Findings
- The Attorney-General's estimate of new reporting entities is 89,557; 39,520 had enrolled as of 13 August 2026 (Real Estate Business, citing AUSTRAC) — [FinCrime Agent](https://fincrimeagent.com/news/issue-14/austrac-section-167-notices-tranche-two-enrolment/)
- 17,970 real estate agencies registered as of 20 August 2026 against roughly 45,000 offices (agencies vs offices may not be like-for-like) — [FinCrime Agent](https://fincrimeagent.com/news/issue-14/austrac-section-167-notices-tranche-two-enrolment/)
- AUSTRAC began issuing section 167 information notices to businesses that appear to provide designated services without enrolling; reported 27 August 2026 — [FinCrime Agent](https://fincrimeagent.com/news/issue-14/austrac-section-167-notices-tranche-two-enrolment/)
- Timeline: amended Act commenced for existing reporting entities 31 March 2026; Tranche 2 entities from 1 July 2026; enrolment portal opened 31 March 2026 for lawyers, accountants, real estate agents, buyers' agents and property developers; initial enrolment deadline 29 July 2026; new providers enrol within 28 days of starting a designated service — [Legl](https://legl.com/articles/tranche-2-enrolment-open-australian-law-firms-july-2026); [CompareAML enrolment guide](https://www.compareaml.com.au/guides/austrac-enrolment); [EasyAML timeline](https://easyaml.com/resources/blog/articles/latest-update-on-your-tranche-2-timeline-now-and-before-july-2026/)
- Vendors already serving small firms include easyAML (integrates with Actionstep, Unity, Clio), First AML (NZ-based, strong on complex structures), Clear AML, Duely, IntelliCompli, plus Infinity BGL, TrustEasy, Ignition, VeriMe in comparison tables; NameScan and Persona/ComplyCube for screening — [NameScan](https://namescan.io/insights/select-the-right-tool-for-tranche-2-aml-compliance/); [Capterra ClearAML](https://www.capterra.com/p/10045616/ClearAML/); [GetApp Duely](https://www.getapp.com.au/software/2293463/duely-1); [ComplyCube top 5](https://www.complycube.com/en/?p=34452); [Persona](https://withpersona.com/blog/tranche-2-australia)
- Screening software alone does not meet Tranche 2 obligations; firms still need their own policies, risk assessments and staff processes — [NameScan](https://namescan.io/insights/select-the-right-tool-for-tranche-2-aml-compliance/)
- Earlier commentary warned Tranche 2 risked leaving SMEs behind — [FinTech Global, June 2025](https://fintech.global/2025/06/03/australias-tranche-2-aml-reforms-risk-leaving-smes-behind)

### Inferences
- About 50,000 expected entities had not enrolled by mid-August 2026 (89,557 minus 39,520), so the late-adopter tail is large. But at least eight AU/NZ vendors already compete for small firms, and the work is mostly customer due diligence and policy, not operations telemetry. Low fit with the hub; crowded. Reject as the primary niche.
- A possible narrow angle: Tranche 2 entities that are also multi-site operations (property developers, large real estate groups) might value linking staff training and access records to their AML program, but this is speculative.

### Gaps
- No independent readiness survey of Tranche 2 entities was found; the enrolment figures are secondary (Real Estate Business via FinCrime Agent), not AUSTRAC's own publication.
- No enrolment figures by sector for lawyers, accountants, conveyancers, trust and company service providers or dealers in precious stones.
- Vendor pricing is unverified (one affiliate page quotes from $179/month).

## Q3. AASB S2 mandatory climate reporting: Group 2 and 3, the mid-market, Scope 3 supplier data

### Takeaway
Group 2 reporting applies to periods starting on or after 1 July 2026; Scope 3 is not required in the first reporting year. Suppliers to Group 1 and 2 reporters should expect Scope 3 data requests. Policy is still moving (Treasury consultation on easing supplier requests closed 2 October 2026). Carbon accounting is a busy vendor space; the founder's Xero/MYOB connectors fit spend-based Scope 3, but this is not a clear white space.

### Cited Findings
- Group 2 reporting begins for periods starting on or after 1 July 2026; Scope 3 not required in Year 1 (broadly FY27 for June year-end Group 2 entities), mandatory from Year 2 — [Naturaliste Solutions](https://naturalistesolutions.com.au/insights/aasb-s2-group-2-climate-reporting/); [SAI Assurance](https://saiassurance.com.au/news-resources/blog/aasb-s2-reporting-starts-1-july-2026-is-your-organisation-ready/)
- Scope 1 and 2 data collection should be live from 1 July 2026, with Scope 3 supplier engagement starting for Year 2 — [Eco-Shaper Group 2](https://eco-shaper.com/aasb-s2-group-2-mandatory-climate-reporting-australia-2026/)
- Suppliers to Group 1 and 2 reporters should prepare for Scope 3 data requests from 2026 onward — [Industry Queensland](https://industryqld.com.au/climate-ready-suppliers-can-gain-an-edge-under-aasb-s2/)
- Treasury consultation on easing supplier information requests was open until 2 October 2026; Budget 2026–27 changes would clarify the "undue cost or effort" exemption for unmeasurable Scope 3 categories — [NetNada Budget 2026–27](https://www.netnada.com/post/budget-2026-27-climate-disclosures)
- Assurers prefer activity-based data; spend-based approaches also accepted — [Terrascope](https://www.terrascope.com/blog/navigating-australia-mandatory-climate-reporting)
- Group 2 thresholds conflict between sources: one gives two of three of $200M revenue, $500M gross assets, 250 employees; another gives 500 employees / $500M revenue / $1B assets (the latter looks like Group 1) — [Eco-Shaper](https://eco-shaper.com/aasb-s2-group-2-mandatory-climate-reporting-australia-2026/); contradicted by [Eco-Shaper 5 ways](https://eco-shaper.com/aasb-s2-reporting-requirements-5-ways-to-get-ready/)
- Many vendors already target this: Trace, NetNada, Terrascope, Eco-Shaper, Naturaliste and others publish readiness offers — [Trace](https://www.our-trace.com/blog/mid-market-readiness-assessment-dont-delay); [NetNada](https://www.netnada.com/post/budget-2026-27-climate-disclosures)

### Inferences
- The hub's site-level energy and device telemetry plus Xero/MYOB spend could feed Scope 1/2 and spend-based Scope 3, but carbon accounting vendors already do this. A narrower angle: helping the *supplier* side (a manufacturer's own SME suppliers) answer data requests cheaply. Medium crowding, medium fit.
- Group 3 (smaller entities, from 1 July 2027 per the legislated timeline) was not checked in this session.

### Gaps
- Group 3 dates and thresholds not verified this session.
- The ESGI Group 2 briefing paper (August 2026) was found but not read — [ESGI briefing](https://esgandi.com.au/__l5e/assets-v1/b03c597c-a405-4874-9628-0b1a3af33d54/ESGI_Group_2_AASB_S2_Briefing_Paper_August_2026.pdf)
- No count of Group 2 entities found.

## Q4. Physical security compliance (access control, CCTV, visitor logs, comms rooms) linked to ISO 27001 Annex A and SOCI evidence

### Takeaway
This is the clearest white space found. ISO 27001 Annex A 7.x and the SOCI CIRMP physical hazard both need proof that physical access is monitored and reviewed, and auditors ask for log retention and review records. Search found no GRC platform with native door-access or CCTV evidence connectors; evidence today is manual upload, custom integration or a SIEM bridge.

### Cited Findings
- ISO 27001:2022 Annex A 7.4: premises should be continuously monitored for unauthorised physical access; CCTV is usual but not mandated; choice must be justified by risk assessment — [HighTable](https://hightable.io/iso-27001-annex-a-7-4-physical-security-monitoring/); [ISMS.online](https://www.isms.online/iso-27001/annex-a-2022/7-4-physical-security-monitoring-2022/)
- Auditors ask whether access logs are kept and reviewed, how long CCTV is kept and who can access footage; "periodic" review must be defined and review evidence kept — [Copla](https://copla.com/blog/compliance-regulations/does-iso-27001-cover-physical-security-full-guide-with-checklist/); [TCSA A.7.4](https://www.tcsa.in/frameworks/iso-27001/controls/7-4-physical-security-monitoring)
- A suggested evidence pattern: weekly sampled reconciliation of physical access logs against CCTV, review records kept as primary evidence (vendor suggestion, not a requirement) — [HighTable](https://hightable.io/iso-27001-annex-a-7-4-physical-security-monitoring/)
- Practitioners recommend feeding badge anomalies and environmental alarms into a SIEM to correlate physical and digital events — [GRC Solutions](https://grcsolutions.io/iso-27001-and-physical-security/)
- Monitoring evidence should also cover privacy notices, retention limits and restricted footage access — [ISMS.online](https://www.isms.online/iso-27001/annex-a-2022/7-4-physical-security-monitoring-2022/)
- GRC platforms' documented connectors are mostly cloud, identity, ERP, ITSM, HR — [Mitratech](https://mitratech.com/resource-hub/blog/top-9-grc-software-platforms-for-global-risk-management-2026/); [Sprinto controls](https://sprinto.com/grc/controls/)
- SOCI CIRMP covers physical and personnel hazards alongside cyber and supply chain — [CISC guidance](https://www.cisc.gov.au/resources-subsite/Documents/guidance-for-the-critical-infrastructure-risk-management-program.pdf)

### Inferences
- Concrete product: map hub signals to controls. Door-access events and review sign-offs to A.7.2 and A.7.4; CCTV camera uptime and retention settings to A.7.4; visitor log completeness to A.7.2; comms-room inspection checklists and environmental sensors to A.7.5 and A.7.8; joiner/leaver badge removal versus HR records to A.5.18 and A.7.2. Export as dated evidence packets into existing GRC tools.
- Must keep events metadata only (who/when/which door, not footage), which matches the hub's own rules and the privacy point above.
- Who buys: security, facilities and compliance managers at multi-site manufacturers, data-centre and logistics operators, SOCI-regulated entities. Barrier: proving auditors accept automated evidence; long enterprise sales cycles.

### Gaps
- Did not verify with Genetec, Gallagher, Milestone or similar whether their own compliance reporting already covers ISO 27001 evidence; this is the most likely partial competitor and should be checked next.
- No market size figure.

## Q5. OT/plant network compliance (IEC 62443, SOCI) for manufacturers

### Takeaway
IEC 62443 was adopted as an Australian standard (AS IEC 62443) in 2025, and it aligns with SOCI CIRMP cyber requirements without being named in the Act. But general manufacturing is not one of SOCI's 11 sectors, the space is held by specialist OT security vendors and consultancies, and it needs deep OT network visibility. Poor fit for a solo founder.

### Cited Findings
- SOCI does not mandate IEC 62443 by name; CIRMP requirements align with it; using it does not automatically satisfy all CIRMP requirements — [Industrial Defender](https://www.industrialdefender.com/ot-cybersecurity/iec-62443-australia); [ESIS](https://www.esis.com.au/iec-62443-guide-australian-manufacturers/)
- One vendor page claims the Act explicitly references IEC 62443; this contradicts the other sources and was not confirmed — [operationaltechnology.au](https://operationaltechnology.au/ot-security.html)
- SOCI applies to 11 defined critical infrastructure sectors; general manufacturing is not named — [Invicti](https://www.invicti.com/blog/web-security/soci-act-explained-compliance-rules-and-requirements)
- AS IEC 62443 formally adopted in Australia in 2025 — [iec62443.au](https://iec62443.au/)
- From 2026–27 CISC is evolving its compliance posture in response to the 2026 Independent Review of the SOCI Act — [CISC SOCI page](https://www.cisc.gov.au/legislation-regulation-and-compliance/soci-act-2018)

### Inferences
- OT itself is a hard niche, but the physical and personnel parts of CIRMP (Q4, Q6) are adjacent and easier. A manufacturer that runs critical food, energy or water assets is the likely SOCI customer.

### Gaps
- Did not identify which OT asset-inventory vendors (Claroty, Nozomi, Dragos) offer compliance reporting, or their AU mid-market pricing.
- Outcomes of the 2026 SOCI Independent Review not checked.

## Q6. Multi-site WHS and licence/ticket tracking linked to rosters

### Takeaway
Roster tools already link tickets to shifts (RosterElf blocks shifts when a cert expires) and safety tools track licences, but contractor credential tracking across sites remains a reported gap, and nothing found links ticket status to door access. Good fit for the hub; partially covered.

### Cited Findings
- RosterElf links certifications to rostering so staff are only scheduled for shifts they hold tickets for; shifts are blocked when a cert expires (vendor claim; its own buying guide lists no automatic expiry alerts as a con, which conflicts) — [RosterElf](https://www.rosterelf.com/blog/staff-licence-permit-certification-tracking-australia); [RosterElf buying guide](https://www.rosterelf.com/reviews/buying-guides/best-licence-expiry-tracking-software-australia)
- Deputy reportedly needs manual processes or third-party integrations for ticket tracking; Connecteam has no rostering integration for this (per RosterElf, a competitor) — [RosterElf buying guide](https://www.rosterelf.com/reviews/buying-guides/best-licence-expiry-tracking-software-australia)
- WorkPro from about $3/user/month; Lucidity mid-market AU-built at about $10–20/user/month (unverified comparison page) — [TradieScaler](https://tradiescaler.pages.dev/safety-compliance)
- Contractor credential tracking is a common gap when external workers are outside internal compliance systems; centralised systems give consistency across sites — [WorkPro mining](https://www.workpro.com.au/blog/the-hidden-cost-of-expired-tickets-in-mining-operations); [WorkPro DMS](https://www.workpro.com.au/blog/a-robust-document-management-system-for-licence-tickets-accreditations-and-certifications)
- Contractor management tools exist (e.g. LinkSafe) — [LinkSafe](https://linksafe.com.au/contractor-management/)

### Inferences
- Differentiator: one rule across rosters, door access and inductions ("no valid forklift ticket, no forklift-bay door and no forklift shift"), with site-by-site compliance rates. This turns WHS evidence into a by-product of systems already in the hub.
- Barrier is low (no certification); main risk is that roster vendors add access-control integration.

### Gaps
- SafetyCulture, Rapid Global and Cm3 features for contractor credentials and access integration were not found in results; check directly.

## Q7. Continuous control monitoring from operational telemetry ("compliance as a by-product of operations")

### Takeaway
Investors are funding "continuous compliance" (Comp AI $34M Series A, Sept 2026) and practitioners complain that SOC 2 tools produce checkbox compliance and that auditors push back on screenshots. But the funded players draw evidence from cloud and identity systems. Telemetry from non-cloud operations (sites, devices, people, physical security) is the less served part.

### Cited Findings
- Comp AI: $2.6M pre-seed July 2025 (OSS Capital, Grand Ventures); $34M Series A September 2026 led by Roo Capital and Grand Ventures; claims 1,000+ customers and 15x ARR growth; moving into continuous cybersecurity — [Comp AI pre-seed](https://www.trycomp.ai/hub/comp-ai-pre-seed-round); [Comp AI Series A](https://www.trycomp.ai/press/series-a)
- Other 2026 compliance raises: Haast $12M Series A (Peak XV, April 2026); Norm AI figures conflict ($48M April 2026 vs $120M Series C July 2026) — [Angel Investors Network](https://angelinvestorsnetwork.com/regulatory-compliance/ai-compliance-automation-raises-12m-series-a-in-2026); [ValueAddVC](https://valueaddvc.com/pulse/comp-ai-34m-series-a-agentic-compliance-2026)
- HN-style comments (via mirrors) call Vanta/Drata SOC 2 a "b2b checkbox" and say small-company audits become rubber stamping since auditors rely on supplied evidence — [HN mirror](https://remix-clone-hacker-news.flameddd1.workers.dev/item/47482042); [Margins: SOC2 Kabuki theater](https://www.readmargins.com/p/the-soc2-kabuki-theater)
- Renewal price complaints: "$7500 to $20,000" to add two frameworks; Drata renewal increases over 150% (unverified user reports) — [Cyber Sierra review](https://cybersierra.co/blog/vanta-drata-review/)
- A Reddit comment says Vanta/Drata struggle in the mid-market (single anecdote) — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1s1y8fs/snapshots/2026-03-25T03%3A40%3A19.565209Z)

### Inferences
- SOC 2 automation for SaaS startups is crowded; do not enter it. The opening is evidence that cloud-first tools cannot see: physical sites, rosters, field devices, finance-system controls (e.g. Xero/MYOB user access reviews, segregation of duties).
- Price complaints suggest room for a cheaper add-on sold per site rather than per framework.

### Gaps
- No analyst report on CCM adoption outside cloud/IT found.
- Original HN threads not confirmed (mirrors only).

## Q8. Regulatory change management and obligations registers for non-financial industries and SMEs

### Takeaway
LexisNexis Regulatory Compliance supplies AU obligations content, including feeds into enterprise GRC tools like Ansarada's TriLine; Reguladar targets small businesses. Few AU-specific alternatives surfaced. It needs ongoing legal content work, which is a poor match for a solo technical founder.

### Cited Findings
- LexisNexis Regulatory Compliance publishes AU obligations content and modules (e.g. whistleblowing, electronic transactions, aged care) — [LexisNexis RC](https://www.lexisnexis.com/en-au/products/regulatory-compliance); [LexisNexis AU credentials 2026](https://www.lexisnexis.com/assets/en-au/pdf/lexisnexis-regulatory-compliance-credentials-document-clear-path-to-compliance-au-2026.pdf)
- Ansarada TriLine GRC's Obligations Module is populated by a live LexisNexis feed — [Ansarada help](https://grc.help.ansarada.com/intro_obligations.html)
- Reguladar is listed as an AU platform that helps small businesses track obligations and law changes — [SourceForge Reguladar](https://sourceforge.net/software/product/Reguladar/); [Reguladar psychosocial blog](https://reguladar.com.au/blog/psychosocial-hazards-small-business)

### Inferences
- An AI-drafted obligations register is tempting but legally risky; the hub could instead *consume* a register (from LexisNexis or open libraries) and attach live evidence. Reject building legal content.

### Gaps
- No pricing or market size for SME obligations registers; Reguladar's traction unknown.

## Q9. Psychosocial hazard compliance and right to disconnect without surveillance

### Takeaway
The right to disconnect applies to large employers from 26 August 2024 and to small businesses (under 15 staff) from 26 August 2025. WHS regulations treat psychosocial hazards like physical hazards. Tools are mostly HR consultants and wellbeing vendors. Any product that monitors individuals clashes with the founder's own no-surveillance rule and with employee trust.

### Cited Findings
- Right to disconnect: larger employers from 26 August 2024, small business employers (under 15) from 26 August 2025; it does not ban contact but lets employees refuse unreasonable after-hours contact — [Trusted HR Solutions](https://trustedhrsolutions.com.au/right-to-disconnect-employer-guide/); [Subscribe-HR one year on](https://www.subscribe-hr.com.au/blog/right-to-disconnect-aus-2026)
- Psychosocial hazards must be identified, assessed and controlled like physical hazards; persistent after-hours contact is treated as a psychosocial hazard (secondary sources) — [CCIWA](https://cciwa.com/business-toolbox/employees/workplace-health-and-safety-risks-of-right-to-disconnect-a-guide-for-employers/); [eCompliance Central](https://www.ecompliancecentral.com.au/right-to-disconnect-whs-compliance-australia)
- Queensland's psychosocial code of practice — [WorkSafe QLD code](https://www.worksafe.qld.gov.au/laws-and-compliance/codes-of-practice/managing-the-risk-of-psychosocial-hazards-at-work-code-of-practice-2022); a secondary search summary said updates take effect 1 September 2026 (not confirmed against the code)

### Inferences
- A privacy-safe angle: aggregate, team-level signals only (roster overtime hours, shift length, after-hours paging counts per team) with no individual tracking, reported as a hazard indicator for a WHS risk register. This is a feature, not a standalone product.

### Gaps
- Queensland 1 September 2026 code update not verified. No sourced competitor list of psychosocial-risk software.

## Q10. Privacy Act reform readiness (automated decision disclosure due 10 December 2026)

### Takeaway
From 10 December 2026, APP entities must disclose in their privacy policy when a computer program makes or substantially informs decisions that significantly affect individuals (new APP 1.7–1.9). The OAIC consulted on guidance (submissions closed June 2026). Readiness work is an inventory of systems and decisions. The hub already knows which apps and data stores exist, so an inventory helper fits, but the deadline is five weeks away.

### Cited Findings
- From 10 December 2026, privacy policies must include information on computer programs that make or inform significant decisions — [OAIC](https://www.oaic.gov.au/news/media-centre/new-resources-on-transparency-for-use-of-ai-and-automated-decision-making)
- Obligation comes from the Privacy and Other Legislation Amendment Act 2024, inserting APP 1.7, 1.8, 1.9 — [Certrak](https://certrak.com.au/ai-regulation-australia/privacy-act-reform-automated-decision-making-transparency/)
- Scope is broad: rule-based processes, machine learning, everyday business software and generative AI chatbots can be in scope; applies to decisions from that date regardless of system age — [Johnson Winter Slattery](https://jws.com.au/what-we-think/practical-implications-of-new-transparency-requirements-for-automated-decision-making/); [Corrs](https://www.corrs.com.au/insights/automated-decision-making-preparing-for-the-new-transparency-obligation)
- OAIC Issues Paper submissions closed 15 June 2026; final guidance may not yet be out — [Landers](https://landers.com.au/legal-insights-news/australian-privacy-law-update-what-app-entities-need-to-know-in-2026); [Corrs](https://www.corrs.com.au/insights/automated-decision-making-preparing-for-the-new-transparency-obligation)
- Readiness advice: inventory every system that touches decisions about people (decision, human or system, personal information used, significance) — [AW Labs](https://www.awlabs.com.au/guides/privacy-act-automated-decision-making); [Xcdit](https://xcdit.com.au/privacy-act-ai-disclosure-rules-december-2026/)

### Inferences
- The hub's live map of apps and data stores is the starting point for this inventory and for future privacy reform tranches (data mapping, retention). Product angle: "decision and data inventory kept current from telemetry", not a one-off policy update. Small and medium firms are underserved here; enterprises use OneTrust-class tools (not verified this session).

### Gaps
- Status of the second tranche of Privacy Act reforms not checked. OAIC final guidance release not confirmed.

## Q11. AI governance tooling (ISO 42001, EU AI Act, Australian guardrails): evidence of AI use inside a company

### Takeaway
Shadow AI discovery and ISO 42001 mapping are a busy, well-funded category (Credo AI, Modulos, WitnessAI, Cranium, Lookout). The AU mid-market seems underserved mainly by price and locality, and the hub's Intune and app telemetry could feed an AI-use inventory, but this is not empty space.

### Cited Findings
- Credo AI scans for unregistered AI tools and maps to ISO 42001; Modulos claims ISO 42001 product conformity and shadow-AI inventory; Cranium offers AI bill of materials and runtime blocking; WitnessAI claims network-level discovery of 4,000+ AI apps — [Modulos buyer's guide](https://www.modulos.ai/best-ai-governance-platforms/); [ComplyJet ISO 42001 software](https://www.complyjet.com/blog/best-iso-42001-compliance-software); [WitnessAI](https://witness.ai/blog/how-to-implement-iso-42001-with-ai-governance-tools/)
- Shadow AI leaves ISO 42001 risk registers and Statements of Applicability incomplete; discovery without a governance inventory is insufficient — [QL Security](https://qlsecurity.co.uk/blog/shadow-ai-discovery-governance/); [AI Sigil](https://aisigil.com/shadow-ai/)
- AU MSPs sell shadow-AI discovery and deny-by-default policies as a service — [Epic IT](https://www.epicit.com.au/ai-governance-australia/)

### Inferences
- Fit: Intune app inventory plus SaaS sign-in logs can show which AI tools are in use on managed devices, feeding both ISO 42001 and the APP 1.7 automated-decision inventory (Q10). Combining the two AU deadlines is a plausible wedge.

### Gaps
- Australian voluntary AI safety standard / guardrails status in late 2026 not checked this session. EU AI Act timelines not checked.

## Q12. Self-hosted / data-sovereign compliance tools (AU-hosted, IRAP)

### Takeaway
6clicks (Australian) has an IRAP-assessed government instance in Canberra and offers self-hosted and appliance options; open-source CISO Assistant can be self-hosted. Sovereignty buyers exist (government, defence supply chain), but IRAP is expensive for a solo founder; "self-hostable and AU-hosted" is the cheap version.

### Cited Findings
- 6clicks' Australian Government instance runs on Azure in Canberra, IRAP-assessed at Official: Sensitive and Protected; also self-hosted and appliance options — [6clicks IRAP](https://www.6clicks.com/resources/blog/6clicks-announces-successful-irap-assessment-for-its-australian-government-instance); [6clicks gov](https://6clicks.com/solutions/australian-government-irap-protected-grc)
- IRAP assessment applies to a specific deployment; standard public SaaS may be unassessed; vendor-held keys undermine sovereignty — [Salesforce AU](https://www.salesforce.com/au/data/irap-assessed-collaboration-platforms/)
- SOC 2, ISO 27001 and FedRAMP do not address AU sovereignty on their own — [Glean](https://www.glean.com/perspectives/is-irap-certification-a-must-have-for-enterprise-ai-in-australia)

### Inferences
- Mycelium already runs privately on a homelab/Tailscale; an on-prem compliance module with no data leaving site is a credible selling point for manufacturers and defence suppliers without needing IRAP at first.

### Gaps
- No independent list of IRAP-assessed GRC tools; IRAP cost and duration for a small vendor not sourced.

## Q13. Small-business compliance, supplier risk and modern slavery

### Takeaway
Modern slavery reform is proposed, not enacted: on 16 July 2026 the Government announced a planned offence for failing to prevent modern slavery in supply chains with a "reasonable steps" defence, and the Anti-Slavery Commissioner recommended mandatory due diligence for entities with AU$100M+ revenue. That would push evidence requests down to mid-market suppliers. Small-business compliance tooling evidence was thin.

### Cited Findings
- 16 July 2026 Government announcement: new criminal offence for failing to prevent modern slavery in supply chains, civil penalties for false statements, "reasonable steps" defence — [Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/2026/07/australia-new-modern-slavery-offence-proposed); [DLA Piper](https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2026/australia-federal-proposed-amendments-to-modern-slavery-laws-)
- Commissioner's January 2026 position paper: mandatory risk-based due diligence for reporting entities ($100M+ revenue) and high-risk product/industry declarations — [Anti-Slavery Commissioner paper](https://www.antislaverycommissioner.gov.au/system/files/2026-01/OAASC_initial_position_paper.pdf)
- Advisers say entities should review supplier risk mapping now; the reform is not yet law — [Watchdog Compliance](https://www.watchdogcompliance.com/updates/au-modern-slavery-reform-consultation-2026); [ASCLA](https://www.ascla.org/from-reporting-to-responsibility-what-the-modern-slavery-reforms-mean-for-australian-supply-chains/)

### Inferences
- A "supplier evidence pack" (one answer serving Scope 3, modern slavery and security questionnaires) for SME suppliers of large manufacturers is a possible later product. Not a first move.

### Gaps
- No sourced data on SME (1–50 staff) compliance tool demand or price tolerance this session.

## Q14. Open standards and open-source GRC as a sign of demand for transparency

### Takeaway
Open-source GRC is gaining traction: CISO Assistant (intuitem) has 3,600+ GitHub stars and 80+ contributors, and Comp AI (open source) raised $34M. This shows demand for transparent, cheaper, self-hostable tooling, and gives the founder a ready GRC "front end" to integrate with rather than rebuild.

### Cited Findings
- CISO Assistant: 3,600+ GitHub stars, 80+ contributors (early 2026); revenue from managed hosting and enterprise support; release v4.1.2 in Oct 2026 added GDPR DPIA screening; licence reported as AGPL-3.0 (one source says MIT; AGPL better supported) — [InfosecFlow comparison](https://infosecflow.com/blog/open-source-grc-comparison/); [Cyber Toolchain](https://cybertoolchain.io/tools/ciso-assistant/); [intuitem open source](https://intuitem.com/we-are-going-open-source)
- Comp AI positions as open source and verifiable, inviting auditors to contribute control templates and mappings — [Comp AI pre-seed](https://www.trycomp.ai/hub/comp-ai-pre-seed-round)
- Eramba and SimpleRisk are other open-source GRC options — [InfosecFlow](https://infosecflow.com/blog/open-source-grc-comparison/)

### Inferences
- Integrating as an evidence source for CISO Assistant and Comp AI (both open) is cheap distribution and avoids building framework libraries.

### Gaps
- OSCAL adoption and Australian open control libraries (e.g. ISM in OSCAL) not researched this session.

## Q15. Failed or struggling RegTech startups and the traps to avoid

### Takeaway
No specific RegTech post-mortem was found in this session. The available evidence is general: compliance buyers are slow, procurement and data rules surprise late in deals, and incumbents face price backlash at renewal.

### Cited Findings
- General startup failures come from lack of market fit, poor business models and insufficient funding (CB Insights compilation, not RegTech-specific) — [CB Insights](https://www.cbinsights.com/research/startup-failure-post-mortem/)
- Data rules and procurement requirements arrive as late surprises that derail deals after months of work (engineering-software analogy) — [Mean CEO, Sept 2026](https://blog.mean.ceo/startup-post-mortems-news-september-2026/)
- Compliance has historically been seen as a slow, unglamorous niche most VCs overlooked — [ValueAddVC](https://valueaddvc.com/pulse/comp-ai-34m-series-a-agentic-compliance-2026)

### Inferences
- Traps to avoid (inferred): building legal content you must maintain forever; chasing a one-off deadline whose demand collapses after the date; enterprise security reviews before having your own ISO 27001/SOC 2; selling to a buyer without budget (compliance teams often need a sponsor in operations or IT).

### Gaps
- No named RegTech failures with reasons were found; a targeted search by company name (e.g. on CB Insights or Crunchbase) is needed.
