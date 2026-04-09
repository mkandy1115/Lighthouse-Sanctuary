#!/usr/bin/env python3
"""Run each pipeline with --profile local; write JSON under output/.

Loads ml-pipelines/.env when present (optional; notebooks may use it).
CSV data is read only from ml-pipelines/lighthouse_csv_v7 (DuckDB).
"""

from __future__ import annotations

import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError as e:
    raise SystemExit("Install python-dotenv: pip install python-dotenv") from e

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
ENV_FILE = ROOT / ".env"

PIPELINES: list[tuple[int, str]] = [
    (1, "pipeline_1_donor_churn.json"),
    (2, "pipeline_2_social_engagement_referrals.json"),
    (3, "pipeline_3_reintegration_readiness.json"),
    (4, "pipeline_4_donor_uplift_180d.json"),
    (5, "pipeline_5_donor_impact_allocation.json"),
]


def main() -> None:
    if ENV_FILE.is_file():
        load_dotenv(ENV_FILE)

    OUTPUT.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []
    for num, out_name in PIPELINES:
        out_path = OUTPUT / out_name
        pkg = ROOT / f"ML_Pipeline_{num}"
        script = pkg / "run_pipeline.py"
        if not script.is_file():
            print(f"Skip missing {script}", file=sys.stderr)
            continue
        cmd = [
            sys.executable,
            str(script),
            "--profile",
            "local",
            "--output",
            str(out_path),
        ]
        print("Running:", " ".join(cmd))
        subprocess.run(cmd, cwd=pkg, check=True)
        written.append(out_path)

    log_path = OUTPUT / "RUN_LOG.txt"
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    lines = [
        f"run_all_local completed_at_utc={stamp}",
        f"python_executable={sys.executable}",
        f"python_version={sys.version.splitlines()[0]}",
        "outputs:",
    ]
    for p in written:
        lines.append(f"  - {p.name} ({p.stat().st_size} bytes)")
    lines.append("")
    with log_path.open("a", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Wrote {len(written)} JSON file(s) under {OUTPUT}")
    print(f"Appended run summary to {log_path}")


if __name__ == "__main__":
    main()
