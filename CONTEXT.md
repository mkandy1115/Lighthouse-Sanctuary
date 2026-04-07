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

## Deployment Direction
- Deploy frontend, backend, and PostgreSQL on Azure.
- Local development uses PostgreSQL.
- Current local backend default connection:
  - Host: `localhost`
  - Port: `5432`
  - Database: `lighthouse_sanctuary`
  - Username: `postgres`
  - Password: `admin`

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
