import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(_path: Path) -> None:
        return

_PIPELINES = Path(__file__).resolve().parents[2]
if str(_PIPELINES) not in sys.path:
    sys.path.insert(0, str(_PIPELINES))

from pipeline_common.csv_sql import (  # noqa: E402
    build_duckdb_from_csv,
    resolve_csv_directory,
    run_query,
)


def load_env(dotenv_path: str = ".env") -> None:
    path = Path(dotenv_path)
    if path.exists():
        load_dotenv(path)


def build_engine(profile_name: str = "local"):
    _ = profile_name
    csv_dir = resolve_csv_directory()
    if csv_dir is None:
        raise FileNotFoundError(
            "No lighthouse CSV bundle found. Add CSV files under ml-pipelines/lighthouse_csv_v7."
        )
    return build_duckdb_from_csv(csv_dir)
