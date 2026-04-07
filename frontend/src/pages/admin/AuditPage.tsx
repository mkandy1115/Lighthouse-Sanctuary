import { formatDate } from '@/lib/formatters'

const auditEvents = [
  { id: '1', user: 'ana.reyes', action: 'VIEW_SENSITIVE_DATA', resource: 'Case #0421 — dateOfBirth', resourceType: 'case-field', timestamp: '2025-01-15T09:14:22Z', ip: '192.168.1.42' },
  { id: '2', user: 'ben.morales', action: 'UPDATE_CASE', resource: 'Case #0419', resourceType: 'case', timestamp: '2025-01-15T08:52:00Z', ip: '192.168.1.55' },
  { id: '3', user: 'ines.tan', action: 'CREATE_REPORT', resource: 'Monthly Report Dec 2024', resourceType: 'report', timestamp: '2025-01-15T08:30:00Z', ip: '192.168.1.60' },
  { id: '4', user: 'admin', action: 'ROLE_CHANGE', resource: 'User: jdelacruz → donor', resourceType: 'user', timestamp: '2025-01-15T06:00:00Z', ip: '192.168.1.10' },
  { id: '5', user: 'ana.reyes', action: 'VIEW_SENSITIVE_DATA', resource: 'Case #0415 — location', resourceType: 'case-field', timestamp: '2025-01-14T14:20:00Z', ip: '192.168.1.42' },
]

const actionColors: Record<string, string> = {
  VIEW_SENSITIVE_DATA: 'text-amber-700 bg-amber-50',
  UPDATE_CASE: 'text-brand-teal bg-brand-teal-muted',
  CREATE_REPORT: 'text-blue-700 bg-blue-50',
  ROLE_CHANGE: 'text-brand-bronze bg-brand-bronze-muted',
  DELETE_RECORD: 'text-red-700 bg-red-50',
}

export default function AdminAuditPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-charcoal">Audit Log</h1>
        <p className="text-brand-muted text-sm mt-1">Immutable record of all sensitive data access and system changes</p>
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Timestamp', 'User', 'Action', 'Resource', 'IP'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditEvents.map((e) => (
              <tr key={e.id} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3 text-xs text-brand-muted font-mono whitespace-nowrap">
                  {formatDate(e.timestamp, 'relative')}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-brand-charcoal">{e.user}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded font-medium ${actionColors[e.action] ?? 'text-brand-charcoal bg-brand-stone'}`}>
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-brand-charcoal max-w-xs truncate">{e.resource}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
