import json
import tempfile
import unittest
from pathlib import Path

from server import create_app


class DemoFeedbackTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.folder = Path(self.dir.name)
        self.client = create_app(self.folder, code="").test_client()

    def tearDown(self):
        self.dir.cleanup()

    def test_feedback_appends_quoted_markdown(self):
        r = self.client.post("/api/feedback", json={"text": "Line one\n<script>x</script>", "where": "Sites", "kind": "Problem",
                                                    "page": "/sites", "name": "Pat", "team": "IT", "role": "GM Operations"})
        self.assertEqual(r.status_code, 201)
        self.client.post("/api/feedback", json={"text": "Second", "where": "Home"})
        md = (self.folder / "FEEDBACK.md").read_text(encoding="utf-8")
        self.assertEqual(md.count("# Mycelium demo feedback"), 1)
        self.assertIn("· Sites · Problem", md)
        self.assertIn("**From:** Pat · IT (viewing as GM Operations)", md)
        self.assertIn("> &lt;script&gt;x&lt;/script&gt;", md)
        self.assertNotIn("<script>", md)
        self.assertIn("**From:** Anonymous", md)

    def test_empty_or_bad_body_is_refused(self):
        self.assertEqual(self.client.post("/api/feedback", json={"text": "  "}).status_code, 400)
        self.assertEqual(self.client.post("/api/feedback", data="nope").status_code, 400)

    def test_system_answers_are_kept_and_logged(self):
        r = self.client.post("/api/systems", json={"id": "access_control", "answer": "Salto Space", "assumed": "Gallagher",
                                                  "question": "Door access?", "area": "Physical security", "name": "Pat"})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(self.client.get("/api/systems").get_json()["access_control"]["answer"], "Salto Space")
        self.assertEqual(json.loads((self.folder / "systems.json").read_text())["access_control"]["by"], "Pat")
        self.assertIn("**Answer:** Salto Space", (self.folder / "FEEDBACK.md").read_text(encoding="utf-8"))

    def test_access_code_when_set(self):
        client = create_app(self.folder, code="ironbark").test_client()
        self.assertTrue(client.get("/api/config").get_json()["code_required"])
        self.assertEqual(client.post("/api/feedback", json={"text": "hi"}).status_code, 401)
        self.assertEqual(client.post("/api/feedback", json={"text": "hi"}, headers={"X-Demo-Code": "ironbark"}).status_code, 201)


if __name__ == "__main__":
    unittest.main()
