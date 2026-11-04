# Enterprise operational compliance for large multi-site manufacturers (Australia first, then EU/US), as of November 2026

Reading key. Each finding is tagged:
- **[S]**: checked against a search result or page during this research session (4 Nov 2026). Most of these sources are law firms or vendors, not regulators; that is noted where it matters.
- **[K]**: from the researcher's background knowledge, not re-checked this session. The link goes to the official home of the rule. Check these before quoting them to a customer. (A Safe Work Australia page fetch timed out, so the WHS details are [K].)

Status words: **IN FORCE** (law now), **PHASING IN** (law, with dates still ahead), **PROPOSED** (a draft or policy, not law), **STALLED/CHANGED** (was planned, then cut back or delayed).

Plain-language frame. A large manufacturer has roughly six families of duty: keep people safe (WHS), keep systems and plant networks secure (cyber), report emissions and pollution (environment and climate), treat workers and their data fairly (people and privacy), make safe products of consistent quality (product and quality), and run the company honestly (corporate). Nearly every duty boils down to the same three things: **a register** (what you have: chemicals, plant, licences, assets, suppliers), **a record of doing something** (an inspection, training, a review, a risk assessment) and **a report or notification** sent to someone, either on a schedule (yearly) or when an event happens (within hours). The evidence is what an auditor or regulator asks to see.

## 1. Cyber and IT: ISO 27001, SOC 2, Essential Eight, IEC 62443, NIST CSF 2.0, SOCI, NIS2, ransomware reporting

### Takeaway
For an Australian manufacturer the cyber duties that actually bind are the **ransomware payment report** (turnover over A$3m, 72 hours, enforced since 1 Jan 2026) and the Privacy Act's breach rules. **SOCI** binds only manufacturers that own a listed critical infrastructure asset (for example food and grocery distribution networks, energy, liquid fuels, or a declared defence industry asset). ISO 27001, Essential Eight, IEC 62443 and NIST CSF are frameworks that customers, insurers, boards or SOCI ask for, not laws. Multinationals that sell into the EU face **NIS2** (manufacturing is an Annex II sector) and the **EU Cyber Resilience Act** for connected products.

