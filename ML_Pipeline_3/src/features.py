import pandas as pd

from .db import run_query


RESIDENT_SQL = """
with edu as (
  select resident_id, avg(progress_percent) as edu_progress_avg, avg(attendance_rate) as attendance_avg
  from education_records
  group by resident_id
),
hlth as (
  select resident_id, avg(general_health_score) as health_avg, avg(energy_level_score) as energy_avg
  from health_wellbeing_records
  group by resident_id
),
proc as (
  select resident_id,
         avg(session_duration_minutes) as session_minutes_avg,
         avg(case when progress_noted then 1 else 0 end) as progress_noted_rate,
         avg(case when concerns_flagged then 1 else 0 end) as concerns_rate
  from process_recordings
  group by resident_id
)
select
  r.resident_id,
  r.case_status,
  r.reintegration_status,
  r.current_risk_level,
  coalesce(e.edu_progress_avg, 0) as edu_progress_avg,
  coalesce(e.attendance_avg, 0) as attendance_avg,
  coalesce(h.health_avg, 0) as health_avg,
  coalesce(h.energy_avg, 0) as energy_avg,
  coalesce(p.session_minutes_avg, 0) as session_minutes_avg,
  coalesce(p.progress_noted_rate, 0) as progress_noted_rate,
  coalesce(p.concerns_rate, 0) as concerns_rate
from residents r
left join edu e on e.resident_id = r.resident_id
left join hlth h on h.resident_id = r.resident_id
left join proc p on p.resident_id = r.resident_id;
"""


def build_frame(engine):
    df = run_query(RESIDENT_SQL, engine)
    ready_values = {"Completed", "In Progress"}
    df["approaching_readiness"] = df["reintegration_status"].isin(ready_values).astype(int)
    return df


def split_xy(df: pd.DataFrame):
    X = df[
        [
            "current_risk_level",
            "edu_progress_avg",
            "attendance_avg",
            "health_avg",
            "energy_avg",
            "session_minutes_avg",
            "progress_noted_rate",
            "concerns_rate",
        ]
    ].copy()
    y = df["approaching_readiness"].copy()
    return X, y
