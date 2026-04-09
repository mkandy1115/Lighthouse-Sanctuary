"""Load lighthouse CSV bundles into DuckDB so existing pipeline SQL runs unchanged."""

from __future__ import annotations

import importlib
import os
import subprocess
import sys
from pathlib import Path

import pandas as pd


def _import_duckdb():
    """Import duckdb; if missing, install into the *current* interpreter (same as ``%pip install``)."""
    try:
        return importlib.import_module("duckdb")
    except ImportError:
        if os.environ.get("ML_PIPELINES_NO_AUTO_PIP", "").lower() in ("1", "true", "yes"):
            raise ImportError(
                "duckdb is not installed and ML_PIPELINES_NO_AUTO_PIP is set. "
                f"Install it for this kernel: {sys.executable} -m pip install duckdb"
            ) from None
        proc = subprocess.run(
            [sys.executable, "-m", "pip", "install", "duckdb"],
            capture_output=True,
            text=True,
        )
        if proc.returncode != 0:
            raise ImportError(
                "Could not import duckdb and automatic install failed.\n"
                f"Interpreter: {sys.executable}\n"
                f"pip: {proc.stdout}\n{proc.stderr}\n"
                "Fix: use kernel Python from ml-pipelines/.venv, or run in a cell: %pip install duckdb"
            ) from None
        importlib.invalidate_caches()
        return importlib.import_module("duckdb")


# pipeline_common -> ml-pipelines
_ML_PIPELINES_ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_CSV_DIR = _ML_PIPELINES_ROOT / "lighthouse_csv_v7"


def resolve_csv_directory() -> Path | None:
    """Return ``ml-pipelines/lighthouse_csv_v7`` if it exists; otherwise None.

    No environment variables — data is expected only under the ``ml-pipelines`` package.
    """
    if _DEFAULT_CSV_DIR.is_dir():
        return _DEFAULT_CSV_DIR
    return None


def build_duckdb_from_csv(csv_dir: Path):
    """Register every *.csv in ``csv_dir`` as a DuckDB table (name = file stem)."""
    duckdb = _import_duckdb()

    con = duckdb.connect(database=":memory:")
    paths = sorted(csv_dir.glob("*.csv"))
    if not paths:
        raise FileNotFoundError(f"No CSV files found in {csv_dir}")

    for path in paths:
        table = path.stem
        df = pd.read_csv(path, low_memory=False)
        con.register(table, df)
    return con


def is_duckdb_connection(obj) -> bool:
    # Avoid isinstance(duckdb...) so we don't import duckdb for SQLAlchemy-only runs.
    # C extension uses __module__ "_duckdb"; public package is "duckdb".
    cls = type(obj)
    if cls.__name__ == "DuckDBPyConnection":
        return getattr(cls, "__module__", "").endswith("duckdb")
    return False


def run_query(sql: str, engine) -> pd.DataFrame:
    """Run SQL against either a SQLAlchemy engine or a DuckDB connection."""
    if is_duckdb_connection(engine):
        return engine.sql(sql).df()
    import pandas as pd_
    return pd_.read_sql_query(sql, engine)
