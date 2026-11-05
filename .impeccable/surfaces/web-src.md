---
version: 2
slug: "web-src"
primary_target: "web/src"
related_targets: []
---

Scope: the whole Monitor web app: Overview, Live map, Status, Costs, Usage, API details, Transactions, Event log, Access, Settings.
Audience and job: one owner (later small teams) checking a few times a day whether apps are up, what they cost and what is touching their data; acting on access when something is wrong.
Look: the shared Mycelium look in `DESIGN.md` and `docs/design/`. Reference implementation: Mycelium Ops prototype 1.

## Direction contract

THESIS: A calm, card-based dashboard where the live map is the one thing no other dashboard has. Big quiet cards, one accent, data you read in a glance. Not a dense grey ops console.
FIRST VIEWPORT: Header (logo, app picker, tab row, status pill, search, theme, Access and Settings). A greeting with the app's state. Four KPI tiles (requests, errors, p95, cost today) with change pills. A requests chart, an uptime gauge, a live map card, recent activity, a weekly heatmap, and one insight sentence when there is something to say.
SIGNATURE: the live map card on the Overview, pulsing with real reads and writes, opening the full map.
FINISH: check every width in `docs/design/rules.md`, both themes, keyboard only and reduced motion.
