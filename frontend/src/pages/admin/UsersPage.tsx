import { useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/formatters'
import { getAdminUsers, type AdminUserListItem, updateAdminUserRole } from '@/lib/staff'

const roleColors: Record<string, string> = {
  admin: 'bg-brand-bronze-muted text-brand-bronze',
  donor: 'bg-blue-50 text-blue-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const adminCount = useMemo(
    () => users.filter((user) => user.isActive && user.role === 'Admin').length,
    [users],
  )

  async function handleRoleChange(user: AdminUserListItem, role: 'Admin' | 'Donor') {
    if (user.role === role) return
    setSavingUserId(user.id)
    setError(null)
    setNotice(null)
    try {
      const updated = await updateAdminUserRole(user.id, role)
      setUsers((prev) => prev.map((record) => (record.id === updated.id ? updated : record)))
      setNotice(`${updated.displayName} is now ${updated.role}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update role.')
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Users</h1>
          <p className="text-brand-muted text-sm mt-1">{users.length} accounts registered · {adminCount} active admins</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {notice ? (
        <div className="mb-4 rounded-lg border border-brand-teal/20 bg-brand-teal-muted/40 px-4 py-3 text-sm text-brand-teal">
          {notice}
        </div>
      ) : null}

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Name', 'Email', 'Role', 'Status', 'Created', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-brand-muted" colSpan={6}>Loading users…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-brand-muted" colSpan={6}>No users found.</td>
              </tr>
            ) : (
              users.map((user) => {
                const roleKey = user.role.toLowerCase()
                return (
                  <tr key={user.id} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-charcoal">{user.displayName}</div>
                      <div className="text-xs text-brand-muted">@{user.username}</div>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{user.email || 'No email on file'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[roleKey] ?? 'bg-brand-stone text-brand-charcoal'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        user.isActive ? 'bg-brand-teal-muted text-brand-teal' : 'bg-brand-stone text-brand-muted'
                      }`}>
                        {user.isActive ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{formatDate(user.createdAt, 'relative')}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        disabled={savingUserId === user.id}
                        onChange={(event) => {
                          void handleRoleChange(user, event.target.value as 'Admin' | 'Donor')
                        }}
                        className="rounded-md border border-brand-border bg-white px-2 py-1 text-xs text-brand-charcoal"
                      >
                        <option value="Donor">Donor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
