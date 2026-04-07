export type UserRole =
  | 'case_worker'
  | 'counselor'
  | 'supervisor'
  | 'donor_relations'
  | 'social_media'
  | 'admin'
  | 'volunteer'

export interface StaffUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  safeHouseId?: string
  avatarInitials: string
  isActive: boolean
  joinedDate: string
  lastLogin: string
  permissions: string[]
}
