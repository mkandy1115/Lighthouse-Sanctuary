import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from src.db import build_engine, load_env
from src.features import build_post_frame, feature_target_frames
from src.modeling import train_engagement_models, train_referral_models


def clamp01(value: float) -> float:
    return float(max(0.0, min(1.0, value)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ML Pipeline 2 (social engagement + referrals).")
    parser.add_argument("--profile", default="local")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    load_env(".env")
    engine = build_engine(args.profile)

    df = build_post_frame(engine)
    if df.empty:
        payload = {"records": []}
    else:
        X, y_engagement, _, y_referrals_binary = feature_target_frames(df)
        _, best_engagement_model = train_engagement_models(X, y_engagement)
        _, referral_model, _ = train_referral_models(X, y_referrals_binary)

        engagement_pred = np.array(best_engagement_model.predict(X), dtype=float)
        uplift_score = np.clip(engagement_pred / 10.0, 0.0, 1.0)
        churn_score = np.clip(1.0 - uplift_score, 0.0, 1.0)
        referral_proba = referral_model.predict_proba(X)[:, 1]
        uplift_score = np.clip((uplift_score + referral_proba) / 2.0, 0.0, 1.0)

        now = datetime.now(timezone.utc).isoformat()
        payload_records = []
        for idx, row in df.iterrows():
            payload_records.append(
                {
                    "post_id": int(row["post_id"]),
                    "churn_score": clamp01(float(churn_score[idx])),
                    "uplift_score": clamp01(float(uplift_score[idx])),
                    "model_version": "pipeline2-v1",
                    "scored_at_utc": now,
                }
            )
        payload = {"records": payload_records}

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload), encoding="utf-8")


if __name__ == "__main__":
    main()
