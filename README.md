# ReactFast

Minimal full-stack template: **FastAPI** backend + **Vite/React (TypeScript)** frontend. The backend serves the built frontend (single-page app) and exposes a simple JSON API. Includes a multi‑stage Docker build and GitHub Actions workflow (Commit-4) to push the image to Azure Container Registry (ACR).

---

## Features
- FastAPI backend (`/api/transform`, `/api/health`) with static file serving.
- Vite + React + TypeScript frontend built to `frontend/dist`.
- Frontend served at `/` (adjust base in `vite.config.ts`).
- Simple round‑trip demo: user enters text, backend returns transformed string.
- Multi-stage Dockerfile: builds frontend, copies build into Python runtime image.
- GitHub Actions CI: builds & pushes image to ACR (tags: commit SHA + `latest`).

---

## Tech Stack
| Layer      | Technology | Notes |
|------------|------------|-------|
| Backend    | FastAPI / Uvicorn | ASGI app serving API + static assets |
| Frontend   | React 18 + Vite   | Fast dev server & optimized build |
| Language   | Python 3.12 & TypeScript | Type safety on both sides |
| Packaging  | Docker multi-stage | Small final image (Python slim) |
| CI / CD    | GitHub Actions     | Image build & ACR push |
| Registry   | Azure Container Registry | Deployment artifact storage |

---

## Repository Layout
```
backend/
  app.py               # FastAPI app + API endpoints + static mounting
  requirements.txt     # Backend dependencies
frontend/
  src/                 # React source (App.tsx, main.tsx, style.css)
  index.html           # Vite entry HTML
  vite.config.ts       # Vite config (base path, build outDir)
  package.json         # Frontend scripts/deps
Dockerfile             # Multi-stage build (frontend build → backend runtime)
.dockerignore          # Prunes build context
builderflow.md         # Incremental commit summaries (Commit-1..4)
README.md              # This file
```

---

## Backend Overview
- Mounts frontend build via `StaticFiles` after defining API routes.
- Example endpoints:
  - `POST /api/transform` → `{ result: "You said: ..." }`
  - `GET /api/health` → `{ status: "ok" }`
- Ensure API routes are declared **before** mounting static root to avoid 405 errors (StaticFiles intercepting non-GET methods).

### Running backend (local dev)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Open: http://127.0.0.1:8000/

---

## Frontend Overview
- Vite handles dev (`npm run dev`) and production builds (`npm run build`).
- Output bundle placed in `frontend/dist` and served by FastAPI.
- If you change route mount (e.g., from `/` to `/app`), update `base` in `vite.config.ts`.

### Running frontend (standalone dev mode)
```powershell
cd frontend
npm install
npm run dev
```
Dev server: http://127.0.0.1:5173/ (API calls to `/api/...` will need proxy config or full backend URL if not served together).

### Production build
```powershell
cd frontend
npm run build
```
Rebuild whenever you change frontend assets before packaging backend or Docker image.

---

## End‑to‑End Flow
1. User enters text in the form.
2. Frontend sends `POST /api/transform` with `{ text }`.
3. Backend returns a transformed string.
4. UI displays the response below the form.

---

## Docker
Multi-stage build: Node → Python.

### Build locally
```powershell
docker build -t reactfast .
docker run --rm -p 8000:8000 reactfast
```
Visit: http://localhost:8000/

### Environment customization
- Adjust exposed port by changing `-p hostPort:8000`.
- Add env vars by appending `-e KEY=value` to `docker run`.
- For dev hot-reload, prefer running backend & frontend separately outside container.

---

## GitHub Actions (Commit-4)
Workflow builds and pushes image to ACR on push to `main`.

### Required GitHub Secrets
- `AZURE_CREDENTIALS` – Service Principal JSON (`--sdk-auth`) with AcrPush role.
- `ACR_LOGIN_SERVER` – e.g. `myregistry.azurecr.io`.

### Resulting Tags
- `<loginServer>/reactfast:<git-sha>` (immutable)
- `<loginServer>/reactfast:latest`

### Typical Service Principal Creation
```powershell
$ACR_ID = az acr show -n <ACR_NAME> --query id -o tsv
az ad sp create-for-rbac --name reactfast-sp --role AcrPush --scopes $ACR_ID --sdk-auth
```
Paste JSON output into `AZURE_CREDENTIALS` secret.

---

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| 404 assets | Wrong mount/base mismatch | Align `vite.config.ts` base with `app.mount()` path and rebuild |
| 405 on POST /api/transform | StaticFiles mounted before API routes | Declare API routes first, mount static last |
| Image lacks new frontend changes | Forgot to rebuild frontend in Docker | Dockerfile handles build; ensure source changes committed |
| ACR push fails | Missing/incorrect secrets | Verify `AZURE_CREDENTIALS`, `ACR_LOGIN_SERVER` |

---

## Extending
- Add tests (pytest + React Testing Library).
- Introduce type checking (mypy/pyright) in CI.
- Add security scanning (Trivy / GitHub Dependabot alerts).
- Implement version tagging (semantic-release or manual release workflow).
- Deploy automatically to Azure Web App / Container Apps after push.

---

## Quick Start (All-in-One)
```powershell
# Backend & Frontend build
cd frontend
npm install
npm run build
cd ../backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
# Open http://127.0.0.1:8000/
```

---

For commit-by-commit evolution see `builderflow.md`.
