# Imari: Safe Haven (Lighthouse Sanctuary)

Imari: Safe Haven is a secure, mobile-friendly platform for nonprofit case operations and donor engagement: staff manage residents, cases, documentation, and programs; donors see giving history and impact-oriented reporting. The codebase is the INTEX course project for **Lighthouse Sanctuary** / **Shellter Africa**–style requirements, deployed on **Azure**.

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Radix UI primitives, Recharts
- **Backend**: ASP.NET Core **.NET 10** Web API, JWT authentication, Entity Framework Core
- **Database**: PostgreSQL (Npgsql)
- **ML / batch scoring**: Python Azure Functions app in **`Pipelines/`** (optional locally; see `Pipelines/README.md`)

---

## Setup (First Time)

### Prerequisites

- **Node.js 18+** — https://nodejs.org/
- **.NET SDK 10** — https://dotnet.microsoft.com/download
- **PostgreSQL 14+** — https://www.postgresql.org/download/

Verify:

```bash
node --version
dotnet --version
psql --version
```

### 1. Clone the repo

```bash
git clone <repository-url>
cd "Lighthouse Sanctuary"
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

There is **no** root `package.json`; install in **`frontend/`** only.

### 3. Restore backend dependencies

```bash
cd backend
dotnet restore
cd ..
```

### 4. Create the database and load schema + seed

Create a database whose name matches your connection string (default in `backend/appsettings.json` is **`lighthouse_sanctuary`**).

```bash
# Windows (example) — adjust user/host if needed
psql -U postgres -c "CREATE DATABASE lighthouse_sanctuary;"
```

Apply the **canonical schema** and sample data from the **repository root** (not inside `backend/`):

```bash
# From repo root — live_schema.sql is the final schema (includes app_users, FKs, indexes)
psql -U postgres -d lighthouse_sanctuary -f live_schema.sql
psql -U postgres -d lighthouse_sanctuary -f seed_sample_data.sql
```

> **`live_schema.sql`** is the source of truth for DDL. The older **`schema_postgres_supabase.sql`** file is not used for new setups unless your team explicitly relies on it.

### 5. Configure the backend

**Option A — `.env` next to published output (common for local `dotnet run` from `backend/`):**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set at least:

- `ConnectionStrings__DefaultConnection` — host, port, database name, user, password
- `Jwt__Key` — long random string for signing tokens

**Option B — optional local overrides file:**

```bash
cd backend
cp appsettings.Local.json.example appsettings.Local.json
```

Edit `appsettings.Local.json` for connection string and, if you use it, **`AuthSeed`** (see [Local accounts](#local-accounts)).

The API loads, in order: `appsettings.json` → optional `appsettings.Local.json` → environment variables → optional `backend/.env` (when present).

---

## Running the App

You need **PostgreSQL**, the **API**, and the **Vite dev server** running.

### Terminal 1 — Backend

```bash
cd backend
dotnet run
```

Expected:

- API base URL: **http://localhost:5057** (see `backend/Properties/launchSettings.json`)
- Swagger (development): **http://localhost:5057/swagger**
- Health check: **http://localhost:5057/api/health**

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** (or the URL Vite prints).

### Frontend API URL (local dev)

By default the app uses **`http://localhost:5057`** when **`VITE_API_BASE_URL`** is unset (`frontend/src/lib/auth.ts`).

To point at another API (e.g. Azure):

```bash
# frontend/.env.local (create if needed)
VITE_API_BASE_URL=https://your-api.azurewebsites.net
```

### CORS

Local origins **`http://localhost:5173`** / **`5174`** are allowed in `backend/Program.cs`. For extra dev origins, extend `WithOrigins(...)` or use configuration-driven CORS in a follow-up change.

---

## Local accounts

- **Password policy** (login / register): at least **14** characters, with uppercase, lowercase, digit, and special character (see `AuthController`).

**Donor**

- Use the **registration** flow in the UI, or **`POST /api/auth/register-donor`** via Swagger.

**Admin**

