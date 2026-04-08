import { getApiBaseUrl, getAuthorizationHeaders } from '@/lib/auth'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthorizationHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to load staff data right now.')
  }

  return data as T
}

export interface StaffResidentListItem {
  residentId: number
  caseControlNo: string
  internalCode: string
  safehouseId: number
  safehouseName: string
  caseStatus: string
  caseCategory?: string | null
  assignedSocialWorker?: string | null
  currentRiskLevel?: string | null
  dateOfAdmission: string
  presentAge?: string | null
  tags: string[]
}

export interface ProcessRecordingItem {
  recordingId: number
  residentId: number
  residentCaseControlNo?: string | null
  residentInternalCode?: string | null
  sessionDate: string
  socialWorker?: string | null
  sessionType?: string | null
  sessionDurationMinutes?: number | null
  emotionalStateObserved?: string | null
  emotionalStateEnd?: string | null
  sessionNarrative?: string | null
  interventionsApplied?: string | null
  followUpActions?: string | null
  progressNoted: boolean
  concernsFlagged: boolean
  referralMade: boolean
}

export interface HomeVisitationItem {
  visitationId: number
  residentId: number
  residentCaseControlNo?: string | null
  residentInternalCode?: string | null
  visitDate: string
  socialWorker?: string | null
  visitType?: string | null
  locationVisited?: string | null
  familyMembersPresent?: string | null
  purpose?: string | null
  observations?: string | null
  familyCooperationLevel?: string | null
  safetyConcernsNoted: boolean
  followUpNeeded: boolean
  followUpNotes?: string | null
  visitOutcome?: string | null
}

