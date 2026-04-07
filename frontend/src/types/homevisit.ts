export type VisitOutcome = 'safe' | 'needs_followup' | 'referred' | 'not_home'
export type VisitPurpose =
  | 'regular_check'
  | 'reintegration_monitoring'
  | 'family_assessment'
  | 'crisis_response'
  | 'aftercare'

export interface HomeVisit {
  id: string
  participantId: string
  participantFirstName: string
  caseNumber: string
  staffId: string
  staffName: string
  visitDate: string
  purpose: VisitPurpose
  outcome: VisitOutcome
  environmentAssessment: 'safe' | 'concerns' | 'unsafe'
  familyEngagement: 'positive' | 'neutral' | 'difficult' | 'absent'
  notes: string
  followUpRequired: boolean
  followUpDate?: string
}