- Example local seed users are documented in **`backend/appsettings.Local.json.example`** (`local-admin`, `local-donor`). The project includes **`AuthSeedService`**, but startup must call **`SeedAsync()`** for those entries to be created automatically; if your branch does not call it yet, either wire that on startup or insert an **`app_users`** row with role **`Admin`** and a valid ASP.NET Identity password hash (team script / SQL).

---

## ML refresh (Function App + admin UI)

- **Azure / production:** The API calls the Python Function App (`MlRuntime:FunctionAppUrl`, `MlRuntime:FunctionKey`, `MlRuntime:DbProfile`). See **`Pipelines/README.md`** for deploy, DB env vars, and GitHub Actions.
- **Local optional:** Run Azure Functions Core Tools from **`Pipelines/`** (`func start`) and set **`MlRuntime:FunctionAppUrl`** to `http://localhost:7071` in `appsettings.Local.json`.
- **Admin UI:** After login as **Admin**, open **`/admin`** and use **Refresh ML Scores** (loads insights from the API, which may call the Function App).

---

## CI / auto-deploy

- **API:** `.github/workflows/main_lh-sanctuary-api.yml`
- **Frontend (Static Web Apps):** `.github/workflows/azure-static-web-apps-calm-tree-0253d7010.yml`
- **Function App (`Pipelines/`):** `.github/workflows/deploy-lh-sanctuary-ml-pipelines.yml` (requires **`AZURE_FUNCTIONAPP_NAME`** and **`AZURE_FUNCTIONAPP_PUBLISH_PROFILE`** — see `Pipelines/README.md`)

---

## Keeping up to date

```bash
git fetch origin && git status
git pull
```

Then:

```bash
cd frontend && npm install
cd ../backend && dotnet restore
```

If the database layout changes, pull the latest **`live_schema.sql`** and coordinate with your team on how to apply updates (fresh DB vs. incremental SQL).

---

## Troubleshooting

**`dotnet run` fails: missing connection string**

- Set `ConnectionStrings__DefaultConnection` in `appsettings.Local.json`, environment variables, or `backend/.env`.

**PostgreSQL connection refused**

- Ensure the service is running and host/port/user/password match the connection string.

**Frontend cannot reach the API**

- Confirm **`dotnet run`** is up on **5057**.
- Check **`VITE_API_BASE_URL`** if you overrode it.
- Browser console / Network tab for CORS errors; add your origin to the API CORS policy if needed.

**Login always fails**

- Ensure you applied **`live_schema.sql`** so **`app_users`** exists, and the user is active.
- Password must meet the 14-character policy.

**Admin “Refresh ML Scores” fails**

- Configure **`MlRuntime`** for your environment; ensure the Function App is deployed and can reach PostgreSQL; see **`Pipelines/README.md`**.

**Port 5057 already in use**

- Change `applicationUrl` in `backend/Properties/launchSettings.json` or stop the other process using the port.

---

## Project structure

```
Lighthouse Sanctuary/
├── frontend/                 # React + Vite SPA
├── backend/                  # ASP.NET Core API
├── Pipelines/                # Azure Functions (ML refresh), Python pipelines + notebooks
├── live_schema.sql           # Final PostgreSQL schema (DDL — use for new databases)
├── seed_sample_data.sql      # Optional sample rows after schema
├── schema_postgres_supabase.sql  # Legacy / alternate script (not the default setup path)
├── CONTEXT.md                # Product and architecture notes
└── README.md
```

---

## Features (high level)

- Public marketing pages, donation flow, and contact
- **JWT auth**: login, donor registration, password change
- **Donor** portal: dashboard, giving history, impact-oriented views
- **Admin / staff** workspace (`/admin`): residents, cases, donors, campaigns, social, reports, users/roles, audit, **ML insights** refresh
- REST API with Swagger in Development
- Optional **Python ML pipelines** (donor churn, social scoring, readiness, uplift, impact) invoked via Function App and persisted to PostgreSQL

---

## Course / assignment context

This repository supports INTEX-related work across **IS 401, IS 413, IS 414, IS 455** (see **`CONTEXT.md`** for personas, demo priorities, and conventions). Product naming in UI may use **Imari: Safe Haven** while docs still reference **Lighthouse Sanctuary**.
