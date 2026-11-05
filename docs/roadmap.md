# Mycelium Monitor roadmap

v1 is done and running on the homelab (see `architecture.md`). This is what comes next for Monitor only. The enterprise plan moved to Mycelium Ops (`mycelium-ops/docs/roadmap.md`). Shop and dropshipping ideas belong to Mycelium Commerce. All three share one look (`docs/design/`).

Written with Claude Code from Tristan's notes of 31 Oct and 4 Nov 2026; a person needs to review it.

## What Monitor is for

One place to see every app, game or service you run: is it up, what does it cost, who uses it, what is touching its data right now. First user: Tristan. Later: other developers and small teams running their own copy.

## Limits (these do not change)

- **No remote control by free text.** The website never sends free-text commands to a machine.
  - Read-only first: agents collect only, connect outward, and open no port.
  - Later, only a short list of named actions with fixed settings (restart a named service, block an address).
  - Every action is approved in the site, signed by the server, checked by the agent and logged at both ends. The agent has a local off switch.
  - Admin rights only to install. The running service uses the fewest rights it needs.
- **AI suggests, people approve.** Scans and agents make drafts, diffs or pull requests. Nothing changes without a person saying yes.
- **Metadata only.** Events never carry contents, bodies, keys or personal data.
- **Code stays private.** A scan runs on your computer and sends the AI only summaries. Full files are opt-in. Your own API key pays, with a spend cap.
- **Self-hosted first.** People run their own copy. A hosted service only once Monitor meets the security bar a customer would ask for.

## Open decisions

1. Licence for the public repo (MIT or AGPL). Needed before anyone else runs it.
2. Whether agents ever run actions, or stay read-only. The plan assumes a short allow-list later.

## Next steps

| Step | What | Done when | Size |
|---|---|---|---|
| 1 | Screen-reader pass (NVDA) over the panels | Problems fixed or listed | S |
| 2 | Map: replay the last hour, filter by source | A past burst of writes can be replayed, with a table version | M |
| 3 | Settings: budgets and alert rules; add apps and rotate keys from the browser | An over-budget day sends an alert | M |
| 4 | Alerts to phone (email, push or ntfy) with quiet hours; phone bottom tab bar | A test alert reaches the phone | M |
| 5 | Push the code scan to production (needs the root-only ingest key on the homelab) | Reroute's live map shows the full code graph | S |
| 6 | Node emitter and generic OpenTelemetry | A Node app shows up without custom code | M |
| 7 | Game connectors (Unity, Godot) with a Players panel | A test game's sessions appear | M |
| 8 | `mycelium scan` with an AI step that opens a pull request with the emitter wired in | A new repo is connected by merging one pull request | L |
| 9 | Security centre: a ledger of checks (code, website, sign-ins, keys), each showing what, why, when, result and evidence; per-check settings | A leaked key in a repo shows up as a failed check | L |
| 10 | Policy pack: a file a project adds to plug into Monitor's checks and agent rules | A repo with the pack shows its rules in Monitor | M |
| 11 | More than one user: organisations, roles (owner, admin, viewer), OAuth sign-in, keys per organisation | Two organisations on one server can't see each other's data | L |
| 12 | Packaging: container image, one-line installer, signed releases | A fresh machine runs Monitor in under ten minutes | M |
| 13 | Mycelium's own security: `SECURITY.md`, disclosure policy, a pen test | A security questionnaire can be answered with evidence | M |

## How this fits Tristan's goals

The security parts double as cybersecurity portfolio work, and the homelab is the first place to run them. See the vault note `Career/Career and Cybersecurity.md`.
