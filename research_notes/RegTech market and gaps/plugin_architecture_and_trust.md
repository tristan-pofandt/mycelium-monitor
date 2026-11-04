# Plug-in compliance app architecture, and what a small vendor needs to be trusted and to sell (as of November 2026)

Scope: how a compliance/RegTech product can be built as a separate app controlled by a host platform (Mycelium), which open control catalogues can legally be used, how continuous control monitoring works, what auditors accept, what a small vendor needs to sell into enterprises, and Australian legal risks. Research done 4 November 2026 with about 20 searches/fetches. Many sources are vendor or law-firm commentary rather than primary legal text; this is flagged where it matters. Items marked "(training knowledge, not verified this session)" come from the researcher's background knowledge and must be checked before use.

Plain-language glossary for a beginner:
- **Control**: a rule an organisation says it follows (for example "admin accounts use MFA").
- **Control catalogue / framework**: a published list of controls (NIST 800-53, Essential Eight, ISO 27001 Annex A).
- **Evidence**: proof a control works (a log, a config export, a screenshot, a signed-off review).
- **Continuous control monitoring (CCM)**: software checks the evidence automatically and repeatedly instead of a person checking once a year.
- **Attestation**: a person states "I checked this manually" and attaches proof, for controls software cannot test.
- **SOC 2 Type II**: an independent auditor's report on whether a company's security controls worked over a period (usually 6-12 months). Common US-origin enterprise purchase requirement.
- **IRAP**: Australian Government scheme where ASD-endorsed assessors assess a system against the ISM; asked for when the buyer is an Australian government agency.

---

## 1. Real-world host-plus-plug-in compliance architectures: how responsibilities are split

### Takeaway
Every mature product splits the job the same way: the host (or connectors) collects raw data; a compliance layer maps data to controls through tags or indicators, runs automated tests on a schedule, and lets humans attest to the rest; reporting/export and auditor access sit on top. All of them say the tool does not by itself make you compliant. This matches Mycelium's model: Mycelium collects, the compliance app maps, tests, collects attestations and exports.

