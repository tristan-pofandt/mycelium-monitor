# Mycelium demo

A clickable prototype of the enterprise plan (`docs/roadmap.md`, phases C to H) for a design partner and their IT team to
review. It runs on a fictional company, **Brolga Industries**: 4 Queensland sites, a Brisbane office, 3 entities and about
600 generated staff. Nothing connects to a real system. Written by Claude Code; human review required.

## What's in it

- **Six role views** through "Viewing as": GM Operations, Site Manager, Shift Supervisor, Employee, Security Coordinator, IT
  Administrator. Pages and data follow the permissions on Roles and permissions, so unticking a box changes what a role sees.
- **Pages:** Home (different for each role), Sites, People (radial team map with drag-to-assign, an outline and a
  directory), Work and approvals, Calendar (lock levels, approval rules, change requests, business-only calendar import),
  Security (Physical and Cyber tabs, each shown only to roles allowed to see it), Assistant (simulated, no AI), Roles and
  permissions (with a person search to give anyone a role), Setup wizard (small and multi-site flows), Your systems, About.
- **Person search** (`PersonSearch` in `web/src/demo/bits.jsx`): type a name, job or site and pick with the arrow keys and
  Enter. Used to give someone a role, hand over approvals and assign a task, instead of long dropdowns.
- **Guesses:** 40 guesses about the real company's systems and structure (`web/src/demo/assumptions.js`), shown as dashed
  "Our guess" tags. The main pages show what each role would see day to day, with no tags in the data: each page lists the
  systems its cards draw on once, in a "Where this page's data would come from" strip above the feedback box (`SourceNote`
  registers a source; `SourcesScope` in `feedback.jsx` collects and shows them). Prose names a system with `SystemName`, which
  shows the reviewer's answer once there is one. **Your systems** is the guided place to answer them all: a "Start with the
  first one" button, progress, and saving an answer opens the next (systems first, then IT's two questions, then physical
  security and structure).
- **Feedback:** a one-line box at the bottom of every page that expands when used, a header Feedback button (for menus and
  anything else) and a link on each setup wizard step. It says who reads feedback and thanks the reviewer after sending.
- **Start here:** a first-visit strip on the GM's Home (what Mycelium is in one line and three things to try), hidden once
  dismissed. **How it works** (`/about`) has the guide and a **For IT** section (`/about#it`) on how a real deployment would run.
- **Showcase:** the calendar labels who can change each event (Locked / Ask first / Anyone can move) with a legend, and shows
  staff their own shifts; the team map is a radial tree with labels that thin out with depth.
- **Added 5 Nov** (plan: `docs/demo-features-plan.md`; built by parallel Claude Code agents, human review required):
  - **Skills** (People → Skills): who holds which machine ticket, when it runs out, and which shift will have no certified
    operator (Toowoomba's afternoon shift loses its last crane ticket in two days).
  - **Rosters** (`/rosters`): plan this week and next, checked live against 10 hours' rest, a 48-hour week, leave, headcount,
    machine tickets and weather. "Fill gaps" only suggests. A supervisor's roster goes to the Site Manager before a simulated
    hand-off to the rostering system; the GM sees coverage only. Sites and Home read coverage live from it.
  - **Permits to work** (Security and Work): hot-work, confined-space and isolation permits, issued only to people in scope
    with a current ticket. Door activity marks each read at a restricted door Valid, None or Expired, and a card entering
    Tank 2 with no permit raises an alert. Alert only; changing door access groups would need approval.
  - **Site map** (Sites → a site → Map, and on Security): doors, cameras, alarms and machines with live states, people per
    area counted from card reads, and a 24-hour replay with jumps to the seeded incidents. Every alert has "Show on map".
    Setup gains a simulated floor-plan step.
  - **Weather and roads** (every Home, Sites, Rosters): Bureau of Meteorology-style warnings and QLDTraffic-style closures.
    People who may be cut off are counted by home postcode, only with their consent: the GM sees counts, a supervisor their
    own team's names, an employee only themselves, and they can opt out. Nothing is fetched.
  - **Documents and tax** (`/documents`, GM): about 40 fictional invoices, receipts and logbooks. Over 95% sure goes straight
    through, the rest wait for review, and duplicates and changed bank details are always flagged and never paid from the
    document. The tax pack (BAS-style GST, spend by category, FBT logbook) exports as a CSV for a registered tax agent;
    nothing is lodged.
  - **Roll call** (header button, `emergency` permission): reconciles door reads, visitors, permit holders and the roster
    with nobody counted twice. Wardens tick people off on a phone, the banner turns red on every page, and ending it writes
    a report. Drills only.
  - **Audit evidence** (`/audit`, header tool): ISO 9001, ISO 45001, ISO 27001 physical controls and the Essential Eight,
    clause numbers and short titles only, with evidence computed live from the rest of the demo (Evidence found, Gap or
    Stale). "An auditor is here" builds a Markdown summary and CSV with a SHA-256 hash per item. Roles can give a guest
    auditor read-only access for a set time.
  - **What we hold about you** (`/my-data`, everyone): each part of a person's record with its source, who can see it (from
    the current grants) and how long it's kept; who opened their record; what is never collected; correction requests to
    HR; a JSON download.
  - **Customisable Home:** Customise reorders (drag by the handle or Move up and Move down), resizes, hides and adds cards.
    Only cards the role's permissions allow are offered, and they drop out if the permission is taken away. Admins (the
    `layouts` permission) set each role's default Home in Roles and permissions. The six default homes are unchanged.
  - **TV mode** (`/tv?site=ips`, opened from a site on Sites with the `tv` permission): a full-screen floor screen outside the
    app shell, rotating every 15 s through safety days, output against target, shift coverage, machine states, weather,
    permits by area and an announcement. Nothing personal. A roll call takes over every floor screen at that site.
  - Seven new permissions (roster, permits, emergency, finance, audit, tv, layouts). Browsers that saved the old grants get
    the new ones on their next visit (`store.js`, `seenCaps`).
