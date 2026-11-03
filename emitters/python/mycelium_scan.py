"""Static map of a project for Mycelium: every file, folder, HTTP route, data store, external host and config variable, linked by
what really relates them (imports, tests, route handlers, front-end calls to routes, reads of config). Standard library only.

    python mycelium_scan.py <repo-root> [--url https://mycelium --key INGEST_KEY]     # without --url it prints a summary

Only names and relations leave the machine: no file contents, no values of environment variables. Node ids match what the
emitter and the Claude Code hook already send at runtime (`file:<repo-relative path>`, `endpoint:<flask rule>`, `store:data/<name>`,
`external:<host>`), so live events pulse along the links drawn here.
"""
import ast
import json
import os
import re
import sys
import urllib.request
from pathlib import PurePosixPath

SKIP_DIRS = {".git", "node_modules", "dist", "build", "__pycache__", ".venv", "venv", "vendor", "data", ".impeccable", ".claude",
             "graphify-out", "coverage", ".pytest_cache", "icons", "store-listing"}
CODE = {".py", ".js", ".jsx", ".mjs", ".ts", ".tsx", ".html", ".css"}
MAX_BYTES = 400_000
JS_EXT = ("", ".js", ".jsx", ".mjs", ".ts", ".tsx", ".css", "/index.js", "/index.jsx", "/index.ts", "/index.tsx")
VERBS = {"route", "get", "post", "put", "delete", "patch"}
STORE = re.compile(r"^(?:[\w.-]+/)*[\w.*-]+\.(?:sqlite3?|db)$|^data/(?:[\w.*-]+/)*[\w.*-]+\.(?:json|zip)$")
HOST = re.compile(r"^https?://([A-Za-z0-9.-]+\.[A-Za-z]{2,})")
ENVNAME = re.compile(r"^[A-Z][A-Z0-9_]{2,}$")
JS_IMPORT = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["'](\.{1,2}/[^"']+|\.{1,2})["']""")
JS_API = re.compile(r"""["'`](/(?:api|admin|healthz|readyz)[^"'`\s?#]*)""")
HTML_REF = re.compile(r"""(?:src|href)\s*=\s*["']([^"'#?:]+)["']""")
CSS_IMPORT = re.compile(r"""@import\s+(?:url\()?["']([^"')]+)""")


def _walk(root):
    for base, dirs, names in os.walk(root):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS and not d.startswith("."))
        for n in sorted(names):
            p = os.path.join(base, n)
            if os.path.splitext(n)[1] in CODE and os.path.getsize(p) <= MAX_BYTES:
                yield PurePosixPath(os.path.relpath(p, root).replace("\\", "/"))


def _rule_regex(rule):
    return re.compile("^" + re.sub(r"<[^>]+>", "[^/]+", re.escape(rule).replace("\\<", "<").replace("\\>", ">")) + "/?$")


