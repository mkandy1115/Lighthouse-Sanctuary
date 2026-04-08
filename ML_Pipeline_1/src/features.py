import pandas as pd

from .db import run_query


DONOR_TIMELINE_SQL = """
with donation_events as (
    select
        d.donation_id,
        d.supporter_id,
        d.donation_date::date as donation_date,
        coalesce(d.amount, d.estimated_value, 0)::numeric as value_amount,
        d.is_recurring,
        coalesce(d.channel_source, 'Unknown') as channel_source,
        coalesce(d.donation_type, 'Unknown') as donation_type,
        lead(d.donation_date::date) over (
            partition by d.supporter_id
            order by d.donation_date::date
        ) as next_donation_date,
        min(d.donation_date::date) over (partition by d.supporter_id) as first_donation_date,
        count(*) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as donation_count_to_date,
        sum(coalesce(d.amount, d.estimated_value, 0)) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as amount_sum_to_date,
        avg(coalesce(d.amount, d.estimated_value, 0)) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as amount_avg_to_date,
        stddev_pop(coalesce(d.amount, d.estimated_value, 0)) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as amount_std_to_date,
        avg(case when d.is_recurring then 1 else 0 end) over (
            partition by d.supporter_id
            order by d.donation_date::date
            rows between unbounded preceding and current row
        ) as recurring_rate_to_date
    from donations d
),
global_date as (
    select max(donation_date)::date as max_donation_date from donations
)
select
    de.donation_id,
    de.supporter_id,
    de.donation_date as snapshot_date,
    de.next_donation_date,
    de.first_donation_date,
    de.donation_type,
    de.channel_source,
    de.donation_count_to_date,
    de.amount_sum_to_date,
    de.amount_avg_to_date,
    de.amount_std_to_date,
    de.recurring_rate_to_date,
    (de.donation_date - de.first_donation_date)::int as tenure_days,
    (de.donation_date - lag(de.donation_date) over (
        partition by de.supporter_id
        order by de.donation_date
    ))::int as recency_days,
    s.supporter_type,
    coalesce(s.relationship_type, 'Unknown') as relationship_type,
    coalesce(s.region, 'Unknown') as region,
    coalesce(s.acquisition_channel, 'Unknown') as acquisition_channel,
    gd.max_donation_date
from donation_events de
join supporters s on s.supporter_id = de.supporter_id
cross join global_date gd
order by de.supporter_id, de.donation_date;
"""


def build_donor_training_frame(engine, churn_window_days: int = 365) -> pd.DataFrame:
    df = run_query(DONOR_TIMELINE_SQL, engine)
    if df.empty:
        return df

    df["snapshot_date"] = pd.to_datetime(df["snapshot_date"])
    df["next_donation_date"] = pd.to_datetime(df["next_donation_date"])
    df["first_donation_date"] = pd.to_datetime(df["first_donation_date"])
    df["max_donation_date"] = pd.to_datetime(df["max_donation_date"])

    cutoff_date = df["max_donation_date"] - pd.to_timedelta(churn_window_days, unit="D")
    has_full_label_window = df["snapshot_date"] <= cutoff_date

    days_to_next = (df["next_donation_date"] - df["snapshot_date"]).dt.days
    df["churn_365"] = ((df["next_donation_date"].isna()) | (days_to_next > churn_window_days)).astype(int)
    df.loc[~has_full_label_window, "churn_365"] = pd.NA

    numeric_fill_zero = [
        "amount_sum_to_date",
        "amount_avg_to_date",
        "amount_std_to_date",
        "recurring_rate_to_date",
        "recency_days",
    ]
    for col in numeric_fill_zero:
        df[col] = df[col].fillna(0)

    model_df = df[df["churn_365"].notna()].copy()
    model_df["churn_365"] = model_df["churn_365"].astype(int)
    return model_df


def split_feature_target(df: pd.DataFrame):
    target_col = "churn_365"
    drop_cols = {"churn_365", "next_donation_date", "max_donation_date"}
    feature_cols = [c for c in df.columns if c not in drop_cols]
    X = df[feature_cols].copy()
    y = df[target_col].copy()
    return X, y


def select_explanatory_features(df: pd.DataFrame) -> pd.DataFrame:
    explanatory_cols = [
        "donation_count_to_date",
        "amount_avg_to_date",
        "amount_sum_to_date",
        "recurring_rate_to_date",
        "recency_days",
        "tenure_days",
        "supporter_type",
        "relationship_type",
        "region",
        "acquisition_channel",
        "channel_source",
        "donation_type",
    ]
    keep_cols = [c for c in explanatory_cols if c in df.columns]
    return df[keep_cols].copy()
