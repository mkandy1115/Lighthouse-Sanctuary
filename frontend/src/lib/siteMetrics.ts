import { getApiBaseUrl, getAuthorizationHeaders } from '@/lib/auth'

export interface SiteMetricsResponse {
  aggregates: {
    girlsSupported: number
    reintegrationCompleted: number
    reintegrationTracked: number
    reintegrationSuccessPct: number
    totalImpactPhp: number
    programCompletionPct: number
    stableHousingVisitPct: number
    educationProgressPct: number
    attendanceEngagementPct: number
    wellbeingPct: number
    activeCases: number
    sessionsThisWeek: number
    homeVisitsDue: number
    fundsRaisedMtd: number
  }
  allocations: {
    total: number
    byProgram: Array<{
      programArea: string | null
      amount: number
    }>
  }
}

export async function getSiteMetrics(): Promise<SiteMetricsResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/site-metrics`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthorizationHeaders(),
    },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to load site metrics.')
  }
  return data as SiteMetricsResponse
}
