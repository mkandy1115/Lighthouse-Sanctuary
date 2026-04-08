import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from src.db import build_engine, load_env
from src.features import build_donor_training_frame, split_feature_target
from src.modeling import score_donors, train_and_evaluate


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ML Pipeline 1 (donor churn).")
    parser.add_argument("--profile", default="local")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    load_env(".env")
    engine = build_engine(args.profile)

    df = build_donor_training_frame(engine)
    if df.empty:
        payload = {"records": []}
    else:
        X, y = split_feature_target(df)
        result = train_and_evaluate(X, y)
        best_model = result["best_model"]
        scored = score_donors(best_model, X)
        now = datetime.now(timezone.utc).isoformat()
        payload_records = []
        for row in scored.to_dict(orient="records"):
            payload_records.append(
                {
                    "supporter_id": int(row.get("supporter_id", 0)),
                    "churn_score": float(row.get("churn_probability_365", 0.0)),
                    "churn_tier": str(row.get("risk_tier", "Medium")),
                    "model_version": "pipeline1-v1",
                    "scored_at_utc": now,
                }
            )
        payload = {"records": payload_records}

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload), encoding="utf-8")


if __name__ == "__main__":
    main()
