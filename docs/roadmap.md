# Mycelium roadmap

**Status:** plan, updated 2026-11-05. Written from Tristan's notes of 31 Oct, 4 Nov (business-wide product) and 4 Nov (enterprise wedge); Reviewed. v1 (steps 1 to 9 of the original build, see [architecture.md](architecture.md)) is done and running on the homelab. This file covers everything after it.

## Direction (2026-11-04)

Mycelium grows from "monitoring for my apps" into a **business operations hub**: software, sites, people, schedules, physical and cyber security, money and compliance, joined up on the live map, set up by a wizard and an AI agent, and changing shape to fit anything from a one-person stall to a multi-site company.

**First wedge: large organisations with many sites, regions and entities and hundreds of staff, starting with manufacturers.** A design partner (a general operations manager responsible for several factories at a large multinational manufacturer) gives feedback on demos. Small businesses stay supported through a small-business profile in the same app; their extra features (dropshipping, bookkeeping) move to later phases.

**What it does better than single-purpose tools:**
1. One picture of the whole organisation: code, sites, people, schedules, security and money on one map.
2. Setup done for you: the wizard and agent find and connect the data instead of the owner filling in forms.
3. Transparent and under the owner's control: every check, data source and AI action is visible and adjustable, and data can stay on the customer's own infrastructure.

## The briefs

**31 Oct 2026:** monitor anything (games, apps, sales, retail); security as a first-class feature, with AI hardening and threat management; setup files and scripts from the website; a policy pack that plugs projects into the site's agent and security rules; an installable app and an admin-level setup script; a cheap AI agent that analyses a project and builds its monitoring; RegTech in Mycelium and a parallel enterprise compliance site.

**4 Nov 2026, business-wide:** security fully transparent and customisable; features businesses, shops, apps and games would want; detailed setup wizards; built-in agent chats with automated tasks (for example product research and store improvements for dropshippers); total business statistics, with an AI agent pointing the monitors at every related file (finance, statements, revenue, website); document extraction (invoices, payroll) with machine learning; recommendations for any area (website, filing, marketing, security); every dollar in and out traced to its receipt or invoice; a context library for financial insight and tax preparation; CO₂ and other regulatory tracking; everything opt-in and customisable, from a lemonade stand to thousands of staff; live map formats chosen by use (agents, SaaS, an employee hierarchy with task distribution), changed through the wizard and the agent.

**4 Nov 2026, enterprise:**
- Large multi-site organisations first, with the setup wizard adjusting to any size.
- One app for everyone. Staff see their own tickets, tasks and shifts; managers see everyone under them; the same system adapts to each role.
- Easy delegation of permissions, tasks and access. The owner sets permissions by role and assigns roles by place in the hierarchy.
- Works with the SSO each company already has.
- Physical security: CCTV, access control and RFID (for example Salto), visitor management, alarms, perimeter and structure, secure entry points, locked comms rooms, and computers that lock when left.
- Dynamic connectors (Xero, MYOB, Tanda, Deputy, Trello and others), with more on request.
- A simple phone app for the owner.
- An optional AI email assistant, with sharing levels set by sensitivity.
- A shared calendar: business events extracted from personal calendars, managers creating events, approvals for big changes, and lock levels on senior staff's events.

## Limits and decisions

- **No arbitrary remote control.** Agents never take free-text commands from the website. The safe shape:
  - **Read-only first.** Agents and site gateways collect only, connect outbound, and open no listening port.
  - **Allow-listed actions only, later.** A short list of named actions (block an address, restart a named service, revoke a card, apply a lock-screen policy) with fixed parameters.
  - **Approval and proof.** Every action is approved in the site, signed by the server, checked by the agent, logged at both ends, and the agent has a local kill switch.
  - **Elevation only to install.** The installer needs admin rights to register the service; the service runs with the least rights its collectors need.
