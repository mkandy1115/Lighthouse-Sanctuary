import pandas as pd

from .db import run_query


DONOR_SQL = """
with base as (
    select
        d.supporter_id,
        d.donation_date::date as donation_date,
        coalesce(d.amount, d.estimated_value, 0)::numeric as donation_value,
        lead(d.donation_date::date) over (partition by d.supporter_id order by d.donation_date::date) as next_date,
        sum(coalesce(d.amount, d.estimated_value, 0)) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as amount_to_date,
        avg(coalesce(d.amount, d.estimated_value, 0)) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as avg_amount_to_date,
        count(*) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as donation_count_to_date
    from donations d
),
future_sum as (
    select
        b.supporter_id,
        b.donation_date,
        (
            select coalesce(sum(coalesce(d2.amount, d2.estimated_value, 0)), 0)
            from donations d2
            where d2.supporter_id = b.supporter_id
              and d2.donation_date::date > b.donation_date
              and d2.donation_date::date <= b.donation_date + interval '180 days'
        ) as amount_next_180d
    from base b
),
mx as (select max(donation_date::date) as max_date from donations)
select
    b.supporter_id,
    b.donation_date as snapshot_date,
    b.donation_value,
    b.amount_to_date,
    b.avg_amount_to_date,
    b.donation_count_to_date,
    coalesce(s.supporter_type, 'Unknown') as supporter_type,
    coalesce(s.relationship_type, 'Unknown') as relationship_type,
    coalesce(s.region, 'Unknown') as region,
    coalesce(s.acquisition_channel, 'Unknown') as acquisition_channel,
    f.amount_next_180d,
    mx.max_date
from base b
join future_sum f on f.supporter_id = b.supporter_id and f.donation_date = b.donation_date
join supporters s on s.supporter_id = b.supporter_id
cross join mx
order by b.supporter_id, b.donation_date;
"""


def build_frame(engine) -> pd.DataFrame:
    df = run_query(DONOR_SQL, engine)
    df["snapshot_date"] = pd.to_datetime(df["snapshot_date"])
    df["max_date"] = pd.to_datetime(df["max_date"])
    cutoff = df["max_date"] - pd.to_timedelta(180, unit="D")
    df = df[df["snapshot_date"] <= cutoff].copy()
    df["uplift_180d"] = (df["amount_next_180d"] > df["donation_value"]).astype(int)
    return df


def split_xy(df: pd.DataFrame):
    feature_cols = [
        "supporter_id",
        "donation_value",
        "amount_to_date",
        "avg_amount_to_date",
        "donation_count_to_date",
        "supporter_type",
        "relationship_type",
        "region",
        "acquisition_channel",
    ]
    X = df[feature_cols].copy()
    y = df["uplift_180d"].copy()
    return X, y