export interface InterventionPlanItem {
  planId: number
  residentId: number
  planCategory?: string | null
  planDescription: string
  servicesProvided?: string | null
  targetValue?: number | null
  targetDate?: string | null
  status?: string | null
  caseConferenceDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface ConferenceItem {
  planId: number
  residentId: number
  residentCaseControlNo?: string | null
  residentInternalCode?: string | null
  planCategory?: string | null
  planDescription: string
  servicesProvided?: string | null
  targetValue?: number | null
  targetDate?: string | null
  status?: string | null
  caseConferenceDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface ResidentDetailResponse {
  resident: Record<string, unknown>
  safehouseName?: string | null
  processRecordings: ProcessRecordingItem[]
  homeVisitations: HomeVisitationItem[]
  interventions: InterventionPlanItem[]
}

export interface SupporterListItem {
  supporterId: number
  supporterType: string
  displayName: string
  organizationName?: string | null
  firstName?: string | null
  lastName?: string | null
  relationshipType?: string | null
  region?: string | null
  country?: string | null
  email?: string | null
  phone?: string | null
  status: string
  createdAt: string
  firstDonationDate?: string | null
  acquisitionChannel?: string | null
  totalGiven: number
  lastGiftDate?: string | null
}

export interface SupporterDetailResponse {
  supporter: SupporterListItem
  donations: Array<Record<string, unknown>>
  allocations: Array<Record<string, unknown>>
}

export interface CreateStaffDonationPayload {
  supporterId: number
  donationType: string
  donationDate: string
  isRecurring: boolean
  campaignName?: string | null
  channelSource?: string | null
  currencyCode?: string | null
  amount?: number | null
  estimatedValue?: number | null
  impactUnit?: string | null
  notes?: string | null
  safehouseId: number
  programArea: string
  amountAllocated: number
  allocationNotes?: string | null
}

export interface AdminDashboardResponse {
  activeResidents: number
  activeSafehouses: number
  recentDonations: Array<Record<string, unknown>>
  safehouseMetrics: Array<Record<string, unknown>>
  upcomingCaseConferences: Array<Record<string, unknown>>
}

export interface ReportsSummaryResponse {
  donationsByMonth: Array<{ month: string; raised: number; donors: number }>
  residentOutcomeMetrics: Array<Record<string, unknown>>
  safehouseComparisons: Array<Record<string, unknown>>
  reintegration: { completed: number; totalTracked: number }
}

export function getResidents() {
  return api<StaffResidentListItem[]>('/api/residents')
}

export function getResident(id: string | number) {
  return api<ResidentDetailResponse>(`/api/residents/${id}`)
}

export function createResident(payload: Record<string, unknown>) {
  return api<Record<string, unknown>>('/api/residents', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface UpdateResidentPayload {
  caseControlNo: string
  internalCode: string
  safehouseId: number
  caseStatus: string
  sex: string
  dateOfBirth: string
  dateOfAdmission: string
  caseCategory?: string | null
  assignedSocialWorker?: string | null
  referralSource?: string | null
  currentRiskLevel?: string | null
  initialRiskLevel?: string | null
  initialCaseAssessment?: string | null
  reintegrationStatus?: string | null
  reintegrationType?: string | null
  notesRestricted?: string | null
  subCatTrafficked: boolean
  subCatPhysicalAbuse: boolean
  subCatSexualAbuse: boolean
  subCatAtRisk: boolean
  isPwd: boolean
  pwdType?: string | null
  hasSpecialNeeds: boolean
  specialNeedsDiagnosis?: string | null
  familyIs4Ps: boolean
  familySoloParent: boolean
  familyIndigenous: boolean
  familyInformalSettler: boolean
}

export function updateResident(id: string | number, payload: UpdateResidentPayload) {
  return api<Record<string, unknown>>(`/api/residents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

const DEFAULT_DELETE_CONFIRM =
  'Are you sure you want to do this? This action cannot be undone.'

/**
 * Deletes a resident after a browser confirmation prompt.
 * @returns true if the row was deleted, false if the user cancelled.
 */
export async function deleteResident(
  id: string | number,
  confirmMessage: string = DEFAULT_DELETE_CONFIRM,
): Promise<boolean> {
  if (!window.confirm(confirmMessage)) {
    return false
  }

  const response = await fetch(`${getApiBaseUrl()}/api/residents/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthorizationHeaders(),
    },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(
      typeof data?.message === 'string' ? data.message : 'Unable to delete participant.',
    )
  }
  return true
}

export interface SafehouseListItem {
  safehouseId: number
  safehouseCode: string
  name: string
  region: string
  city: string
  province: string
  country: string
  status: string
}

export function getSafehouses() {
  return api<SafehouseListItem[]>('/api/safehouses')
}

export function getSupporters() {
  return api<SupporterListItem[]>('/api/supporters')
}

export function getSupporter(id: string | number) {
  return api<SupporterDetailResponse>(`/api/supporters/${id}`)
}

export function createSupporter(payload: Record<string, unknown>) {
  return api<SupporterListItem>('/api/supporters', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createStaffDonation(payload: CreateStaffDonationPayload) {
  return api<Record<string, unknown>>('/api/donations/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getProcessRecordings(residentId?: string | number) {
  const suffix = residentId ? `?residentId=${residentId}` : ''
  return api<ProcessRecordingItem[]>(`/api/processrecordings${suffix}`)
}

export function getProcessRecording(id: string | number) {
  return api<ProcessRecordingItem>(`/api/processrecordings/${id}`)
}

export function createProcessRecording(payload: Record<string, unknown>) {
  return api<ProcessRecordingItem>('/api/processrecordings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getHomeVisitations(residentId?: string | number) {
  const suffix = residentId ? `?residentId=${residentId}` : ''
  return api<HomeVisitationItem[]>(`/api/homevisitations${suffix}`)
}

export function createHomeVisitation(payload: Record<string, unknown>) {
  return api<HomeVisitationItem>('/api/homevisitations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface CreateConferencePayload {
  residentId: number
  planCategory?: string | null
  planDescription: string
  servicesProvided?: string | null
  targetValue?: number | null
  targetDate?: string | null
  status?: string | null
  caseConferenceDate: string
}

export interface UpdateConferencePayload {
  planCategory?: string | null
  planDescription?: string | null
  servicesProvided?: string | null
  targetValue?: number | null
  targetDate?: string | null
  status?: string | null
  caseConferenceDate?: string | null
}

export function getConferences(query?: {
  upcoming?: boolean
  residentId?: string | number
  status?: string
}) {
  const params = new URLSearchParams()
  if (query?.upcoming != null) params.set('upcoming', String(query.upcoming))
  if (query?.residentId != null) params.set('residentId', String(query.residentId))
  if (query?.status) params.set('status', query.status)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return api<ConferenceItem[]>(`/api/conferences${suffix}`)
}

export function createConference(payload: CreateConferencePayload) {
  return api<ConferenceItem>('/api/conferences', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateConference(id: string | number, payload: UpdateConferencePayload) {
  return api<ConferenceItem>(`/api/conferences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getAdminDashboard() {
  return api<AdminDashboardResponse>('/api/admin/dashboard')
}

export function getReportsSummary() {
  return api<ReportsSummaryResponse>('/api/reports/summary')
}