- **AI suggests, people approve.** Scans, agents and the assistant produce drafts, diffs, pull requests or proposed actions. Nothing changes a system, sends a message or posts content without a person approving it.
- **Documents and emails are untrusted input.** The AI may read, extract and summarise them, but text inside a document or email never triggers an action, however it is phrased.
- **Two kinds of data.** Telemetry events keep the v1 rule: metadata only, never contents or personal data. Business records (people, rosters, invoices, door events, email summaries) are a separate, consented data store: scoped by role, encrypted at rest, sensitive fields (pay, tax file numbers, bank details) encrypted again, kept for a set time, exportable and deletable.
- **Mock data until a sanctioned pilot.** Demos for the design partner run on a fictional company. No real company data goes into Mycelium unless that company's IT approves a pilot. No real company names or branding in the product, demos or this public repo.
- **Physical security is metadata only.** Camera health and events, never video streams; links open the customer's own camera system.
- **Use the customer's own enforcement tools.** Device rules such as screen lock come from Intune or Group Policy; Mycelium checks compliance and reports gaps. It enforces only through an approved allow-listed action where no management tool exists.
- **Employee privacy.** Workload comes from tasks, tickets and rosters, never keystrokes or screen time. Staff can see what is held about them. Check state workplace surveillance laws (NSW and the ACT have their own) before turning on cameras, access logs or device data.
- **Code privacy.** `mycelium scan` runs static tools locally and sends the model summaries only; full files are opt-in. The customer's own API key pays, with a spend cap.
- **Self-hosted first.** Each customer runs Mycelium in their own cloud or on their own servers; a small public site hosts documentation, the setup kit and signed downloads. A hosted service can come later, once Mycelium itself meets the security bar a customer would ask of it.
- **Compliance wording.** Evidence and gaps against published control lists. Never "you are compliant", and no copyrighted standard text (ISO control numbers and short titles are fine; the Essential Eight is free from the ACSC).
- **Finance and tax limits.** Cash-flow and margin insights, not financial product advice (that needs an AFSL). Tax features prepare packs and drafts for the owner or their registered tax agent, not returns lodged for a fee. Get legal advice before these features ship.
- **Decisions:**
  1. ~~First users after Tristan~~ **Decided 2026-11-04:** large multi-site organisations, starting with manufacturers, with a design partner.
  2. A licence for the public repo (for example MIT or AGPL). **Open**, needed before phase K.
  3. Whether agents ever run actions, or stay read-only. **Open**; the plan assumes allow-listed actions later.
  4. The first compliance framework. **Open**; Essential Eight recommended, ISO 27001 physical controls likely for the wedge.
  5. A separate enterprise RegTech app. **Decided 2026-11-04 (revised the same day):** compliance is a separate application that Mycelium controls as a plug-in. Mycelium collects, read-only; the compliance app maps evidence to controls, runs tests, takes attestations and exports (OSCAL and signed packs). Research and the ranked gaps: [RegTech market and gaps](../reports/RegTech%20market%20and%20gaps.md), notes in `research_notes/`. The first pack it recommends is read-only cross-vendor site evidence (physical security, people) plus Essential Eight per site from Intune, for one design-partner site.
  6. Pilot hosting: in the customer's cloud (recommended) or hosted by Tristan. **Open**, decide with the design partner.

## How it's built

The shape stays: one React web app (installable as a PWA), connectors and agents feeding a Flask server, live updates over SSE, panels and collectors added through their registries. For enterprise these change:

| Area | v1 | From now |
|---|---|---|
| Data collection | Emitters and the Claude hook | **No agent where an API exists:** cloud connectors first (Microsoft Graph and Intune, Tanda, Xero, Gallagher and Salto cloud APIs). Then **one site gateway per site** (a small VM or container, outbound only) for systems on the site's own network (access control servers, camera systems, plant data). Per-machine agents only where nothing else works. |
| Installing | PowerShell and bash scripts | Scripts stay for small setups. For enterprise: **code-signed MSI and Intune packages**, `.deb` and `.rpm`, a container image and a Helm chart, all with checksums. |
| Hosting | One private server on Tailscale | **Self-hosted** in the customer's cloud (Docker or Kubernetes) first; hosted later. Tailscale stays for Tristan's own instance. |
| Back end | Flask, SQLite, an in-memory bus, one gunicorn worker | Flask stays. **Postgres** with row-level security for organisation and scope, a **job queue** for connectors and AI, **object storage** for documents, Redis or Postgres LISTEN/NOTIFY for the live bus across workers. |
| Phone | Responsive web | **PWA first**, then the same code wrapped with **Capacitor** for the App Store, Play and managed phones (Intune app protection needs a native wrapper; iOS PWAs lack NFC and some background features). |
| Sign-in | Tailscale identity or a password | **SSO** (OIDC and SAML: Entra ID, Okta, Google) with **SCIM** directory sync, passkeys, and Tailscale for Tristan's own instance. |
| Audit | Audit table | **Tamper-evident** hash chain from the start of phase B. |

