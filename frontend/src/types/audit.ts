export type AuditAction =
  | 'VIEW_SENSITIVE_DATA'
  | 'EDIT_CASE'
  | 'CREATE_CASE'
  | 'CLOSE_CASE'
  | 'VIEW_DONOR'
  | 'EXPORT_DATA'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CHANGE_ROLE'
  | 'DELETE_RECORD'

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: AuditAction
  resourceType: string
  resourceId: string
  resourceLabel: string
  timestamp: string
  ipAddress: string
  details?: string
}
