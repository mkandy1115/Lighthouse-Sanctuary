-- psql CSV loader for Azure Database for PostgreSQL
-- Assumes psql is launched from this project directory.
-- Example:
-- psql "host=<server>.postgres.database.azure.com port=5432 dbname=<db> user=<user> password=<pwd> sslmode=require" -f load_csv_psql.sql

\set ON_ERROR_STOP on

begin;

-- Clear tables so script is rerunnable.
truncate table
    donation_allocations,
    in_kind_donation_items,
    donations,
    partner_assignments,
    process_recordings,
    home_visitations,
    education_records,
    health_wellbeing_records,
    intervention_plans,
    incident_reports,
    safehouse_monthly_metrics,
    public_impact_snapshots,
    residents,
    supporters,
    partners,
    social_media_posts,
    safehouses
restart identity cascade;

commit;

-- Parent/reference tables first
\copy safehouses from 'safehouses.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy partners from 'partners.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy supporters from 'supporters.csv' with (format csv, header true, delimiter ',', quote '"', null '');

-- social_media_posts CSV stores some integer-like values as decimals (e.g., 50.0).
create temporary table social_media_posts_stage (
    post_id text,
    platform text,
    platform_post_id text,
    post_url text,
    created_at text,
    day_of_week text,
    post_hour text,
    post_type text,
    media_type text,
    caption text,
    hashtags text,
    num_hashtags text,
    mentions_count text,
    has_call_to_action text,
    call_to_action_type text,
    content_topic text,
    sentiment_tone text,
    caption_length text,
    features_resident_story text,
    campaign_name text,
    is_boosted text,
    boost_budget_php text,
    impressions text,
    reach text,
    likes text,
    comments text,
    shares text,
    saves text,
    click_throughs text,
    video_views text,
    engagement_rate text,
    profile_visits text,
    donation_referrals text,
    estimated_donation_value_php text,
    follower_count_at_post text,
    watch_time_seconds text,
    avg_view_duration_seconds text,
    subscriber_count_at_post text,
    forwards text
);

\copy social_media_posts_stage from 'social_media_posts.csv' with (format csv, header true, delimiter ',', quote '"', null '');

insert into social_media_posts (
    post_id, platform, platform_post_id, post_url, created_at, day_of_week, post_hour, post_type, media_type, caption, hashtags,
    num_hashtags, mentions_count, has_call_to_action, call_to_action_type, content_topic, sentiment_tone, caption_length,
    features_resident_story, campaign_name, is_boosted, boost_budget_php, impressions, reach, likes, comments, shares, saves,
    click_throughs, video_views, engagement_rate, profile_visits, donation_referrals, estimated_donation_value_php,
    follower_count_at_post, watch_time_seconds, avg_view_duration_seconds, subscriber_count_at_post, forwards
)
select
    nullif(post_id, '')::integer,
    nullif(platform, ''),
    nullif(platform_post_id, ''),
    nullif(post_url, ''),
    nullif(created_at, '')::timestamp,
    nullif(day_of_week, ''),
    nullif(post_hour, '')::integer,
    nullif(post_type, ''),
    nullif(media_type, ''),
    nullif(caption, ''),
    nullif(hashtags, ''),
    nullif(num_hashtags, '')::integer,
    nullif(mentions_count, '')::integer,
    case when nullif(has_call_to_action, '') is null then false else nullif(has_call_to_action, '')::boolean end,
    nullif(call_to_action_type, ''),
    nullif(content_topic, ''),
    nullif(sentiment_tone, ''),
    nullif(caption_length, '')::integer,
    case when nullif(features_resident_story, '') is null then false else nullif(features_resident_story, '')::boolean end,
    nullif(campaign_name, ''),
    case when nullif(is_boosted, '') is null then false else nullif(is_boosted, '')::boolean end,
    nullif(boost_budget_php, '')::numeric(12,2),
    nullif(impressions, '')::integer,
    nullif(reach, '')::integer,
    nullif(likes, '')::integer,
    nullif(comments, '')::integer,
    nullif(shares, '')::integer,
    nullif(saves, '')::integer,
    nullif(click_throughs, '')::integer,
    round(nullif(video_views, '')::numeric)::integer,
    nullif(engagement_rate, '')::numeric(8,4),
    nullif(profile_visits, '')::integer,
    round(nullif(donation_referrals, '')::numeric)::integer,
    nullif(estimated_donation_value_php, '')::numeric(14,2),
    nullif(follower_count_at_post, '')::integer,
    round(nullif(watch_time_seconds, '')::numeric)::integer,
    round(nullif(avg_view_duration_seconds, '')::numeric)::integer,
    round(nullif(subscriber_count_at_post, '')::numeric)::integer,
    round(nullif(forwards, '')::numeric)::integer
