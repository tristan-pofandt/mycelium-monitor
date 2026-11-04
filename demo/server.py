"""Mycelium demo server: serves the fictional demo (demo/dist) and appends feedback to demo/feedback/FEEDBACK.md.

Separate from Mycelium's own server on purpose: the demo holds no real data, needs no sign-in to look at, and must never sit
behind Mycelium's owner session. Everything people type goes to the git-ignored demo/feedback/ folder, never to the repo.

Run:  python demo/server.py            (http://127.0.0.1:8200)
Env:  DEMO_HOST, DEMO_PORT, DEMO_CODE (optional access code needed to send feedback), DEMO_FEEDBACK_DIR
"""
import json
import mimetypes
import os
import re
import threading
import time
from datetime import datetime
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_from_directory

HERE = Path(__file__).resolve().parent
mimetypes.add_type("application/manifest+json", ".webmanifest")  # not in every platform's table
LIMITS = {"text": 4000, "short": 200}
RATE = (60, 600)  # at most 60 posts per visitor per 10 minutes
MAX_FILE = 5_000_000  # stop accepting once FEEDBACK.md reaches 5 MB, so a public demo can never fill the disk


def clean(value, limit):
    """One field from a visitor: a string, control characters removed (newlines kept), trimmed to the limit."""
    s = re.sub(r"[\x00-\x09\x0b-\x1f\x7f]", "", str(value or "")).strip()
    return s[:limit]


def quote(text):
    """Feedback as a Markdown quote; < and > escaped so nothing typed renders as HTML when the file is previewed."""
    safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return "\n".join(f"> {line}" if line else ">" for line in safe.splitlines() or [""])


def line(text):
    return clean(text, LIMITS["short"]).replace("\n", " ").replace("<", "&lt;").replace(">", "&gt;")


HEADER = """# Mycelium demo feedback

Raw feedback from the demo prototype, oldest first. Each entry says where in the demo it was written and which demo role
the person was viewing as. Answers about real systems are under "Your systems" entries, with what the demo assumed.

This file is git-ignored: it may name real systems and people, so it never goes to the public repo.
"""


def create_app(folder=None, code=None):
    folder = Path(folder or os.environ.get("DEMO_FEEDBACK_DIR") or HERE / "feedback")
    code = code if code is not None else os.environ.get("DEMO_CODE", "")
    dist = HERE / "dist"
    md, answers_file = folder / "FEEDBACK.md", folder / "systems.json"
    lock = threading.Lock()
    hits = {}
    app = Flask(__name__, static_folder=None)

    def load_answers():
        try:
            return json.loads(answers_file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}

    def append(entry):
        folder.mkdir(parents=True, exist_ok=True)
        with lock:
            new = not md.exists()
            with md.open("a", encoding="utf-8", newline="\n") as f:
                if new:
                    f.write(HEADER)
                f.write(entry)

    def guard():
        if code and request.headers.get("X-Demo-Code", "") != code:
            abort(401)
        ip = request.remote_addr or "?"
        if ip in ("127.0.0.1", "::1"):  # behind Tailscale Funnel on the same host: the visitor is in X-Forwarded-For, if set
            ip = request.headers.get("X-Forwarded-For", ip).split(",")[0].strip()
        now = time.time()
        recent = [t for t in hits.get(ip, []) if now - t < RATE[1]]
        if len(recent) >= RATE[0]:
            abort(429)
        hits[ip] = recent + [now]
        if md.exists() and md.stat().st_size > MAX_FILE:
            abort(507)
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            abort(400)
        return body

    def who(body):
        name, team, role = (line(body.get(k)) for k in ("name", "team", "role"))
        person = " · ".join(x for x in (name, team) if x) or "Anonymous"
        return f"**From:** {person}" + (f" (viewing as {role})" if role else "")

    @app.get("/api/config")
    def config():
        return {"code_required": bool(code)}

    @app.post("/api/check")
    def check():
        guard()
        return {"ok": True}

    @app.post("/api/feedback")
    def feedback():
        body = guard()
        text = clean(body.get("text"), LIMITS["text"])
        if not text:
            abort(400)
        where, kind, page = line(body.get("where")) or "Unknown place", line(body.get("kind")) or "Comment", line(body.get("page"))
        stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        append(f"\n---\n\n### {stamp} · {where} · {kind}\n\n{who(body)}  \n**Page:** `{page or '/'}`\n\n{quote(text)}\n")
        return {"ok": True}, 201

    @app.get("/api/systems")
    def systems():
        return jsonify(load_answers())

    @app.post("/api/systems")
    def answer():
        body = guard()
        key = re.sub(r"[^a-z0-9_]", "", str(body.get("id", "")))[:60]
        value = clean(body.get("answer"), LIMITS["short"] * 2)
        if not key or not value:
            abort(400)
        note = clean(body.get("note"), LIMITS["text"])
        person = " · ".join(x for x in (line(body.get("name")), line(body.get("team"))) if x) or "Anonymous"
        with lock:
            answers = load_answers()
            answers[key] = {"answer": value, "by": person, "at": datetime.now().strftime("%Y-%m-%d %H:%M")}
            folder.mkdir(parents=True, exist_ok=True)
            answers_file.write_text(json.dumps(answers, indent=2), encoding="utf-8")
        stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        entry = (f"\n---\n\n### {stamp} · Your systems · {line(body.get('area')) or key}\n\n{who(body)}  \n"
                 f"**Question:** {line(body.get('question'))}  \n**Demo assumed:** {line(body.get('assumed'))}  \n"
                 f"**Answer:** {line(value)}\n")
        append(entry + (f"\n{quote(note)}\n" if note else ""))
        return {"ok": True, "answers": answers}, 201

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def files(path):
        if path.startswith("api/"):
            abort(404)
        if path and (dist / path).is_file():
            return send_from_directory(dist, path)
        if not (dist / "index.html").is_file():
            return "Build the demo first: cd web && npm run build:demo", 503
        return send_from_directory(dist, "index.html")  # client routes

    @app.after_request
    def headers(resp):
        resp.headers.setdefault("X-Content-Type-Options", "nosniff")
        resp.headers.setdefault("Referrer-Policy", "no-referrer")
        resp.headers.setdefault("X-Frame-Options", "DENY")
        resp.headers.setdefault("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
                                "font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
        return resp

    return app


if __name__ == "__main__":
    create_app().run(host=os.environ.get("DEMO_HOST", "127.0.0.1"), port=int(os.environ.get("DEMO_PORT", "8200")))
