# The fictional demo (demo/), separate from Mycelium: no real data, public behind an access code. Build from the repo root:
#   docker build -f infra/demo.Dockerfile -t mycelium-demo .
FROM node:22-slim AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY web/ ./
RUN npm run build:demo

FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DEMO_FEEDBACK_DIR=/data
WORKDIR /app/demo
RUN pip install --no-cache-dir "flask>=3.1,<4" "gunicorn>=23.0"
COPY demo/server.py ./
COPY --from=web /demo/dist ./dist
RUN useradd --system --uid 10002 --home-dir /data demo && mkdir -p /data && chown demo /data
USER demo
EXPOSE 8200
# One worker: feedback appends and the rate limit stay in one process.
CMD ["gunicorn", "--bind", "127.0.0.1:8200", "--workers", "1", "--threads", "8", "server:create_app()"]
