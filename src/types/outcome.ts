export type OutcomeCategory =
  | 'safety'
  | 'education'
  | 'mental_health'
  | 'family_reintegration'
  | 'livelihood'
  | 'social_support'

export interface Outcome {
  id: string
  participantId: string
  caseNumber: string
  category: OutcomeCategory
  indicator: string
  baselineValue: string
  currentValue: string
  targetValue: string
  measuredDate: string
  achievedDate?: string
  achieved: boolean
  notes: string
}
