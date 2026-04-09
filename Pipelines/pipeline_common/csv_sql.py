"""Load lighthouse CSV bundles into DuckDB so existing pipeline SQL runs unchanged."""

from __future__ import annotations

import os
from pathlib import Path

import pandas as pd

_REPO_ROOT = Path(__file__).resolve().parents[2]


def resolve_csv_directory() -> Path | None:
    """Return CSV directory if ML should read from local files instead of Postgres.

    Priority:
    1. LIGHTHOUSE_CSV_DIR or LIGHTHOUSE_CSV_V7 (explicit path)
    2. <repo>/lighthouse_csv_v7 or <repo>/lighthouse_csv_7 if the folder exists
    3. Otherwise None (use PostgreSQL)

    Set ML_DATA_SOURCE=postgres (or USE_POSTGRES=1) to force Postgres even when a CSV folder exists.
    """
    if os.getenv("ML_DATA_SOURCE", "").strip().lower() == "postgres":
        return None
    if os.getenv("USE_POSTGRES", "").strip().lower() in ("1", "true", "yes"):
        return None

    explicit = os.getenv("LIGHTHOUSE_CSV_DIR") or os.getenv("LIGHTHOUSE_CSV_V7")
    if explicit:
        p = Path(explicit).expanduser().resolve()
        if not p.is_dir():
            raise FileNotFoundError(f"LIGHTHOUSE_CSV_DIR is not a directory: {p}")
        return p

    for name in ("lighthouse_csv_v7", "lighthouse_csv_7"):
        cand = _REPO_ROOT / name
        if cand.is_dir():
            return cand
    return None


def build_duckdb_from_csv(csv_dir: Path):
    """Register every *.csv in ``csv_dir`` as a DuckDB table (name = file stem)."""
    import duckdb

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
    try:
        import duckdb
    except ImportError:
        return False
    return isinstance(obj, duckdb.DuckDBPyConnection)


def run_query(sql: str, engine) -> pd.DataFrame:
    """Run SQL against either a SQLAlchemy engine or a DuckDB connection."""
    if is_duckdb_connection(engine):
        return engine.sql(sql).df()
    import pandas as pd_
    return pd_.read_sql_query(sql, engine)
