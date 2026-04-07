export type CampaignStatus = 'active' | 'completed' | 'draft' | 'paused'
export type CampaignType =
  | 'annual_fund'
  | 'emergency_appeal'
  | 'program_specific'
  | 'matching_gift'
  | 'year_end'
  | 'event'

export interface CampaignMetrics {
  totalRaised: number
  goal: number
  donorCount: number
  avgGift: number
  largestGift: number
  newDonors: number
  returningDonors: number
  onlineDonations: number
  offlineDonations: number
  conversionRate: number
  emailOpenRate?: number
  socialClicks?: number
}

export interface Campaign {
  id: string
  name: string
  description: string
  type: CampaignType
  status: CampaignStatus
  startDate: string
  endDate?: string
  goal: number
  metrics: CampaignMetrics
  programArea: string
  leadStaffId: string
  leadStaffName: string
  channels: string[]
  monthlyData: { month: string; raised: number; donors: number }[]
}
