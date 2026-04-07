const roles = [
  {
    name: 'staff',
    label: 'Staff',
    description: 'Case workers and program coordinators. Can view and update assigned cases.',
    permissions: ['view:cases:assigned', 'update:cases:assigned', 'create:session-logs', 'view:donors:basic'],
    userCount: 18,
  },
  {
    name: 'supervisor',
    label: 'Supervisor',
    description: 'Team leads with elevated access to all cases and sensitive data fields.',
    permissions: ['view:cases:all', 'update:cases:all', 'view:sensitive-data', 'create:reports', 'view:donors:full'],
    userCount: 3,
  },
  {
    name: 'donor',
    label: 'Donor',
    description: 'External donors with access to their own giving history and anonymized impact data.',
    permissions: ['view:own-donations', 'view:impact:anonymized', 'view:campaigns:public', 'update:own-profile'],
    userCount: 45,
  },
  {
    name: 'admin',
    label: 'Admin',
    description: 'Full platform access including user management, audit logs, and system settings.',
    permissions: ['*'],
    userCount: 2,
  },
]

export default function AdminRolesPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-charcoal">Roles & Permissions</h1>
        <p className="text-brand-muted text-sm mt-1">Manage role definitions and access control</p>
      </div>

      <div className="space-y-5">
        {roles.map((r) => (
          <div key={r.name} className="bg-brand-cream rounded-xl border border-brand-border p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-brand-charcoal">{r.label}</h2>
                  <span className="font-mono text-xs bg-brand-stone text-brand-muted px-2 py-0.5 rounded">
                    {r.name}
                  </span>
                </div>
                <p className="text-sm text-brand-muted">{r.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-semibold text-brand-charcoal">{r.userCount}</p>
                <p className="text-xs text-brand-muted">users</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.permissions.map((p) => (
                <span key={p} className="font-mono text-xs bg-white border border-brand-border text-brand-charcoal px-2.5 py-1 rounded-lg">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