from social_media_posts_stage;

-- Tables depending on parent tables
\copy residents from 'residents.csv' with (format csv, header true, delimiter ',', quote '"', null '');

-- partner_assignments CSV has safehouse_id values like "8.0".
create temporary table partner_assignments_stage (
    assignment_id text,
    partner_id text,
    safehouse_id text,
    program_area text,
    assignment_start text,
    assignment_end text,
    responsibility_notes text,
    is_primary text,
    status text
);

\copy partner_assignments_stage from 'partner_assignments.csv' with (format csv, header true, delimiter ',', quote '"', null '');

insert into partner_assignments (
    assignment_id, partner_id, safehouse_id, program_area, assignment_start, assignment_end, responsibility_notes, is_primary, status
)
select
    nullif(assignment_id, '')::integer,
    nullif(partner_id, '')::integer,
    round(nullif(safehouse_id, '')::numeric)::integer,
    nullif(program_area, ''),
    nullif(assignment_start, '')::date,
    nullif(assignment_end, '')::date,
    nullif(responsibility_notes, ''),
    case when nullif(is_primary, '') is null then false else nullif(is_primary, '')::boolean end,
    nullif(status, '')
from partner_assignments_stage;

-- Tables depending on donations/residents/safehouses
\copy donations from 'donations.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy in_kind_donation_items from 'in_kind_donation_items.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy donation_allocations from 'donation_allocations.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy process_recordings from 'process_recordings.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy home_visitations from 'home_visitations.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy education_records from 'education_records.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy health_wellbeing_records from 'health_wellbeing_records.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy intervention_plans from 'intervention_plans.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy incident_reports from 'incident_reports.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy safehouse_monthly_metrics from 'safehouse_monthly_metrics.csv' with (format csv, header true, delimiter ',', quote '"', null '');
\copy public_impact_snapshots from 'public_impact_snapshots.csv' with (format csv, header true, delimiter ',', quote '"', null '');

-- Keep identity sequences aligned with imported IDs
select setval(pg_get_serial_sequence('safehouses', 'safehouse_id'), coalesce((select max(safehouse_id) from safehouses), 1), true);
select setval(pg_get_serial_sequence('partners', 'partner_id'), coalesce((select max(partner_id) from partners), 1), true);
select setval(pg_get_serial_sequence('supporters', 'supporter_id'), coalesce((select max(supporter_id) from supporters), 1), true);
select setval(pg_get_serial_sequence('social_media_posts', 'post_id'), coalesce((select max(post_id) from social_media_posts), 1), true);
select setval(pg_get_serial_sequence('residents', 'resident_id'), coalesce((select max(resident_id) from residents), 1), true);
select setval(pg_get_serial_sequence('partner_assignments', 'assignment_id'), coalesce((select max(assignment_id) from partner_assignments), 1), true);
select setval(pg_get_serial_sequence('donations', 'donation_id'), coalesce((select max(donation_id) from donations), 1), true);
select setval(pg_get_serial_sequence('in_kind_donation_items', 'item_id'), coalesce((select max(item_id) from in_kind_donation_items), 1), true);
select setval(pg_get_serial_sequence('donation_allocations', 'allocation_id'), coalesce((select max(allocation_id) from donation_allocations), 1), true);
select setval(pg_get_serial_sequence('process_recordings', 'recording_id'), coalesce((select max(recording_id) from process_recordings), 1), true);
select setval(pg_get_serial_sequence('home_visitations', 'visitation_id'), coalesce((select max(visitation_id) from home_visitations), 1), true);
select setval(pg_get_serial_sequence('education_records', 'education_record_id'), coalesce((select max(education_record_id) from education_records), 1), true);
select setval(pg_get_serial_sequence('health_wellbeing_records', 'health_record_id'), coalesce((select max(health_record_id) from health_wellbeing_records), 1), true);
select setval(pg_get_serial_sequence('intervention_plans', 'plan_id'), coalesce((select max(plan_id) from intervention_plans), 1), true);
select setval(pg_get_serial_sequence('incident_reports', 'incident_id'), coalesce((select max(incident_id) from incident_reports), 1), true);
select setval(pg_get_serial_sequence('safehouse_monthly_metrics', 'metric_id'), coalesce((select max(metric_id) from safehouse_monthly_metrics), 1), true);
select setval(pg_get_serial_sequence('public_impact_snapshots', 'snapshot_id'), coalesce((select max(snapshot_id) from public_impact_snapshots), 1), true);

\echo 'CSV load complete.'
