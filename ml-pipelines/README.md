# ML pipelines (CSV-only)

Pipelines read **`*.csv`** from **`lighthouse_csv_v7/`** in this directory (next to `ML_Pipeline_*` and `pipeline_common`). DuckDB loads them in memory; no PostgreSQL and no path configuration.

After cloning the repo, this folder should already contain the CSV bundle. If it is missing, copy the assignment `lighthouse_csv_v7` export here:

`Lighthouse-Sanctuary/ml-pipelines/lighthouse_csv_v7/*.csv`

## CRISP-DM in the notebooks

Each `ML_Pipeline_*/*.ipynb` is structured around **CRISP-DM**. The **Business understanding** phase is spelled out first: organizational context, objectives, stakeholders and decisions, measurable success criteria, constraints (ethics, capacity, data limits), and the **business cost** of model errors. A roadmap table maps each CRISP-DM phase to notebook sections. Later sections cover data understanding, modeling (with preparation in `src/`), evaluation, and deployment-style notes—so the story from **business question → data → model → action** is explicit.

## Setup

1. Python 3.10+ recommended. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Jupyter optional cells may import **SQLAlchemy** for legacy Azure demos; install from `requirements.txt` or skip those cells.

### Notebooks (grading / Run All)

Open any `ML_Pipeline_*/*.ipynb` and choose **Run All**. The first code cell runs `pipeline_common/notebook_bootstrap.py`: it installs everything in `requirements.txt` if missing (using the notebook kernel’s Python, or `ml-pipelines/.venv` as a fallback when the system blocks `pip`), sets `sys.path`, and `chdir`s to the pipeline folder so `.env` and imports work. First run may need network access for `pip`.

## Run all pipelines and write outputs

```bash
python run_all_local.py
```

JSON files go to `output/` (see `../ML_PIPELINE_OUTPUT_CONTRACTS.md`). `output/RUN_LOG.txt` records the run time and Python version.

## Single pipeline

```bash
cd ML_Pipeline_1
python run_pipeline.py --profile local --output ../output/pipeline_1_donor_churn.json
```
