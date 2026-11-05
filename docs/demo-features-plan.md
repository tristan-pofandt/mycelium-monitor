# Plan: eleven new features in the demo

**Status:** built in the demo on 2026-11-05 (commits c28fd3a to 7d098ab and the review pass after them). Written by Claude Code from Tristan's list of 5 Nov (which picks from
"Ideas to stand out" in the vault note); human review required.

The features go into the fictional Brolga Industries demo (`web/src/demo`), built the same way as the pages already there.
Each one gets a home in the roadmap once it's built (see "Docs" at the end).

## How every feature is built (the demo's existing pattern)

Each feature follows these rules, so none of them need repeating below.

- **Data** goes in `data.js` (or a new data file next to it), generated from a fixed seed, with dates relative to today.
  **New generators use their own `rng(seed)`, added after the existing ones.** The shared `rand()` sequence makes every
  person, card and door event, so one extra call in the middle would rename people and move cards that reviewers' feedback
  already mentions. A test checks that `PEOPLE[0..20]` and the leavers are unchanged.
- **A page** is one entry in `PAGES` (`DemoApp.jsx`) with a `cap`. A new permission is one row in `CAPS` plus
  `DEFAULT_GRANTS` per role, so it shows on Roles and permissions straight away and `NotInView` explains a missing page.
  A smaller feature is a tab (the `segmented` toolbar, as on Security) or a card on an existing page.
- **What reviewers click** is kept in `store.js` (new keys in `fresh()`), so Reset demo clears it. Every change a real
  deployment would log goes through `audit()`. Decisions toast with Undo; destructive actions use `HoldButton`.
- **Sources:** every card calls `SourceNote` with the systems it draws on. A new system we have to guess at is a new entry in
  `assumptions.js`, so it shows in Your systems and the page's sources strip. Prose names systems with `SystemName`.
- **Scope:** lists are filtered by `inScope()` and the persona's site, as today. The Site Manager sees Ipswich only, the
  supervisor their team, the employee themselves.
- **Accessibility:** every visual (the site map, the roster grid, the TV screens) has a table or text equivalent, a keyboard
  path and a screen-reader name. Status is never shown by colour alone.
- **Motion:** pages never animate their own arrival (`<Page>` does it). Numbers use `CountUp`. Anything new moves with
  `transform` and `opacity` only, timed from `choreography.js`, with a reduced-motion form.
- **Look:** existing cards, KPI tiles, `Table`, `Bars`, badges, chips and the one-accent rule from `DESIGN.md`. No raw hex.
  Light-mode status colours use the darker steps.
- **About page:** each feature adds a line to "Try this" and, where it would touch a real system, a row to "For IT" saying
  what it would connect to, read-only or not, and what it stores.
- **Tests:** each feature's rules are a pure function in the data file, tested in `data.test.js` (named below).
- **Limits from the roadmap** apply throughout: metadata only for physical security (no video), AI suggests and people
  approve, documents are untrusted input, staff can see what's held about them, and fictional data only.

## New permissions

| Permission (`CAPS`) | Group | Default roles |
|---|---|---|
| `finance`: See invoices, receipts and tax packs | Money | GM |
| `roster`: Plan rosters | People | GM, Site Manager, Supervisor |
| `permits`: Issue and close permits to work | Safety | Site Manager, Supervisor |
| `emergency`: Run a roll call | Safety | GM, Site Manager, Supervisor (as warden), Security |
| `audit`: See and export audit evidence | Admin | GM, Site Manager, Security, IT |
| `tv`: Set up floor screens | Operations | GM, Site Manager |
| `layouts`: Set each role's default Home | Admin | GM, IT |

Everyone can customise their own Home, see My data and see weather for their site, so those need no permission.

## The features

Ordered by what each one needs from the others. Effort uses the roadmap's scale: S about a day, M a few days, L a week or
more of evenings.

### 1. Skills log (People, new "Skills" view) · S

- **What:** a matrix of machines and tasks against people, showing who is trained and certified, when each certificate
  expires, and where a shift has no qualified operator.
