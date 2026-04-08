import json
import subprocess
import sys
from pathlib import Path

import azure.functions as func

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
PIPELINE_FOLDERS = [
    "ML_Pipeline_1",
    "ML_Pipeline_2",
    "ML_Pipeline_3",
    "ML_Pipeline_4",
    "ML_Pipeline_5",
]


def _run_pipeline(folder_name: str, profile: str, timeout_seconds: int) -> dict:
    pipeline_dir = BASE_DIR / folder_name
    script = pipeline_dir / "run_pipeline.py"
    if not script.exists():
        raise FileNotFoundError(f"Pipeline script not found for {folder_name}: {script}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_DIR / f"{folder_name}.json"
    if output_file.exists():
        output_file.unlink()

    result = subprocess.run(
        [sys.executable, str(script), "--profile", profile, "--output", str(output_file)],
        cwd=str(pipeline_dir),
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"{folder_name} failed with code {result.returncode}. "
            f"stderr: {result.stderr} stdout: {result.stdout}"
        )

    if not output_file.exists():
        raise FileNotFoundError(f"Output was not created by {folder_name}: {output_file}")

    return json.loads(output_file.read_text(encoding="utf-8"))


@app.route(route="refresh-all", methods=["POST"])
def refresh_all(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json() if req.get_body() else {}
    except ValueError:
        data = {}

    profile = str(data.get("profile", "azure"))
    timeout_seconds = int(data.get("timeoutSeconds", 180))

    try:
        payload = {
            "pipeline1": _run_pipeline("ML_Pipeline_1", profile, timeout_seconds),
            "pipeline2": _run_pipeline("ML_Pipeline_2", profile, timeout_seconds),
            "pipeline3": _run_pipeline("ML_Pipeline_3", profile, timeout_seconds),
            "pipeline4": _run_pipeline("ML_Pipeline_4", profile, timeout_seconds),
            "pipeline5": _run_pipeline("ML_Pipeline_5", profile, timeout_seconds),
        }
        return func.HttpResponse(
            json.dumps(payload),
            mimetype="application/json",
            status_code=200,
        )
    except Exception as ex:
        return func.HttpResponse(
            json.dumps({"error": str(ex)}),
            mimetype="application/json",
            status_code=500,
        )