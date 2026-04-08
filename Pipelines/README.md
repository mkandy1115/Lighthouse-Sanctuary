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
- `FUNCTIONS_WORKER_RUNTIME=python`

The backend should call this app through:

- `MlRuntime__FunctionAppUrl=https://<your-function-app>.azurewebsites.net`
- `MlRuntime__FunctionKey=<function-key>`
