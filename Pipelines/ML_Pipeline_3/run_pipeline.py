import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from src.db import build_engine, load_env
from src.features import build_frame, split_xy
from src.modeling import train_models


def readiness_tier(score: float) -> str:
    if score >= 0.70:
        return "Ready"
    if score >= 0.40:
        return "Developing"
    return "Early"


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ML Pipeline 3 (reintegration readiness).")
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
        rf, _, _, _, _ = train_models(X, y)
        readiness = rf.predict_proba(X)[:, 1]
        now = datetime.now(timezone.utc).isoformat()
        payload_records = []
        for idx, row in df.iterrows():
            score = float(max(0.0, min(1.0, readiness[idx])))
            payload_records.append(
                {
                    "resident_id": int(row["resident_id"]),
                    "readiness_score": score,
                    "readiness_tier": readiness_tier(score),
                    "model_version": "pipeline3-v1",
                    "scored_at_utc": now,
                }
            )
        payload = {"records": payload_records}

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload), encoding="utf-8")


if __name__ == "__main__":
    main()
