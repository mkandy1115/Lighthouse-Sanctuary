export type SessionType =
  | 'individual'
  | 'group'
  | 'family'
  | 'trauma_focused'
  | 'psychoeducation'
  | 'crisis'

export type SessionTheme =
  | 'trust'
  | 'safety'
  | 'identity'
  | 'relationships'
  | 'coping'
  | 'grief'
  | 'empowerment'
  | 'reintegration'
  | 'boundaries'

export type ProgressIndicator =
  | 'progressing'
  | 'stable'
  | 'needs_support'
  | 'significant_progress'

export interface CounselingSession {
  id: string
  participantId: string
  participantFirstName: string
  caseNumber: string
  counselorId: string
  counselorName: string
  sessionDate: string
  sessionType: SessionType
  durationMinutes: number
  themes: SessionTheme[]
  progressIndicator: ProgressIndicator
  objectives: string[]
  // Note: content is masked by default in UI
  sessionSummary: string // clinician-facing, masked for non-counselors
  clientResponse: string // clinician-facing, masked for non-counselors
  nextSteps: string[]
  followUpDate?: string
}
