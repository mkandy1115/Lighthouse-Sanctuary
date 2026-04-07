import { useState, useCallback } from 'react'

export type UserRole = 'staff' | 'supervisor' | 'donor' | 'admin'

export function useRole() {
  const [role, setRoleState] = useState<UserRole>(
    () => (localStorage.getItem('lighthouse_role') as UserRole) ?? 'staff',
  )

  const setRole = useCallback((r: UserRole) => {
    localStorage.setItem('lighthouse_role', r)
    setRoleState(r)
  }, [])

  return { role, setRole }
}
