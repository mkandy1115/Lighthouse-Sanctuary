import getpass
import os
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(_path: Path) -> None:
        return


def load_env(dotenv_path: str = ".env") -> None:
    path = Path(dotenv_path)
    if path.exists():
        load_dotenv(path)


def _get_value(key_base: str, profile_name: str) -> str:
    profile_key = f"{profile_name.upper()}_{key_base}"
    return os.getenv(profile_key, os.getenv(key_base, ""))


def build_engine(profile_name: str = "local"):
    host = _get_value("DB_HOST", profile_name) or "localhost"
    port = _get_value("DB_PORT", profile_name) or "5432"
    name = _get_value("DB_NAME", profile_name) or "lh_sanctuary"
    user = _get_value("DB_USER", profile_name) or getpass.getuser()
    password = _get_value("DB_PASSWORD", profile_name)
    sslmode = _get_value("DB_SSLMODE", profile_name) or ("require" if profile_name == "azure" else "prefer")
    auth = f"{user}:{password}" if password else user
    url = f"postgresql+psycopg://{auth}@{host}:{port}/{name}?sslmode={sslmode}"
    return create_engine(url, pool_pre_ping=True, future=True)


def run_query(sql: str, engine) -> pd.DataFrame:
    return pd.read_sql_query(sql, engine)
