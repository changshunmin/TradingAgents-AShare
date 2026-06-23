# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend (Python 3.10+, managed with uv)
uv sync                    # Install dependencies
uv run pytest              # Run all tests
uv run tradingagents-api   # Start API server (port 8000)

# Frontend (Node.js 18+)
cd frontend && npm install
cd frontend && npm run dev    # Dev server on port 5173
cd frontend && npm run build  # Production build

# Docker (podman on this machine)
podman build -t tradingagents-ashare:latest .
podman stop tradingagents && podman rm tradingagents          # Stop old container
cd /opt/tradingagents && ./startup.sh                         # Deploy new container
podman logs -f tradingagents                                  # Follow logs
podman exec tradingagents env | grep -E 'MAIL_|TA_'          # Verify env vars in container

# One-shot rebuild + restart
podman build -t tradingagents-ashare:latest . && cd /opt/tradingagents && ./startup.sh
```

## Architecture

TradingAgents is a **multi-agent A-share (China stock market) investment analysis system** — 14 AI agents simulate a real trading institution's decision chain: analysts → bull/bear debate → risk management → final recommendation.

### Key layers

- **`tradingagents/`** — Core library. Environment-agnostic; does NOT import `api/`.
  - `agents/` — Agent definitions (analysts, researchers, risk managers, trader) + shared utilities (memory, debate, indicators).
  - `graph/trading_graph.py` — Central orchestrator. Builds a LangGraph state machine that runs the full analysis pipeline.
  - `graph/intent_parser.py` — NLP-based intent extraction (ticker, horizon, etc.) from free-text user input.
  - `llm_clients/factory.py` — `create_llm_client(provider, model, base_url)` routes to OpenAI/Anthropic/Google clients. **All OpenAI-compatible providers (deepseek, moonshot, zhipu, etc.) must be listed here** or they will raise `ValueError`.
  - `dataflows/` — Market data abstraction with multi-vendor routing (AKShare, BaoStock, yfinance, Alpha Vantage).
  - `prompts/` — Bilingual prompt templates (zh.py / en.py), selected by `TA_LANGUAGE`.

- **`api/`** — FastAPI backend. Depends on `tradingagents/`.
  - `main.py` — All routes, lifespan (DB init, trade calendar, stock map preload), SSE streaming for agent events, CORS config.
  - `services/auth_service.py` — Email OTP login. **SMTP fallback behavior**: if SMTP fails or `MAIL_HOST` is unset, the verification code is returned in the API response when `APP_ENV != "production"` (default is development mode). In production the code is hidden.
  - `services/vlm_service.py` — Portfolio screenshot parsing via VLM. Default: `glm-4.6v-flash` (Zhipu free tier).

- **`frontend/`** — React 18 + Vite + TypeScript + Tailwind 4 + Zustand.
  - `src/services/api.ts` — Central API client. `getBaseUrl()` resolves `VITE_API_URL` → `window.location.origin` → hardcoded fallback.
  - `src/stores/` — Zustand stores for auth, config, SSE, agent states.
  - `vite.config.ts` — Proxies `/v1`, `/api`, `/docs` to backend in dev mode.

### LLM configuration

Two-tier model design: **quick_think_llm** (light tasks) and **deep_think_llm** (reasoning/debate). Configured via:

1. User DB config (frontend Settings page — per-user)
2. Env vars: `TA_LLM_QUICK`, `TA_LLM_DEEP`, `TA_LLM_PROVIDER`, `TA_API_KEY`, `TA_BASE_URL`
3. Hardcoded defaults: `gpt-4o-mini` / `gpt-4o`

If only one model is configured, it auto-fills both roles. The `LLM_PROVIDER` must match a key in `factory.py`.

### Runtime config flow

`api/main.py` builds runtime config per-request in `_build_runtime_config()`:
1. Reads user's saved LLM config from DB (encrypted at rest via Fernet)
2. Decrypts user API key; falls back to server `TA_API_KEY` if `ALLOW_SERVER_LLM_FALLBACK=true`
3. Merges with env var defaults from `DEFAULT_CONFIG`

### Environment files

- `.env` in project root — for local development (`uv run`)
- `/opt/tradingagents/.env` — for the production container (`startup.sh` uses `--env-file`)
- `TA_APP_SECRET_KEY` — encrypts user LLM keys + signs JWTs. **Must not change** after first use or existing encrypted data becomes unreadable.
