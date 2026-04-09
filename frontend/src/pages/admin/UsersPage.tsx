import { useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/formatters'
import {
  getAdminUsers,
  type AdminUserListItem,
  updateAdminUserActive,
  updateAdminUserRole,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
} from '@/lib/staff'
import { X, Plus, Edit2, Trash2 } from 'lucide-react'

const roleColors: Record<string, string> = {
  admin: 'bg-brand-bronze-muted text-brand-bronze',
  donor: 'bg-blue-50 text-blue-700',
}

interface FormData {
  username: string
  displayName: string
  email: string
  password?: string
}

interface ConfirmDialog {
  type: 'deactivate' | 'delete'
  userId: number
  userName: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUserListItem | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    displayName: '',
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

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

  function handleOpenAddModal() {
    setFormData({ username: '', displayName: '', email: '', password: '' })
    setEditingUser(null)
    setFormError(null)
    setShowAddModal(true)
  }

  function handleOpenEditModal(user: AdminUserListItem) {
    setFormData({ username: user.username, displayName: user.displayName, email: user.email || '', password: '' })
    setEditingUser(user)
    setFormError(null)
    setShowAddModal(true)
  }

  function handleCloseModal() {
    setShowAddModal(false)
    setEditingUser(null)
    setFormData({ username: '', displayName: '', email: '', password: '' })
    setFormError(null)
  }

  async function handleSaveUser() {
    setFormError(null)

    if (!formData.username.trim() || !formData.displayName.trim() || !formData.email.trim()) {
      setFormError('All fields are required.')
      return
    }

    if (editingUser === null && !formData.password?.trim()) {
      setFormError('Password is required for new users.')
      return
    }

    try {
      setSavingUserId(editingUser?.id ?? -1)

      if (editingUser) {
        const payload: UpdateAdminUserPayload = {
          displayName: formData.displayName,
          email: formData.email,
          username: formData.username,
        }
        const updated = await updateAdminUser(editingUser.id, payload)
        setUsers((prev) => prev.map((record) => (record.id === updated.id ? updated : record)))
        setNotice(`${updated.displayName} has been updated.`)
      } else {
        const payload: CreateAdminUserPayload = {
          username: formData.username,
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password!,
          role: 'Donor',
        }
        const newUser = await createAdminUser(payload)
        setUsers((prev) => [...prev, newUser])
        setNotice(`${newUser.displayName} has been created.`)
      }

      handleCloseModal()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save user.')
    } finally {
      setSavingUserId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDialog || confirmDialog.type !== 'delete') return

    try {
      setTogglingUserId(confirmDialog.userId)
      await deleteAdminUser(confirmDialog.userId)
      setUsers((prev) => prev.filter((u) => u.id !== confirmDialog.userId))
      setNotice(`${confirmDialog.userName} has been deleted.`)
      setConfirmDialog(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user.')
      setConfirmDialog(null)
    } finally {
      setTogglingUserId(null)
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmDialog || confirmDialog.type !== 'deactivate') return

    const user = users.find(u => u.id === confirmDialog.userId)
    if (!user) return

    setTogglingUserId(confirmDialog.userId)
    setError(null)
    setNotice(null)
    try {
      const updated = await updateAdminUserActive(user.id, !user.isActive)
      setUsers((prev) => prev.map((record) => (record.id === updated.id ? updated : record)))
      setNotice(`${updated.displayName} is now ${updated.isActive ? 'active' : 'inactive'}.`)
      setConfirmDialog(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update account status.')
    } finally {
      setTogglingUserId(null)
    }
  }

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
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors"
          aria-label="Add new user"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add User
        </button>
      </div>

      {error ? (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {error}
        </div>
      ) : null}
      {notice ? (
        <div
          className="mb-4 rounded-lg border border-brand-teal/20 bg-brand-teal-muted/40 px-4 py-3 text-sm text-brand-teal"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {notice}
        </div>
      ) : null}

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Name', 'Email', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
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
                      <div className="flex flex-col gap-2 items-start">
                        <select
                          value={user.role}
                          disabled={savingUserId === user.id}
                          onChange={(event) => {
                            void handleRoleChange(user, event.target.value as 'Admin' | 'Donor')
                          }}
                          aria-label={`Change role for ${user.displayName}`}
                          className="rounded-md border border-brand-border bg-white px-2 py-1 text-xs text-brand-charcoal"
                        >
                          <option value="Donor">Donor</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={togglingUserId === user.id}
                            onClick={() => setConfirmDialog({ type: 'deactivate', userId: user.id, userName: user.displayName })}
                            aria-label={`${user.isActive ? 'Deactivate' : 'Activate'} user ${user.displayName}`}
                            className="text-xs font-semibold text-brand-bronze hover:underline disabled:opacity-50"
                            aria-busy={togglingUserId === user.id}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            disabled={savingUserId === user.id}
                            onClick={() => handleOpenEditModal(user)}
                            aria-label={`Edit user ${user.displayName}`}
                            className="text-xs font-semibold text-brand-teal hover:underline disabled:opacity-50 flex items-center gap-1"
                            aria-busy={savingUserId === user.id}
                          >
                            <Edit2 className="w-3 h-3" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={savingUserId === user.id}
                            onClick={() => setConfirmDialog({ type: 'delete', userId: user.id, userName: user.displayName })}
                            aria-label={`Delete user ${user.displayName}`}
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                            aria-busy={savingUserId === user.id}
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="font-serif text-2xl text-brand-charcoal">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={handleCloseModal}
                aria-label="Close modal"
                className="text-brand-muted hover:text-brand-charcoal transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {formError ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                {formError}
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <label htmlFor="username-input" className="block text-sm font-medium text-brand-charcoal mb-1">
                  Username
                </label>
                <input
                  id="username-input"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-bronze/50"
                  placeholder="username"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="displayname-input" className="block text-sm font-medium text-brand-charcoal mb-1">
                  Display Name
                </label>
                <input
                  id="displayname-input"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-bronze/50"
                  placeholder="John Doe"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-brand-charcoal mb-1">
                  Email
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-bronze/50"
                  placeholder="john@example.com"
                  required
                  aria-required="true"
                />
              </div>

              {editingUser === null ? (
                <div>
                  <label htmlFor="password-input" className="block text-sm font-medium text-brand-charcoal mb-1">
                    Password
                  </label>
                  <input
                    id="password-input"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-bronze/50"
                    placeholder="••••••••••••••"
                    required
                    aria-required="true"
                    aria-describedby="password-requirements"
                  />
                  <p id="password-requirements" className="text-xs text-brand-muted mt-1">Must be at least 14 characters</p>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-brand-border rounded-lg text-sm font-medium text-brand-charcoal hover:bg-brand-stone transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSaveUser()}
                disabled={savingUserId !== null}
                className="flex-1 px-4 py-2 bg-brand-bronze text-white rounded-lg text-sm font-medium hover:bg-brand-bronze-light transition-colors disabled:opacity-50"
                aria-busy={savingUserId !== null}
              >
                {savingUserId !== null ? 'Saving...' : editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmation Dialog */}
      {confirmDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4" role="alertdialog" aria-labelledby="confirm-title">
            <h2 id="confirm-title" className="font-serif text-xl text-brand-charcoal mb-2">
              {confirmDialog.type === 'delete' ? 'Delete User' : 'Confirm'}
            </h2>
            <p className="text-sm text-brand-muted mb-6">
              Are you sure you want to {confirmDialog.type === 'delete' ? 'delete' : 'deactivate'}{' '}
              <span className="font-medium text-brand-charcoal">{confirmDialog.userName}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2 border border-brand-border rounded-lg text-sm font-medium text-brand-charcoal hover:bg-brand-stone transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.type === 'delete' ? handleConfirmDelete : handleConfirmDeactivate}
                disabled={togglingUserId !== null}
                className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  confirmDialog.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-brand-bronze hover:bg-brand-bronze-light'
                }`}
                aria-busy={togglingUserId !== null}
              >
                {togglingUserId !== null ? 'Processing...' : confirmDialog.type === 'delete' ? 'Delete' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
