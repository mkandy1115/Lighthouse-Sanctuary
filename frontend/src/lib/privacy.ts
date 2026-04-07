// Privacy utilities for sensitive data handling in the Lighthouse platform.
// All access to sensitive survivor data is gated by role and audited.

export type AccessLevel = 'public' | 'staff' | 'supervisor' | 'admin'

/**
 * Mask arbitrary text based on the viewer's access level.
 * Supervisors and admins see the real value; staff see block characters.
 */
export function maskText(text: string, role: AccessLevel = 'staff'): string {
  if (role === 'admin' || role === 'supervisor') return text
  return '█'.repeat(Math.min(text.length, 10))
}

/**
 * Mask a person's name. Staff see first name + last initial only.
 * Supervisors and admins see the full name.
 */
export function maskName(
  firstName: string,
  lastName: string,
  role: AccessLevel,
): string {
  if (role === 'admin' || role === 'supervisor') return `${firstName} ${lastName}`
  return `${firstName} ${lastName.charAt(0)}.`
}

/**
 * Create an immutable audit log entry for a sensitive-data access event.
 * In production this should be POSTed to /api/v1/audit-logs immediately.
 */
export function createAuditEntry(
  userId: string,
  action: string,
  resourceId: string,
  resourceType: string,
) {
  // TODO: API Integration — POST /api/v1/audit-logs
  // This would persist to the audit log in production.
  return {
    id: crypto.randomUUID(),
    userId,
    action,
    resourceId,
    resourceType,
    timestamp: new Date().toISOString(),
    ipAddress: '(client)',
  }
}

export const SENSITIVE_FIELDS = [
  'fullName',
  'dateOfBirth',
  'location',
  'familyContact',
  'caseHistory',
  'traumaHistory',
] as const

export type SensitiveField = (typeof SENSITIVE_FIELDS)[number]
