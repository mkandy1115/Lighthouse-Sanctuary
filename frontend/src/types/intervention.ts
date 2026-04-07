export type InterventionType =
  | 'safety_planning'
  | 'crisis_support'
  | 'legal_referral'
  | 'medical_referral'
  | 'education_support'
  | 'vocational_training'
  | 'family_mediation'
  | 'peer_support'
  | 'spiritual_care'
  | 'livelihood'

export type InterventionStatus = 'planned' | 'active' | 'completed' | 'discontinued'

export interface Intervention {
  id: string
  participantId: string
  participantFirstName: string
  caseNumber: string
  type: InterventionType
  status: InterventionStatus
  assignedStaffId: string
  assignedStaffName: string
  startDate: string
  endDate?: string
  goal: string
  progress: string
  outcome?: string
}