Also planned:
- **Core, products and connectors.** Split the repo into the core engine (ingest, storage, bus, auth, admin proxy, audit), the web app, and connectors (emitters, gateway, agents).
- **Connector protocol.** Write down the event format, ingest auth and webhook signing as a versioned spec (`docs/protocol.md`).

## Modules

What each module covers, so a phase can be built from this list. Every module is one or more collectors plus panels, switched on by the setup profile and by the data that arrives.

**People, roles and permissions**
- **Home screen per role, in one app:**
  - **Employee:** my tickets, tasks, shifts, leave, training and certificate expiries, access cards, announcements, calendar.
  - **Manager:** everyone under them, plus an approvals inbox, team workload, roster coverage and team incidents.
  - **Site, regional and executive levels:** site-by-site comparison, plus everything below.
  - **Specialists:** Security, HR, Finance, IT and a read-only Auditor, each across the scope they're given.
- **Permissions are role × scope.** Scopes: organisation → region → entity → site → department → team → self.
- **The hierarchy comes from the directory:** manager, department and office location arrive through SCIM or HR data, and the owner confirms them.
- **Preset roles:** Employee, Supervisor, Site Manager, Regional Manager, GM Operations, Security Officer, HR, Finance, IT Admin, Auditor, Contractor. Each is a capability grid by module the owner can edit.
- **Easy to manage:** bulk assignment by department, site or directory group. "View as" previews what a role sees, and "why can this person see this?" explains access on any record.
- **Delegation and hygiene:** delegation with an expiry, acting roles, and tasks assigned to a person, role or team. Quarterly access reviews, break-glass access with an alert, and field-level hiding (pay visible to HR and Finance only).

**Calendar and scheduling**
- **Layers:** organisation, region, site, team and personal, plus rosters (Tanda, Deputy), maintenance windows, audits, training and leave.
- **Personal calendar import, business events only:** choose calendars, add rules (company-domain attendees, keywords), and let the AI classify the rest with confirmation. Private events show as busy only.
- **Approval rules as policies:** for example, events over 4 hours or of certain types need approval from the next level up. Optionally, managers need approval to move or delete existing events.
- **Lock levels on events:** locked, edit by request (the approver sees a diff), or editable. The default comes from the creator's role, and every change is audited.
- **Two-way sync with Outlook and Google.** Mycelium is the source of truth for its own events. It can't stop someone deleting their Outlook copy, so it detects and flags that.

**Tasks and tickets**
- A built-in board, plus connectors for Trello, Jira, Planner and ServiceNow.
- Assign to a person, role or team. Workload per person feeds the team map.

**Operations (manufacturing first)**
- Site comparison: OEE, downtime, safety incidents and near misses, maintenance backlog, quality defects, on-time delivery, roster coverage.
- Data from CSV drops, maintenance systems, plant historians or MES through the site gateway.
- Exact contents decided with the design partner.

**Physical security**
- **Access control and RFID:** Gallagher, Salto (KS cloud API; Space through the gateway), Inner Range. Covers door events, forced and held-open doors, card issue and revoke, cards still active for leavers, after-hours and restricted-area access.
- **Visitor management:** SwipedOn or Envoy, or built-in phone and tablet sign-in with host notification, induction acknowledgement, badge expiry and an evacuation list.
- **Cameras:** health and events only (offline, tamper, restricted-zone motion, recording gaps, storage days left, vulnerable firmware) from systems such as Milestone or Genetec.
- **Alarms and perimeter:** alarm panel events, zones, fence and gate sensors, guard patrol tours, incident reports with photos.
- **Comms and server rooms:** door events, door-open-too-long alerts, temperature and humidity, and scheduled phone inspections with photo evidence.
- **Device policy:** screen lock, disk encryption and patch compliance from Intune or Group Policy.
- **Policies view:** each physical policy with its evidence, gaps and trend, linked to compliance packs.

