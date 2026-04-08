# ML Pipeline Output Contracts

Each `run_pipeline.py` script must write a UTF-8 JSON file with this top-level shape:

```json
{
  "records": []
}
```

## Pipeline 1 (`ML_Pipeline_1/run_pipeline.py`)

Each record:

- `supporter_id` (int)
- `churn_score` (float in `[0,1]`)
- `churn_tier` (`Low|Medium|High`)
- `model_version` (string)
- `scored_at_utc` (ISO-8601 datetime string)

## Pipeline 2 (`ML_Pipeline_2/run_pipeline.py`)

Each record:

- `post_id` (int)
- `churn_score` (float in `[0,1]`)
- `uplift_score` (float in `[0,1]`)
- `model_version` (string)
- `scored_at_utc` (ISO-8601 datetime string)

## Pipeline 3 (`ML_Pipeline_3/run_pipeline.py`)

Each record:

- `resident_id` (int)
- `readiness_score` (float in `[0,1]`)
- `readiness_tier` (`Early|Developing|Ready`)
- `model_version` (string)
- `scored_at_utc` (ISO-8601 datetime string)

## Pipeline 4 (`ML_Pipeline_4/run_pipeline.py`)

Each record:

- `supporter_id` (int)
- `uplift_score` (float in `[0,1]`)
- `churn_score` (float in `[0,1]`)
- `model_version` (string)
- `scored_at_utc` (ISO-8601 datetime string)

## Pipeline 5 (`ML_Pipeline_5/run_pipeline.py`)

Each record:

- `supporter_id` (int)
- `impact_score` (float in `[0,1]`)
- `predicted_top_program_area` (string)
- `predicted_education_share` (float in `[0,1]`)
- `model_version` (string)
- `scored_at_utc` (ISO-8601 datetime string)
