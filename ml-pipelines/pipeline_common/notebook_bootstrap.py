"""Executed via exec() from the first code cell of each ML pipeline notebook.

Ensures dependencies and sys.path so graders can open any ``ML_Pipeline_*/*.ipynb`` and Run All
without manual venv selection or pip commands.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ML_PIPELINES_ROOT = Path(__file__).resolve().parent.parent
_REQUIREMENTS = ML_PIPELINES_ROOT / "requirements.txt"
_VENV = ML_PIPELINES_ROOT / ".venv"


def _venv_python() -> Path:
    if sys.platform == "win32":
        return _VENV / "Scripts" / "python.exe"
    return _VENV / "bin" / "python"


def _venv_site_packages() -> Path | None:
    if not _VENV.is_dir():
        return None
    lib = _VENV / "lib"
    if not lib.is_dir():
        return None
    found = sorted(lib.glob("python*/site-packages"))
    return found[0] if found else None


def _prepend_venv_site() -> None:
    sp = _venv_site_packages()
    if sp and sp.is_dir():
        s = str(sp)
        while s in sys.path:
            sys.path.remove(s)
        sys.path.insert(0, s)


def _pip_install(executable: str | Path) -> None:
    subprocess.run(
        [
            str(executable),
            "-m",
            "pip",
            "install",
            "-q",
            "--disable-pip-version-check",
            "-r",
            str(_REQUIREMENTS),
        ],
        check=True,
        capture_output=True,
        text=True,
    )


def _deps_ok() -> bool:
    try:
        import duckdb  # noqa: F401
        import sklearn  # noqa: F401
    except ImportError:
        return False
    return True


def _ensure_dependencies() -> None:
    if _deps_ok():
        return
    try:
        _pip_install(sys.executable)
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    if _deps_ok():
        return
    if not _VENV.is_dir():
        subprocess.run([sys.executable, "-m", "venv", str(_VENV)], check=True)
    _pip_install(_venv_python())
    _prepend_venv_site()
    if not _deps_ok():
        raise ImportError(
            "Could not install pipeline dependencies. Ensure network access for pip, or run:\n"
            f"  {sys.executable} -m pip install -r {_REQUIREMENTS}"
        )


def _pipeline_root(ns: dict) -> Path:
    nb = ns.get("__vsc_ipynb_file__") or os.environ.get("VSCODE_NOTEBOOK_FILE")
    if nb:
        root = Path(nb).resolve().parent
        if (root / "src" / "db.py").is_file():
            return root
    cwd = Path.cwd().resolve()
    if (cwd / "src" / "db.py").is_file():
        return cwd
    env = os.environ.get("ML_PIPELINE_DIR")
    if env:
        p = Path(env).expanduser().resolve()
        if (p / "src" / "db.py").is_file():
            return p
    raise RuntimeError(
        "Could not locate this pipeline folder (expected ML_Pipeline_*/ with src/db.py). "
        "Open the notebook in VS Code/Cursor and use Run All, run Jupyter from inside "
        "ML_Pipeline_N, or set ML_PIPELINE_DIR to that folder."
    )


def _bootstrap(ns: dict) -> None:
    _ensure_dependencies()
    pipeline_root = _pipeline_root(ns)
    os.chdir(pipeline_root)
    for p in (str(pipeline_root), str(ML_PIPELINES_ROOT)):
        if p not in sys.path:
            sys.path.insert(0, p)
    _prepend_venv_site()
    ns["PIPELINE_ROOT"] = pipeline_root
    ns["ML_PIPELINES_ROOT"] = ML_PIPELINES_ROOT
    ns["PROJECT_ROOT"] = pipeline_root


_bootstrap(globals())