### Cited Findings
**Ransomware payment reporting (Cyber Security Act 2024, Part 3): IN FORCE**
- Applies to a business that operates in Australia with annual turnover over A$3m (or that owns critical infrastructure) and that makes a ransomware or extortion payment, or has one made on its behalf. The report goes to the Australian Signals Directorate (ASD) within 72 hours of the payment. [S] — [PIP](https://pip.com.au/cyber-security/cyber-security-act-2024/); [Ai Group](https://www.australianindustrygroup.com.au/news/blogs/2025/mandatory-ransomware-payment-reporting/)
- Part 3 started on 30 May 2025. 2025 was an education-first phase, and enforcement began on 1 Jan 2026. [S] — [Snare Solutions](https://www.snaresolutions.com/australias-ransomware-reporting-regime/); [Key IT](https://keyit.com.au/news/ransomware-reporting-enforcement-2026/)
- The penalty is disputed between secondary sources: one says 60 penalty units, another says 300 penalty units (about A$99,000). Check the Act itself. [S] — [Dundas Lawyers](https://www.dundaslawyers.com.au/ransomware-payment-reporting-obligations/); [Cliffside](https://www.cliffside.com.au/insights/cyber-security-act-2024-australia/)
- The same Act also brought in a limited-use rule (information given to ASD or the National Cyber Security Coordinator cannot be used against the reporter for most purposes), a Cyber Incident Review Board, and security standards for smart devices. [K] — [legislation.gov.au](https://www.legislation.gov.au/)

**SOCI Act 2018 (Security of Critical Infrastructure): IN FORCE**
- The risk management program rules (CIRMP) started on 17 Feb 2023 and cover 13 asset classes, food and grocery among them. [S] — [Lander & Rogers](https://landers.com.au/legal-insights-news/risk-management-program-PSO-switched-on); [Hall & Wilcox](https://hallandwilcox.com.au/news/resilient-infrastructure-risk-management-program-rules-under-soci-act-now-in-force/)
- Food and grocery coverage is narrow: it covers distribution networks of **critical supermarket retailers, food wholesalers or grocery wholesalers**. A food manufacturer is not covered just because it makes food. [S] — [CISC](https://www.cisc.gov.au:443/information-for-your-industry/food-and-grocery/legislation-regulation-and-compliance/soci-act-2018)
- A covered entity must adopt, maintain and comply with a written CIRMP, review it regularly, and lodge an **annual report approved by its board** (a statement about the program, not the full program). The penalty quoted in 2022 was 150 penalty units, about A$166,500 for a corporation at that time; check the current value. [S] — [Lander & Rogers](https://landers.com.au/legal-insights-news/risk-management-program-PSO-switched-on); [KPMG](https://kpmg.com/au/en/insights/risk-regulation/critical-infrastructure-reforms.html); [HWL Ebsworth](https://hwlebsworth.com.au/infrastructure-update-new-obligations-under-the-security-of-critical-infrastructure-act-2018-cth-september-2022/)
- Other SOCI duties: registering asset ownership and operational information; mandatory cyber incident reporting (12 hours for a significant impact, 72 hours for a relevant impact); and a CIRMP cyber section aligned to a recognised framework (ISO 27001, Essential Eight Maturity Level 1, NIST CSF, C2M2 or AESCSF), with a deadline of Aug 2024. The annual CIRMP report is due within 90 days after the end of the Australian financial year. [K] — [CISC](https://www.cisc.gov.au/)
- Australian vendors already sell "SOCI CIRMP readiness" (for example Protecht). [S] — [Protecht](https://www.protechtgroup.com/en-au/blog/soci-cirmp-deadlines-are-looming-are-you-ready)

**Frameworks, voluntary unless a contract, regulator or SOCI demands them**
- **ISO/IEC 27001:2022** is a certifiable information security management system. Annex A has 93 controls in four themes (organisational, people, physical, technological). Certification runs on a three-year cycle with yearly surveillance audits. The deadline to move from the 2013 version was 31 Oct 2025. [K] — [ISO](https://www.iso.org/standard/27001)
- **ACSC Essential Eight**: eight mitigations (application control, patching applications, Office macro settings, user application hardening, restricting admin privileges, patching operating systems, MFA, regular backups), each scored at Maturity Level 0 to 3. It is mandatory for non-corporate Commonwealth entities, voluntary for private companies, and is one of the SOCI-accepted frameworks. **Intune and Defender data maps directly to several of these controls** (patch level, macro policy, MFA, admin rights). [K] — [cyber.gov.au](https://www.cyber.gov.au/)
- **IEC 62443** is the operational technology (OT) and industrial control system series. Part 2-1 covers the asset owner's security program, Part 3-2 covers zones and conduits (network segmentation), Part 3-3 sets system security levels SL1 to SL4, and Part 4-2 covers components. Plant network monitoring tools (Claroty, Nozomi, Dragos and others) produce the asset inventory and segmentation evidence. [K] — [IEC/ISA 62443 overview](https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards)
- **NIST CSF 2.0** was released on 26 Feb 2024 and added a sixth function, "Govern". Many US multinationals use it as the common language for board reporting. [K] — [NIST](https://www.nist.gov/cyberframework)
- **SOC 2** is an AICPA attestation (Type I covers design, Type II covers operation over a period) and is mainly used by service providers. Manufacturers usually *ask* their SaaS vendors for SOC 2 reports rather than getting one themselves, so it is a third-party risk management item. [K] — [AICPA](https://www.aicpa-cima.com/)

**EU: NIS2 Directive (EU) 2022/2555: IN FORCE (national transposition patchy)**
- Manufacturing is an Annex II sector (medical devices, computers and electronics, electrical equipment, machinery, motor vehicles, other transport). Food production and chemicals are also in scope. Large entities in Annex I sectors are "essential"; Annex II entities are "important" and are supervised after the fact, with lower maximum fines. [S] — [Legiscope](https://www.legiscope.com/blog/nis2-essential-important-entities.html); [Kiteworks](https://www.kiteworks.com/?p=235075)
- Incident reporting runs in three steps: early warning within 24 hours, notification within 72 hours, final report within one month. Management can be held personally liable. [S] — [OpenStatus](https://www.openstatus.dev/guides/nis2-incident-reporting-requirements); [Taylor Wessing](https://digital-regulation.taylorwessing.com/welcome/the-second-network-and-information-security-directive-act-nis2)
- Maximum fines: essential entities €10m or 2% of worldwide turnover; important entities €7m or 1.4%. The transposition deadline was 17 Oct 2024. [K] — [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2022/2555/oj)
- **EU Cyber Resilience Act**: manufacturers of products with digital elements sold in the EU must report actively exploited vulnerabilities from 11 Sep 2026, with full obligations from 11 Dec 2027. This matters to manufacturers of connected equipment. PHASING IN. [K] — [EUR-Lex CRA](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)

**US (for multinationals)**
- SEC-listed companies must disclose material cyber incidents on Form 8-K Item 1.05 within four business days of deciding the incident is material, and describe their cyber risk management yearly in the 10-K (since Dec 2023). Defence suppliers face CMMC certification, phased in from Nov 2025. [K] — [SEC](https://www.sec.gov/)

### Inferences
- The cyber evidence that is easiest to produce automatically is device posture (Intune), MFA coverage, admin rights, patch age, backup success and access reviews. That is most of Essential Eight ML1 and ML2, and a large share of ISO 27001 Annex A technological controls. A monitoring hub that already sees Intune, identity and software status can show "Essential Eight maturity per site" as a live score instead of a yearly consultant assessment.
- The ransomware 72-hour clock and the NIS2 24-hour clock are event-driven deadlines. A product that opens an incident with a countdown and a pre-filled report template fits naturally.
- OT is usually the weak spot: plant networks are often owned by engineering, not IT, and are left out of ISO 27001 scope.

### Gaps
- Exact current ransomware reporting penalty (sources conflict); exact current SOCI penalty values after indexation.
- An official list of which manufacturing businesses hold SOCI-declared assets (for example "critical defence industry assets" are privately declared, so no public list exists).
- How Australian manufacturers actually score on Essential Eight: no reliable survey was found this session.

## 2. Workplace health and safety (WHS): Act and regulations, psychosocial rules, incident notification, ISO 45001, chemicals, plant registration, licences

### Takeaway
WHS is the heaviest daily compliance load for a manufacturer. It is mostly registers (chemicals, plant, licences, training), records (inspections, risk assessments, toolbox talks, consultation) and fast incident notification to a state regulator. **Every state and territory now has specific psychosocial hazard rules; Victoria was last, on 1 Dec 2025.** Penalties now include industrial manslaughter, which can mean jail for officers.

### Cited Findings
- **Structure (IN FORCE):** the model WHS Act and Regulations apply in all jurisdictions except Victoria, which has its own OHS Act 2004 and regulations. Each state has its own regulator (SafeWork NSW, WorkSafe Victoria, WorkSafe Queensland/WHSQ and others) plus Comcare for Commonwealth workplaces. A multi-site manufacturer can therefore answer to five or more regulators. [K] — [Safe Work Australia](https://www.safeworkaustralia.gov.au/)
- **Victoria psychosocial (IN FORCE since 1 Dec 2025):** the Occupational Health and Safety (Psychological Health) Regulations 2025 require employers to identify, assess and control psychosocial hazards (for example bullying, work overload, poor support) and to review the controls. Victoria was the last jurisdiction to bring in specific rules. [S] — [WorkSafe Victoria](https://www.worksafe.vic.gov.au/news/2025-12/new-regulations-make-psychological-health-priority); [Clayton Utz](https://www.claytonutz.com/insights/2025/october/victorian-employers-get-new-requirements-on-psychosocial-hazards)
- The model WHS Regulations added psychosocial duties from 1 Apr 2023 (NSW had a Code of Practice earlier). [K] — [Safe Work Australia](https://www.safeworkaustralia.gov.au/safety-topic/managing-health-and-safety/mental-health/psychosocial-hazards)
- **Industrial manslaughter:** the Commonwealth offence took effect on 1 Jul 2024, with maximums of A$18m for a body corporate and 25 years' jail for an individual. Most states have their own offence. Victoria's first workplace manslaughter conviction was raised to a record A$3m on appeal (reported Feb 2026). [S] — [AICD](https://www.aicd.com.au/regulatory-compliance/the-psychosocial-regulatory-landscape.html); [Safety Solutions](https://www.safetysolutions.net.au/content/business/article/victoria-in-2025-17m-in-penalties-and-137-prosecutions-and-enforceable-undertakings-987785989)
- Victoria recorded more than A$17m in penalties and 137 prosecutions and enforceable undertakings in 2025. [S] — [Safety Solutions](https://www.safetysolutions.net.au/content/business/article/victoria-in-2025-17m-in-penalties-and-137-prosecutions-and-enforceable-undertakings-987785989)
- **Notifiable incidents (model WHS Act ss 35 to 39):** a death, a serious injury or illness, or a "dangerous incident" (for example an uncontrolled chemical release, a fire, plant collapse or electric shock) must be reported to the regulator **immediately**, by the fastest means. A written notice follows within 48 hours if the regulator asks for one. The site must be left undisturbed, except to help people or make it safe, and the record must be kept for 5 years. Failing to notify is a fineable offence. [K] — [Safe Work Australia, notifiable incidents](https://www.safeworkaustralia.gov.au/safety-topic/managing-health-and-safety/notifiable-incidents)
- **Hazardous chemicals (model WHS Regs Part 7.1):** a register of hazardous chemicals with current Safety Data Sheets (SDS) must be kept; a manifest goes to the regulator, and placards are needed, above quantity thresholds; labels and SDS must follow GHS (Revision 7 has been mandatory since 1 Jan 2026 after a transition); exposure standards apply (the workplace exposure standards are becoming "workplace exposure limits", WELs). Engineered stone has been banned since 1 Jul 2024. Chemical register software (Chemwatch, ChemAlert) is widely used in Australia. [K] — [Safe Work Australia, hazardous chemicals](https://www.safeworkaustralia.gov.au/safety-topic/hazards/chemicals)
- **Plant (Schedule 5):** some plant designs must be registered (for example pressure equipment, cranes, lifts), and some individual items must be registered with the regulator and renewed (for example boilers, pressure vessels, tower and mobile cranes above set ratings, lifts). Inspection and maintenance records are needed for all plant; lock-out/tag-out and guarding are standard audit items. [K] — [Safe Work Australia, plant](https://www.safeworkaustralia.gov.au/safety-topic/hazards/plant-and-structures)
- **High risk work licences (Schedule 3):** forklift (LF), order-picking forklift (LO), cranes, dogging, rigging, scaffolding, pressure equipment and others. These are issued by state regulators, valid for 5 years, and the employer must check them and keep evidence. Site "tickets", inductions and contractor qualifications sit on top of that. [K] — [Safe Work Australia, licences](https://www.safeworkaustralia.gov.au/licences-and-registration)
- **ISO 45001:2018** (amended 2024 for climate change) is the certifiable OHS management system: three-year certification with yearly surveillance audits. It is voluntary but often required in tenders. [K] — [ISO 45001](https://www.iso.org/standard/63787.html)

| Duty (plain words) | Evidence | How often | Typical tools |
|---|---|---|---|
| Report serious incidents fast | Notification record, investigation, site-preservation note | Event-driven, immediately; 5-year retention | EHS suite incident module, SafetyCulture/Mitti, phone plus spreadsheet |
| Manage psychosocial risk | Hazard register, consultation records, survey results, control reviews | Ongoing; review after changes or complaints | EHS suite, HR system, survey tools |
| Chemical register | Register, SDS less than 5 years old, risk assessments, manifest | Ongoing; manifest updates | Chemwatch, ChemAlert, EHS suite |
| Plant | Registration certificates, inspection and maintenance logs, risk assessments | Yearly registration renewals; inspections by schedule | CMMS (SAP PM, Maximo), EHS suite |
| Licences and tickets | Copies of licences with expiry dates, training matrix | Licence renewals every 5 years; site-specific | LMS, contractor management tools (Rapid Global, Cm3, Avetta), spreadsheets |
| ISO 45001 | Management system documents, internal audits, management review | Yearly surveillance audit | Document control, EHS suite |

### Inferences
- Licences and tickets join directly with rosters: an unlicensed person rostered on a forklift shift is a compliance gap you can detect *before* the shift. Access control can also refuse entry to a zone when an induction or ticket has expired. Few EHS tools join rosters, access logs and licence registers; this is a clear gap that Mycelium's data could cover.
- Psychosocial hazards (overwork, fatigue, long hours) can be partly evidenced from roster and overtime data. This needs care because of surveillance and privacy law (section 4).

### Gaps
- Current indexed WHS penalty amounts (Category 1 to 3 and failure to notify) per jurisdiction were not checked this session.
- No survey found on what share of Australian manufacturers run WHS on spreadsheets compared with an EHS platform.

## 3. Environment and climate: ASRS/AASB S2, NGER, Safeguard Mechanism, EPA licences, ISO 14001, CBAM, CSRD

### Takeaway
Climate reporting is the fastest-growing duty. **Group 2 entities (most large manufacturers) began their first AASB S2 reporting year on 1 Jul 2026**, and the first reports are due in late 2027. NGER (yearly by 31 Oct) and the Safeguard Mechanism (facilities over 100,000 t CO2-e) already apply to heavy manufacturers. The EU simplified its rules: the **CSRD now catches only companies with more than 1,000 employees** and the CBAM definitive period started on 1 Jan 2026 with a 50-tonne exemption.

### Cited Findings
**ASRS / AASB S2 (Corporations Act Ch 2M): PHASING IN**
- Group 2 applies to financial years starting on or after 1 Jul 2026; for a company with a 30 June year end, the first report covers the year to 30 Jun 2027 and is lodged by about Oct 2027. Group 3 starts on or after 1 Jul 2027. [S] — [Anthesis](https://www.anthesisgroup.com/au/insights/asrs-and-aasb-s2-a-guide-to-mandatory-climate-reporting-in-australia/); [Rulesmate](https://rulesmate.com.au/insights/asrs-group-2-climate-reports-1-july-2026)
- An entity is in Group 2 if it meets two of three tests: revenue of A$200m or more, gross assets of A$500m or more, or 250 or more employees. [S] — [Carbon Impact HQ](https://carbonimpacthq.com/journal/australia-aasb-s2-group-2-climate-reporting-2026)
- Scope 1 and 2 emissions are required from year one; Scope 3 from the second reporting year. ASIC enforces (Regulatory Guide 280) and has said the first year will be handled pragmatically, which is not a pause in enforcement. [S] — [Rulesmate](https://rulesmate.com.au/insights/asrs-group-2-climate-reports-1-july-2026); [Anthesis](https://www.anthesisgroup.com/au/insights/asrs-and-aasb-s2-a-guide-to-mandatory-climate-reporting-in-australia/); [Spectre](https://www.spectreco.com/blog/what-aasb-s2-means-for-your-business-before-july-2026)
- Group 1 has applied since 1 Jan 2025 (two of: revenue A$500m or more, assets A$1b or more, 500 or more employees, or large NGER reporters). Group 3 thresholds are revenue A$50m, assets A$25m, 100 employees. Directors sign a declaration. Limited liability protection ("modified liability") covers Scope 3, scenario analysis and transition plans for the first years. Assurance phases up to reasonable assurance by about 2030. [K] — [ASIC RG 280](https://asic.gov.au/regulatory-resources/sustainability-reporting/)
- One source says the Group 3 thresholds are under review; this is not confirmed. [S] — [Carbon Halo](https://carbonhalo.com/glossary/aasb-s2-effective-date/)

**NGER (National Greenhouse and Energy Reporting): IN FORCE**
- Facility threshold: 25 kt CO2-e (Scope 1 plus 2) or more. [S] — [NSW EPA guiding principles](https://www.epa.nsw.gov.au/Your-environment/Climate-change/guiding-principles-alignment-national-greenhouse-and-energy-reporting-scheme-safeguard-mechanism)
- Corporate group thresholds are 50 kt CO2-e or 200 TJ of energy, and the facility energy threshold is 100 TJ. Reports go to the Clean Energy Regulator **by 31 October each year** for the previous financial year. [K] (31 Oct partly [S]) — [Clean Energy Regulator](https://cer.gov.au/)

**Safeguard Mechanism: IN FORCE**
- Covers any facility with more than 100,000 t CO2-e of covered Scope 1 emissions a year. Baselines fall 4.9% a year to 2030, with an indicative 3.285% a year after that. The 2031 to 2035 rate will be set in the 2026–27 review. Facilities over their baseline must surrender ACCUs or Safeguard Mechanism Credits. [S] — [Clean Energy Regulator Safeguard insights](https://cer.gov.au/document/2024-25-safeguard-mechanism-data-insights); [Carbon Market Institute](https://carbonmarketinstitute.org/2026/04/16/safeguard-mechanism-performance-promising-as-industry-prepares-for-critical-review/)

**EPA licences and pollution reporting: IN FORCE (state-based)**
- Licences are issued per site by state EPAs (for example a NSW Environment Protection Licence under the POEO Act, with a yearly return and monitoring data; Victoria's EP Act 2017 permissions plus a "general environmental duty" to minimise risk since 1 Jul 2021). National Pollutant Inventory (NPI) reports are due yearly (by 30 Sep) for sites above substance thresholds. Waste tracking and trade waste agreements sit alongside. [K] — [NSW EPA](https://www.epa.nsw.gov.au/); [EPA Victoria](https://www.epa.vic.gov.au/); [NPI](https://www.dcceew.gov.au/environment/protection/npi)
- **ISO 14001:2015** is the certifiable environmental management system (a revised version is expected around 2026; check its status). [K] — [ISO 14001](https://www.iso.org/standard/60857.html)

**EU CBAM (Carbon Border Adjustment Mechanism): PHASING IN**
- The definitive period started on 1 Jan 2026. A mass threshold of **50 t of CBAM goods per importer per calendar year** replaced the old €150 per-consignment exemption (electricity and hydrogen excluded). Once an importer passes 50 t, the whole year is in scope. Certificate sales for 2026 imports start on 1 Feb 2027. Sources disagree on the first declaration deadline (31 Aug or 30 Sep 2027). [S] — [Customs Support Group](https://www.customssupport.com/cbam-omnibus-i-package/); [CBAM Guide](https://cbamguide.com/compliance/de-minimis/); [Substantio](https://substantio.com/cbam-eu-omnibus-package/)
- Goods covered: iron and steel, aluminium, cement, fertilisers, hydrogen, electricity. The obligation falls on the EU importer, but Australian exporters of steel and aluminium are asked for installation-level embedded emissions data. A bill to extend CBAM to downstream goods was in trilogue after a Parliament mandate on 15 Sep 2026: PROPOSED. [S for extension] [K for sectors] — [Substantio](https://substantio.com/cbam-eu-omnibus-package/)

**EU CSRD / CSDDD after Omnibus I: CHANGED**
- Directive (EU) 2026/470 entered into force on 18 Mar 2026. CSRD now applies to companies with more than 1,000 employees and either turnover above €450m or a balance sheet above €25m. Their first reports cover FY2027 and are due in 2028. CSDDD (supply-chain due diligence) now applies above 5,000 employees and €1.5bn turnover. [S] — [Tracera](https://tracera.com/eu-omnibus-simplification-package/); [Normative](https://normative.io/insight/the-omnibus-simplification-package-explained/)
- Non-EU groups (for example an Australian parent) come in through EU turnover or EU subsidiaries; check the parent thresholds in the final text. [K]

**US**
- The SEC climate disclosure rule is effectively dead (the SEC stopped defending it in 2025). California SB 253 (emissions) and SB 261 (climate risk) apply to large companies doing business in California; SB 261 was paused by the courts in late 2025. Both statuses need checking. [K] — [CARB](https://ww2.arb.ca.gov/)

### Inferences
- AASB S2 Scope 1 and 2 data comes from energy bills, fuel and refrigerant records: data that sits in finance systems (Xero/MYOB/ERP invoices) and site meters. A finance connector that tags energy and fuel spend by site is a cheap start on emissions evidence. The board-level duty (the directors' declaration) makes a "data lineage" view (where each number came from) valuable.
- NGER, Safeguard, NPI and AASB S2 all want site-level data rolled up to the group. This is the same multi-site rollup problem as WHS.

### Gaps
- Exact current CSRD rules for non-EU parents after Omnibus I; status of California SB 253/261 in Nov 2026; status of the ISO 14001 and ISO 9001 revisions; EU Deforestation Regulation application date (it was delayed again; check).

## 4. People and privacy: Privacy Act reforms, workplace surveillance, Fair Work and awards, modern slavery, right to disconnect

### Takeaway
**Tranche 1 of the Privacy Act reforms is law (Dec 2024). Its rule requiring privacy policies to explain automated decisions applies from 10 Dec 2026. Tranche 2 is only an exposure draft (31 Aug 2026)**, and it still **does not remove the employee records exemption**. Workplace surveillance is regulated state by state: NSW and the ACT have notice-based Acts, and Victoria's tougher regime is a Labor election promise for the 28 Nov 2026 state election. Wage underpayment became a crime on 1 Jan 2025. The modern slavery threshold stays at A$100m.

### Cited Findings
**Privacy**
- Tranche 2 is the exposure draft Privacy Amendment (Personal Data Protection) Bill 2026, released on 31 Aug 2026 with about 40 proposals. Submissions closed on 18 Sep 2026. The Government intends to introduce it before the end of 2026, with no start date yet. PROPOSED. [S] — [McCullough Robertson](https://mccullough.com.au/2026/08/31/privacy-act-reforms-tranche-2-proposals/); [Gadens](https://www.gadens.com/insights/tranche-2-privacy-reforms-key-changes); [MinterEllison](https://www.minterellison.com/articles/draft-tranche-2-privacy-reforms-what-they-mean-for-businesses)
- The draft leaves out removing the small business and **employee records** exemptions, a right to erasure, mandatory Privacy Impact Assessments and a direct right of action. [S] — [Russell Kennedy](https://www.russellkennedy.com.au/insights-events/insights/privacy-reform-tranche-2-arrives-major-changes-proposed-key-reforms-still-missing); [Corrs](https://www.corrs.com.au/insights/australias-privacy-act-reforms-fundamental-changes-proposed-in-new-exposure-draft)
- Tranche 1 (Privacy and Other Legislation Amendment Act 2024): automated decision-making transparency in privacy policies by 10 Dec 2026. [S] — [LK Law](https://www.lk.law/2026/09/australias-privacy-act-reforms-inside-the-second-tranche/)
- Tranche 1 also created a statutory tort for serious invasions of privacy (from Jun 2025), tiered civil penalties and infringement notices, and stronger OAIC powers. The maximum for serious interference is the greater of A$50m, three times the benefit, or 30% of adjusted turnover. Under the Notifiable Data Breaches scheme, a suspected breach must be assessed within 30 days and notified to the OAIC and affected individuals as soon as practicable. [K] — [OAIC](https://www.oaic.gov.au/)
- Plain language: employee records held by an employer are still largely outside the Privacy Act. **CCTV footage, access-control logs of contractors and visitors, and biometrics are not employee records**, so they are covered.

**Workplace surveillance**
- NSW (Workplace Surveillance Act 2005): 14 days' written notice before camera, computer or tracking surveillance; cameras must be visible, with signs; a written policy is required for computer surveillance; covert surveillance needs a magistrate's authority. ACT (Workplace Privacy Act 2011) is similar and requires consultation. IN FORCE. [K] — [NSW legislation](https://legislation.nsw.gov.au/view/html/inforce/current/act-2005-047)
- Victoria: no dedicated Act. The Surveillance Devices Act 1999 Part 2A bans workplace cameras and listening devices in toilets, washrooms, change rooms and lactation rooms. Labor's PROPOSED package (if re-elected at the Nov 2026 election) would add notice and consultation before new monitoring, limit biometrics to cases where nothing less intrusive works, restrict emotion recognition, require human review of significant automated decisions, give workers access to data used against them, and ban the sale of surveillance data. It follows a parliamentary inquiry report from May 2025. [S] — [Lander & Rogers](https://landers.com.au/legal-insights-news/vic-government-foreshadows-tougher-workplace-surveillance-laws); [iTnews](https://www.itnews.com.au/news/vic-labor-moots-workplace-ai-and-biometrics-surveillance-curbs-627502); [Biometric Update](https://www.biometricupdate.com/202607/victoria-moves-to-curb-workplace-ai-and-biometric-surveillance)

**Fair Work and awards (IN FORCE)**
- From 1 Jan 2025 intentional underpayment of wages is a criminal offence (Closing Loopholes). The right to disconnect has applied since 26 Aug 2024 for non-small businesses (26 Aug 2025 for small business). Employee records must be kept for 7 years, and pay slips issued within 1 working day of pay day. Awards set rostering, minimum engagement, overtime, breaks and allowances. "Same job, same pay" orders for labour hire are also in place. [K] — [Fair Work Ombudsman](https://www.fairwork.gov.au/)
- Payday Super (superannuation paid with each pay cycle) was legislated to start on 1 Jul 2026; check its status. [K] — [ATO](https://www.ato.gov.au/)

**Modern Slavery Act 2018 (Cth): IN FORCE, reform PROPOSED**
- The reporting threshold stays at A$100m consolidated revenue; the government "noted" the review's recommendation to cut it to A$50m. [S] — [AICD](https://www.aicd.com.au/regulatory-compliance/government-legislations/modern-slavery-law/modern-slavery-act-review.html)
- Anti-Slavery Commissioner Chris Evans began a five-year term on 2 Dec 2024. Proposed reforms include declarations of high-risk regions, industries and suppliers, and possibly an offence for failing to prevent modern slavery, reportedly announced on 16 Jul 2026. That announcement comes from one secondary source and needs checking. [S] — [Naturaliste Solutions](https://naturalistesolutions.com.au/insights/modern-slavery-act-reform-2026/); [GTLaw](https://www.gtlaw.com.au/insights/review-of-australias-modern-slavery-act-key-proposals-and-implications)
- Statements address seven mandatory criteria, are approved by the board, are due within 6 months after the reporting period ends, and are published on the Online Register run by the Attorney-General's Department (formerly Australian Border Force). [K] — [Modern Slavery Register](https://modernslaveryregister.gov.au/)

### Inferences
- Mycelium's CCTV, access-control and roster data is exactly what surveillance law regulates. A compliance product must evidence **notice given, policy published, consultation held and purpose limited** for each site and each state. That is a feature and a legal risk at the same time. A Victorian win for Labor on 28 Nov 2026 would make this much stricter.
- Award compliance is roster plus timesheet plus payroll. Joining rosters (shifts, breaks, overtime) with payroll (Xero/MYOB) is how underpayment risk is detected now that underpayment can be a crime.

### Gaps
- Official AGD confirmation of the 16 Jul 2026 modern slavery announcement; exact Payday Super start; any NSW workplace surveillance reform in 2026 (not searched).

## 5. Product and quality: ISO 9001, product safety, food safety, TGA, export controls

### Takeaway
Quality duties depend heavily on the industry: food (FSANZ Code, state food licences, HACCP, retailer-required GFSI certificates), medical (TGA GMP and ARTG), defence and dual-use (DSGL export permits, AUKUS changes) and general consumer goods (ACCC mandatory standards, the 2-day serious injury report). ISO 9001 is the common base certificate.

### Cited Findings
- **ISO 9001:2015** (amended 2024 for climate change) is the certifiable quality management system, with yearly surveillance audits and recertification every three years. A revision is in progress (check whether it was published in 2026). [K] — [ISO 9001](https://www.iso.org/standard/62085.html)
- **Consumer product safety (Australian Consumer Law, IN FORCE):** suppliers must tell the ACCC within **2 days** of learning of a death, serious injury or illness linked to a consumer good. ACCC mandatory safety standards and bans apply (for example button batteries). Recalls are notified to the ACCC. Electrical goods need registration under the EESS scheme. [K] — [Product Safety Australia](https://www.productsafety.gov.au/)
- **Food (IN FORCE):** the FSANZ Food Standards Code covers composition, labelling and allergens; state food authority licences (for example the NSW Food Authority) apply to meat, dairy and seafood; HACCP-based food safety programs and audits. Major retailers require GFSI certificates (SQF, BRCGS, FSSC 22000) and their own supplier standards. Exports of meat, dairy and similar products need approved arrangements under the Export Control Act 2020 (Department of Agriculture). [K] — [FSANZ](https://www.foodstandards.gov.au/)
- **Medical (TGA, IN FORCE):** goods must be listed on the ARTG; manufacturers need a GMP licence (PIC/S Guide); device conformity assessment; adverse event reporting. [K] — [TGA](https://www.tga.gov.au/)
- **Export controls and sanctions (IN FORCE):** Defence Trade Controls Act 2012 permits for Defence and Strategic Goods List (DSGL) items, with 2024 AUKUS amendments (licence-free trade with the US and UK for many items, plus new controls on supplying DSGL technology to foreign persons inside Australia). Autonomous sanctions are on DFAT's Consolidated List, with permits through the Pax system. [K] — [Defence Export Controls](https://www.defence.gov.au/business-industry/exporting); [DFAT sanctions](https://www.dfat.gov.au/international-relations/security/sanctions)
- EU: the Machinery Regulation (EU) 2023/1230 applies from 20 Jan 2027, and the new Product Liability Directive must be transposed by Dec 2026 (software counts as a product). PHASING IN. [K] — [EUR-Lex](https://eur-lex.europa.eu/)

### Inferences
- Product and quality evidence (batch records, calibration, non-conformances, recalls) lives in ERP, MES and QMS tools (SAP QM, Ideagen Q-Pulse, MasterControl and others), not in an ops hub. Integration is lower priority except where devices and calibration overlap. The "2-day product injury report" and "food recall" deadlines are event-driven, like WHS incidents.

### Gaps
- No search done this session on food or TGA specifics; all [K]. Revision status of ISO 9001.

## 6. Physical security for sites and comms rooms

### Takeaway
No single Australian law sets physical security for a private factory. The evidence comes from **ISO 27001 Annex A theme 7 (14 physical controls)**, SOCI physical-security rules where SOCI applies, the DISP membership requirements for defence suppliers, AS/NZS equipment standards for alarms and CCTV, and fire safety maintenance law.

### Cited Findings
- ISO/IEC 27001:2022 Annex A.7 has 14 controls, including physical perimeters, physical entry, securing offices and rooms, **physical security monitoring (7.4, new in 2022)**, protection against environmental threats, working in secure areas, clear desk and screen, equipment siting, off-site assets, storage media, supporting utilities, cabling security, maintenance and secure disposal. [K] — [ISO 27001](https://www.iso.org/standard/27001)
- SOCI CIRMP rules include a physical security hazards section (identify critical components, control access to them, respond to unauthorised access) and a personnel hazards section (background checks for critical workers, possibly via AusCheck). [K] — [CISC](https://www.cisc.gov.au/)
- Australian standards commonly cited: AS/NZS 2201 (intruder alarms), AS 4806 / AS/NZS 62676 (CCTV / video surveillance), AS 1851 (routine servicing of fire protection systems); state building law needs yearly fire safety statements (NSW Annual Fire Safety Statement, Victoria essential safety measures report). Defence suppliers follow DISP, which aligns with the PSPF. [K] — [Standards Australia](https://www.standards.org.au/); [DISP](https://www.defence.gov.au/security/industry)

### Inferences
- Mycelium already sees CCTV health and access-control events. Evidence for 7.4 (monitoring), 7.2 (entry) and access reviews (who has a badge to the comms room, and whether they still need it) can be generated continuously. That is a strong, concrete wedge: auditors usually get screenshots.

### Gaps
- Current editions and exact titles of the AS/NZS physical security standards were not checked.

## 7. Corporate: director duties, whistleblowers, continuous disclosure, anti-bribery, sanctions

### Takeaway
Corporate duties sit with the board and the legal team. They matter to an ops compliance product mainly because **directors must show "reasonable steps" and "adequate procedures"**, and that requires the evidence the other sections produce. The new **failure to prevent foreign bribery offence (Sep 2024)** works this way too.

### Cited Findings
- Director duties: care and diligence (Corporations Act s180) and the WHS "officer due diligence" duty (model WHS Act s27: know about WHS, understand the operations, make sure resources, processes and reporting exist). [K] — [legislation.gov.au](https://www.legislation.gov.au/)
- Whistleblowers: since 1 Jan 2020, public and large proprietary companies must have a whistleblower policy (Corporations Act Part 9.4AAA). Large proprietary means two of: revenue A$50m or more, assets A$25m or more, 100 or more employees. [K] — [ASIC whistleblowing](https://asic.gov.au/regulatory-resources/corporate-governance/whistleblowing/)
- Continuous disclosure: ASX Listing Rule 3.1 and Corporations Act s674 (for listed manufacturers, a major incident or cyber event may be price-sensitive). [K] — [ASX](https://www.asx.com.au/)
- Anti-bribery: the Crimes Legislation Amendment (Combatting Foreign Bribery) Act 2024 created a corporate offence of failing to prevent foreign bribery from 8 Sep 2024, with an "adequate procedures" defence and AGD guidance. [K] — [AGD](https://www.ag.gov.au/crime/foreign-bribery)
- US and UK equivalents for multinationals: FCPA; the UK Bribery Act; the UK Economic Crime and Corporate Transparency Act's failure to prevent fraud offence (in force from 1 Sep 2025). [K]

### Inferences
- A board pack showing "evidence of reasonable steps" across WHS, cyber, privacy and climate is a cross-function product that today is stitched together by hand from each team's tool.

### Gaps
- No session searches on these items; all [K].

## 8. Software commonly used, and how multi-site companies coordinate compliance (and where it breaks)

### Takeaway
The market is split by function: **EHS suites** for safety and environment, **GRC/IRM tools** for risk, audit and cyber, **ESG/carbon tools** for climate, **privacy tools**, **payroll and roster award engines**, and **contractor management**, with **spreadsheets as the glue between them**. Only about one in five manufacturers has a single unified EHS platform (EY 2025, quoted second-hand). Each site often runs its own files and sub-tools, so the same item can be "compliant" at one site and "non-compliant" at another. The biggest player in Australian frontline safety, SafetyCulture, rebranded as **Mitti** on 11 Aug 2026 and now calls itself a frontline operations platform, not an EHS suite.

### Cited Findings
**Tools**
- SafetyCulture rebranded to Mitti on 11 Aug 2026. It reports more than 2 million frontline workers across 80,000 organisations and positions itself as one system for frontline work (software, hardware, consumables, insurance), with new AI features (for example turning a photo or voice note into an issue). Founder Luke Anear stays CEO. [S] — [IT Brief](https://itbrief.com.au/story/safetyculture-rebrands-as-mitti-in-frontline-software-push); [Business Wire via Cadillac News](https://www.cadillacnews.com/ap/business/safetyculture-becomes-mitti-unveiling-a-platform-built-for-the-future-of-frontline-work/article_4f035e24-a056-51d2-8b87-2a42ce236a7c.html); [Startland News](https://startlandnews.com/2026/08/safetyculture-mitti/)
- One reviewer says Mitti "does not compete as a full enterprise EHS platform" (it is an inspections and frontline tool). [S] — [Shopfloor Index](https://shopfloorindex.com/safety-software)
- An Australian 2026 buyer ranking lists HSI Donesafe (top, with five Australian offices and contractor prequalification), Ideagen EHS, VelocityEHS, Enablon, Evotix, Mitti, Intelex, EcoOnline, Sphera and Cority. It found no Australian office for Cority or Sphera. Note: the ranking is published by a vendor-linked blog. [S] — [ComplyFlow](https://www.complyflow.com/blog/top-10-ehs-software-australia)
- Enterprise tier: Cority, Enablon (Wolters Kluwer), Sphera, Origami Risk. Mid-market: Donesafe, Intelex and others. Sphera and Enablon are shortlisted when ESG reporting and audit trails matter most; Cority is strongest for occupational health. [S] — [Reliamag](https://reliamag.com/guides/best-ehs-software/); [EcoOnline AU](https://www.ecoonline.com/en-au/blog/best-ehs-software/)
- Commonly seen elsewhere in the stack (from background knowledge, not checked this session): GRC (ServiceNow IRM, Archer, MetricStream, Diligent, Protecht, CAMMS, Riskware); cyber compliance automation (Vanta, Drata); privacy (OneTrust); ESG and carbon (Workiva, IBM Envizi, Sphera, Persefoni, Watershed, Pathzero); chemicals (Chemwatch, ChemAlert); contractors (Rapid Global, Cm3, Avetta, ISNetworld); supplier ethics and modern slavery (Sedex, FRDM, Informed365); OT security (Claroty, Nozomi, Dragos); payroll and roster award interpretation (Employment Hero, ELMO, UKG, Deputy, Ascender); maintenance (SAP PM, Maximo). [K]

**Coordination and where it breaks**
- EY's 2025 Global EHS Maturity Study (quoted second-hand) found only about one-fifth of manufacturers have a single unified EHS platform, which leads to inconsistent reporting and shallow root-cause analysis. [S] — [Pulse / Quality Digest summary](https://www.pulse.bot/manufacturing/news/why-manufacturers-must-transform-ehs-management-now-a62396cd-795e-401d-94e5-358d4c33b52e) (original EY report not accessed)
- A vendor claims 80% of EHS teams still use paper forms, spreadsheets and disconnected tools (methodology not given; treat as marketing). [S] — [FacilityOS](https://www.facilityos.com/resources/wp/an-ehs-guide-to-safety-culture-compliance-the-infrastructure-behind-both)
- When each plant keeps its own file, the same component can carry different compliance conclusions at different sites. [S] — [Certivo](https://www.certivo.com/blog-details/is-it-risky-to-manage-reach-and-rohs-compliance-in-spreadsheets)

### Inferences
Where it breaks, in plain words (built from the findings above plus how these duties are structured):
1. **One duty, many owners.** A forklift ticket is a WHS duty (the safety team), stored in HR or a learning system (HR), checked at the gate (security), and used in the roster (operations). Nobody sees all four, so a person with an expired ticket gets rostered.
2. **Site-by-site files, group-level reports.** NGER, AASB S2, modern slavery and SOCI are signed at group or board level, but the data comes from sites in different formats. Roll-up happens in spreadsheets once a year, under deadline.
3. **Different regulators per state.** WHS notification, surveillance notice and EPA licences differ between NSW, Victoria and Queensland, so "the same" process forks at each state line.
4. **Evidence is a screenshot.** ISO 27001, Essential Eight and SOC 2-style audits mostly receive manual exports. Systems that already emit the data (Intune, access control, CCTV health, identity) are rarely wired up as continuous evidence.
5. **Event clocks are short and spread across teams:** WHS "immediately", product injury 2 days, ransomware 72 hours, SOCI cyber 12/72 hours, NIS2 24 hours, the 30-day privacy breach assessment. Each is owned by a different team with its own tool, and one event (for example a cyber attack that stops a plant and hurts someone) can trigger several clocks at once.
6. **Gap for a hub like Mycelium:** a cross-function "obligation register to evidence" map, keyed by site and legal entity, that pulls live evidence from connectors (Intune, access control, CCTV, rosters, finance) and leaves the deep workflows to existing EHS/GRC tools rather than replacing them. This matches the user's roadmap principle (AI suggests, people approve), because legal applicability decisions should stay with a human.

### Gaps
- No independent (non-vendor) Australian survey found on the number of compliance tools per manufacturer, spreadsheet reliance or compliance headcount. Ai Group and Manufacturing Australia sources were not reached in this session's search budget.
- No pricing data for EHS or GRC suites.
- The EY 2025 EHS Maturity Study figure is second-hand; the original was not accessed.
