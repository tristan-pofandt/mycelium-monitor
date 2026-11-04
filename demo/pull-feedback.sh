#!/usr/bin/env bash
# Copy the hosted demo's feedback into demo/feedback/ (git-ignored) so it can be read in the repo.
# Run from the repo root in Git Bash:  bash demo/pull-feedback.sh
set -euo pipefail
HOST=${HOST:-root@192.168.1.106}
mkdir -p demo/feedback
for f in FEEDBACK.md systems.json; do
  ssh "$HOST" "pct exec 101 -- docker exec mycelium-demo sh -c 'cat /data/$f 2>/dev/null || true'" > "demo/feedback/$f"
done
echo "Pulled: $(grep -c '^### ' demo/feedback/FEEDBACK.md || true) entries in demo/feedback/FEEDBACK.md"
