import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import azure.functions as func

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

BASE_DIR = Path(__file__).resolve().parent


def _subprocess_env() -> dict[str, str]:
    """Match the Function host's import path so pip deps (e.g. pandas) work in child processes."""
    env = os.environ.copy()
    paths = [p for p in sys.path if p]
    existing = env.get("PYTHONPATH", "")
    if existing:
        paths = existing.split(os.pathsep) + paths
    # De-dupe while preserving order
    merged = list(dict.fromkeys(paths))
    env["PYTHONPATH"] = os.pathsep.join(merged)
    return env


def _runtime_output_dir() -> Path:
    """Azure wwwroot is read-only; never write pipeline JSON under wwwroot."""
    # WEBSITE_INSTANCE_ID is set on Azure App Service / Functions (including Flex).
    if os.name != "nt" and os.environ.get("WEBSITE_INSTANCE_ID"):
        d = Path("/tmp") / "ml_pipeline_run"
    else:
        root = os.environ.get("TMPDIR") or os.environ.get("TEMP") or tempfile.gettempdir()
        d = Path(root) / "ml_pipeline_run"
    d.mkdir(parents=True, exist_ok=True)
    return d.resolve()


def _run_pipeline(folder_name: str, profile: str, timeout_seconds: int) -> dict:
    pipeline_dir = BASE_DIR / folder_name
    script = pipeline_dir / "run_pipeline.py"
    if not script.exists():
        raise FileNotFoundError(f"Pipeline script not found for {folder_name}: {script}")

    out_dir = _runtime_output_dir()
    output_file = out_dir / f"{folder_name}.json"
    if output_file.exists():
        output_file.unlink()

    result = subprocess.run(
        [sys.executable, str(script), "--profile", profile, "--output", str(output_file)],
        cwd=str(pipeline_dir),
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        check=False,
        env=_subprocess_env(),
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