**Cyber security**
- **Security ledger:** every check shows what it checks, why, how, when it last ran, the result, the evidence and the next run.
- **Per-check settings:** on or off, schedule, thresholds, severity, alert routing, quiet hours. Risk acceptance has a reason and an expiry.
- **Profiles:** small business, online shop, SaaS, company.
- **Auto-actions:** opt-in from the allow-list only.
- **Checks:**
  - Code: dependencies, secrets, static analysis, headers, admin tokens.
  - Website: TLS and domain expiry, DNS changes, SPF/DKIM/DMARC, defacement, CMS plugins.
  - Sign-ins: failed bursts, new admins, rate-limit hits.
  - SaaS accounts: MFA on, admin count, leavers with access, stale keys.
  - Devices, through Intune or the agent: mapped to the Essential Eight.
  - Data exposure: public sharing links, public buckets.
  - Brand and breaches: lookalike domains, the company domain in known breaches.
  - Payments: chargebacks, refund spikes, changed supplier bank details.
  - AI agents: permissions and what they touched.
  - Third-party app access.

**Connectors**
- **Catalogue:** each connector declares the data it provides, and modules light up when that data arrives.
- **First set:** Microsoft 365 (Entra, Outlook, Teams, Planner, Intune), Tanda, Deputy, Trello, Jira, Xero, MYOB, Gallagher, Salto, SwipedOn.
- **Enterprise later:** SAP (OData), Workday or SuccessFactors, ServiceNow, maintenance systems.
- **Generic connectors:** REST with OAuth, webhooks, CSV and SFTP drops, read-only database views.
- **Requests:** a request-a-connector page with votes. Later, an AI connector builder drafts a connector spec from API docs for review.
- **OAuth plumbing:** an open-source sync layer that can be self-hosted (for example Nango) rather than hand-written OAuth per service.

**Setup wizard**
- **Size routes the flow:**
  - **Small:** three questions (what you sell, how, how big), then connect accounts and point at folders.
  - **Enterprise:** connect SSO and the directory, confirm the imported org structure, sites and managers, then set organisation policies (roles, approvals, data-sharing levels). The wizard is then **distributed**: each site manager completes their own site's section, and the owner sees progress per site.
- **Templates:** manufacturing site, office, warehouse, retail, small online store.
- **AI help throughout:** it asks about gaps, and every step says what it unlocks. A setup score shows how complete the picture is, and setup can be resumed or delegated at any time.

**AI assistant**
- Chat over the organisation's own records, with sources cited for every answer.
- Scheduled tasks ("every Monday, overdue maintenance by site").
- **Agent permissions:** read-only by default, then drafts that need approval, then allow-listed actions.
- Each agent's history, cost and pause switch are visible, with a spend cap per organisation.

**Email assistant (opt-in)**
- **Sharing levels,** set organisation-wide and by each person:
  1. Off
  2. Metadata only
  3. Subject plus an AI summary
  4. Full message, for chosen folders only
- Messages with sensitivity labels (Microsoft Purview) and excluded senders or folders are always skipped.
- **Extracts:** tasks, deadlines, supplier commitments and business events, linked to the source. Summaries are stored, not bodies.
- Corporate mailbox access needs the customer IT's admin consent.

**Phone app**
- **On the phone:** approvals, alerts (acknowledge, assign), a daily brief per site, my shifts and tasks, incident and hazard reports with photos, inspection checklists, visitor sign-in, revoking a lost card, receipt capture, voice chat with the assistant.
- **Desktop only:** permission grids, connector setup, the full map, reports.
- **Layout:** a bottom tab bar (Home, Approvals, Tasks, Alerts, Chat) and one decision per screen. Passkey or biometric sign-in, with a check again before sensitive actions.

