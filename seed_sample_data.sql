-- Sample seed data for Supabase/PostgreSQL
-- Run AFTER schema_postgres_supabase.sql
-- Inserts 10+ rows across related tables with valid FK references.

begin;

insert into safehouses
    (safehouse_id, safehouse_code, name, region, city, province, country, open_date, status, capacity_girls, capacity_staff, current_occupancy, notes)
values
    (1, 'SH01', 'Lighthouse Safehouse 1', 'Luzon', 'Quezon City', 'Metro Manila', 'Philippines', '2022-01-01', 'Active', 10, 5, 8, 'Primary pilot safehouse'),
    (2, 'SH02', 'Lighthouse Safehouse 2', 'Visayas', 'Cebu City', 'Cebu', 'Philippines', '2022-03-15', 'Active', 12, 6, 10, null),
    (3, 'SH03', 'Lighthouse Safehouse 3', 'Mindanao', 'Davao City', 'Davao del Sur', 'Philippines', '2022-06-01', 'Active', 8, 4, 6, null)
on conflict (safehouse_id) do nothing;

insert into partners
    (partner_id, partner_name, partner_type, role_type, contact_name, email, phone, region, status, start_date, end_date, notes)
values
    (1, 'Hope Partners Org', 'Organization', 'SafehouseOps', 'Ana Reyes', 'ana.reyes@hopepartners.ph', '+63 912 000 1001', 'Luzon', 'Active', '2022-01-01', null, 'Operations support'),
    (2, 'Elena Cruz', 'Individual', 'Education', 'Elena Cruz', 'elena.cruz@eduhelp.ph', '+63 912 000 1002', 'Mindanao', 'Active', '2022-02-01', null, 'Tutoring partner')
on conflict (partner_id) do nothing;

insert into supporters
    (supporter_id, supporter_type, display_name, organization_name, first_name, last_name, relationship_type, region, country, email, phone, status, created_at, first_donation_date, acquisition_channel)
values
    (1, 'MonetaryDonor', 'Noah Chen', null, 'Noah', 'Chen', 'International', 'Luzon', 'USA', 'noah.chen@example.com', '+1 206 555 0101', 'Active', '2024-01-10 09:00:00', '2024-02-01', 'SocialMedia'),
    (2, 'InKindDonor', 'Emma Evans', null, 'Emma', 'Evans', 'Local', 'Visayas', 'Philippines', 'emma.evans@example.ph', '+63 917 555 0102', 'Active', '2024-01-15 10:00:00', '2024-03-10', 'Website'),
    (3, 'Volunteer', 'June Usman', null, 'June', 'Usman', 'Local', 'Mindanao', 'Philippines', 'june.usman@example.ph', '+63 917 555 0103', 'Active', '2024-01-20 11:00:00', null, 'PartnerReferral')
on conflict (supporter_id) do nothing;

insert into social_media_posts
    (post_id, platform, platform_post_id, post_url, created_at, day_of_week, post_hour, post_type, media_type, caption, hashtags, num_hashtags, mentions_count, has_call_to_action, call_to_action_type, content_topic, sentiment_tone, caption_length, features_resident_story, campaign_name, is_boosted, boost_budget_php, impressions, reach, likes, comments, shares, saves, click_throughs, video_views, engagement_rate, profile_visits, donation_referrals, estimated_donation_value_php, follower_count_at_post, watch_time_seconds, avg_view_duration_seconds, subscriber_count_at_post, forwards)
values
    (1, 'Facebook', 'fb_100001', 'https://facebook.com/lighthouse/posts/100001', '2024-04-08 14:30:00', 'Monday', 14, 'FundraisingAppeal', 'Photo', 'Help us support education supplies this month.', '#HopeForGirls,#DonateNow', 2, 1, true, 'DonateNow', 'Education', 'Hopeful', 46, false, 'Back to School', false, null, 3500, 2200, 310, 25, 40, 18, 72, null, 0.1705, 85, 3, 4200.00, 5100, null, null, null, null),
    (2, 'Instagram', 'ig_200001', 'https://instagram.com/p/200001', '2024-04-10 18:00:00', 'Wednesday', 18, 'ImpactStory', 'Video', 'A story of progress and resilience.', '#EndTrafficking,#SafehouseLife', 2, 0, true, 'LearnMore', 'DonorImpact', 'Emotional', 35, true, null, true, 1200.00, 9800, 7200, 640, 90, 110, 80, 130, 4200, 0.1167, 240, 4, 5800.00, 8450, null, null, null, null)
