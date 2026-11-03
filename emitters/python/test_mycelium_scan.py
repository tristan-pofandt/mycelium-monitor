import os
import tempfile
import unittest
from pathlib import Path

import mycelium_scan as ms

FILES = {
    "app/server.py": 'import os\nfrom flask import Flask, Blueprint\nimport rides\nfrom . import util\napp = Flask(__name__)\nbp = Blueprint("a", __name__, url_prefix="/admin")\n'
                     'KEY = os.environ.get("APP_SECRET")\n@app.get("/api/rides/<rid>")\ndef one(rid): pass\n@bp.post("/settings")\ndef s(): pass\n',
    "app/rides.py": 'from x import emit\nURL = "https://api.example.org/v1"\nemit("write", "file:app/rides.py", "store:data/rides.sqlite3")\n',
    "app/util.py": "",
    "app/test_rides.py": "import rides\n",
    "app/app.js": 'import { a } from "./lib/a.js";\nfetch(`/api/rides/${id}`);\n',
    "app/lib/a.js": "export const a = 1;\n",
    "app/index.html": '<script src="app.js"></script>',
    "node_modules/x/index.js": "import './y'",
}


class ScanTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        for rel, text in FILES.items():
            p = Path(self.tmp.name, rel)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(text, "utf-8")
        g = ms.scan(self.tmp.name)
        self.nodes = {n["id"] for n in g["nodes"]}
        self.edges = {(e["src"], e["dst"], e["kind"]) for e in g["edges"]}

    def tearDown(self):
        self.tmp.cleanup()

    def test_relations(self):
        want = [("file:app/server.py", "file:app/rides.py", "import"), ("file:app/server.py", "file:app/util.py", "import"),
                ("file:app/test_rides.py", "file:app/rides.py", "tests"), ("endpoint:/api/rides/<rid>", "file:app/server.py", "route"),
                ("endpoint:/admin/settings", "file:app/server.py", "route"), ("file:app/app.js", "endpoint:/api/rides/<rid>", "calls"),
                ("file:app/app.js", "file:app/lib/a.js", "import"), ("file:app/index.html", "file:app/app.js", "import"),
                ("file:app/server.py", "config:APP_SECRET", "config"), ("file:app/rides.py", "external:api.example.org", "calls"),
                ("file:app/rides.py", "store:data/rides.sqlite3", "uses"), ("folder:app", "file:app/rides.py", "contains")]
        for e in want:
            self.assertIn(e, self.edges)

    def test_skips_dependencies_and_leaves_nothing_alone(self):
        self.assertFalse(any("node_modules" in n for n in self.nodes))
        linked = {x for e in self.edges for x in e[:2]}
        self.assertEqual(self.nodes - linked, set())


if __name__ == "__main__":
    unittest.main()
