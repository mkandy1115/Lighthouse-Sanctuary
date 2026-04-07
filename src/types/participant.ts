export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type CaseStatus = 'intake' | 'assessment' | 'active' | 'reintegration' | 'aftercare' | 'closed'

export interface SensitiveDetails {
  fullName: string
  dateOfBirth: string
  originCity: string
  familyContact?: string
  referralSource: string
}

export interface CaseEvent {
  id: string
  type:
    | 'intake'
    | 'assessment'
    | 'counseling'
    | 'medical'
    | 'education'
    | 'home_visit'
    | 'intervention'
    | 'conference'
    | 'reintegration'
    | 'aftercare'
    | 'note'
  date: string
  title: string
  description: string
  staffId: string
  staffName: string
}

export interface Participant {
  id: string
  caseNumber: string
  firstName: string
  age: number
  riskLevel: RiskLevel
  status: CaseStatus
  safeHouseId: string
  intakeDate: string
  assignedCaseworkerId: string
  assignedCaseworkerName: string
  program: string[]
  goals: string[]
  timeline: CaseEvent[]
  sensitiveDetails: SensitiveDetails
  notes: string
  lastActivityDate: string
  nextReviewDate: string
  progressScore: number // 0-100
}