on conflict (post_id) do nothing;

insert into donations
    (donation_id, supporter_id, donation_type, donation_date, is_recurring, campaign_name, channel_source, currency_code, amount, estimated_value, impact_unit, notes, referral_post_id)
values
    (1, 1, 'Monetary', '2024-04-11', false, 'Back to School', 'SocialMedia', 'PHP', 2500.00, 2500.00, 'pesos', 'General fund support', 1),
    (2, 1, 'Monetary', '2024-05-15', true, 'Back to School', 'Direct', 'PHP', 1500.00, 1500.00, 'pesos', 'Monthly pledge', null),
    (3, 2, 'InKind', '2024-04-20', false, null, 'Event', null, null, 3200.00, 'items', 'School and hygiene kits', null),
    (4, 3, 'Time', '2024-04-22', false, null, 'Campaign', null, null, 12.00, 'hours', 'Weekend mentoring', 2)
on conflict (donation_id) do nothing;

insert into in_kind_donation_items
    (item_id, donation_id, item_name, item_category, quantity, unit_of_measure, estimated_unit_value, intended_use, received_condition)
values
    (1, 3, 'School Kits', 'SchoolMaterials', 20, 'sets', 120.00, 'Education', 'New'),
    (2, 3, 'Hygiene Packs', 'Hygiene', 40, 'packs', 20.00, 'Hygiene', 'Good')
on conflict (item_id) do nothing;

insert into partner_assignments
    (assignment_id, partner_id, safehouse_id, program_area, assignment_start, assignment_end, responsibility_notes, is_primary, status)
values
    (1, 1, 1, 'Operations', '2022-01-01', null, 'Facility operations and staffing coordination', true, 'Active'),
    (2, 2, 3, 'Education', '2022-02-15', null, 'Education planning and tutoring support', true, 'Active')
on conflict (assignment_id) do nothing;

insert into residents
    (resident_id, case_control_no, internal_code, safehouse_id, case_status, sex, date_of_birth, birth_status, place_of_birth, religion, case_category, sub_cat_orphaned, sub_cat_trafficked, sub_cat_child_labor, sub_cat_physical_abuse, sub_cat_sexual_abuse, sub_cat_osaec, sub_cat_cicl, sub_cat_at_risk, sub_cat_street_child, sub_cat_child_with_hiv, is_pwd, pwd_type, has_special_needs, special_needs_diagnosis, family_is_4ps, family_solo_parent, family_indigenous, family_parent_pwd, family_informal_settler, date_of_admission, age_upon_admission, present_age, length_of_stay, referral_source, referring_agency_person, date_colb_registered, date_colb_obtained, assigned_social_worker, initial_case_assessment, date_case_study_prepared, reintegration_type, reintegration_status, initial_risk_level, current_risk_level, date_enrolled, date_closed, created_at, notes_restricted)
values
    (1, 'C1001', 'LS-1001', 1, 'Active', 'F', '2010-05-12', 'Marital', 'Quezon City', 'Roman Catholic', 'Neglected', false, false, false, false, true, false, false, true, false, false, false, null, false, null, true, false, false, false, false, '2024-01-05', '13 Years 7 months', '15 Years 11 months', '1 Years 3 months', 'Government Agency', 'DSWD QC', '2024-02-10', '2024-03-10', 'SW-01', 'For Reunification', '2024-01-20', 'Family Reunification', 'In Progress', 'High', 'Medium', '2024-01-05', null, '2024-01-05 00:00:00', null),
    (2, 'C1002', 'LS-1002', 2, 'Active', 'F', '2012-11-03', 'Non-Marital', 'Cebu City', 'Evangelical', 'Foundling', true, false, false, false, false, false, false, false, true, false, false, null, false, null, false, true, false, false, false, '2024-02-10', '11 Years 3 months', '13 Years 5 months', '1 Years 1 months', 'Police', 'Cebu Police Unit', null, null, 'SW-02', 'For Continued Care', '2024-03-01', 'None', 'Not Started', 'Medium', 'Medium', '2024-02-10', null, '2024-02-10 00:00:00', null),
    (3, 'C1003', 'LS-1003', 3, 'Closed', 'F', '2009-09-21', 'Marital', 'Davao City', 'Islam', 'Surrendered', false, true, false, true, false, false, false, false, false, false, true, 'Hearing', true, 'Mild hearing loss', false, false, true, false, false, '2023-04-15', '13 Years 6 months', '16 Years 2 months', '2 Years 0 months', 'NGO', 'Mindanao Relief Group', '2023-06-02', '2023-07-01', 'SW-03', 'For Foster Care', '2023-05-10', 'Foster Care', 'Completed', 'Critical', 'Low', '2023-04-15', '2025-04-10', '2023-04-15 00:00:00', null)