**Live map lenses**
- **One graph model, many lenses.** Nodes: files, services, stores, agents, people, products, suppliers, accounts, money categories. Edges: imports, calls, reads and writes, reports-to, supplies, pays. A lens is a JSON spec of filters, layout, styling and grouping.
- **The lenses:**

  | Lens | Shows | Look (ReactVibe styles) | Layout |
  |---|---|---|---|
  | Code (v1) | Files, routes, stores | Node Flow | Force |
  | Traffic | Endpoints, services, external APIs | Network Pulse, Hub Flow | Force with pinned hubs |
  | Agents | Orchestrator, agents, tools, files touched | Hub Flow, Converge, Connection Flow | Radial hub |
  | Integrations | Sources → Mycelium → outputs | Connection Flow | Layers |
  | Team | People, roles, managers, tasks | Origin, Nexus | Tree or radial |
  | Money | Revenue → categories → profit | Sankey | Flow layers |
  | Sites | Sites, doors, cameras, rooms | (to design) | Grouped by site |

- **Mostly configuration:** `force-graph` already has `dagMode` (`td`, `lr`, `radialout`, `radialin`), so tree, radial and layered lenses need no new library. Only the Sankey needs one (`d3-sankey`).
- **The team lens:** nodes sized by open tasks, colour for overload, drag a task onto a person to assign it.
- **Changing lenses:** the wizard picks lenses from the profile. Later the assistant edits a lens spec from a request, with a preview before saving; it never generates code.
- **Accessibility:** each lens has a non-visual equivalent (the team lens as a nested list, money as a table).

**Later modules (from the 4 Nov business-wide brief)**
- **Documents and money:**
  - Capture from folders, email forwarding and the phone camera, then OCR and field extraction with a confidence score per field and a review queue. Corrections become per-organisation rules. Local OCR and a local model are an option.
  - Matching receipts to bank lines, duplicate and changed-bank-details detection, subscription audit, a money-flow (Sankey) view, true profit per product, cash flow and a GST set-aside.
- **Tax and finance packs:** BAS worksheets, a tax-time pack and a depreciation schedule for the owner or their registered agent, plus accountant, bank and investor packs.
- **CO₂ and compliance:**
  - Emissions: scope 1 from fuel receipts, scope 2 from electricity bills, scope 3 from spend by category using National Greenhouse Accounts factors. Each figure is labelled estimated or measured. Large customers ask suppliers for this as AASB S2 reporting phases in.
  - Compliance packs: Essential Eight, ISO 27001, WHS, IEC 62443 for plant networks, Privacy Act, PCI DSS self-assessment.
  - A compliance calendar of renewals and due dates.
- **Small business and online sellers:**
  - Shopify, Stripe and Square sales.
  - A product research agent using official APIs, and a margin calculator.
  - Supplier vetting, trademark risk checks, and a store audit (speed, accessibility, SEO, copy, checkout).
  - A marketing calendar with drafts that need approval.
  - A filing-system agent.
- **Software monitoring (v1) carried forward:** a Node emitter, Unity and Godot game connectors with a Players panel, generic OpenTelemetry, and `mycelium scan` with its model step delivered as a pull request.

## Plan of attack

Each phase ends in something usable. Effort: S is about a day, M a few days, L a week or more of evenings. A, B and C come first so the design partner has something to click on mock data early; their feedback sets the contents of E and F.

### Phase 0: v1 (done)

| Step | Status |
|---|---|
| 0.1 Deploy on the homelab | **Done 2026-10-31**, see `infra/homelab/README.md` |
| 0.2 Merge Reroute PRs and connect production | **Done 2026-11-01** (Reroute `main` `e44f150`) |
| 0.3 Screen-reader pass (NVDA) | **Deferred 2026-11-04.** Run it in phase C, over the new role-based screens. |

### Phase A: discovery

