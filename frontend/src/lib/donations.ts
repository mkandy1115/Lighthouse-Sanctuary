import { getApiBaseUrl } from '@/lib/auth'

export interface PublicDonationRequest {
  amount: number
  isRecurring: boolean
  campaignName?: string
  email?: string
  firstName?: string
  lastName?: string
  isAnonymous: boolean
  supporterId?: number
}

export interface PublicDonationResponse {
  donationId: number
  supporterId: number
  isAnonymous: boolean
  message: string
}

export async function createPublicDonation(request: PublicDonationRequest): Promise<PublicDonationResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/donations/public`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to process donation right now.')
  }

  return data as PublicDonationResponse
}
