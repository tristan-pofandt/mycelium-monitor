# Physical security data as compliance evidence: is the gap real? (as of November 2026)

Scope note: about 16 tool calls (searches and fetches). Several vendor pages blocked fetching (RightCrowd 403, Genetec feature note empty), so some findings rest on search snippets of vendor pages. Most sources are vendor marketing; treat feature claims as vendor-stated.

Plain-language glossary for a beginner:
- **GRC tool** (governance, risk, compliance): software such as Vanta, Drata or ServiceNow IRM that tracks a company's controls and collects "evidence" (screenshots, logs, reports) that auditors check for standards like ISO 27001 or SOC 2.
- **PACS** (physical access control system): the door/badge system, e.g. Gallagher Command Centre, Genetec Synergis, Lenel OnGuard, C-CURE 9000, Inner Range Integriti.
- **VMS** (video management system): the CCTV software, e.g. Milestone XProtect, Genetec Security Center (Omnicast), Verkada Command.
- **PIAM** (physical identity and access management): a layer that sits above one or more PACS and manages who should have which badge access, with approvals, joiner/mover/leaver workflows and periodic access reviews.
- **Access review / recertification / attestation**: a manager is asked on a schedule "does this person still need access to this door/zone?" and approves or revokes. Auditors want proof this happens (ISO 27001 Annex A 5.18 and 7.2, SOC 2 CC6.x).

Blunt headline: the claim "no product turns physical security data into compliance evidence" is **false**. Enterprise PIAM vendors (AlertEnterprise, HID SAFE, RightCrowd, Genetec ClearID) already do access reviews and audit-ready reports, and AlertEnterprise runs natively inside ServiceNow. The narrower claim "the startup GRC tools (Vanta, Drata) don't pull evidence from door or camera systems" **looks true** on what I could find. The open space is mid-market, cross-vendor, Australian-framework, and physical-plus-cyber-plus-people in one control view, not "physical evidence" as such.

## Do access control and VMS vendors offer compliance reporting, audit reports, framework mappings or access reviews?

### Takeaway
Access control vendors give you raw audit trails, event and cardholder reports, and (Genetec ClearID) scheduled access reviews, but I found no vendor that maps its reports to ISO 27001 Annex A 7.x, SOC 2, SOCI or PCI DSS controls. Their own SOC 2/ISO certifications are about their cloud service, not about helping customers comply.

