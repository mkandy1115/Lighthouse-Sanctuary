# ML Runtime Dependencies (System Python)

To run `ML_Pipeline_1..5/run_pipeline.py` with system Python, install:

- `pandas`
- `sqlalchemy`
- `psycopg[binary]`
- `scikit-learn`
- `numpy`
- `python-dotenv` (optional; scripts now safely continue without it)

Example:

```bash
python3 -m pip install pandas sqlalchemy "psycopg[binary]" scikit-learn numpy python-dotenv
```
