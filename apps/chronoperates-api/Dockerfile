# syntax=docker/dockerfile:1

FROM python:3.13-slim AS base
COPY --from=ghcr.io/astral-sh/uv:0.8.22 /uv /uvx /bin/

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        libjpeg-dev \
        zlib1g-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -d /opt/app app
USER app
WORKDIR /opt/app

COPY --chown=app:app pyproject.toml uv.lock ./
RUN uv sync --no-dev

COPY --chown=app:app src ./src

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8000/ || exit 1

CMD [".venv/bin/python", "-m", "src.main"]