### Cited Findings
**Vanta (evidence from connected systems, pushed by third parties)**
- Vanta's Build Integrations API is for "applications that send data into Vanta"; it powers Vanta's marketplace integrations and private integrations a customer builds for their own tenant. Supported data includes user accounts, devices, vulnerabilities, training records, background checks and arbitrary custom resources — [Vanta developer docs: Build integrations overview](https://developer.vanta.com/reference/build-integrations/overview)
- For data Vanta has no connector for, Vanta's docs suggest syncing it as "custom resources" and layering "Custom Tests" on top; custom resources and Custom Tests are a private-integration feature, not available to public marketplace integrations — [Vanta developer docs](https://developer.vanta.com/reference/build-integrations/overview); [Supported resource types](https://developer.vanta.com/docs/supported-resources)
- File evidence (PDF, CSV) can be uploaded through the API and each document is tied to an evidence request — [Vanta supported resources](https://developer.vanta.com/docs/supported-resources)
- Integrations use OAuth-style scopes such as `connectors.self:write-resource`; a separate base URL exists for Vanta Gov (`api.vanta-gov.com`) — [Vanta developer docs](https://developer.vanta.com/reference/build-integrations/overview)
- Third-party pattern: Ory documents a Vanta custom integration that polls Ory's admin API on a schedule with a read-only key — [Ory docs: Vanta](https://www.ory.com/docs/integrates-with/compliance-audit/vanta)

**Drata**
- Open API access is reported as included only in Drata's higher tiers (not the entry "Essential" tier); "custom API connections and automated tests" sit in the Advanced plan — [Sprinto: Drata pricing (competitor source)](https://sprinto.com/blog/drata-pricing/); [SmartSuite: Drata pricing](https://smartsuite.com/blog/drata-pricing)

**Microsoft Defender for Cloud regulatory compliance dashboard**
- The dashboard mixes automated assessments (run roughly every 12 hours) with manual attestation; users select a manual assessment, click Attest, enter details and attach evidence — [Microsoft Learn: Regulatory compliance dashboard](https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard)
- Each control shows "Your Actions" (automated and manual assessments for the customer) and "Microsoft Actions" (what the platform handles) — the shared-responsibility split is shown per control — [Microsoft Learn: Regulatory compliance dashboard](https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard); [Microsoft Learn: concept regulatory compliance](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-regulatory-compliance)
- Grayed-out controls are typically procedural controls (e.g. awareness training), platform responsibilities (physical datacentre security), or controls with no automated assessment yet — [Microsoft Learn training module](https://learn.microsoft.com/en-us/training/modules/evaluate-regulatory-compliance/2-understand-compliance-standards-controls)
- Reports can be exported and "might provide evidence to internal and external auditors" (note Microsoft's hedged wording) — [Microsoft Learn: Regulatory compliance dashboard](https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard)

**ServiceNow IRM / GRC**
- ServiceNow continuous monitoring uses "indicators": manual indicators for data that cannot be retrieved from the ServiceNow instance, basic indicators (automated, tied to a table and collection frequency), and scripted indicators (custom code). Indicator templates generate many indicators for similar controls — [ServiceNow docs: Risk indicators, control indicators and indicator templates](https://www.servicenow.com/docs/r/Z61H6JNUJXKe8NNPQzK7MQ/5ny9iWZFGcgoawHLtnJZCw)
- Indicator results create issues for controls, update risk scores and support audit activities and control testing — [ServiceNow GRC docs (Xanadu)](https://www.servicenow.com/docs/r/xanadu/governance-risk-compliance/governance-risk-and-compliance/r_WhatIsGRC.html)
- GRC apps are installed from the ServiceNow Store as separate apps; e.g. Continuous Authorization and Monitoring 21.x is "certified to work with" other GRC apps at the same version — [ServiceNow Store / SoftwareOne listing](https://platform.softwareone.com/product/continuous-authorization-and-monitoring/PCP-6169-9291); [ServiceNow Store: Risk Management](https://store.servicenow.com/store/app/d96927ee1be06a50a85b16db234bcb39)

**Wazuh (open-source SIEM, compliance by tagging)**
- Wazuh rules are mapped to compliance requirements so an alert carries compliance fields (`pci_dss`, `gdpr`, HIPAA, NIST 800-53, TSC tags) when a rule matches — [Wazuh 3.13 docs: Regulatory compliance](https://documentation.wazuh.com/3.13/getting-started/use_cases/regulatory_compliance.html); [Wazuh 4.5 docs](https://documentation.wazuh.com/4.5/compliance/index.html)
- In Wazuh 5.0 (RC/beta), the Regulatory Compliance view per framework has Dashboard, Controls and Findings tabs, and rules use the Sigma format with a `compliance` field listing requirement IDs — [Wazuh 5.0-rc PCI DSS](https://documentation.wazuh.com/5.0-rc/compliance/pci-dss/index.html); [Wazuh 5.0-rc GDPR](https://documentation.wazuh.com/5.0-rc/compliance/gdpr/index.html)
- Wazuh states deploying it does not by itself certify or guarantee compliance with any framework — [Wazuh 5.0-rc compliance](https://documentation.wazuh.com/5.0-rc/compliance/index.html)

**Atlassian Marketplace (the plug-in trust model)**
- Atlassian's Cloud Fortified badge is being phased out: no new submissions, sunset by 31 December 2026 — [Atlassian developer: Cloud Fortified Apps program](https://developer.atlassian.com/platform/marketplace/cloud-fortified-apps-program/)
- The replacement "Atlassian Enterprise Certified" program is open to Forge cloud apps and requires public (or becoming public) vulnerability reporting via Atlassian's bug bounty; vendors can alternatively use a CREST-accredited pen-test provider via a self-managed route — [Atlassian Enterprise Certified program](https://developer.atlassian.com/platform/marketplace/atlassian-enterprise-certified-program/)
- Atlassian continuously scans cloud apps ("Ecoscanner") and has a Marketplace security enforcement policy — [Atlassian Marketplace security enforcement policy](https://developer.atlassian.com/platform/marketplace/marketplace-security-enforcement-policy/); [Atlassian Marketplace trust](https://www.atlassian.com/trust/marketplace)

### Inferences
- Common pattern (plain language): **host = pipes and storage; plug-in = meaning and judgement aid**. Vanta's "custom resource + custom test" and ServiceNow's "basic indicator over a table" are the same idea: a stored record type plus a scheduled test that returns pass/fail per control. Mycelium's collectors already produce the records; the compliance app would define the tests.
- Defender's "Your Actions / Microsoft Actions" split is a good UI model for Mycelium: each control shows what is checked automatically from Mycelium data, what needs human attestation, and what is the responsibility of a third party (e.g. the SaaS provider).
- Wazuh's tag-on-the-rule approach is the cheapest to build (map events to control IDs at ingest), but it only proves "an event of this type happened", not that a control is effective. Vanta/ServiceNow-style tests over current state are stronger evidence.
- Atlassian's direction (bug bounty / pen test as the gate for an "enterprise" badge) shows what buyers expect of any plug-in vendor, even inside a host ecosystem.
- Splunk apps, Datadog Cloud Security compliance, Elastic compliance and Microsoft Purview Compliance Manager were not researched this session (see Gaps). From training knowledge (not verified this session): Purview Compliance Manager uses the same split as Defender (Microsoft-managed vs customer-managed "improvement actions" with a compliance score, explicitly described as not a measure of compliance), and Splunk apps are packaged add-ons (TAs) for collection plus separate apps for dashboards — the same collect/interpret split.

### Gaps
- No sources fetched for Splunk app/TA architecture, Datadog or Elastic compliance modules, or Purview Compliance Manager scoring disclaimers.
- No source found for ServiceNow Store certification criteria for third-party scoped GRC apps.
- Drata's API documentation itself was not fetched; Drata details come from competitor/aggregator pricing pages.

---

## 2. Open standards for machine-readable controls and evidence; licensing of control catalogues

### Takeaway
NIST OSCAL is the open, machine-readable format for catalogues, system plans, assessment plans, results and POA&Ms, and is the right export/interchange format. For content: Australian ASD material (Essential Eight, ISM) is published under CC BY 4.0 (commercial use allowed with attribution); the Secure Controls Framework is CC BY-ND 4.0, which allows sharing the unmodified catalogue (with attribution, including in a GRC platform) but forbids distributing derivatives, explicitly including AI-generated policies from SCF content, without a paid commercial licence; CISO Assistant's code is AGPLv3 and some of its bundled frameworks have licences that block direct redistribution. ISO text must not be reproduced.

### Cited Findings
**NIST OSCAL**
- OSCAL's Assessment Layer has three models: Assessment Plan (what is planned for a periodic or continuous assessment of one system), Assessment Results (findings, always defined in the context of an assessment plan), and Plan of Action and Milestones (POA&M, open risks carried forward); Results and POA&M use identical syntax for findings and risks — [NIST OSCAL: Assessment layer](https://pages.nist.gov/OSCAL/learn/concepts/layer/assessment); [Assessment Results](https://pages.nist.gov/OSCAL/learn/concepts/layer/assessment/assessment-results); [POA&M](https://pages.nist.gov/OSCAL/learn/concepts/layer/assessment/poam/)
- The POA&M model provides XML, JSON and YAML representations; its root is `plan-action-milestones` — [NIST OSCAL POA&M](https://pages.nist.gov/OSCAL/learn/concepts/layer/assessment/poam/)
- The Implementation Layer holds the System Security Plan (SSP) and Component Definition models; the Control Layer holds catalogues and profiles — [NIST OSCAL layers](https://pages.nist.gov/OSCAL/learn/concepts/layer); [NIST lecture: Control layer](https://csrc.nist.gov/csrc/media/Projects/open-security-controls-assessment-language/documents/oscal-lecture-2/The%20Anatomy%20of%20OSCAL%20Models-Control_Layer-2023.03.21.pdf)
- FedRAMP uses OSCAL for machine-readable authorisation packages — [FedRAMP Automate: What is OSCAL?](https://automate.fedramp.gov/about/what-is-oscal)

**Secure Controls Framework (SCF)**
- The SCF is governed by CC BY-ND 4.0 (effective 22 March 2019) "to maintain the integrity of the SCF" — [SCF Terms & Conditions](https://securecontrolsframework.com/terms-conditions)
- Permitted: reproduce and share in whole or in part; create adapted material kept private; the attribution examples explicitly cover a GRC platform that includes SCF content, which must credit the SCF — [SCF Terms & Conditions](https://securecontrolsframework.com/terms-conditions)
- Not permitted without a commercial licence: distributing derivatives. The prohibition expressly covers "utilizing Artificial Intelligence (AI)" to generate policies, standards, procedures, metrics, risks or threats from SCF content; "An organization needs to purchase a commercial license to offer derivative SCF content" — [SCF Terms & Conditions](https://securecontrolsframework.com/terms-conditions); [SCF commercial licence](https://securecontrolsframework.com/commercial-license)
- Attribution must keep the copyright notice, licence reference, disclaimer, a link, indicate modifications, and must not imply SCF Council endorsement — [SCF Terms & Conditions](https://securecontrolsframework.com/terms-conditions)
- The commercial licence has Tier 1 and Tier 2 (Licensed Content Provider); GRC platforms are the example user; full Tier 2 terms were not retrieved — [SCF commercial licence](https://securecontrolsframework.com/commercial-license)

**ASD Essential Eight / ISM**
- "Essential Eight explained" states that, except the Coat of Arms, ASD logo and where otherwise stated, material is provided under CC BY 4.0 — [ASD: Essential Eight explained (PDF)](https://www.cyber.gov.au/sites/default/files/2025-03/Essential%20Eight%20explained%20(November%202023).pdf)
- The Essential Eight Maturity Model is a separate publication (last updated November 2023); its own copyright page was not retrieved, though a re-hosted copy is dated 2026-10 on cyber.gov.au — [ASD: Essential Eight maturity model (PDF)](https://www.cyber.gov.au/sites/default/files/2026-10/Essential%20Eight%20maturity%20model%20%28November%202023%29.pdf)
- A third-party site says ISM/Essential Eight content is CC BY 3.0 or 4.0 depending on release era (unofficial, needs checking) — [ism-explorer licence page](https://ism-explorer.pages.dev/licence.html)

**CISO Assistant (open-source GRC with a framework library)**
- Community edition is AGPLv3; files in the `enterprise` directory are under a commercial licence; Pro/Enterprise editions use a proprietary licence — [CISO Assistant GitHub](https://github.com/intuitem/ciso-assistant-community); [SourcePulse summary](https://www.sourcepulse.org/projects/1636962)
- The README notes some frameworks require a manual step of downloading the latest spreadsheet from the owner's website because "their license prevent direct usage" — [CISO Assistant README](https://github.com/intuitem/ciso-assistant-community/blob/main/README.md)
- CISO Assistant was covered as an open-source GRC tool in January 2026 — [Help Net Security](https://www.helpnetsecurity.com/2026/01/14/ciso-assistant-open-source-cybersecurity-management-grc/)

**CIS**
- CIS publishes Terms of Use and a separate "Commercial Use & CIS Supporters" program for commercial use of CIS Controls/Benchmarks — [CIS: Commercial Use & CIS Supporters](https://www.cisecurity.org/cis-controls-supporters); [CIS terms of use](https://cas.docs.cisecurity.org/en/latest/source/terms-of-use/)

### Inferences
- Plain language: **OSCAL is the "file format"; SCF/NIST/Essential Eight are the "content".** Use OSCAL Assessment Results + POA&M as the export the compliance app hands to auditors and GRC tools; this avoids lock-in and is a credible standards story.
- Safest content for an Australia-first product: ASD Essential Eight and ISM (CC BY 4.0, attribute ASD, don't use the logo or imply endorsement) and NIST SP 800-53/CSF. (Training knowledge, not verified this session: NIST publications are US Government works not subject to US copyright, so commercial reuse is generally allowed; OSCAL catalogues for 800-53 are published by NIST on GitHub.)
- SCF can be shipped verbatim inside the app with attribution, and its crosswalks are its main value. But the founder's "AI suggests" feature must not generate distributed policies/procedures from SCF text without a commercial licence. If the AI drafts policies, base it on NIST/ASD content or buy the SCF commercial licence.
- ISO 27001/27002: reference control IDs and short self-written paraphrased titles only; customers who own the standard can paste their own text. (Training knowledge: ISO standards are sold and copyrighted by ISO and national bodies such as Standards Australia.)
- CISO Assistant: reusing its code inside a proprietary network-served product triggers AGPL source-disclosure obligations; reading its framework YAML for ideas is fine, but each bundled framework keeps its own licence. It could be a reference implementation or even the "compliance app" Mycelium feeds, if the founder accepts AGPL.
- CIS Benchmarks: treat as needing a CIS membership/licence before shipping benchmark content commercially (training knowledge: CIS Benchmarks are CC BY-NC-SA for non-commercial use). Verify.
- Open Policy Agent / Rego is a sensible engine for "controls as automated tests" (training knowledge, not verified this session: OPA is a CNCF graduated project under Apache 2.0, safe to embed commercially).

### Gaps
- Common Controls Hub / UCF licensing and pricing not researched.
- Exact text of the Essential Eight Maturity Model's own licence page not retrieved.
- SCF commercial licence prices and Tier 2 terms not retrieved.
- OPA licence and CIS Benchmark licence not verified this session.
- Whether SCF's mappings to ISO themselves raise ISO copyright issues: not addressed by SCF's terms.

---

## 3. Continuous control monitoring design: tests over telemetry, retention, tamper-evident logs, auditor portals, sampling

### Takeaway
Controls become automated tests (indicators) that run on a schedule against collected records and produce dated pass/fail results; controls that cannot be tested become human attestations with attached evidence. Evidence integrity needs layers: hash chaining makes tampering detectable, WORM/object-lock storage makes deletion hard, and anchoring the chain head externally stops an insider recomputing the chain. Auditor portals are standard; sampling guidance was not found.

### Cited Findings
- ServiceNow model: basic indicators run on a set collection frequency against a table; results raise issues and feed control testing — [ServiceNow docs: indicators](https://www.servicenow.com/docs/r/Z61H6JNUJXKe8NNPQzK7MQ/5ny9iWZFGcgoawHLtnJZCw)
- Defender model: automated assessments approximately every 12 hours plus manual attestation with evidence — [Microsoft Learn](https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard)
- Vanta model: custom resources synced on a schedule, Custom Tests evaluate them — [Vanta developer docs](https://developer.vanta.com/reference/build-integrations/overview)
- Tamper evidence vs immutability: "WORM storage gives you immutability but not completeness. Hash-chaining gives you verifiability but not retention" — [DEV Community: Immutable audit trail](https://dev.to/beanstechbr/immutable-audit-trail-59fo)
- Hash chains are O(n) to verify; Merkle trees give O(log n) proofs per record, useful for large examinations — [scour.ing/dev.to: cryptographic audit trails for SEC 17a-4](https://scour.ing/@matmat/p/https://dev.to/veritaschain/building-cryptographic-audit-trails-for-sec-rule-17a-4-a-technical-deep-dive-4hbp)
- A hash chain alone does not stop someone with write access rewriting entries and recomputing the chain, nor detect truncation; external anchoring (e.g. a transparency log) is needed for full guarantees — [Vapora ADR 0039: Merkle audit trail](https://repo.jesusperez.pro/jesus/Vapora/raw/branch/main/docs/adrs/0039-merkle-audit-trail.md)
- Recommended layering: WORM or ledger storage, cryptographic chaining, and separation of duties; tools include S3 Object Lock compliance mode, Google Trillian, RFC 3161 trusted timestamps — [archman.dev: Auditing and tamper-evident logs](https://archman.dev/docs/data-architecture-and-persistence/data-lifecycle-and-compliance/auditing-and-tamper-evident-logs); [Emergent Mind: Immutable audit log](https://www.emergentmind.com/topics/immutable-audit-log)
- Retention cited by secondary sources: 7-10+ years for some regimes; FedRAMP AU-9/AU-11 three-year minimum; when regimes overlap the longest applies (secondary source, verify per regime) — [Microsoft Fabric best-practice repo: audit trail immutability](https://fgarofalo56.github.io/Suppercharge_Microsoft_Fabric/best-practices/security/audit-trail-immutability/)
- A secondary source claims SEC Rule 17a-4 (2022 amendments) accepts audit-trail alternatives to WORM including cryptographic methods; primary rule text not checked — [scour.ing/dev.to](https://scour.ing/@matmat/p/https://dev.to/veritaschain/building-cryptographic-audit-trails-for-sec-rule-17a-4-a-technical-deep-dive-4hbp)
- Auditors flag that CSV reports "can be easily edited", so they need a way to confirm a report was not modified after generation — [Linford & Co: AICPA FAQs on SOC 2 automation tools](https://linfordco.com/blog/soc-2-automation-tools-aicpa-faqs)
- Auditor portals: some tools give auditors direct read access to configurations and evidence grouped for review — [Linford & Co](https://linfordco.com/blog/soc-2-automation-tools-aicpa-faqs)

### Inferences
- A minimal, credible design for Mycelium's compliance app:
  1. **Control** = ID + plain-language summary (self-written) + mapping to framework IDs.
  2. **Test** = a read-only query over Mycelium records (policy-as-code, e.g. Rego or Python), with its own version number, run on a schedule.
  3. **Result** = control ID, test version, time, pass/fail/not-applicable, and references (IDs + hashes) to the source records — not copies of sensitive data (fits Mycelium's metadata-only rule).
  4. **Attestation** = person, time, statement, attached file hash; AI may draft, a named person approves.
  5. **Evidence log** = append-only, each entry includes the previous entry's hash; publish the chain head daily to somewhere the operator cannot rewrite (an RFC 3161 timestamp authority, a customer-held copy, or object-locked storage).
  6. **Export** = OSCAL Assessment Results + POA&M, plus a signed bundle with the generating query and parameters so an auditor can check completeness and accuracy.
- Recording the query/parameters with each result directly answers the auditor concern that they must understand how a report was generated.
- Sampling: continuous testing of 100% of a population (all accounts, all devices) avoids sampling for those controls; auditors will still sample to verify the tool's own correctness (inference, unsourced).
- Retention should be configurable per framework; default to the longest the customer selects.

### Gaps
- No primary IIA continuous auditing guidance (GTAG 3) fetched.
- No authoritative source on how auditors sample when evidence is continuous.
- SEC 17a-4 text and Australian record-keeping retention periods (e.g. Corporations Act 7 years for financial records) not verified this session.

---

## 4. What auditors and regulators accept from automated tools; tool vs auditor; avoiding liability

### Takeaway
Auditors can use tool output, but cannot rely on it alone: they must understand how each integration and report is produced, confirm it is current and unaltered, and check the source system for higher-risk controls. The tool vendor cannot also be the auditor. Every major vendor disclaims that its product certifies or guarantees compliance.

### Cited Findings
- Linford & Co (audit firm), summarising the AICPA FAQ of 30 June 2021: the service auditor "should not place undue reliance on the tool" and cannot only rely on information captured by a SOC 2 compliance tool; "Due diligence must be performed to validate the data coming from the tool" — [Linford & Co: AICPA FAQs on SOC 2 automation tools](https://linfordco.com/blog/soc-2-automation-tools-aicpa-faqs); [Linford & Co: SOC 2 software tools](https://linfordco.com/blog/using-soc-2-software-tools-for-audit-compliance)
- Reliance requires the tool be "properly designed, configured, implemented, and managed"; broken integrations can show stale data — [Linford & Co](https://linfordco.com/blog/using-soc-2-software-tools-for-audit-compliance)
- Auditors must understand the parameters used to generate a report; if not, they should not rely on it — [Linford & Co](https://linfordco.com/blog/soc-2-automation-tools-aicpa-faqs)
- Independence: "the SOC 2 automation tool company cannot also perform the SOC 2 audit"; the author views audit arms affiliated with tool vendors as failing independence in appearance — [Linford & Co](https://linfordco.com/blog/soc-2-automation-tools-aicpa-faqs)
- Tools do not fix control gaps; over-reliance by management is a risk — [Linford & Co](https://linfordco.com/blog/soc-2-automation-tools-aicpa-faqs)
- Wazuh: deploying Wazuh does not certify or guarantee compliance — [Wazuh 5.0-rc compliance](https://documentation.wazuh.com/5.0-rc/compliance/index.html)
- Microsoft hedges: exported reports "might provide evidence to internal and external auditors" — [Microsoft Learn](https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard)
- A legal-tech vendor's terms state "The Service is software. It is not legal advice" and that it does not replace the user's obligations (vendor wording, not authority) — [LexBrief terms](https://lexbrief-marketing.pages.dev/terms)
- An AICPA conference session on SOC 2 automation exists in 2026 programming (title only seen) — [AICPA session TD2607](https://agenda.aicpastore.com/sessions/td2607)

### Inferences
- Plain language: **the tool collects and organises; the auditor judges.** Position the app as "evidence preparation and monitoring", output wording like "test passed on 3 Nov 2026 for 412 of 412 accounts", never "compliant".
- Design features that raise auditor reliance: show integration health/last successful sync per control (stale-data concern), record query + parameters with each result, hash/sign exports (alteration concern), and give auditors read-only portal access to source records.
- The founder should not offer audits or certification, or partner in a way that pays an auditor per referral without disclosure, to stay clear of independence concerns.
- Liability wording pattern: "information tool, not legal, audit or professional advice; does not certify compliance; results depend on configured connectors; customer remains responsible for its compliance obligations" — in terms of service, in-app footers on reports, and in marketing.

### Gaps
- The AICPA FAQ itself (primary) was not fetched; findings come via an audit firm's summary.
- Nothing found on what Australian regulators (APRA for CPS 234/CPS 230, OAIC, ASIC) say about evidence from automated tools.
- No source on "information produced by the entity" (IPE) testing specifically.

---

## 5. What a small vendor needs to sell into enterprises

### Takeaway
Buyers judge the vendor, not just the app: expect security questionnaires, a pen test report, and at some stage SOC 2 Type II or ISO 27001; IRAP only matters for Australian government data, has no small-business exemption and was quoted at roughly AUD 50k-300k by an unverified aggregator. Self-hosted deployment shrinks what the vendor must prove (data never leaves the customer). Competitor pricing shows framework add-ons as separate line items, which supports a per-framework SKU for the plug-in.

### Cited Findings
**IRAP**
- The IRAP requirement attaches to the system and the data; "There is no small business exemption" (consultancy blog) — [Cybernion: IRAP for SaaS and cloud providers](https://cybernion-website.pages.dev/insights/irap-for-saas-and-cloud-providers/)
- Being assessed at PROTECTED when customers only handle OFFICIAL: Sensitive adds cost and clearance overhead (consultancy blog) — [Cybernion: Do we need an IRAP assessment](https://cybernion-website.pages.dev/insights/do-we-need-an-irap-assessment/)
- Only assessors on ASD's register can conduct a valid IRAP assessment; ASD publishes an IRAP common assessment framework and a 2026 IRAP Assessor Agreement — [ASD: IRAP common assessment framework (PDF)](https://cyber.gov.au/sites/default/files/2025-04/IRAP%20common%20assessment%20framework.pdf); [ASD: IRAP Assessor Agreement 2026 (PDF)](https://www.cyber.gov.au/sites/default/files/2026-05/IRAP%20Assessor%20Agreement%202026.pdf)
- Cost estimate AUD 50,000-300,000 and 3-12 months (unverified aggregator) — [auditxyz: IRAP](https://auditxyz.pages.dev/frameworks/security-governance/irap); see also [6clicks: IRAP cost](https://www.6clicks.com/resources/answers/how-much-does-an-irap-assessment-cost)
- ASD's older guidance recommends seeking at least three quotes from IRAP assessors (page dated around 2020) — [ASD IRAP page](https://www.cyber.gov.au/node/2080)
- An existing ISO 27001 system is claimed to cut IRAP preparation effort (vendor claim) — [Cybernion: IRAP vs ISO 27001](https://cybernion-website.pages.dev/insights/irap-vs-iso-27001/)

**Plug-in marketplace trust gates (as an indicator of buyer expectations)**
- Atlassian Enterprise Certified requires bug bounty participation or a CREST-accredited provider pen test — [Atlassian Enterprise Certified program](https://developer.atlassian.com/platform/marketplace/atlassian-enterprise-certified-program/)

**Pricing and packaging of compliance products**
- Drata is quote-only; per-framework add-on estimates range USD 1.5k-3k (Compliance Stronghold) to 3k-10k each (UnderDefense, Orbiq); custom integrations estimated at 5k-10k each; median annual contract about USD 25k (range 10,250-42,750) from Vendr data via Orbiq. All third-party estimates — [Orbiq: Drata pricing](https://orbiqhq.com/comparisons/drata-pricing); [UnderDefense: Drata pricing (Aug 2026)](https://underdefense.com/blog/drata-pricing/); [Compliance Stronghold: Drata review 2026](https://compliancestronghold.pages.dev/reviews/drata)
- Open-core example: CISO Assistant has an AGPLv3 community edition and proprietary Pro/Enterprise editions — [CISO Assistant GitHub](https://github.com/intuitem/ciso-assistant-community)

### Inferences
- Order of trust investments for a one-person/small Australian vendor (inference):
  1. Free/cheap now: a public security page, a filled-in standard questionnaire (e.g. CAIQ or SIG Lite), a vulnerability disclosure policy, SBOM and signed releases, a clear data-flow diagram showing self-hosted = no vendor access.
  2. Early: an independent pen test of the app, and professional indemnity plus cyber insurance (buyers ask for certificates of currency).
  3. When deals require it: SOC 2 Type II or ISO 27001 for the vendor. ISO 27001 is generally better recognised in Australia and also eases IRAP (consultancy claim above).
  4. Only for government buyers handling classified/OFFICIAL: Sensitive data: IRAP. For self-hosted software the agency's own system is assessed, which may lessen what the vendor must hold (inference, verify).
- Self-hosting is a strong selling point for a compliance product: data residency is solved by the customer's own location, and the vendor's SOC 2 scope shrinks to its development and release process. It also makes Mycelium's "read-only first" rule visible to buyers.
- Packaging: the market already prices frameworks as add-ons, so "Mycelium (host) + Compliance app (separate licence) + framework packs (Essential Eight, ISO 27001 mapping, SOC 2 mapping)" matches buyer expectations. Open-core (open host or open control tests, paid packs/support) builds trust with auditors who can read the tests; AGPL deters cloud copycats but some enterprises ban AGPL internally.

### Gaps
- No sourced figures for SOC 2 Type II or ISO 27001 certification cost for a small vendor in Australia in 2026.
- No sourced data on typical PI/cyber insurance limits enterprise buyers require (AUD 5m/10m are common anecdotally; unverified).
- No source on whether self-hosted software sold to government needs its own IRAP assessment versus being assessed inside the agency's system.
- Splunkbase / ServiceNow Store revenue-share and listing requirements not researched.

---

## 6. Legal risks in Australia for a compliance product

### Takeaway
Three main exposures: (1) unqualified legal practice — only Australian legal practitioners may "engage in legal practice" under the Legal Profession Uniform Law (NSW, Victoria, WA), so the product must provide information and tooling, not tailored legal opinions; (2) financial product advice — only relevant if the product recommends financial products, which a security/operations compliance tool should avoid; (3) Australian Consumer Law — business customers spending AUD 100,000 or less are "consumers", so consumer guarantees apply and cannot be excluded, only limited under s 64A.

### Cited Findings
**Unqualified legal practice**
- Section 10 of the Legal Profession Uniform Law (NSW) prohibits engaging in legal practice by unqualified entities; section 11 prohibits advertising or representing that an unqualified entity may practise law — [Law Society of NSW: Unqualified practitioners](https://www.lawsociety.com.au/practising-law-in-NSW/complaints-and-discipline/unqualified-practitioners); [Law Society NSW PDF](https://www.lawsociety.com.au/sites/default/files/2018-03/Unqualified.pdf)
- WA joined the Uniform Law scheme on 1 July 2022, alongside NSW and Victoria — [Legal Practice Board WA: Uniform Law](https://www.lpbwa.org.au/uniform-law); [Legal Profession Uniform Law (WA)](https://www.legislation.wa.gov.au/legislation/prod/filestore.nsf/FileURL/mrdoc_46913.htm/$FILE/Legal%20Profession%20Uniform%20Law%20(WA)%20-%20%5B00-a0-01%5D.html)
- Example vendor disclaimer: "The Service is software. It is not legal advice." (vendor terms, not authority) — [LexBrief terms](https://lexbrief-marketing.pages.dev/terms)

**Financial product advice (AFSL)**
- "Personal advice" is defined in s 766B(3) of the Corporations Act 2001; ASIC RG 255 (August 2016) covers digital (robo) advice and says businesses providing associated technology or compliance services "may also find this guidance useful" — [ASIC RG 255](https://www.asic.gov.au/regulatory-resources/find-a-document/regulatory-guides/rg-255-providing-digital-financial-product-advice-to-retail-clients); [RG 255 PDF](https://download.asic.gov.au/media/vbnlotqw/rg255-published-30-august-2016-20220328.pdf)
- Academic commentary exists on computer forecasting software under s 766B(1); conclusion not seen — [Macquarie University: Financial product advice s766B(1): the case of computer forecasting](https://researchers.mq.edu.au/en/publications/financial-product-advice-s766b-1-the-case-of-computer-forecasting/)

**Australian Consumer Law and liability caps**
- From 1 July 2021 the "consumer" threshold rose from AUD 40,000 to AUD 100,000, so many business software buyers are consumers under the ACL — [HWL Ebsworth: change to the definition of consumer](https://hwlebsworth.com.au/a-key-change-to-the-definition-of-consumer-under-the-australian-consumer-law-will-lead-to-more-business-customers-being-able-to-rely-on-consumer-guarantees/); [LegalVision](https://legalvision.com.au/consumer-definition-changing-business-implications)
- Businesses can limit liability for consumer guarantee breaches under s 64A (to repair, replacement, resupply or the cost of these), but not for goods/services of a kind ordinarily acquired for personal, domestic or household use — [Coleman Greig: Consumer guarantees](https://colemangreig.com.au/insights/publications/consumer-guarantees-what-who-how/); [ACCC: guide to consumer guarantees](https://www.accc.gov.au/about-us/publications/a-guide-to-consumer-guarantees-for-businesses-and-legal-practitioners)
- For SaaS, commentators advise using s 64A to limit liability to resupplying the services and keeping caps clear of the unfair contract terms regime; a B2B contract may still leave consequential loss exposure — [BSL FAQ: completely exclude liability in my SaaS agreement](https://bsl-web.pages.dev/faq/commercial/completely-exclude-liability-in-my-saas-agreement/); [HWL Ebsworth: consequential loss in B2B contracts](https://hwlebsworth.com.au/you-may-still-be-liable-for-consequential-loss-in-your-b2b-contract-heres-why/)

### Inferences
- Plain language: **a compliance app may tell people what a public framework says and what their data shows; it must not tell a specific client what the law requires of them in their circumstances.** Safe: "Control E8-MFA-1 test failed: 3 admin accounts without MFA". Risky: "You are in breach of the Privacy Act and must notify the OAIC". Map to frameworks and standards rather than interpreting statutes; if the product covers legal obligations (Privacy Act, SOCI Act, CPS 234), have a lawyer review content and frame it as general information.
- The AI-suggests/people-approve rule and "no 'you are compliant' claims" both reduce legal-practice and misleading-conduct risk (s 18 ACL misleading or deceptive conduct also applies to marketing claims such as "guarantees compliance" — training knowledge, not verified this session).
- AFSL: a security/operations compliance tool that never recommends financial products is very unlikely to be financial product advice; keep features away from recommending investments, insurance or super products. Get specialist advice if selling to financial services clients wanting product-level outputs.
- Contracts: use s 64A wording for contracts at or below AUD 100,000, avoid blanket exclusions that are void or unfair under the unfair contract terms regime (penalties since November 2023 — training knowledge, verify), and cap liability (commonly fees paid in the prior 12 months) for larger deals. Self-hosted deployment helps: the customer controls the data and the system, narrowing the vendor's duty.
- Get an Australian technology lawyer to review the EULA, disclaimers and marketing before the first paid sale; this is a small fixed cost relative to the risk.

### Gaps
- No primary statute text fetched for ss 10-11 Uniform Law, s 766B, or ACL s 64A.
- No Australian case or regulator guidance found on whether compliance software amounts to legal practice.
- Unfair contract terms penalties (2023 amendments) and their effect on SaaS liability caps not verified this session.
- Queensland, SA, Tasmania, ACT, NT legal profession Acts (not under Uniform Law) not checked.
