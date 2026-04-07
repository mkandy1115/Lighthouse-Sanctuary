# Project Context

## Overview
- This project is a large multi-course INTEX assignment.
- The current product is inspired by Lighthouse Sanctuary, but the organization being built is a separate concept.
- The current temporary working name is `Imari: Safe Haven`.
- The organization context currently references `Shellter Africa` as the target nonprofit platform.

## Product Goal
- Build a secure, mobile-friendly platform for Shellter Africa that empowers case workers to protect and track resident progress, and gives donors meaningful visibility into the impact of their generosity.

## Primary Personas
- `Social Worker / Admin`
  - Primary internal user.
  - Needs to manage residents, case progress, documentation, interventions, and operations safely.
- `Donor`
  - Primary external authenticated user.
  - Needs visibility into donation history and meaningful impact reporting.

## Priority Demo Screens
- Public landing page
- Donor page
- Admin page

## Features Explicitly Not Prioritized
- Public stories document
- Native mobile app

## Team Roles
- Scrum Master: `Jens`
- Product Owner: `Jacob`

## Current Technical Decisions
- Frontend: `React + TypeScript + Vite`
- Backend: `.NET 10`
- ORM: `Entity Framework Core`
- Database: `PostgreSQL`
- Cloud target: `Azure`
- Repo structure target:
  - `frontend/`
  - `backend/`
  - root-level shared project files where needed

## Current Repo Structure
- `frontend/`
  - React + Vite application
  - all UI pages, components, hooks, mock data, and frontend config live here
- `backend/`
  - ASP.NET Core Web API
  - EF Core context, models, controllers, startup config, and DB bootstrap logic live here
- root-level files
  - `schema_postgres_supabase.sql`
  - `seed_sample_data.sql`
  - `CONTEXT.md`
  - shared repo metadata such as `.gitignore`

## Frontend Stack Details
- Framework: `React 18`
- Language: `TypeScript`
- Build tool: `Vite`
- Routing: `react-router-dom`
- Styling: `Tailwind CSS`
- Utilities:
  - `clsx`
  - `tailwind-merge`
  - `date-fns`
- UI/data libraries currently present:
  - `Recharts`
  - `@tanstack/react-table`
  - several `Radix UI` primitives
- Fonts:
  - `@fontsource/inter`
  - `@fontsource/playfair-display`

## Backend Stack Details
- Runtime/framework: `ASP.NET Core` on `.NET 10`
- Data access: `Entity Framework Core`
- PostgreSQL provider: `Npgsql.EntityFrameworkCore.PostgreSQL`
- API style: controller-based REST endpoints
- Development API docs/testing: `Swagger`
- Local startup includes automatic database bootstrap from SQL scripts

## How The App Fits Together
- The `frontend` is the browser-based user interface.
- The `backend` is the API layer that exposes data and business operations.
- PostgreSQL is the system of record for operational data.
- The frontend should not talk directly to PostgreSQL.
- The intended runtime flow is:
  - user interacts with React UI
  - React sends HTTP requests to the .NET API
  - API reads/writes PostgreSQL through EF Core
  - API returns JSON responses to the frontend

## Current State Of Integration
- The backend is live and working locally.
- The frontend currently still contains significant mock data and is not yet fully wired to the backend.
- Current proven backend endpoints include:
  - `/api/health`
  - `/api/residents`
  - `/api/safehouses`
  - `/api/supporters`
  - `/api/socialmediaposts`
  - `/api/impact/summary`
- Near-term goal:
  - replace frontend mock data incrementally, starting with residents/cases

## Local Development Logistics
- Start backend:
  - `cd backend`
  - `dotnet run`
- Start frontend:
  - `cd frontend`
  - `npm run dev`
- Default local URLs:
  - frontend: usually `http://localhost:5173`
  - backend: `http://localhost:5057`
  - swagger: `http://localhost:5057/swagger`

## Backend Bootstrapping Behavior
- On startup, the backend:
  - loads connection settings from `backend/appsettings.json`
  - optionally overrides local secrets with `backend/appsettings.Local.json`
  - checks whether the target PostgreSQL database exists
  - creates the database if missing
  - applies `schema_postgres_supabase.sql`
  - applies `seed_sample_data.sql`
- This means local environments can be spun up quickly as long as PostgreSQL is running.

## Deployment Direction
- Deploy frontend, backend, and PostgreSQL on Azure.
- Local development uses PostgreSQL.
- Current local backend default connection:
  - Host: `localhost`
  - Port: `5432`
  - Database: `lighthouse_sanctuary`
  - Username: `postgres`
  - Password: `admin`

## Expected Azure Direction
- Frontend: Azure-hosted web frontend
- Backend: Azure-hosted ASP.NET API
- Database: Azure Database for PostgreSQL
- Deployment target is all-Azure, even though current development is local-first
- Production connection strings and secrets should be moved out of checked-in config

## Architecture Conventions
- Keep frontend and backend separated physically and logically.
- Keep database access inside the backend only.
- Treat the SQL files as bootstrap/reference artifacts, not immutable long-term constraints.
- Favor reusable frontend components over page-specific duplication.
- Favor API endpoints that support the priority judged pages first:
  - landing
  - donor
  - admin
- Build residents/cases first on the backend because that is the first priority domain.

## Database Notes
- The current SQL schema and seed files are based on provided sample/anonymized data.
- The current schema is not final and may be extended during development.
- The current local SQL files are useful for bootstrapping and testing.
- The team expects to connect to a fuller production database later.

## Current Backend Direction
- Single backend project under `backend/`
- No authentication implemented yet
- Authentication approach is intentionally left open for now
- First backend priority domain:
  - residents / cases

## Current Frontend Direction
- Continue with the current design direction already present in the repo.
- Maintain a component/design-system standard.
- Favor mobile-friendly, polished UI suitable for presentation judging.

## Component / UI Direction
- Public-facing pages should feel polished and donor-ready.
- Internal/admin pages should feel structured, efficient, and operationally clear.
- Shared UI patterns should live in reusable component folders rather than being rebuilt ad hoc.
- The landing page, donor page, and admin page are the most important visual priorities.

## Security Notes
- Authentication is deferred for now.
- Secrets should not be committed.
- Local override files should remain ignored.
- Production security requirements from the assignment still need a dedicated implementation pass.

## ML Notes
- No ML pipeline topics are finalized yet.
- Future ML work should live in `ml-pipelines/`.
- Predictive vs explanatory framing should be documented per pipeline.

## Assignment Framing
- This project must satisfy requirements across:
  - `IS 401`
  - `IS 413`
  - `IS 414`
  - `IS 455`
- The application should support:
  - donor operations
  - case management
  - outreach/social media analysis
  - privacy and security controls
  - deployment and demo readiness

## Open Decisions
- Final official organization name
- Final authentication approach
- Final ML pipeline selection
- Final Azure service configuration details
- Exact scope of first end-to-end production page using live API data

## Working Assumptions
- The public landing page is likely the first high-visibility judged page.
- Residents/cases are the first high-value backend domain.
- The donor and admin experiences are core for demo success.
- The repo should remain organized enough that other AI agents can quickly understand:
  - product purpose
  - architecture
  - priorities
  - open decisions
