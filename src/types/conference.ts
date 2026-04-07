export type ConferenceType =
  | 'case_review'
  | 'crisis'
  | 'reintegration_planning'
  | 'family_conference'
  | 'interdisciplinary'

export interface ConferenceAttendee {
  name: string
  role: string
}

export interface CaseConference {
  id: string
  participantId: string
  participantFirstName: string
  caseNumber: string
  type: ConferenceType
  date: string
  facilitatorId: string
  facilitatorName: string
  attendees: ConferenceAttendee[]
  agenda: string[]
  decisions: string[]
  actionItems: { task: string; assignedTo: string; dueDate: string }[]
  nextConferenceDate?: string
}