### Cited Findings
- Genetec ClearID lets site owners schedule or manually launch access reviews; approvers verify area or role access, revoked access is removed when the review completes, and a report is generated covering completed reviews for all sites on the ClearID account — [Genetec ClearID access reviews feature note](https://resources.genetec.com/en-feature-notes/genetec-clearid-access-reviews); [Genetec video: schedule and complete an identity access review in ClearID](https://resources.genetec.com/videos/how-to-schedule-and-complete-an-identity-access-review-in-clearid)
- Genetec markets this as audit readiness but no source found states it is mapped to a specific ISO 27001 control — [Genetec ClearID feature note](https://resources.genetec.com/en-feature-notes/genetec-clearid-access-reviews) (absence of mapping is my reading of the snippet)
- Genetec's own ISO 27001 (six years running as of 2023), ISO 27017 and SOC 2 Type 2 cover Genetec's cloud products including ClearID, i.e. Genetec as a supplier, not the customer's controls — [Genetec press release Feb 2023](https://rss.globenewswire.com/news-release/2023/02/01/2600009/0/en/Genetec-achieves-stringent-certifications-through-commitment-to-cybersecurity-and-privacy.html)
- Gallagher Command Centre reports cover "events, cardholders and their access"; no compliance report or framework mapping is described — [Gallagher Command Centre datasheet (sourcesecurity.com)](https://sourcesecurity.com/datasheets/gallagher-c201311-access-control-software/co-723-ga/Command%20Centre%20Datasheet.pdf)
- Gallagher sells separate optional Competencies and Compliance licences for Command Centre (e.g. "2A8959 Competencies License") — [Gallagher Command Centre datasheet](https://sourcesecurity.com/datasheets/gallagher-c201311-access-control-software/co-723-ga/Command%20Centre%20Datasheet.pdf); [Gallagher Competency and Compliance (sourcesecurity.com)](https://sourcesecurity.com/gallagher-competency-and-compliance-access-control-software-technical-details.html)
- Verkada Command keeps an audit log of user and device activity with an Access Control event category, exportable as CSV by Org Admins; legacy logs record timestamp, IP, username, email and action — [Verkada help: audit logs](https://help.verkada.com/command/organization-settings/manage-your-admin-page-settings/manage-and-view-audit-logs); [Verkada legacy audit logs](https://help.verkada.com/en/articles/5488687-legacy-audit-logs)
- Verkada's integration partner list is hardware (ASSA ABLOY, Schlage, Suprema) and evidence export to Axon Evidence for video, not GRC tools — [Verkada integrations partners](https://www.verkada.com/integrations/partners/)
- Brivo holds SOC 2 Type II (report under NDA) and offers an open API; no customer compliance-reporting feature found — [Brivo security and compliance](https://brivo.com/about/security-and-compliance/)
- Salto Systems: the search returned salto.io, which is a different company (SaaS configuration), so ignore it; the Salto Systems (door locks) legal TOMs document is about their own data protection — [saltosystems.com TOMs PDF](https://saltosystems.com/sites/default/files/downloads/legal/2029_TechnicalandOrganizationalMeasures_Legal_vi.pdf)

### Inferences
- Door and camera vendors treat compliance as "you can export the logs". Turning those logs into control evidence (who reviewed, what was revoked, which ISO clause it satisfies) is left to the customer or a PIAM layer.
- ClearID access reviews only cover Genetec's own ecosystem (ClearID is designed to sit on Security Center/Synergis); a multi-vendor site gets no single review.

### Gaps
- Not checked: Milestone XProtect, LenelS2 OnGuard, Avigilon/Avigilon Alta (Openpath), Inner Range Integriti, ICT Protege, Salto KS/Space compliance features. No search result described any compliance-mapping feature from them; that is absence of evidence, not proof.
- Whether Gallagher's "Compliance" licence includes any framework-mapped reports could not be confirmed from the datasheet snippets.
- Camera-health evidence (proof cameras were recording, retention met) as a compliance artefact: no vendor source found either way.

## Do PIAM vendors provide compliance evidence, recertification and GRC integrations?

### Takeaway
Yes. This is where the gap is already filled for large enterprises: AlertEnterprise Guardian (native ServiceNow app), HID SAFE (attestation audits, evidence-ready reports), RightCrowd SmartAccess (Access Audit module, audit-ready reports, ServiceNow integration) and Genetec ClearID all do physical access recertification and audit reporting. None found integrates with Vanta or Drata.

### Cited Findings
- AlertEnterprise describes Guardian as "the only native ServiceNow application" managing the full physical identity lifecycle; Guardian Hybrid uses ServiceNow for request intake, approvals, tracking and reporting; a Guardian AI Agent is on the ServiceNow AI Agent Marketplace — [ServiceNow partner finder: AlertEnterprise](https://servicenow.com/partners/partner-finder/alertenterprise-inc.html); [ServiceNow Store listing](https://apprepo.service-now.com/store/app/c81d27a21b646a50a85b16db234bcb95)
- Guardian applies IAM-style recertification to doors, zones and facility entitlements, and recommends including contractors and visitors in recertification and offboarding — [NHIMG article (based on AlertEnterprise content)](https://nhimg.org/articles/physical-identity-and-access-governance-is-moving-to-automation/)
- Guardian listing covers access certification, compliance management and governance — [Capterra: Enterprise Guardian](https://www.capterra.com/p/199385/Enterprise-Guardian/) (Capterra price "$1.00" and 3.0 rating look unreliable)
- Guardian PIAM named a G2 Leader Spring 2026 (vendor-publicised figures) — [G2: AlertEnterprise Guardian](https://www.g2.com/products/alert-enterprise-guardian); CSA STAR Level 1 self-assessment listed 27 Mar 2026 — [CSA STAR registry](https://cloudsecurityalliance.org/star/registry/services/alertenterprise-guardian-piam-saas-platform)
- HID SAFE is a PIAM "superhub" for "governed and auditable access management"; it has an Attestation Audit feature for removing no-longer-needed access; the government edition keeps a full audit trail and generates "evidence-ready reports", aligned to HIPAA, NIST/FIPS and CJIS physical access expectations; pricing not published ("varies by deployment scope") — [HID SAFE](https://www.hidglobal.com/products/software/hid-safe); [HID SAFE Government](https://www.hidglobal.com/ja/products/hid-safe-government); [HID SAFE Adoption Guide](https://securitytoday.com/whitepapers/2025/09/hidglobal-hid-safe-adoption-guide.aspx)
- RightCrowd Access Audit (built into SmartAccess): scheduled, policy-driven reviews, digital sign-off, escalation of overdue items, auto-flagging of expired, out-of-scope or orphaned access, and "audit-ready reports with full history and attribution" filterable by contractor, company, location or credential type, exportable for regulatory inspections — [RightCrowd Access Audit Management](https://www.rightcrowd.com/solutions/access-audit-management/)
- RightCrowd SmartAccess links PACS to business processes and automates access audits and attestation; a hyperscale data-centre case study runs it above C-CURE 9000 — [SmartAccess datasheet](https://rightcrowd.com/srv/htdocs/wp-content/uploads/2024/07/SmartAccess-Datasheet.pdf); [RightCrowd hyperscale case study](https://engage.rightcrowd.com/hubfs/Case%20Studies/Tech%20and%20Data%20Center/Governing%20Physical%20Access%20at%20Hyperscale%20-%20RightCrowd%20Case%20Study.pdf)
- RightCrowd has a "ServiceNow + RightCrowd" integration page (content blocked, 403) — [RightCrowd ServiceNow page](https://www.rightcrowd.com/?p=30299)
- RightCrowd's 2026 trends piece says the 2026 shift is the expectation that "physical access data should be usable as security evidence", via automated access reviews, tamper-resistant logs and repeatable evidence packs (vendor blog; seen via search snippet, fetch blocked) — [RightCrowd 2026 trends](https://www.rightcrowd.com/resources/blog/2026-security-and-compliance-trends-a-forward-looking-guide-for-physical-security-leaders/)

### Inferences
- The "physical access evidence" product exists and is being actively marketed with exactly the founder's pitch language ("physical access data as security evidence"). The founder should not pitch "nobody does this"; buyers at large enterprises will have heard it from RightCrowd, AlertEnterprise or HID.
- These are enterprise sales products (contact-sales pricing, ServiceNow-centric, data centres, government). That leaves mid-market and multi-site operators without ServiceNow underserved.
- PIAM vendors focus on access entitlements (who can open which door). None found also treats camera health, alarm response, visitor logs and cyber controls as one evidence set.

### Gaps
- Whether RightCrowd, AlertEnterprise or HID integrate with Archer, OneTrust, Vanta or Drata: not found.
- Viscount (Freedom/Liberty) PIAM: not researched.
- Which PACS each PIAM supports (Gallagher, Inner Range in particular): not confirmed from sources. From background knowledge (unsourced, verify), RightCrowd was founded in Brisbane, Australia, and has Gallagher integrations, which would make it the most direct local competitor.
- Pricing for AlertEnterprise, HID SAFE, RightCrowd, ClearID: none published.

## Do Vanta, Drata, Secureframe, 6clicks, ServiceNow IRM, AuditBoard have connectors for physical access or camera systems?

### Takeaway
For Vanta and Drata, no physical access or camera connector was found; Drata's Envoy integration only reviews who has accounts in the Envoy app, not visitor or door events. ServiceNow is the exception through third-party PIAM apps (AlertEnterprise, RightCrowd), not through IRM itself.

### Cited Findings
- Vanta's integrations page (first of 21 pages checked) shows no physical security, door, badge, camera or visitor integration; none of Verkada, Brivo, Envoy, Kisi, Openpath, Genetec, Gallagher, HID or Salto appear on that page — [Vanta integrations](https://www.vanta.com/integrations)
- Drata's Envoy integration imports "Envoy user account data" to "help organizations review who has access to Envoy" (a user access review of the app), not visitor logs or physical access events — [Drata help: Envoy integration guide](https://help.drata.com/en/articles/9769744-envoy-integration-guide)
- No Kisi or Secureframe physical-security connector found; third-party comparisons note manual evidence collection for specialised tools — [Drata vs Secureframe comparison (rfp.wiki)](https://www.rfp.wiki/legal-compliance/governance-risk-compliance-tools/compliance-monitoring-solutions/drata/secureframe)
- Compliance automation platforms mostly pull from cloud, identity, HR and code systems; new entrant Comp AI raised US$34M in Sept 2026 positioned as a Vanta alternative for SOC 2/ISO 27001 — [SiliconANGLE, 17 Sep 2026](https://siliconangle.com/2026/09/17/compliance-automation-startup-comp-ai-raises-34m-to-push-into-security/)
- Typical guidance for SOC 2/ISO 27001 physical security evidence is policy plus manually retained records mapped to controls — [SecureSlate physical security policy guide](https://getsecureslate.com/blog/physical-security-policy)

### Inferences
- In Vanta/Drata today, physical controls (ISO 27001 A.7.1 to A.7.14) are typically satisfied by uploaded documents and screenshots. A connector that pushes door-review, visitor-log and camera-uptime evidence into Vanta/Drata (both have custom-evidence APIs, not verified here) is a plausible wedge that nobody appears to have built.
- Because these GRC tools are aimed at SaaS companies with one office, demand for physical connectors is low in their core market; the demand lives with multi-site operators (data centres, critical infrastructure, health, mining).

### Gaps
- Vanta pages 2 to 21, 6clicks (Australian GRC), AuditBoard, Archer, OneTrust and the ServiceNow Store beyond AlertEnterprise were not checked. 6clicks matters most for an Australian founder and is unverified.

## Do converged security / SecOps platforms (Splunk, Sentinel, Everbridge, Genetec Mission Control) produce compliance reports from physical systems?

### Takeaway
I found no native Sentinel or Splunk connector for Verkada or Genetec in the results; the documented route is generic syslog/CEF or custom log ingestion. These tools collect and alert; they don't produce physical-control compliance reports out of the box.

### Cited Findings
- Microsoft's connector reference directs appliances without a dedicated connector to Syslog via AMA, CEF via AMA or Custom Logs via AMA; no Verkada or Genetec entry surfaced in search — [Microsoft Sentinel data connectors reference](https://learn.microsoft.com/en-us/azure/sentinel/data-connectors-reference)
- No Verkada Splunk app surfaced; Verkada audit data is exportable as CSV — [Verkada help: audit logs](https://help.verkada.com/command/organization-settings/manage-your-admin-page-settings/manage-and-view-audit-logs)

### Inferences
- A SIEM can hold door and camera logs, but someone still has to build the compliance view. That is consulting work today, which supports a productised evidence layer.

### Gaps
- Splunkbase and Sentinel Content Hub were not browsed directly; a Genetec or Verkada app may exist there. Everbridge and Genetec Mission Control compliance reporting: not researched within the search budget.

## Is anything linking contractor licences and inductions to door access? How complete is it?

### Takeaway
Yes, and it is mature on Gallagher sites in Australia: Gallagher's competencies feature plus integrations with Rapid Global (contractor compliance) and Sine (visitor management) already grant or deny door access based on induction and licence status. The gap is not the link itself but cross-vendor coverage and turning it into audit evidence.

### Cited Findings
- Gallagher's Rapid Induct integration uses Command Centre competencies to automate granting and denying site access based on a person's compliance status in Rapid; requires Command Centre v8.60+ and a licence per competency — [Gallagher product page: Rapid Induct integration](https://products.security.gallagher.com/security/uk/en_UK/c/rapid-induct/p/INT158)
- Gallagher's mining brochure: import competency data from HR or contractor management systems; random cardholder selection to check competencies, licensing, drug and alcohol testing — [Gallagher Mining Solutions brochure](https://security.gallagher.com/-/media/Bynder/Security/Document/Brochure/Mining-Solutions-Brochure-original.pdf)
- Sine (by Honeywell) integrates with Command Centre to create and remove visitor credentials automatically (v8.30+); needs Sine Core large or enterprise plan — [Gallagher: Sine integration](https://products.security.gallagher.com/security/global/en/products/sine-by-honeywell-integration/p/C13078); [Sine: Gallagher integration](https://www.sine.co/integrations/gallagher)
- An Australian dashboard integrated with Command Centre validates competencies (inductions, licences, certifications) on arrival (article date unconfirmed) — [sen.news](https://sen.news/?p=76451)
- Sign In App also markets a Gallagher access control integration — [Sign In App: Gallagher](https://signinapp.com/gallagher-access-control)

### Inferences
- "Licence expired, door stops working" is solved on Gallagher. A product pitching that as novel would lose credibility with Australian security integrators.
- What is not evident: one report showing, across sites and access vendors, that every person who badged in had valid inductions at the time, joined to roster data. That is the evidence an auditor or SOCI/WHS regulator would want, and it remains a plausible gap.

### Gaps
- SignOnSite, Cm3, Linkt: no results returned within budget; their Gallagher/Inner Range integration status is unknown.
- Inner Range Integriti competency or contractor-compliance integration: not researched.

## Pricing, target market and what is still missing

### Takeaway
The closest competitors (AlertEnterprise, HID SAFE, RightCrowd, Genetec ClearID) are enterprise, contact-sales products, often ServiceNow-centric and focused on access entitlements only. What still looks missing: a mid-market, cross-vendor (Gallagher plus Inner Range plus Genetec plus cloud ACS) evidence layer that joins door, camera health, visitor, roster and cyber evidence in one control view mapped to Australian frameworks (SOCI, ISM/PSPF) as well as ISO 27001 and SOC 2, with export into Vanta/Drata/6clicks.

### Cited Findings
- HID SAFE pricing "varies by deployment scope, integrations, and organizational requirements" (no list price) — [HID SAFE](https://www.hidglobal.com/products/software/hid-safe)
- AlertEnterprise targets ServiceNow customers via a native app — [ServiceNow partner finder](https://servicenow.com/partners/partner-finder/alertenterprise-inc.html)
- RightCrowd case studies target hyperscale data centres — [RightCrowd hyperscale case study](https://engage.rightcrowd.com/hubfs/Case%20Studies/Tech%20and%20Data%20Center/Governing%20Physical%20Access%20at%20Hyperscale%20-%20RightCrowd%20Case%20Study.pdf)
- RightCrowd frames 2026 as the year physical access data becomes security evidence — [RightCrowd 2026 trends](https://www.rightcrowd.com/resources/blog/2026-security-and-compliance-trends-a-forward-looking-guide-for-physical-security-leaders/)

### Inferences
- Verdict on the founder's claim: **partly refuted**. "No GRC tool pulls evidence directly from physical security systems" is roughly true for Vanta/Drata-class tools but false for the ServiceNow ecosystem and for PIAM products that are themselves compliance-evidence tools for physical access.
- Defensible differentiation for the founder is not "physical evidence exists" but: (1) multi-vendor and multi-site in mid-market price bands; (2) evidence beyond entitlements: camera recording uptime, door-forced/held alarms and response times, visitor logs; (3) joining physical with roster/people and cyber evidence per control; (4) Australian frameworks (SOCI CIRMP physical hazards, PSPF) out of the box; (5) pushing evidence into existing GRC tools rather than replacing them.
- Main risk: RightCrowd (likely Australian-origin, unverified) or Genetec could move downmarket, and Vanta/Drata could add a Verkada or Brivo connector quickly since those are cloud APIs.

### Gaps
- No public pricing for any PIAM competitor; would need sales conversations or analyst reports (Gartner/Omdia PIAM market sizing not found within budget).
- No evidence found on SOCI or PCI DSS Requirement 9 specific mappings by any vendor.
- No independent (non-vendor) adoption data for PIAM in Australia.
