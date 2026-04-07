/**
 * Impact Report figures derived from `lighthouse_csv_v7` CSVs (same definitions as analysis scripts).
 * Update these if the source CSVs change.
 */

/** residents.csv: count of rows (all sex = F in current extract). */
export const SURVIVORS_SERVED = 60

/**
 * education_records.csv: latest row per resident by record_date;
 * share with completion_status === 'Completed'.
 */
export const PROGRAM_COMPLETION_PCT = (26 / 60) * 100

/**
 * home_visitations.csv: visit_type === 'Post-Placement Monitoring';
 * share with visit_outcome === 'Favorable'.
 */
export const STABLE_HOUSING_VISIT_PCT = (73 / 182) * 100

/** donation_allocations.csv: sum(amount_allocated), PHP */
export const COMMUNITY_INVESTMENT_PHP = 282_436.39

/** education_records: latest per resident; progress_percent >= 67 */
export const EDUCATION_PROGRESS_PCT = (56 / 60) * 100 // 56/60 = 93.33%

/** education_records: latest per resident; attendance_rate >= 0.71 */
export const EDUCATION_ATTENDANCE_ENGAGEMENT_PCT = (49 / 60) * 100 // 81.67%

/**
 * health_wellbeing_records: latest per resident;
 * share with general_health_score >= 3.0 (stable-or-better band on 1–5 scale).
 */
export const WELLBEING_HEALTH_PCT = (54 / 60) * 100 // 90%

/** donation_allocations: share of total PHP by program_area */
export const FUND_ALLOCATION_BY_PROGRAM = [
  { label: 'Education', pct: (67_306.45 / 282_436.39) * 100, color: 'bg-brand-teal' as const },
  { label: 'Operations', pct: (66_853.09 / 282_436.39) * 100, color: 'bg-brand-bronze' as const },
  { label: 'Wellbeing', pct: (52_948.52 / 282_436.39) * 100, color: 'bg-amber-400' as const },
  { label: 'Transport', pct: (39_052.78 / 282_436.39) * 100, color: 'bg-teal-600' as const },
  { label: 'Maintenance', pct: (29_894.24 / 282_436.39) * 100, color: 'bg-slate-400' as const },
  { label: 'Outreach', pct: (26_381.31 / 282_436.39) * 100, color: 'bg-slate-300' as const },
]

/** Resident-facing lines as % of total allocations (total − Operations). */
export const DIRECT_PROGRAM_SHARE_PCT =
  ((282_436.39 - 66_853.09) / 282_436.39) * 100
