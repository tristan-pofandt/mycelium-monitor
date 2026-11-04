#!/usr/bin/env bash
# Deploy the fictional demo to the homelab from this checkout (no push needed): ships the source, builds the image in LXC 101,
# and runs it on 127.0.0.1:8200 with Tailscale Funnel on :10000. The access code is generated on the server the first time
# and kept in /opt/mycelium-demo/demo.env (root only); feedback lives in the Docker volume mycelium-demo-feedback.
# Run from the repo root in Git Bash:  bash infra/homelab/demo-deploy.sh
set -euo pipefail
HOST=${HOST:-root@192.168.1.106}
CT=${CT:-101}
tar czf /tmp/mycelium-demo.tgz --exclude=node_modules --exclude=dist web/package.json web/package-lock.json web/vite.demo.config.js web/src web/public demo/server.py infra/demo.Dockerfile
scp -q /tmp/mycelium-demo.tgz "$HOST:/tmp/mycelium-demo.tgz"
ssh "$HOST" bash -s -- "$CT" <<'REMOTE'
set -euo pipefail
CT=$1
pct push "$CT" /tmp/mycelium-demo.tgz /tmp/mycelium-demo.tgz
pct exec "$CT" -- bash -c '
  set -euo pipefail
  mkdir -p /opt/mycelium-demo/src && chmod 700 /opt/mycelium-demo
  rm -rf /opt/mycelium-demo/src/* && tar --no-same-owner -xzf /tmp/mycelium-demo.tgz -C /opt/mycelium-demo/src
  if [ ! -f /opt/mycelium-demo/demo.env ]; then
    umask 077; echo "DEMO_CODE=brolga-$(head -c3 /dev/urandom | od -An -tx1 | tr -dc 0-9a-f)" > /opt/mycelium-demo/demo.env
  fi
  cd /opt/mycelium-demo/src && docker build -q -f infra/demo.Dockerfile -t mycelium-demo . >/dev/null
  docker rm -f mycelium-demo >/dev/null 2>&1 || true
  docker run -d --name mycelium-demo --restart unless-stopped --network host --memory 256m \
    --env-file /opt/mycelium-demo/demo.env -v mycelium-demo-feedback:/data mycelium-demo >/dev/null
  tailscale funnel --bg --https=10000 http://127.0.0.1:8200 >/dev/null
  sleep 2; curl -fsS http://127.0.0.1:8200/api/config; echo
  echo "Demo: $(tailscale funnel status | grep -o "https://[^ ]*:10000" | head -1)"
'
REMOTE
rm -f /tmp/mycelium-demo.tgz
