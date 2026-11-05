# Claude Code hook

Each time Claude Code reads or changes a file in a registered repo, this hook sends Mycelium one event: the tool name, the path inside the repo, and how long it took. Nothing else leaves your computer: no file contents, tool input or output, prompts or session ids, and nothing about files outside a registered repo.

Written with Claude Code; a person needs to review it.

## Set up

1. Get the app's ingest key from `python manage.py add-app` (in `server/`). For now the hook and the app's emitter share one key.
2. Make `~/.mycelium/hook.json` (or point `MYCELIUM_HOOK_CONFIG` at another path). Keep it outside every repo:
   ```json
   {"url": "http://127.0.0.1:8100", "apps": [{"root": "C:/dev/reroute", "key": "<ingest key>"}]}
   ```
3. Merge `settings.snippet.json` into `~/.claude/settings.json` and fix the script path if your copy is somewhere else.

The hook runs in the background (`async`), stops after 5s and always exits 0, so a missing config or a stopped Mycelium never bothers Claude.

## What Claude Code sends the hook

`PostToolUse` gives JSON on stdin with `tool_name`, `tool_input`, `tool_response`, `duration_ms` and more. The path is `tool_input.file_path` (Read, Write, Edit), `notebook_path` (NotebookEdit) or `path` (Glob, Grep; defaults to `cwd`). The hook keeps only the tool name, the repo-relative path and `duration_ms`.

## Claude Code cost and tokens

To also send Claude Code's own model calls and cost while you work on an app, add this to that repo's `.claude/settings.local.json` (git-ignored, because it holds the key). It only applies to sessions in that repo, so cost goes to the right app:

```json
{"env": {
  "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
  "OTEL_LOGS_EXPORTER": "otlp", "OTEL_METRICS_EXPORTER": "otlp",
  "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
  "OTEL_EXPORTER_OTLP_ENDPOINT": "http://127.0.0.1:8100",
  "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer <ingest key>"
}}
```

- `http/json` must be set; there is no default. Logs arrive every 5s and metrics every 60s at `/v1/logs` and `/v1/metrics`. Numbers arrive as strings (`intValue`).
- Useful events: `claude_code.api_request` (model, cost, time, tokens) and `claude_code.api_error`.
- Claude Code always adds `user.email`, `user.id` and `organization.id`. Mycelium keeps only a list of allowed fields, so those are dropped.
- Leave `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_ASSISTANT_RESPONSES`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT` and `OTEL_LOG_RAW_API_BODIES` unset.

Checked on 2026-10-31 with Claude Code 2.1.314.

## Test

`python -m unittest -q` in this folder.