class Scan:
    def __init__(self, root):
        self.root = root
        self.files = list(_walk(root))
        self.known = {str(f) for f in self.files}
        self.nodes, self.edges = {}, {}
        self.pending_calls = []  # (file, path string) from front-end code; matched to routes once all routes are known

    def node(self, nid):
        self.nodes.setdefault(nid, nid.split(":", 1)[0])
        return nid

    def edge(self, a, b, kind):
        if a != b:
            self.edges[(self.node(a), self.node(b), kind)] = True

    def file(self, p):
        return "file:" + str(p)

    def resolve(self, base, rel, exts):
        target = str(PurePosixPath(os.path.normpath(str(base / rel)).replace("\\", "/")))
        for e in exts:
            if target + e in self.known:
                return PurePosixPath(target + e)
        return None

    # ── Python ──────────────────────────────────────────────────────────────
    def python(self, p, text):
        me, test = self.file(p), p.name.startswith("test_") or p.name.endswith("_test.py")
        try:
            tree = ast.parse(text)
        except (SyntaxError, ValueError):
            return
        prefixes = {}
        for n in ast.walk(tree):
            if isinstance(n, ast.Assign) and isinstance(n.value, ast.Call) and getattr(n.value.func, "id", getattr(n.value.func, "attr", "")) == "Blueprint":
                pre = next((k.value.value for k in n.value.keywords if k.arg == "url_prefix" and isinstance(k.value, ast.Constant)), "")
                for t in n.targets:
                    if isinstance(t, ast.Name):
                        prefixes[t.id] = pre or ""
        for n in ast.walk(tree):
            if isinstance(n, (ast.Import, ast.ImportFrom)):
                self.py_import(p, me, n, "tests" if test else "import")
            elif isinstance(n, ast.Call):
                self.py_call(p, me, n, prefixes, test)
            elif isinstance(n, ast.Subscript) and ast.unparse(n.value) == "os.environ" and isinstance(n.slice, ast.Constant):
                self.env(me, n.slice.value)
            elif isinstance(n, ast.Constant) and isinstance(n.value, str) and not test:
                self.py_string(me, n.value)

    def py_import(self, p, me, n, kind):
        base = p.parent
        names = [a.name for a in n.names] if isinstance(n, ast.Import) else [n.module or ""] + [(n.module + "." if n.module else "") + a.name for a in n.names]
        if isinstance(n, ast.ImportFrom) and n.level:
            for _ in range(n.level - 1):
                base = base.parent
        for name in names:
            if not name:
                continue
            rel = name.replace(".", "/")
            for b in (base, PurePosixPath(".")):
                hit = self.resolve(b, rel, (".py", "/__init__.py"))
                if hit and hit != p:
                    self.edge(me, self.file(hit), kind)
                    break

    def py_call(self, p, me, n, prefixes, test):
        f = n.func
        name = f.attr if isinstance(f, ast.Attribute) else getattr(f, "id", "")
        if name in VERBS | {"add_url_rule"} and n.args and isinstance(n.args[0], ast.Constant) and isinstance(n.args[0].value, str) and not test:
            owner = ast.unparse(f.value) if isinstance(f, ast.Attribute) else ""
            rule = prefixes.get(owner, "") + n.args[0].value
            if rule.startswith("/"):
                self.route(rule, me)
        if name in ("get", "getenv", "pop") and n.args and isinstance(n.args[0], ast.Constant):
            if name == "getenv" or (isinstance(f, ast.Attribute) and ast.unparse(f.value) == "os.environ"):
                self.env(me, n.args[0].value)

    def route(self, rule, me):
        self.edge("endpoint:" + rule, me, "route")
        self.edge("actor:app", "endpoint:" + rule, "serves")

    def env(self, me, name):
        if isinstance(name, str) and ENVNAME.match(name):
            self.edge(me, "config:" + name, "config")

    def py_string(self, me, s):
        if len(s) > 200:
            return
        m = HOST.match(s)
        if s.startswith(("store:", "external:")) and not s.endswith(":"):  # the ids the app itself declares for its events
            self.edge(me, s, "uses" if s.startswith("store:") else "calls")
        elif m and not m.group(1).endswith((".example", ".test", ".invalid", ".local")):
            self.edge(me, "external:" + m.group(1), "calls")
        elif STORE.match(s):
            self.edge(me, "store:" + (s if s.startswith("data/") else "data/" + s.split("/")[-1]), "uses")

    # ── Front end ───────────────────────────────────────────────────────────
    def script(self, p, text):
        me = self.file(p)
        for m in JS_IMPORT.finditer(text):
            hit = self.resolve(p.parent, m.group(1), JS_EXT)
            if hit:
                self.edge(me, self.file(hit), "import")
        for m in JS_API.finditer(text):
            self.pending_calls.append((me, re.sub(r"\$\{[^}]*\}", "x", m.group(1))))
        for host in set(re.findall(r"""["'`]https?://([A-Za-z0-9.-]+\.[A-Za-z]{2,})""", text)):
            if not host.endswith((".example", ".test", ".invalid", ".local")):
                self.edge(me, "external:" + host, "calls")

    def markup(self, p, text):
        me = self.file(p)
        pattern = CSS_IMPORT if p.suffix == ".css" else HTML_REF
        for m in pattern.finditer(text):
            ref = m.group(1)
            hit = self.resolve(p.parent, ref.lstrip("/"), ("",)) or self.resolve(PurePosixPath("."), ref.lstrip("/"), ("",)) or self.resolve(p.parent, ref, ("",))
            if hit and hit != p:
                self.edge(me, self.file(hit), "import")

    def link_calls(self):
        rules = [(n[len("endpoint:"):], _rule_regex(n[len("endpoint:"):])) for n in self.nodes if n.startswith("endpoint:")]
        for me, path in self.pending_calls:
            for rule, rx in rules:
                if rx.match(path) or rx.match(path.rstrip("/")):
                    self.edge(me, "endpoint:" + rule, "calls")

    def folders(self):
        for p in self.files:
            child = self.file(p)
            for parent in p.parents:
                pid = "folder:" + str(parent)
                self.edge(pid, child, "contains")
                child = pid
        self.edge("actor:app", "folder:.", "runs")

    def run(self):
        for p in self.files:
            try:
                text = (self.root / p).read_text("utf-8", "ignore")
            except OSError:
                continue
            self.node(self.file(p))
            {".py": self.python, ".html": self.markup, ".css": self.markup}.get(p.suffix, self.script)(p, text)
        self.link_calls()
        self.folders()
        return {"nodes": [{"id": i, "kind": k} for i, k in self.nodes.items()],
                "edges": [{"src": a, "dst": b, "kind": k} for (a, b, k) in self.edges]}


def scan(root):
    from pathlib import Path
    return Scan(Path(root)).run()


def push(graph, url, key):
    req = urllib.request.Request(url.rstrip("/") + "/ingest/graph", json.dumps(graph).encode(), {"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:  # nosec: the URL is the operator's own Mycelium
        return json.load(r)


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    opt = dict(zip(argv, argv[1:]))
    if not args:
        print(__doc__)
        return 2
    g = scan(args[0])
    kinds = {}
    for n in g["nodes"]:
        kinds[n["kind"]] = kinds.get(n["kind"], 0) + 1
    print(f"{len(g['nodes'])} nodes {kinds}, {len(g['edges'])} links")
    if opt.get("--url"):
        print(push(g, opt["--url"], opt.get("--key") or os.environ.get("MYCELIUM_KEY", "")))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