| Step | How | Done when | Effort |
|---|---|---|---|
| A.1 Interviews | Sessions with the design partner: systems each site uses (ERP, HR and payroll, rostering, ticketing, maintenance, access control, cameras, visitors), the morning routine, reports built by hand, what needs approval and from whom, differences between sites, physical security incidents and audits, what corporate IT would require. Notes keep no names or quotes. | A one-page problem statement and top-10 needs the partner agrees with | S |
| A.2 Personas | GM Operations, site manager, supervisor, employee, security officer, IT admin | Each persona has its top tasks and the data it needs | S |
| A.3 Demo company | A fictional multi-site manufacturer (about 4 sites, 3 entities, 600 staff) with generated people, rosters, tasks, incidents, door and visitor events. **Prototype done 2026-11-04:** `demo/` (see `demo/README.md`), a clickable front-end demo of phases C, E, F, G and H on this data, with six role views, 40 marked assumptions reviewers can correct (eleven features added 2026-11-05, see [demo-features-plan.md](demo-features-plan.md)), and feedback boxes on every page | The design partner and their IT team review the prototype and their feedback is logged | M |

### Phase B: enterprise foundation

| Step | How | Done when | Effort |
|---|---|---|---|
| B.1 Postgres and jobs | Move from SQLite to Postgres with migrations; a job queue; object storage; a live bus that works across workers | All existing tests pass on Postgres; two workers share live events | M |
| B.2 Organisation model | Organisation, region, entity, site, department, team; people linked to positions; `org` on every table with row-level security | Two organisations on one server cannot see each other's data (tests) | L |
| B.3 Roles and scopes | Capability grid per role, role × scope assignments, field-level hiding, "view as", "why can they see this" | A supervisor sees only their team, and the explanation matches (tests) | L |
| B.4 SSO and SCIM | OIDC and SAML (a test Entra ID tenant), SCIM users and groups, group-to-role mapping, passkeys | A test tenant's users sign in and their managers build the hierarchy | M |
| B.5 Delegation and audit | Delegation with expiry, acting roles, tamper-evident audit (hash chain, verified on export), access reviews | Editing an audit row is detected; an expired delegation stops working | M |
| B.6 Staff data access | Each person sees what is held about them, its source, who can see it, how long it is kept and who opened their record; correction requests to HR; export. **Shown in the demo 2026-11-05** (`/my-data`) | A staff member downloads their record and it matches what HR holds | S |

### Phase C: role-based app

| Step | How | Done when | Effort |
|---|---|---|---|
| C.1 Home screens per role | Employee, manager, site, executive and specialist homes from the same panels, filtered by permission; admins set default layouts per role | Each persona from A.2 lands on a useful home on the demo company | M |
| C.2 Tasks and approvals | Built-in tasks and tickets; an approvals inbox; approval chains from policy | A leave request and a large event go through the right approvers | M |
| C.3 Calendar | Layers, event types, approval rules, lock levels, change requests with a diff | A locked senior event can't be edited by a supervisor; an edit request reaches the owner | L |
| C.4 Phone and PWA | Phone layout with the bottom tab bar; manifest, icons, a service worker for the app shell only (never API data); web push. **Manifest, icons and service worker done 2026-11-05** (see architecture.md, "Installable app"); the bottom tab bar and web push remain | "Install" appears in Chrome, Edge and Safari; an approval works one-handed | M |
| C.5 Screen-reader pass | NVDA over the role homes, approvals and calendar (the deferred step 0.3) | Findings fixed or listed | S |
| C.6 First demo | Walk the design partner through the demo company | Feedback logged and the order of E and F confirmed | S |
| C.7 Customisable Home and TV mode | Card registry with role default layouts; each person reorders, resizes, hides and adds cards their permissions allow; a full-screen floor display with no personal data that a roll call takes over. **Shown in the demo 2026-11-05** | A site manager sets a default Home for supervisors; a floor TV runs a shift without names on screen | M |

### Phase D: connector framework

| Step | How | Done when | Effort |
|---|---|---|---|
| D.1 Framework | Connector catalogue with declared data types; an OAuth and sync layer; generic REST, webhook and CSV/SFTP connectors; request-a-connector | A CSV of shifts and a generic REST source both flow in without new code | M |
| D.2 Microsoft 365 | Entra, Outlook calendar, Planner, Teams notifications, Intune device compliance, through Microsoft Graph | A test tenant's calendars and device compliance appear | M |
| D.3 Rosters and tasks | Tanda or Deputy; Trello, Jira or Planner | Shifts and tasks from test accounts appear on the calendar and the team map | M |
| D.4 Accounts | Xero and MYOB (read-only) for the finance view | A test organisation's invoices and bills appear | M |
| D.5 Protocol spec | `docs/protocol.md`: event format, ingest auth, webhook signing, connector spec | Someone else could write a connector from the spec alone | S |

