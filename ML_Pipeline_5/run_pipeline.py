import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from src.db import build_engine, load_env
from src.features import build_frame, split_xy
from src.modeling import donor_impact_output, train_explanatory_share, train_predictive_top_area


def clamp01(value: float) -> float:
    return float(max(0.0, min(1.0, value)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ML Pipeline 5 (donor impact allocation).")
    parser.add_argument("--profile", default="local")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    load_env(".env")
    engine = build_engine(args.profile)

    df = build_frame(engine)
    if df.empty:
        payload = {"records": []}
    else:
        X, y_top, y_share_education = split_xy(df)
        _, best_top_model = train_predictive_top_area(X, y_top)
        _, baseline_share_model, _, _ = train_explanatory_share(X, y_share_education)
        out = donor_impact_output(df, best_top_model, baseline_share_model)
        now = datetime.now(timezone.utc).isoformat()

        payload_records = []
        for row in out.to_dict(orient="records"):
            share = clamp01(float(row.get("pred_share_education", 0.0)))
            payload_records.append(
                {
                    "supporter_id": int(row["supporter_id"]),
                    "impact_score": share,
                    "predicted_top_program_area": str(row.get("pred_top_program_area", "Education")).title(),
                    "predicted_education_share": share,
                    "model_version": "pipeline5-v1",
                    "scored_at_utc": now,
                }
            )
        # Keep strongest impact row per supporter
        dedup = {}
        for item in payload_records:
            sid = item["supporter_id"]
            if sid not in dedup or item["impact_score"] > dedup[sid]["impact_score"]:
                dedup[sid] = item
        payload = {"records": list(dedup.values())}

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload), encoding="utf-8")


if __name__ == "__main__":
    main()
