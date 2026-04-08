# Daily ML Refresh Runbook

This project includes a scheduled workflow at:

- `.github/workflows/daily-ml-refresh.yml`

It runs daily at **02:15 UTC** and can also be run manually.

## Required GitHub Environment Secrets

Set these in your `production` environment secrets:

- `PROD_API_BASE_URL` (example: `https://your-api.azurewebsites.net`)
- `PROD_ADMIN_USERNAME`
- `PROD_ADMIN_PASSWORD`

## What the workflow does

1. Validates required secrets.
2. Logs into the API (`POST /api/auth/login`).
3. Extracts JWT token from login response.
4. Triggers ML refresh (`POST /api/admin/ml-insights/refresh`).
5. Verifies ML insights payload (`GET /api/admin/ml-insights`) and checks `lastRefreshedAtUtc`.

## First-time setup steps

1. Commit and push the workflow file to `main`.
2. In GitHub Actions, run **Daily ML Refresh** manually once (`workflow_dispatch`).
3. Confirm the workflow run is green and logs show:
   - refresh response payload,
   - non-null `lastRefreshedAtUtc`,
   - counts for donor/social/resident ML outputs.

## Ongoing verification

- Check Admin dashboard ML sections for updated scores/timestamp.
- Check Donor dashboard still shows Pipeline 5 prediction.
- If a run fails, inspect the Action logs for login/refresh errors.