### Phase E: operations module

| Step | How | Done when | Effort |
|---|---|---|---|
| E.1 Site comparison | KPIs per site from A.1 (likely OEE, downtime, incidents, maintenance, quality, deliveries, roster coverage) | The design partner says they'd check it every morning | M |
| E.2 Data in | CSV drops first, then the maintenance system or historian through the site gateway (F.1) | One real-format export (with demo values) loads cleanly | M |
| E.3 Daily brief and alerts | A brief per site and per person; alerts by email, push or ntfy, with quiet hours | A test alert reaches the phone | S |
| E.4 Rosters and skills | Plan rosters in Mycelium against rest, hours, leave, headcount and machine tickets, then hand off to the rostering system through one approved action; a skills matrix that flags shifts with no certified operator. **Shown in the demo 2026-11-05** | A supervisor's roster reaches the rostering system after the site manager approves it | L |
| E.5 Weather and roads | Bureau of Meteorology warnings and QLDTraffic closures per site; commute risk by home postcode for staff who opt in, feeding the roster. Check both sources' terms of reuse. **Shown in the demo 2026-11-05** (fictional data) | A flood watch flags the next day's shift with names only for the person's own supervisor | M |

### Phase F: physical security

| Step | How | Done when | Effort |
|---|---|---|---|
| F.1 Site gateway | A small outbound-only service per site for on-site systems; signed, installed as a container or service | A gateway on the homelab reports to Mycelium | L |
| F.2 Access control | Gallagher and Salto connectors; door events, cards, leavers with active cards, restricted areas | A simulated site raises "leaver's card used" and "comms room door held open" | M |
| F.3 Visitors | SwipedOn or Envoy, or built-in sign-in; evacuation list | A visitor signs in on a phone and the host is notified | M |
| F.4 Cameras and alarms | Camera health and events, alarm panel events, patrol tours | A camera going offline raises an alert with a link to the camera system | M |
| F.5 Inspections and policies | Scheduled phone checklists with photos; a policies view with evidence; device lock compliance from Intune | Overdue comms-room inspections show per site | M |
| F.6 Sites lens | A map lens of sites, doors, cameras and rooms. **Shown in the demo 2026-11-05** as a schematic floor plan per site with live states and a 24-hour replay | Door events pulse on the sites lens, with a table equivalent | M |
| F.7 Permits to work | Hot-work, confined-space and isolation permits linked to work orders, tickets and restricted doors; alerts on entry without a valid permit; optionally an approved action that adds holders' cards to the area's access group for the permit window (decision 3). **Shown in the demo 2026-11-05** | An entry without a permit raises an alert within a minute | M |
| F.8 Emergency roll call | Who is on site from door reads, visitor sign-ins, permit holders and the roster; wardens tick people off on phones; a report into the audit trail and audit evidence. **Shown in the demo 2026-11-05** (drills only) | A drill at one site ends with everyone accounted for and a report | M |

### Phase G: setup wizard

| Step | How | Done when | Effort |
|---|---|---|---|
| G.1 Small flow | Three questions, profile, connect accounts, point at folders | A fresh small business is set up in under fifteen minutes | M |
| G.2 Enterprise flow | SSO and directory import, confirm structure, organisation policies, then a section per site delegated to site managers, with progress per site | The demo company is set up end to end through the wizard | L |
| G.3 Templates and score | Templates (manufacturing site, office, warehouse, retail, online store); setup score; what each step unlocks | Picking a template preselects modules and lenses | S |

### Phase H: AI

