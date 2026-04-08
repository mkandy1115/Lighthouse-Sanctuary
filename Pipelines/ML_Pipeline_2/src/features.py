import pandas as pd

from .db import run_query


POST_SQL = """
select
    post_id,
    platform,
    day_of_week,
    post_hour,
    post_type,
    media_type,
    has_call_to_action,
    coalesce(call_to_action_type, 'None') as call_to_action_type,
    coalesce(content_topic, 'Unknown') as content_topic,
    coalesce(sentiment_tone, 'Unknown') as sentiment_tone,
    coalesce(caption_length, 0) as caption_length,
    coalesce(num_hashtags, 0) as num_hashtags,
    coalesce(mentions_count, 0) as mentions_count,
    is_boosted,
    coalesce(boost_budget_php, 0) as boost_budget_php,
    coalesce(engagement_rate, 0)::float as engagement_rate,
    coalesce(donation_referrals, 0)::int as donation_referrals
from social_media_posts
where created_at is not null;
"""


def build_post_frame(engine) -> pd.DataFrame:
    return run_query(POST_SQL, engine)


def feature_target_frames(df: pd.DataFrame):
    features = [
        "platform",
        "day_of_week",
        "post_hour",
        "post_type",
        "media_type",
        "has_call_to_action",
        "call_to_action_type",
        "content_topic",
        "sentiment_tone",
        "caption_length",
        "num_hashtags",
        "mentions_count",
        "is_boosted",
        "boost_budget_php",
    ]
    X = df[features].copy()
    y_engagement = df["engagement_rate"].copy()
    y_referrals = df["donation_referrals"].copy()
    y_referrals_binary = (y_referrals > 0).astype(int)
    return X, y_engagement, y_referrals, y_referrals_binary