- **Safety cues:** destructive security actions are hold-to-confirm, decisions and actions toast with Undo, and Roles and
  permissions shows an audit trail of every change made in the demo.
- **Installable:** like the main site, the demo installs as an app on a PC (Chrome or Edge: the install icon in the address
  bar) or a phone (Android: Install app; iPhone: Share, then Add to Home Screen). It has its own manifest
  (`web/src/demo/manifest.webmanifest`, "Mycelium demo") and reuses the main site's icons and app-shell service worker from
  `web/public` (only the shell is cached; feedback and answers always go to the server).
- **Phone:** the header keeps the logo, "Viewing as" and the theme; Your systems and Feedback move into the banner with their
  labels; Roles and Setup join the end of the tab row.

## Where feedback goes

`demo/server.py` appends every piece of feedback and every answer to **`demo/feedback/FEEDBACK.md`** (newest at the bottom,
with the page, the role being viewed and the person's name and team if given), and keeps the current answers in
`demo/feedback/systems.json`. The folder is git-ignored: feedback may name real systems and people, so it never goes in this
public repo. Input is trimmed, length-limited, rate-limited per address and HTML-escaped before it is written.

## Run it

```bash
cd web && npm ci && npm run build:demo
python demo/server.py
```

Then open http://127.0.0.1:8200. For development with hot reload, run the server and `npm run dev:demo` (port 5174, proxies
`/api` to 8200).

Environment: `DEMO_HOST` and `DEMO_PORT` (default 127.0.0.1:8200), `DEMO_CODE` (an access code people must enter before
their feedback is accepted; set it whenever the demo is reachable from the internet), `DEMO_FEEDBACK_DIR`.

## Hosted on the homelab

- **Where:** container `mycelium-demo` in LXC 101, host networking, gunicorn on `127.0.0.1:8200`, public through Tailscale
  Funnel on port 10000 of the homelab's tailnet address (the deploy script prints it). This is the one public part of Mycelium: fictional data only, and
  feedback needs the access code. Mycelium itself stays tailnet-only on :8443.
- **Deploy or update** from this checkout (no push needed): `bash infra/homelab/demo-deploy.sh`. It ships the source, builds
  `infra/demo.Dockerfile` on the LXC and restarts the container. The access code is generated on the server the first time
  and kept in `/opt/mycelium-demo/demo.env` (root only); it is never in the repo.
- **Read feedback:** `bash demo/pull-feedback.sh` copies it into `demo/feedback/`. It lives in the Docker volume
  `mycelium-demo-feedback`, and the server stops accepting feedback once the file reaches 5 MB.
- **Take it down:** `pct exec 101 -- tailscale funnel --https=10000 off` and `pct exec 101 -- docker rm -f mycelium-demo`.

Tests: `cd demo && python -m unittest -q` (server) and `cd web && npm test` (calendar rules and role scopes in
`src/demo/data.test.js`).
