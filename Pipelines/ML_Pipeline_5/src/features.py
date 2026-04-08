import pandas as pd

from .db import run_query


DATA_SQL = """
with alloc_sum as (
  select donation_id, sum(amount_allocated) as total_allocated
  from donation_allocations
  group by donation_id
),
alloc_pivot as (
  select
    da.donation_id,
    sum(case when da.program_area = 'Education' then da.amount_allocated else 0 end) as alloc_education,
    sum(case when da.program_area = 'Wellbeing' then da.amount_allocated else 0 end) as alloc_wellbeing,
    sum(case when da.program_area = 'Operations' then da.amount_allocated else 0 end) as alloc_operations,
    sum(case when da.program_area = 'Transport' then da.amount_allocated else 0 end) as alloc_transport,
    sum(case when da.program_area = 'Maintenance' then da.amount_allocated else 0 end) as alloc_maintenance,
    sum(case when da.program_area = 'Outreach' then da.amount_allocated else 0 end) as alloc_outreach
  from donation_allocations da
  group by da.donation_id
)
select
  d.donation_id,
  d.supporter_id,
  d.donation_date::date as donation_date,
  coalesce(d.amount, d.estimated_value, 0)::float as donation_value,
  d.is_recurring,
  coalesce(d.channel_source, 'Unknown') as channel_source,
  coalesce(d.donation_type, 'Unknown') as donation_type,
  coalesce(d.campaign_name, 'None') as campaign_name,
  coalesce(s.supporter_type, 'Unknown') as supporter_type,
  coalesce(s.relationship_type, 'Unknown') as relationship_type,
  coalesce(s.region, 'Unknown') as region,
  coalesce(s.acquisition_channel, 'Unknown') as acquisition_channel,
  coalesce(ap.alloc_education, 0)::float as alloc_education,
  coalesce(ap.alloc_wellbeing, 0)::float as alloc_wellbeing,
  coalesce(ap.alloc_operations, 0)::float as alloc_operations,
  coalesce(ap.alloc_transport, 0)::float as alloc_transport,
  coalesce(ap.alloc_maintenance, 0)::float as alloc_maintenance,
  coalesce(ap.alloc_outreach, 0)::float as alloc_outreach,
  coalesce(a.total_allocated, 0)::float as total_allocated
from donations d
join supporters s on s.supporter_id = d.supporter_id
left join alloc_pivot ap on ap.donation_id = d.donation_id
left join alloc_sum a on a.donation_id = d.donation_id
where coalesce(a.total_allocated, 0) > 0;
"""


def build_frame(engine) -> pd.DataFrame:
    df = run_query(DATA_SQL, engine)
    if df.empty:
        return df

    for c in [
        "alloc_education",
        "alloc_wellbeing",
        "alloc_operations",
        "alloc_transport",
        "alloc_maintenance",
        "alloc_outreach",
    ]:
        df[f"share_{c.replace('alloc_', '')}"] = df[c] / df["total_allocated"]

    share_cols = [c for c in df.columns if c.startswith("share_")]
    df["top_program_area"] = df[share_cols].idxmax(axis=1).str.replace("share_", "", regex=False)
    return df


def split_xy(df: pd.DataFrame):
    X = df[
        [
            "donation_id",
            "supporter_id",
            "donation_value",
            "is_recurring",
            "channel_source",
            "donation_type",
            "campaign_name",
            "supporter_type",
            "relationship_type",
            "region",
            "acquisition_channel",
        ]
    ].copy()
    y_top = df["top_program_area"].copy()
    y_share_education = df["share_education"].copy()
    return X, y_top, y_share_education
