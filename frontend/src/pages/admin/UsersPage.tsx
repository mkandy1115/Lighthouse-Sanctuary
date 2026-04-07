import { formatDate } from '@/lib/formatters'

const users = [
  { id: '1', name: 'Ana Reyes', email: 'ana.reyes@lighthouseph.org', role: 'staff', status: 'active', lastLogin: '2025-01-15' },
  { id: '2', name: 'Ben Morales', email: 'ben.morales@lighthouseph.org', role: 'staff', status: 'active', lastLogin: '2025-01-14' },
  { id: '3', name: 'Ines Tan', email: 'ines.tan@lighthouseph.org', role: 'supervisor', status: 'active', lastLogin: '2025-01-15' },
  { id: '4', name: 'Admin User', email: 'admin@lighthouseph.org', role: 'admin', status: 'active', lastLogin: '2025-01-15' },
  { id: '5', name: 'Jose Dela Cruz', email: 'jose@example.com', role: 'donor', status: 'active', lastLogin: '2025-01-10' },
  { id: '6', name: 'Former Staff', email: 'former@lighthouseph.org', role: 'staff', status: 'inactive', lastLogin: '2024-11-01' },
]

const roleColors: Record<string, string> = {
  staff: 'bg-brand-stone text-brand-charcoal',
  supervisor: 'bg-brand-teal-muted text-brand-teal',
  admin: 'bg-brand-bronze-muted text-brand-bronze',
  donor: 'bg-blue-50 text-blue-700',
}

export default function AdminUsersPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Users</h1>
          <p className="text-brand-muted text-sm mt-1">{users.length} accounts registered</p>
        </div>
        <button className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
          + Invite User
        </button>
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Name', 'Email', 'Role', 'Status', 'Last Login', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3 font-medium text-brand-charcoal">{u.name}</td>
                <td className="px-4 py-3 text-brand-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    u.status === 'active' ? 'bg-brand-teal-muted text-brand-teal' : 'bg-brand-stone text-brand-muted'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-muted">{formatDate(u.lastLogin, 'relative')}</td>
                <td className="px-4 py-3">
                  <button className="text-brand-bronze text-xs font-medium hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
