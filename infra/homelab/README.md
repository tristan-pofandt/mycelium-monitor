# Running Monitor on the homelab

Monitor runs in the homelab's Docker LXC (101, `mediaserver`) next to Reroute. Only the tailnet can reach it.

- **Install once** (as root in the LXC): copy `install.sh` there and run it. It clones the repo to `/opt/mycelium/repo`, writes `/opt/mycelium/mycelium.env` (owner from this machine's Tailscale login and a random session key; root only), installs `update.sh` and a systemd timer, builds and starts the container, and runs `tailscale serve --bg --https=8443 http://127.0.0.1:8100`.
- **Auto-deploy:** `mycelium-update.timer` runs `update.sh` every 2 minutes. If `main` has a new commit it pulls and rebuilds, so a push is live in about 2 minutes.
- **Network:** the container uses the host's network. gunicorn listens on `127.0.0.1:8100` (for `tailscale serve`) and on `172.17.0.1:8100` (so other containers' emitters can reach it). Only requests from 127.0.0.1 may carry a trusted Tailscale identity, so a container can't fake one.
- **Data:** the Docker volume `mycelium-data` holds the SQLite file.
- **Never Funnel.** Monitor is private. Reroute's Funnel on 443 is separate. The Mycelium Ops demo on Funnel :10000 lives in the `mycelium-ops` repo.

## Connecting an app

1. Register it inside the container (keeps the key out of logs): `docker exec mycelium python manage.py add-app <slug> <name> --health-url ... --admin-url ...`.
2. For Reroute on the same LXC: health and admin URLs are `http://127.0.0.1:8010`. In `reroute.env` set `MYCELIUM_URL=http://172.17.0.1:8100` and `MYCELIUM_KEY=<the key>`. Give both apps the same admin token (`PLANB_ADMIN_TOKEN` in Reroute, `MYCELIUM_ADMIN_TOKEN_REROUTE` in `mycelium.env`).
3. Rebuild: `rm /opt/mycelium/deployed; /opt/mycelium/update.sh` (and the same for Reroute).

## Commands

```bash
pct exec 101 -- journalctl -u mycelium-update -n 20     # deploy history
pct exec 101 -- docker logs --tail 50 mycelium          # app log
pct exec 101 -- tailscale serve status                  # should list :8443 (tailnet) and Reroute's Funnel on 443
```