on conflict (resident_id) do nothing;

insert into process_recordings
    (recording_id, resident_id, session_date, social_worker, session_type, session_duration_minutes, emotional_state_observed, emotional_state_end, session_narrative, interventions_applied, follow_up_actions, progress_noted, concerns_flagged, referral_made, notes_restricted)
values
    (1, 1, '2024-04-05', 'SW-01', 'Individual', 60, 'Anxious', 'Hopeful', 'Resident discussed school adjustment and trust concerns.', 'Healing', 'Schedule follow-up session', true, false, false, null),
    (2, 2, '2024-04-09', 'SW-02', 'Group', 75, 'Withdrawn', 'Calm', 'Group activity focused on communication skills.', 'Teaching', 'Coordinate with education partner', true, false, false, null)
on conflict (recording_id) do nothing;

insert into home_visitations
    (visitation_id, resident_id, visit_date, social_worker, visit_type, location_visited, family_members_present, purpose, observations, family_cooperation_level, safety_concerns_noted, follow_up_needed, follow_up_notes, visit_outcome)
values
    (1, 1, '2024-04-12', 'SW-01', 'Routine Follow-Up', 'Barangay Hall - Quezon City', 'Mother and aunt', 'Routine follow-up for reunification readiness', 'Home is stable and supportive.', 'Cooperative', false, true, 'Second follow-up in 30 days', 'Favorable'),
    (2, 3, '2024-01-20', 'SW-03', 'Reintegration Assessment', 'Davao City residence', 'Foster guardian', 'Final assessment before placement', 'Some concerns about school continuity.', 'Neutral', true, true, 'Coordinate with school enrollment support', 'Needs Improvement')
on conflict (visitation_id) do nothing;

insert into education_records
    (education_record_id, resident_id, record_date, education_level, school_name, enrollment_status, attendance_rate, progress_percent, completion_status, notes)
values
    (1, 1, '2024-04-01', 'Secondary', 'Quezon National High School', 'Enrolled', 0.920, 68.50, 'InProgress', 'Consistent attendance'),
    (2, 2, '2024-04-01', 'Primary', 'Cebu City Learning Center', 'Enrolled', 0.810, 54.20, 'InProgress', 'Needs reading support')
on conflict (education_record_id) do nothing;

insert into health_wellbeing_records
    (health_record_id, resident_id, record_date, general_health_score, nutrition_score, sleep_quality_score, energy_level_score, height_cm, weight_kg, bmi, medical_checkup_done, dental_checkup_done, psychological_checkup_done, notes)
values
    (1, 1, '2024-04-01', 3.80, 3.70, 3.60, 3.50, 154.20, 44.80, 18.8, true, false, true, 'Stable monthly checkup'),
    (2, 2, '2024-04-01', 3.40, 3.10, 3.20, 3.00, 147.10, 39.20, 18.1, true, true, false, 'Mild sleep inconsistency')
on conflict (health_record_id) do nothing;

insert into intervention_plans
    (plan_id, resident_id, plan_category, plan_description, services_provided, target_value, target_date, status, case_conference_date, created_at, updated_at)
values
    (1, 1, 'Reintegration', 'Strengthen family relationship and school continuity plan', 'Caring, Healing, Teaching', 1.00, '2024-08-01', 'In Progress', '2024-04-03', '2024-04-03 00:00:00', '2024-04-15 00:00:00'),
    (2, 2, 'Education', 'Improve attendance and literacy progression', 'Teaching', 0.90, '2024-09-01', 'Open', '2024-04-03', '2024-04-03 00:00:00', '2024-04-10 00:00:00')
on conflict (plan_id) do nothing;

insert into incident_reports
    (incident_id, resident_id, safehouse_id, incident_date, incident_type, severity, description, response_taken, resolved, resolution_date, reported_by, follow_up_required)
values
    (1, 1, 1, '2024-04-18', 'Behavioral', 'Low', 'Minor conflict with peer during study period.', 'Conflict mediation and counseling follow-up.', true, '2024-04-19', 'SW-01', false),
    (2, 2, 2, '2024-04-20', 'Medical', 'Medium', 'Resident reported dizziness and fatigue.', 'Medical checkup conducted and rest ordered.', true, '2024-04-22', 'SW-02', true)
