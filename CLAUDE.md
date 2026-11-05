# Mycelium Monitor: notes for Claude Code

Mycelium Monitor watches several apps in one place: up or down, costs, usage, API calls, admin access, and a live map of files and data stores with a dot for each read or write. It is one of three Mycelium products (Ops, Monitor, Commerce). They are separate repos with one shared look.

Read first: `docs/architecture.md` (how it works). Then `docs/roadmap.md` (what's next and the limits). For anything you see on screen: `DESIGN.md`, then `docs/design/`.

## Where things are

- `server/`: Flask (`app.py`, `create_app()`). Collectors in `server/collectors/`, API in `server/api/`, tests `server/test_*.py`.
- `web/`: React + Vite. Panels are listed in `web/src/panels/index.js`.
- **Design kit** (identical in every Mycelium repo; the reference copy is in `mycelium-ops`): `web/src/tokens.css`, `app.css`, `choreography.js`, `reduced.js`, `motion/*`, `Page.jsx`, `shell.jsx`, `ui.jsx`, `charts.jsx`, `tasks.jsx`, `icons.jsx`, `theme.js`, and `docs/design/`. If you change one, copy the change to the other repos. `choreography.js`, `reduced.js`, `motion/fm.js` and the base tokens also come from Reroute (`C:\dev\reroute`, `apps/plan-b-mvp/web/src/`); keep them in step.
- `emitters/python/`: the emitter and code scan apps use. `hooks/claude/`: the Claude Code hook. `infra/`: Dockerfile and homelab deploy.

## Commands

- Server tests: `cd server && python -m unittest -q`
- Run the server: `cd server && python app.py` (http://127.0.0.1:8100)
- Web: `cd web && npm ci && npm run build && npm test`. Dev server: `npm run dev` (sends `/api` and `/healthz` to 8100)
- Emitter and hook tests: `python -m unittest -q` in `emitters/python` and `hooks/claude`
- Docker: `docker build -f infra/Dockerfile -t mycelium .`

## Rules

- Events carry metadata only. Never file contents, request bodies, tokens, keys or personal data.
- App admin tokens live only in the server's environment. Never send them to the browser or store them in SQLite.
- The site is private (Tailscale only). The repo is public: never commit secrets, `.env` files or databases.
- Add a feature as one collector plus one panel. Don't hard-code app names outside configuration.
- Every visual (including the map) has a keyboard and screen-reader version.
- Follow `docs/design/` exactly. No new colours, motion numbers or UI libraries.
- After meaningful work, update `docs/` and the vault note `Projects/Mycelium Monitor.md` (see `CLAUDE.local.md`). Credit Claude and say a person needs to review it.
- Commit messages end with the Co-Authored-By line from the session. Stop any dev server you start.