- **Data:** `MACHINES` per site (press line 2, CNC cells, foundry pour, crane CR-04, forklifts, the brake test rig), each
  needing one or more certificates. Each operator gets `skills` from a new seeded generator. The existing `certs` become a
  subset of skills, so the supervisor's "Certificates expiring" card keeps working.
- **Where:** a fourth view on People next to Map, Outline and Directory. Rows are people in scope, columns machines; each cell
  is a badge with a word (Certified, Training, Expires 12 Nov, None). A "Gaps" strip on top lists each shift and machine
  with too few qualified people. It also shows in the PersonCard ("Can operate").
- **Joined with:** the roster (feature 2) and permits (feature 3: a confined-space permit needs the confined-space ticket).
  New alert: "Night shift at Toowoomba has no certified crane operator on Thursday".
- **Accessibility:** a real `<table>` with row and column headers. Filter by site, shift and machine.
- **Guesses:** `training`: where training records live ("SuccessFactors Learning, or spreadsheets per site").
- **Test:** `skillGaps(roster, skills, machines)` returns the shift, machine and shortfall.

### 2. Roster planning (new page "Rosters") · L

- **What:** build next week's roster in Mycelium, check it, then hand it to the rostering system (UKG in our guess) to publish.
- **Data:** `ROSTER`, a two-week grid per team from each person's shift, plus required headcount and skills per shift and
  machine. Approved leave (from Work's approvals) and the leave in `APPROVALS` remove people from days.
- **Page:** `/rosters`, cap `roster`. A week grid: people down, days across, cells holding a shift chip (Day, Afternoon,
  Night, Off, Leave). Under each day: coverage against need ("Night 9 of 12"), turning amber or red with a word.
- **Interactions:**
  - Click a cell to pick a shift from a `Picker`; arrow keys move between cells (a grid with `rovingKeys` in two directions).
  - Drag a person's chip to another day (pointer only; the keyboard path is the picker).
  - "Fill gaps" suggests people with the right skills and enough rest. It's a suggestion the planner accepts, never automatic.
- **Rules checked live:** a qualified operator on every machine (feature 1), at least 10 hours' rest between shifts, a weekly
  hours cap, approved leave respected, and weather risk (feature 9). Each broken rule is a line in a "Problems" list beside
  the grid, linked to the cell.
- **Hand-off:** "Send to UKG" opens a diff (12 shifts changed, 3 people moved). The Site Manager approves it if the rules say
  so (a new approval kind "Roster", reusing `APPROVALS` and `decide()`). Then a simulated hand-off with a `useTask` chip. The
  For IT row says it would write through an allow-listed action and that the rostering system stays the record.
- **Roles:** the supervisor plans their team, the Site Manager plans and approves the site, the GM sees coverage only, and the
  employee sees their own shifts on Calendar, as now. Sites' "Roster coverage" KPI and the Home tile read from this grid.
- **Accessibility:** the grid is a table; each cell says "Aisha Chen, Thursday, Night shift". The coverage row has text.
- **Motion:** a chip dropped into a cell settles with `scale` from 0.96 over 0.18s. A rejected drop springs back over 0.2s.
  Ask `emil-design-eng` before building the drag.
- **Test:** `rosterProblems(roster, rules)`: rest, hours, skills, leave and coverage, one case each.

### 3. Permits to work tied to door access (Security and Work) · M

- **What:** hot-work, confined-space and isolation (lockout) permits, each linked to its holders, a work order and the doors
  of the area it covers. Only current permit holders should badge into those doors, and the app alerts when someone else does.
- **Data:** `PERMITS` (type, area, doors, holders, issuer, valid from and to, linked task, status). `DOORS` gains a
  `permit` field for restricted doors (Tank 2 confined space, Foundry hot-work bay, Press line 2 isolation cage).
  `DOOR_EVENTS` get two seeded events: a holder entering on a valid permit, and a non-holder entering the confined-space door.
- **Where:**
  - **Security, Physical:** a "Permits to work" card (open permits per site, holders, time left) and a "Permit" column in Door
    activity (Valid, None, Expired).
  - **Alert:** "Card C-10577 entered Tank 2 (confined space) with no permit". It goes in `SECURITY_ALERTS` with source `permits`.
  - **Work:** tasks that need one show a permit badge. "Replace hydraulic seals on press line 2" needs an isolation permit.
    Supervisors can issue a permit from the task: pick holders with `PersonSearch` (only people with the right skill from
    feature 1 can be picked; others are listed as "needs the confined-space ticket"), set times, issue. Closing or revoking
    is hold-to-confirm.
- **Real deployment:** in our guess, Mycelium tells the door system to add the holders' cards to the area's access group for
  the permit window, then remove them. This is an allow-listed action that needs approval (roadmap decision 3 is still open).
  Read-only mode just alerts.
- **Guesses:** `permits`: where permits are written today ("paper permit books, or SafetyCulture").
- **Test:** `permitFor(door, card, at)` returns valid, expired or none. `canHold(person, permitType)` checks skills.

### 4. Site map with live states and replay (Sites, new "Map" view) · L

- **What:** a schematic floor plan of each site instead of only lists. It shows live doors, cameras, alarms, machine states,
  the number of people in each zone, and a scrubber that replays an incident.
- **Data:** `plans.js`, with one plan per site as zones (rectangles with names: Assembly hall, Machine shop, Stores, Comms
  room, Dock 3, Car park), doors on zone edges, cameras, alarm zones and machines with positions. Machine state comes from
  the plant data (Running, Down, Maintenance); press line 2 at Ipswich is down. People per zone are worked out from door
  events (in minus out), so the map and the lists can't disagree.
- **Where:** Sites, in a site's detail view: a `segmented` Map / Figures toggle (Map first for the Site Manager). Security
  links its alerts to the map ("Show on map" highlights the door). Feature 5 and TV mode use the same component.
- **Build:** one SVG component, `SiteMap` in `web/src/demo/sitemap.jsx`. SVG rather than canvas because there are at most
  about 60 objects, and SVG gives real focus and names.
  - Each door, camera and machine is a focusable `<g role="button">` with a name ("Gate 2, held open 14 minutes"), opening
    a small panel with recent events.
  - Icons carry a shape and a word as well as colour.
  - Zone counts sit as text in each zone.
  - A legend shows the meaning of each symbol.
- **Replay:** a native range input under the map, covering the last 24 hours in 5-minute steps, with play, pause and step
  buttons. Moving it replays the door, alarm and camera events up to that time, and a "What happened" list beside it shows
  them in text. Preset incidents to jump to: "Comms room door held open, Toowoomba", "Former employee at Gate 2, Ipswich".
- **Motion:** a door event pulses once (a ring that scales 1 to 1.6 and fades over 0.6s, like the live map). During playback
  pulses are shorter (0.3s), and only the newest three are shown. With reduced motion the door just changes state.
- **Equivalent:** a table of zones (people, doors, alarms, machines) beside the map; the events list covers the replay.
- **Guesses:** `floorplans`: "No floor plans in a system; drawn in setup from a PDF". Setup gains a step: upload a plan, then
  place the doors (simulated).
- **Test:** `zoneCounts(doorEvents, plan, at)` gives the counts at a time; `stateAt(objects, events, at)` gives each
  object's state at a time.
- **Design check:** run `impeccable` (shape) on the map before building, as it's the demo's second signature visual after the
  team map.

### 5. Emergency roll call (new page "Emergency", from the header) · M

- **What:** in an evacuation, see who is in the building and who has left from door logs, check visitor sign-ins and the
  roster, and let wardens tick people off on their phones.
- **Data:** from what already exists. People badged in and not out (`DOOR_EVENTS`, extended to cover a full shift at one
  site), `VISITORS`, contractors on permits (feature 3), and the roster's current shift (feature 2). It reconciles them:
  "On roster, no badge-in" counts as probably absent but is still listed.
- **Entry:** a "Roll call" button in the header for roles with `emergency`, with a choice of site and "Drill" or "Real"
  (Drill is the default, and the demo only runs drills). It starts with a hold-to-confirm. While a roll call runs, the demo
  banner turns red on every page: "Drill at Ipswich: 14 not yet accounted for", linking back to the page.
- **Page:** `/emergency`, cap `emergency`.
  - Big counts at the top: On site, Safe, Not yet found, Visitors.
  - The site map (feature 4) with the count per zone at the last door read, so wardens know where to look.
  - Below it, a list grouped by last known zone.
- **Warden view:** on a phone, one person per row, with large "Safe" and "Not found" buttons (at least 48px) and a search.
  Ticks show to everyone at once (the shared demo store). The Undo toast stays up longer here (8s).
- **End:** "End roll call" (hold to confirm) writes a report: start, all-clear time, who was missing and for how long. It goes
  in the audit trail and in audit evidence (feature 8).
- **Accessibility:** counts are in a polite live region, announced at most once every 5 seconds. Every row is a button pair
  with the person's name in each label.
- **Motion:** almost none, because this screen needs speed. A ticked row's tick appears at once and the row moves to "Safe"
  with no slide. Under reduced motion it's the same. Check this with `emil-design-eng`, whose rule is no animation on
  high-frequency, urgent actions.
- **Guesses:** `evac`: "Wardens use paper lists and a printed visitor book".
- **Test:** `rollCall(site, at)` returns on-site, visitors and roster-without-badge, with no person counted twice.

### 6. Audit evidence that collects itself (new page "Audit evidence") · M

- **What:** evidence gathered as the systems run, sorted by control, and ready to export when an auditor arrives.
- **Data:** `CONTROLS` as data: short titles only, no standard text (roadmap rule). They cover ISO 9001 and ISO 45001 clauses
  relevant to a plant, ISO 27001 physical controls, and the Essential Eight. Each control lists its evidence, taken from
  what the demo already has: inspections done, door logs for restricted rooms, permits issued and closed, roll-call drills,
  training and skills, device compliance, approvals and the audit trail. Each item has a date, a source and a freshness
  ("last collected 2 h ago").
- **Page:** `/audit`, cap `audit`. One `segmented` tab per framework.
  - Each control is a row with Evidence / Gap / Stale and a word.
  - Opening a row lists the evidence items and links to them in the demo.
  - The wording is always "evidence found" or "gap", never "compliant" (roadmap rule).
- **"An auditor is here":**
  - Choose the framework, sites and period, then build a pack.
  - A `useTask` chip shows progress, then a download: a Markdown summary and a CSV of evidence, generated in the browser
    from fictional data, so no server is involved.
  - The pack lists a hash for each item and says a real one would be signed and checked against the tamper-evident log
    (roadmap B.5).
- **Auditor access:** on Roles, "Give an auditor read-only access for 5 days" reuses the delegation pattern and adds a
  read-only Auditor role to `ROLES`.
- **Ties to decision 5:** the page says it's the compliance plug-in, a separate app that Mycelium feeds, read-only. This
  matches the RegTech plan.
- **Existing piece:** Security's "Physical security policies" card links its rows here instead of being a second, separate
  list.
- **Test:** `controlStatus(control, evidence, today)` returns evidence, gap or stale (older than the control's period).

### 7. What we hold about you (new page "My data") · S

- **What:** any member of staff can see what information Mycelium holds about them, where it came from, how long it's kept,
  and who has looked at it.
- **Page:** `/my-data`, no permission needed, linked from the employee's Home and from "This is you" in the PersonCard. Each
  part of their record is a card:
  - profile from HR;
  - access card and their own door reads in the last 30 days;
  - shifts and leave;
  - skills and certificates;
  - tasks;
  - devices signed in;
  - emergency roll-call records.
- **What each card says:** the source (`SourceNote`), who can see it (by role, from `DEFAULT_GRANTS`), and how long it's kept.
- **Who looked:** a list of views of their record. Open a PersonCard as the supervisor, switch to the employee, and the view
  is there (a new `views` key in the store).
- **What we never collect:** keystrokes, screen time, video, and private calendar events (shown as busy only).
- **Actions:**
  - "Ask for a correction" files a request to HR. It shows in Work as a "Data" request and goes in the audit trail.
  - "Download my data" saves a JSON of their fictional record.
- **Guesses:** `privacy`: "HR handles access requests by email today".
- **Test:** `heldAbout(personId)` covers every category the PersonCard shows, so nothing is held that isn't listed.

### 8. Documents, invoices and tax (new page "Documents") · M

- **What:** Mycelium reads the folders and inboxes it's pointed at for invoices, receipts and logs (vehicle logbooks, fuel
  and travel). Machine learning pulls out the fields, and the results land in a review queue and a tax-time pack, which
  takes the tedious part away from people.
- **Data:** `DOCUMENTS`, about 40 fictional files. Each has its source folder or inbox, the fields pulled out (supplier,
  invoice number, date, amount, GST, category, entity, site), a confidence per field, and a status.
  - Seeded cases cover a duplicate invoice, a supplier whose bank details changed (a known fraud pattern), a receipt with
    no matching purchase order, and a logbook with missing trips.
  - No tax file numbers, and no real ABNs or businesses.
- **Page:** `/documents`, cap `finance`. Three tabs:
  - **Inbox:** files found today and where from. Over 95% confidence goes straight through; the rest wait for review.
  - **Review:** the document on the left (a styled fictional image); the fields on the right with their confidence; Accept,
    or correct and accept.
  - **Tax pack:** GST per entity per quarter (BAS worksheet figures), deductible spend by category, and the FBT logbook
    summary. Export is a CSV for the tax agent.
- **"Watched folders" card:** which locations are read (an accounts payable inbox, a SharePoint library, a scanned-receipts
  folder) and what is skipped. It says plainly that it's read-only, nominated folders only, never whole drives, and that
  extraction runs inside the customer's own cloud.
- **Limits** (roadmap): this prepares packs and drafts for the owner or their registered tax agent. It never lodges, and it
  gives no financial advice. Text inside a document never triggers anything: the changed-bank-details invoice is flagged,
  not paid, and the page says why.
- **Guesses:** `accounts` ("SAP S/4HANA Finance"), `ap_inbox` ("invoices arrive at an accounts payable mailbox and a
  scanning service"), `docai` ("Azure AI Document Intelligence in your tenant").
- **Test:** `routeDocument(doc)` returns auto, review or flagged. A duplicate or changed bank details is always flagged,
  whatever the confidence.

### 9. Weather and road alerts (Home, Sites, Rosters, TV) · M

- **What:** Bureau of Meteorology warnings and road closures for each site and the roads staff use to get there, so a
  supervisor knows before a shift who may not make it in.
- **Data:** `WEATHER` per site: a 3-day outlook, current BOM warnings (in the demo, a flood watch for the Bremer River
  affecting Ipswich, and a severe thunderstorm warning for Toowoomba tomorrow afternoon), and `ROADS` closures (fictional,
  in the style of QLDTraffic: "Warrego Hwy at Gatton, flooding, closed").
- **Who's affected, kept private:** commute risk is counted by home postcode only. The postcode comes from HR, and only
  where the person has opted in. The supervisor sees "4 of tomorrow's night shift live in postcodes cut off by the Warrego
  Hwy closure" and a list of those 4 (their own team only). The GM sees counts by site, no names. The employee sees "Your
  route may be affected" on their Home. This is a decision for the design partner (see "Open questions").
- **Where:**
  - a "Weather and roads" card on Home for every role, scoped to their site(s);
  - a line on Sites detail;
  - a problem in the roster planner ("4 at risk on Thursday's night shift: add backups");
  - a TV-mode screen.
- **Real deployment:** BOM warnings come from its public warning feeds, and roads from the QLDTraffic open data API. Check
  BOM's terms for commercial reuse and QLDTraffic's key terms before building it for real. In the demo, all of it is
  fictional data: nothing calls out, and the demo's content security policy would block it anyway.
- **Guesses:** `s_commute`: "Home postcodes in HR, used only with consent".
- **Test:** `commuteRisk(people, closures, warnings)` uses postcode and opt-in only, and returns no one who hasn't opted in.

### 10. Customisable Home (every role) · L

- **What:** full control over the dashboard's layout and parts: reorder, resize, hide and add cards. Admins set each role's
  default layout (roadmap C.1).
- **Refactor first:** today each persona's Home is hand-written in `Home.jsx`. It becomes a registry, `HOME_CARDS` (id, title,
  `cap`, sizes allowed, component), and `DEFAULT_LAYOUTS` per role, which reproduce today's six homes exactly, so nothing
  looks different until someone customises. This is the same idea as `web/src/panels/index.js`. The new features' cards
  join the registry: weather, permits, roster coverage, skills gaps, documents to review, audit gaps and roll call.
- **Editing:** a "Customise" button on Home switches to edit mode.
  - Each card shows a drag handle, Move up / Move down buttons, a size toggle (1 or 2 columns) and Hide.
  - An "Add a card" sheet lists the cards the role may have (filtered by `cap`, so a supervisor can't add the GM's site
    comparison).
  - "Done" saves; "Reset to my role's default" restores it.
  - The layout lives in the store (`layouts[persona]`).
- **Admin defaults:** Roles and permissions gains "Default Home for this role", which edits `DEFAULT_LAYOUTS` for the chosen
  role. It's audited, and people who customised keep theirs.
- **Build:** framer-motion's `Reorder` (already installed) for the drag; it animates with `transform`, so the motion rules
  hold. The Move up and Move down buttons are the keyboard and screen-reader path, and each move is announced ("Security
  moved to position 2 of 6").
- **Motion:** during a reorder the other cards slide over 0.22s (the house `panel` duration). Entering edit mode adds no
  wobble: only the handles fade in. Review with `emil-design-eng` and `review-animations`.
- **Test:** `layoutFor(persona, saved, grants)` drops cards the role lost permission for and keeps the user's order for
  the rest.

### 11. TV mode for the shop floor (`/tv`) · M

- **What:** a full-screen information screen for the floor. Large type, rotating screens, no navigation, and nothing
  personal on show.
- **Route:** `/tv?site=ips`, outside the Shell: no header, banner or feedback box. Add it to `DemoApp`'s routes before
  `/:page`. On Sites, "Open TV mode" (cap `tv`) opens a setup card. It picks the site and the screens, then opens the TV
  view in a new window. A fullscreen button uses `requestFullscreen`.
- **Screens:**
  - days since the last recordable incident;
  - today's output against target (the `Bars` chart, big);
  - this shift's coverage;
  - machine states from the site map (feature 4);
  - weather and roads (feature 9);
  - permits active now, as counts by area;
  - announcements (typed by the Site Manager).
- **Privacy rule:** no names, cards or security detail, because anyone walking past can read it. A roll call (feature 5)
  takes over every TV at that site with "Evacuate to assembly area B", which is the one screen that interrupts.
- **Rotation:** 15s per screen, with a small progress bar (`scaleX`) and Pause.
  - Screens crossfade (opacity, 0.4s) with no sliding, because it's read from a distance.
  - With reduced motion, screens change with no fade and the progress bar is hidden.
  - Dark theme by default, since the screens hang on a wall.
- **Accessibility:** each screen is a heading plus text, with live updates turned off (a wall screen shouldn't chatter to
  a screen reader). The setup card is an ordinary form.
- **Design check:** `impeccable` (shape) for the TV look, because it's the one surface read from 5 m away. The type scale
  needs its own step there (KPI values around 96px).

## Order of work

1. **Data foundation (S):** the new generators with their own seeds, the stability test, plus the new `CAPS`, grants,
   `assumptions.js` entries and store keys. Everything else builds on this.
2. **Skills log (S),** then **roster planning (L),** which needs the skills.
3. **Permits (M),** which need the skills.
4. **Site map (L),** then **emergency roll call (M),** which needs the map, the roster and permits.
5. **Weather and roads (M),** which adds problems to the roster.
6. **Audit evidence (M)** and **My data (S),** which collect what features 1 to 5 produce.
7. **Documents and tax (M).** It doesn't depend on the others, so it can go at any point.
8. **Customisable Home (L),** once all the new cards exist.
9. **TV mode (M),** which reuses the cards and the map.
10. **Review pass (M):**
    - `impeccable` critique of the whole demo, scored against the 23/40 baseline in `.impeccable/critique/`;
    - `emil-design-eng` and `review-animations` on the drag, ticks, scrubber and rotation;
    - `break-ui` on the roster grid and roll call (long names, 0 and 600 people);
    - a phone check at 390 px with no sideways scroll;
    - a keyboard and screen-reader walk of every new page.

Features 7 and 8 don't touch the files of 1 to 6, so they could run in parallel sessions. Everything else shares
`data.js`, `store.js` and `DemoApp.jsx`, so it goes one at a time.

**Total:** about four to five weeks of evenings.

## Docs, after each feature

- `demo/README.md`: the page list, the new guess count (31 now; about 40 after this), and what to try.
- `DESIGN.md`, "Demo surface": the new patterns (site map symbols, roster cells, TV type scale, emergency banner).
- `docs/roadmap.md`, using the homes the vault note suggests:
  - roll call, permits and the site map in phase F (F.3, F.5, F.6);
  - the roster in D.3 and E;
  - the skills matrix in E;
  - audit evidence in J.2;
  - My data under B.3;
  - documents and tax in J.3;
  - weather in E.3;
  - Home layouts in C.1;
  - TV mode in C.
- About's "Try this" and "For IT" sections.
- Vault: `Projects/Mycelium.md` gets a dated section per batch, crediting Claude and noting that human review is required.
- Redeploy the hosted demo with `bash infra/homelab/demo-deploy.sh` after each batch.

## Open questions for Tristan or the design partner

1. **Finance persona:** add a seventh "Viewing as" (the Operations Finance Controller already exists in the data), or show
   Documents through the GM only? Recommended: GM only, to keep the six views simple.
2. **Commute risk:** is home postcode, with opt-in, acceptable to the design partner's HR? If not, weather stays site-level
   only.
3. **Permit enforcement:** should the demo show Mycelium changing door access groups (an allow-listed action), or only
   alerting? Recommended: show both, with "alert only" as the default and the action behind approval. This is roadmap
   decision 3.
4. **Real or drill:** should the demo let reviewers start a "real" roll call at all? Recommended: drills only, with "Real"
   shown but disabled and explained.

## How the open questions were settled for the demo (2026-11-05)

Tristan asked for everything to be built without stopping, so the demo uses the recommended answers. Each is still open
for the design partner:
1. No Finance persona: Documents and tax shows to the GM (the `finance` permission can be given to any role on Roles).
2. Commute risk uses home postcodes, only for people who opted in (about 70% in the fictional data), and each employee can
   turn it off. The question is in Your systems (`s_commute`).
3. Permits alert only. Adding holders' cards to an area's access group is described as an approved action, not shown working.
4. Roll call runs drills only; "Real" is shown, disabled and explained.

## How it was built

Claude Code built the shared foundation (machines and skills on their own seed, permissions with a migration for saved
grants, guesses, store keys, page stubs), then ran the features as parallel agents in three waves, each owning its own
files: (1) skills and rosters, permits, site map, weather, documents; (2) roll call, audit evidence, My data; (3) TV mode,
customisable Home. The lead integrated them (live roster coverage on Sites and Home, weather in the roster's problems, the
site map on Security with "Show on map" from every alert), then three review agents ran impeccable, emil-design-eng,
break-ui and accessibility passes over separate groups of pages. Human review is required.
