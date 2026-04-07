export type DonorTier = 'supporter' | 'advocate' | 'champion' | 'founder'
export type ChurnRisk = 'low' | 'medium' | 'high'
export type DonorType = 'individual' | 'corporate' | 'foundation'

export interface DonorImpactMetrics {
  childrenHelped: number
  monthsOfHousingProvided: number
  counselingSessionsFunded: number
  programsSupported: string[]
}

export interface Donor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  type: DonorType
  tier: DonorTier
  totalGiven: number
  currentYearGiven: number
  firstGiftDate: string
  lastGiftDate: string
  giftCount: number
  isRecurring: boolean
  recurringAmount?: number
  churnRisk: ChurnRisk
  engagementScore: number // 0-100
  tags: string[]
  impactMetrics: DonorImpactMetrics
  assignedRelationsId?: string
  notes: string
  location: string
  joinedDate: string
}

export interface Donation {
  id: string
  donorId: string
  donorName: string
  amount: number
  currency: string
  date: string
  campaignId?: string
  campaignName?: string
  method: 'credit_card' | 'bank_transfer' | 'check' | 'paypal' | 'crypto' | 'in_kind'
  isRecurring: boolean
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  allocation: string
  thankYouSent: boolean
}
