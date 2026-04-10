import { getApiBaseUrl, getAuthorizationHeaders } from '@/lib/auth'

export interface DonorProfile {
  supporterId: number
  displayName: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  region?: string | null
}

export interface DonorSummary {
  totalGiven: number
  thisYear: number
  donationCount: number
  hasRecurringGift: boolean
  counselingSessionsFunded: number
  monthsHousingFunded: number
  residentsHelpedEstimate: number
}

export interface DonorMonthlyGivingPoint {
  month: string
  amount: number
}

export interface DonorDonation {
  donationId: number
  date: string
  amount: number
  campaign: string
  isRecurring: boolean
  status: string
}

export interface OrganizationMonthlyGivingPoint {
  month: string
  totalAmount: number
  donorCount: number
}

export interface OrganizationCampaignBreakdown {
  label: string
  totalAmount: number
  donationCount: number
}

export interface DonorOrganizationImpact {
  activeSupporters: number
  activeMonetaryDonors: number
  recurringDonors: number
  donationEvents: number
  totalContributionValue: number
  averageGiftAmount: number
  monthlyTrends: OrganizationMonthlyGivingPoint[]
  campaignBreakdown: OrganizationCampaignBreakdown[]
}

export interface DonorDashboardData {
  profile: DonorProfile
  summary: DonorSummary
  monthlyGiving: DonorMonthlyGivingPoint[]
  recentDonations: DonorDonation[]
  personalCampaignBreakdown: OrganizationCampaignBreakdown[]
  organizationImpact: DonorOrganizationImpact
  impactPrediction?: {
    impactScore: number
    predictedTopProgramArea: string
    predictedEducationShare: number
    modelVersion: string
    scoredAtUtc: string
  } | null
}

export async function getDonorDashboard(): Promise<DonorDashboardData> {
  const response = await fetch(`${getApiBaseUrl()}/api/donor/dashboard`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthorizationHeaders(),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to load donor dashboard right now.')
  }

  return data as DonorDashboardData
}

export interface CreateDonorDonationRequest {
  amount: number
  isRecurring: boolean
  campaignName?: string
}

export async function createDonorDonation(request: CreateDonorDonationRequest): Promise<DonorDonation> {
  const response = await fetch(`${getApiBaseUrl()}/api/donor/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthorizationHeaders(),
    },
    body: JSON.stringify(request),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to process donor donation right now.')
  }

  return data as DonorDonation
}
