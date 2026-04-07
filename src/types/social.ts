export type Platform = 'instagram' | 'facebook' | 'linkedin' | 'twitter'
export type ContentType =
  | 'impact_story'
  | 'program_update'
  | 'donor_spotlight'
  | 'awareness'
  | 'fundraising'
  | 'event'
  | 'behind_the_scenes'
export type PostStatus = 'published' | 'scheduled' | 'draft'

export interface SocialMetrics {
  platform: Platform
  followers: number
  followersChange: number // +/- from last month
  engagementRate: number
  reach: number
  impressions: number
  postCount: number
  donationConversions: number
  topPerformingContentTypes: ContentType[]
  bestPostingTimes: string[]
}

export interface SocialPost {
  id: string
  platform: Platform
  contentType: ContentType
  status: PostStatus
  caption: string
  scheduledDate?: string
  publishedDate?: string
  metrics?: {
    likes: number
    comments: number
    shares: number
    reach: number
    clicks: number
    donationConversions: number
  }
  recommendation?: string
}

export interface SocialRecommendation {
  platform: Platform
  contentType: ContentType
  reason: string
  suggestedTiming: string
  estimatedReach: number
  priority: 'high' | 'medium' | 'low'
}