on conflict (incident_id) do nothing;

insert into safehouse_monthly_metrics
    (metric_id, safehouse_id, month_start, month_end, active_residents, avg_education_progress, avg_health_score, process_recording_count, home_visitation_count, incident_count, notes)
values
    (1, 1, '2024-04-01', '2024-04-30', 8, 67.20, 3.70, 12, 4, 1, 'Stable month'),
    (2, 2, '2024-04-01', '2024-04-30', 10, 58.10, 3.40, 10, 3, 1, 'Education support expanded'),
    (3, 3, '2024-04-01', '2024-04-30', 6, 62.50, 3.80, 8, 2, 0, 'No major incidents')
on conflict (metric_id) do nothing;

insert into public_impact_snapshots
    (snapshot_id, snapshot_date, headline, summary_text, metric_payload_json, is_published, published_at)
values
    (1, '2024-04-01', 'April 2024 Impact Update', 'This month we supported residents across three active safehouses with steady progress in education and wellbeing.', '{"month":"2024-04","active_safehouses":3,"active_residents":24,"avg_health_score":3.63,"avg_education_progress":62.6}', true, '2024-05-01')
on conflict (snapshot_id) do nothing;

insert into donation_allocations
    (allocation_id, donation_id, safehouse_id, program_area, amount_allocated, allocation_date, allocation_notes)
values
    (1, 1, 1, 'Education', 1500.00, '2024-04-12', 'Allocated to school fees and supplies'),
    (2, 1, 2, 'Wellbeing', 1000.00, '2024-04-12', 'Allocated to nutrition support'),
    (3, 2, 1, 'Operations', 1500.00, '2024-05-15', 'Recurring operations support'),
    (4, 3, 2, 'Education', 3200.00, '2024-04-21', 'In-kind valuation for materials')
on conflict (allocation_id) do nothing;

-- Keep identity sequences aligned when explicit IDs are inserted.
select setval(pg_get_serial_sequence('safehouses', 'safehouse_id'), coalesce((select max(safehouse_id) from safehouses), 1), true);
select setval(pg_get_serial_sequence('partners', 'partner_id'), coalesce((select max(partner_id) from partners), 1), true);
select setval(pg_get_serial_sequence('supporters', 'supporter_id'), coalesce((select max(supporter_id) from supporters), 1), true);
select setval(pg_get_serial_sequence('social_media_posts', 'post_id'), coalesce((select max(post_id) from social_media_posts), 1), true);
select setval(pg_get_serial_sequence('donations', 'donation_id'), coalesce((select max(donation_id) from donations), 1), true);
select setval(pg_get_serial_sequence('in_kind_donation_items', 'item_id'), coalesce((select max(item_id) from in_kind_donation_items), 1), true);
select setval(pg_get_serial_sequence('partner_assignments', 'assignment_id'), coalesce((select max(assignment_id) from partner_assignments), 1), true);
select setval(pg_get_serial_sequence('residents', 'resident_id'), coalesce((select max(resident_id) from residents), 1), true);
select setval(pg_get_serial_sequence('process_recordings', 'recording_id'), coalesce((select max(recording_id) from process_recordings), 1), true);
select setval(pg_get_serial_sequence('home_visitations', 'visitation_id'), coalesce((select max(visitation_id) from home_visitations), 1), true);
select setval(pg_get_serial_sequence('education_records', 'education_record_id'), coalesce((select max(education_record_id) from education_records), 1), true);
select setval(pg_get_serial_sequence('health_wellbeing_records', 'health_record_id'), coalesce((select max(health_record_id) from health_wellbeing_records), 1), true);
select setval(pg_get_serial_sequence('intervention_plans', 'plan_id'), coalesce((select max(plan_id) from intervention_plans), 1), true);
select setval(pg_get_serial_sequence('incident_reports', 'incident_id'), coalesce((select max(incident_id) from incident_reports), 1), true);
select setval(pg_get_serial_sequence('safehouse_monthly_metrics', 'metric_id'), coalesce((select max(metric_id) from safehouse_monthly_metrics), 1), true);
select setval(pg_get_serial_sequence('public_impact_snapshots', 'snapshot_id'), coalesce((select max(snapshot_id) from public_impact_snapshots), 1), true);
select setval(pg_get_serial_sequence('donation_allocations', 'allocation_id'), coalesce((select max(allocation_id) from donation_allocations), 1), true);

commit;
