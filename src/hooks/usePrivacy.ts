import { useState, useCallback } from 'react'
import { createAuditEntry } from '@/lib/privacy'

export function usePrivacy(resourceId: string, resourceType: string) {
  const [revealed, setRevealed] = useState(false)
  const [auditLogged, setAuditLogged] = useState(false)

  const reveal = useCallback(() => {
    if (!revealed && !auditLogged) {
      const entry = createAuditEntry(
        'current-user',
        'VIEW_SENSITIVE_DATA',
        resourceId,
        resourceType,
      )
      console.log('[Audit Log]', entry) // TODO: send to API
      setAuditLogged(true)
    }
    setRevealed(true)
  }, [revealed, auditLogged, resourceId, resourceType])

  const conceal = useCallback(() => setRevealed(false), [])

  return { revealed, reveal, conceal }
}
