import getpass
import os
import sys
from pathlib import Path

from sqlalchemy import create_engine

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


def _get_value(key_base: str, profile_name: str) -> str:
    profile_key = f"{profile_name.upper()}_{key_base}"
    return os.getenv(profile_key, os.getenv(key_base, ""))


def build_engine(profile_name: str = "local"):
    csv_dir = resolve_csv_directory()
    if csv_dir is not None:
        return build_duckdb_from_csv(csv_dir)

    host = _get_value("DB_HOST", profile_name) or "localhost"
    port = _get_value("DB_PORT", profile_name) or "5432"
    name = _get_value("DB_NAME", profile_name) or "lh_sanctuary"
    user = _get_value("DB_USER", profile_name) or getpass.getuser()
    password = _get_value("DB_PASSWORD", profile_name)
    sslmode = _get_value("DB_SSLMODE", profile_name) or (
        "require" if profile_name == "azure" else "prefer"
    )

    required = {
        "DB_HOST": host,
        "DB_PORT": port,
        "DB_NAME": name,
        "DB_USER": user,
    }
    if password:
        required["DB_PASSWORD"] = password

    missing = [
        key
        for key, value in required.items()
        if not value
    ]
    if missing:
        raise ValueError(f"Missing DB config values: {missing}")

    if password:
        auth = f"{user}:{password}"
    else:
        auth = f"{user}"
    url = f"postgresql+psycopg://{auth}@{host}:{port}/{name}?sslmode={sslmode}"
    return create_engine(url, pool_pre_ping=True, future=True)