| Step | How | Done when | Effort |
|---|---|---|---|
| H.1 Assistant | Chat over the organisation's records with cited sources; permission-filtered retrieval; spend cap; check current model choice and pricing at build time | "What's overdue at Site 2?" is answered with sources, and a supervisor's answer leaves out other teams | M |
| H.2 Scheduled tasks and agents | Scheduled tasks; agents with read, draft and allow-listed levels; history and pause | A weekly summary runs on schedule; a draft action waits for approval | M |
| H.3 Email and calendar extraction | Sharing levels, label exclusions, task and event extraction | Email-derived tasks link to their source and respect the level chosen | M |
| H.4 Gap questions and lens edits | The wizard's AI gap questions; lens specs edited from requests with a preview | "Show only Site 3's security" produces a lens that saves | S |

### Phase I: packaging

| Step | How | Done when | Effort |
|---|---|---|---|
| I.1 Server | Published container image, Helm chart, one-line installer for small setups, signed releases with checksums | A fresh machine runs Mycelium in under ten minutes from the docs | M |
| I.2 Agents and gateway | Code-signed MSI and Intune package, `.deb` and `.rpm`; the setup kit page (pick a type, get scripts with dry run, uninstall and checksum) | The gateway installs through Intune on a test device; scripts run twice with no change | M |
| I.3 Phone app | Capacitor wrapper for iOS and Android; app protection for managed phones | The app runs on a managed test phone | M |

### Phase J: later modules

Prioritised from pilot feedback. Each is a set of collectors and panels from the Modules list above.

| Step | Contents | Effort |
|---|---|---|
| J.1 Cyber security centre | Security ledger, threat feed (`auth`, `ratelimit` and `security` event kinds), posture checks, more allow-listed actions; host agent for devices without Intune | L |
| J.2 Compliance app | **Shown in the demo 2026-11-05** (`/audit`: evidence, gap or stale per control, a pack with a hash per item, guest auditor access). A separate plug-in app (decision 5): control library as data, evidence mapping, reports (OSCAL, PDF or Markdown); Essential Eight and site evidence first, then ISO 27001 and WHS | L |
| J.3 Documents and money | **Shown in the demo 2026-11-05** (`/documents`: watched folders, review queue, tax pack for the agent). Capture, extraction, review queue, matching, money map, finance packs | L |
| J.4 CO₂ | Scope 1, 2 and 3 estimates from bills, receipts and spend; supplier questionnaire answers | M |
| J.5 Small business and online sellers | Sales connectors, store audit, product research, marketing calendar | L |
| J.6 Software monitoring | Node emitter, game connectors, generic OpenTelemetry, `mycelium scan` and its pull requests, the policy pack | L |

### Phase K: ready to sell

| Step | How | Done when | Effort |
|---|---|---|---|
| K.1 Mycelium's own security | Penetration test, a security page, `SECURITY.md` and disclosure policy, ISO 27001-style controls for Mycelium itself | A corporate security questionnaire can be answered with evidence | M |
| K.2 Licence and terms | Pick the licence (decision 2); legal review of privacy, surveillance, finance and tax features | Signed off before any real customer data | S |
| K.3 Pilot | One site of a real organisation through its IT and procurement, starting with non-sensitive data | The pilot runs for a month with the customer IT's approval | L |

### Where the 31 Oct phases went

| 31 Oct phase | Now |
|---|---|
| 1.1 Installable app | C.4 |
| 1.2 Organisations and roles, 1.3 Sign-in for others | B.2 to B.4 |
| 1.4 Packaging | I.1 |
| 1.5 Protocol spec and licence | D.5, K.2 |
| 2 Monitor anything | D (connectors), J.5, J.6 |
| 3 Setup kit and policy pack | G, I.2, J.6 |
| 4 AI analyst | J.6 (code), H (assistant) |
| 5 Security centre | J.1, with alerts in E.3 |
| 6 Host agent | F.1 (site gateway), J.1 (device agent) |
| 7 Compliance module | B.5 (audit), J.2 |
| 8 Enterprise RegTech site | J.2, as a separate app controlled by Mycelium |

## How this fits Tristan's goals

The security parts (physical and cyber security, the gateway, Essential Eight and ISO 27001 evidence) double as cybersecurity portfolio work, and the homelab is the first place to run them. Working with a design partner on a real operations problem is product and requirements experience. See the vault note `Career/Career and Cybersecurity.md`.
