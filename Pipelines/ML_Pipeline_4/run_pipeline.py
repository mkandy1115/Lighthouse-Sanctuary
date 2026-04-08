import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from src.db import build_engine, load_env
from src.features import build_frame, split_xy
from src.modeling import train_predictive_and_explanatory


def clamp01(value: float) -> float:
    return float(max(0.0, min(1.0, value)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ML Pipeline 4 (donor uplift 180d).")
    parser.add_argument("--profile", default="local")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    load_env(".env")
    engine = build_engine(args.profile)

    df = build_frame(engine)
    if df.empty:
        payload = {"records": []}
    else:
        X, y = split_xy(df)
        rf, _, _, _, _ = train_predictive_and_explanatory(X, y)
        uplift = rf.predict_proba(X)[:, 1]
        now = datetime.now(timezone.utc).isoformat()
        payload_records = []
        for pos, (_, row) in enumerate(df.iterrows()):
            score = clamp01(float(uplift[pos]))
            payload_records.append(
                {
                    "supporter_id": int(row["supporter_id"]),
                    "uplift_score": score,
                    "churn_score": clamp01(float(1.0 - score)),
                    "model_version": "pipeline4-v1",
                    "scored_at_utc": now,
                }
            )
        # Deduplicate to one row per supporter_id
        dedup = {}
        for item in payload_records:
            sid = item["supporter_id"]
            if sid not in dedup or item["uplift_score"] > dedup[sid]["uplift_score"]:
                dedup[sid] = item
        payload = {"records": list(dedup.values())}

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload), encoding="utf-8")


if __name__ == "__main__":
    main()
