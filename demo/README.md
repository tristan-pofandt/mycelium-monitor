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
- **Guesses:** 31 guesses about the real company's systems and structure (`web/src/demo/assumptions.js`), shown as dashed
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
- **Safety cues:** destructive security actions are hold-to-confirm, decisions and actions toast with Undo, and Roles and
  permissions shows an audit trail of every change made in the demo.
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
