# Pipelines Function App

This folder is the Azure Function App for ML refresh jobs.

## Layout

- `host.json` and `function_app.py` are at project root for deployment packaging.
- `ML_Pipeline_1` ... `ML_Pipeline_5` contain pipeline runtime code and notebooks.
- `notebooks/` contains submission notebooks moved from `ml-pipelines/`.
- `output/` stores per-run JSON outputs and executed artifacts.

## Local run

1. Create a Python 3.11 virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Set database variables in environment (or `.env` in each pipeline folder):
   - `AZURE_DB_HOST`, `AZURE_DB_PORT`, `AZURE_DB_NAME`, `AZURE_DB_USER`, `AZURE_DB_PASSWORD`, `AZURE_DB_SSLMODE=require`
4. Start Functions host:
   - `func start`
5. Call endpoint:
   - `POST http://localhost:7071/api/refresh-all`
   - Body: `{"profile":"azure","timeoutSeconds":180}`

## Azure app settings required

Set these in the Function App configuration:

- `AZURE_DB_HOST`
- `AZURE_DB_PORT`
- `AZURE_DB_NAME`
- `AZURE_DB_USER`
- `AZURE_DB_PASSWORD`
- `AZURE_DB_SSLMODE` (usually `require`)

### Flex Consumption (your current plan)

Do **not** add these in Azure Portal — deployment will fail validation:

- `SCM_DO_BUILD_DURING_DEPLOYMENT`
- `ENABLE_ORYX_BUILD`

Also do **not** set `FUNCTIONS_WORKER_RUNTIME` in App Settings on Flex Consumption; the platform manages the worker.

Keep `FUNCTIONS_WORKER_RUNTIME` only in **local** `local.settings.json` for `func start`.

The backend should call this app through:

- `MlRuntime__FunctionAppUrl=https://<your-function-app>.azurewebsites.net`
- `MlRuntime__FunctionKey=<function-key>`

## GitHub Actions auto-deploy

Workflow: `.github/workflows/deploy-lh-sanctuary-ml-pipelines.yml`

Runs on every push to `main` that changes files under `Pipelines/` (or the workflow file itself). You can also run it manually: **Actions → Deploy Function App - lh-sanctuary-ml-pipelines → Run workflow**.

### Repository secret to add

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**

| Name | Example value |
|------|----------------|
| `AZURE_FUNCTIONAPP_NAME` | `lh-sanctuary-ml-pipelines` |

The workflow reuses the same Azure OIDC secrets as the API deploy (`AZUREAPPSERVICE_CLIENTID_*`, `AZUREAPPSERVICE_TENANTID_*`, `AZUREAPPSERVICE_SUBSCRIPTIONID_*`). If login fails after adding this workflow, add a **federated credential** in Entra ID for the new workflow file path (or use a credential scoped to the whole repo/branch).

### If deploy fails with `Resource ... Microsoft.Web/Sites doesn't exist`

1. **`AZURE_FUNCTIONAPP_NAME`** must match the Function App **Name** in Azure Portal (Overview), with no typos or extra spaces.
2. **`AZUREAPPSERVICE_SUBSCRIPTIONID_*`** must be the subscription **where that Function App actually lives** (Portal → Function app → Overview → Subscription).
3. The Entra app used for OIDC (same client ID as the API workflow) needs **Contributor** (or **Website Contributor**) on that Function App or its **resource group** (Portal → Resource group → Access control (IAM) → Add role assignment).

Optional fallback: download the Function App **publish profile** from Portal → **Get publish profile**, store it as secret `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`, and switch the workflow deploy step to pass `publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}` (validation is skipped when using a publish profile).
