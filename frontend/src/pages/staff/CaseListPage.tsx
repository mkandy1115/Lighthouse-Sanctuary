import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import { createResident, getResidents, type StaffResidentListItem } from '@/lib/staff'
import { formatDate } from '@/lib/formatters'

export default function CaseListPage() {
  const [residents, setResidents] = useState<StaffResidentListItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [safehouseFilter, setSafehouseFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    caseControlNo: '',
    internalCode: '',
    safehouseId: '1',
    caseStatus: 'Active',
    dateOfBirth: '2010-01-01',
    dateOfAdmission: new Date().toISOString().slice(0, 10),
    caseCategory: 'Neglected',
    assignedSocialWorker: '',
    referralSource: 'NGO',
    currentRiskLevel: 'Medium',
    initialCaseAssessment: '',
  })

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        setResidents(await getResidents())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load residents.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return residents.filter((resident) => {
      const matchesSearch = !q
        || resident.caseControlNo.toLowerCase().includes(q)
        || resident.internalCode.toLowerCase().includes(q)
        || resident.safehouseName.toLowerCase().includes(q)
        || (resident.assignedSocialWorker ?? '').toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || resident.caseStatus === statusFilter
      const matchesSafehouse = safehouseFilter === 'all' || resident.safehouseName === safehouseFilter
      const matchesCategory = categoryFilter === 'all' || resident.caseCategory === categoryFilter
      return matchesSearch && matchesStatus && matchesSafehouse && matchesCategory
    })
  }, [categoryFilter, residents, safehouseFilter, search, statusFilter])

  const safehouses = Array.from(new Set(residents.map((resident) => resident.safehouseName))).sort()
  const categories = Array.from(new Set(residents.map((resident) => resident.caseCategory).filter(Boolean))) as string[]

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const created = await createResident({
      caseControlNo: form.caseControlNo,
      internalCode: form.internalCode,
      safehouseId: Number(form.safehouseId),
      caseStatus: form.caseStatus,
      sex: 'F',
      dateOfBirth: form.dateOfBirth,
      dateOfAdmission: form.dateOfAdmission,
      caseCategory: form.caseCategory,
      assignedSocialWorker: form.assignedSocialWorker,
      referralSource: form.referralSource,
      currentRiskLevel: form.currentRiskLevel,
      initialCaseAssessment: form.initialCaseAssessment,
    })

    setResidents((current) => [created, ...current])
    setIsModalOpen(false)
  }

  return (
    <div className="animate-fade-in">
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Resident Case">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.caseControlNo} onChange={(e) => setForm((f) => ({ ...f, caseControlNo: e.target.value }))} placeholder="Case control #" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
            <input value={form.internalCode} onChange={(e) => setForm((f) => ({ ...f, internalCode: e.target.value }))} placeholder="Internal code" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
            <input type="date" value={form.dateOfAdmission} onChange={(e) => setForm((f) => ({ ...f, dateOfAdmission: e.target.value }))} className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
          </div>
          <input value={form.assignedSocialWorker} onChange={(e) => setForm((f) => ({ ...f, assignedSocialWorker: e.target.value }))} placeholder="Assigned social worker" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm" />
          <button className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">Save Case</button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Caseload Inventory</h1>
          <p className="text-brand-muted text-sm mt-1">{residents.length} total cases · {filtered.length} shown</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-bronze text-white text-sm font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
          + New Case
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search case number or worker…" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-brand-border px-4 py-3 text-sm">
          <option value="all">All statuses</option>
          {Array.from(new Set(residents.map((resident) => resident.caseStatus))).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select value={safehouseFilter} onChange={(e) => setSafehouseFilter(e.target.value)} className="rounded-lg border border-brand-border px-4 py-3 text-sm">
          <option value="all">All safehouses</option>
          {safehouses.map((safehouse) => <option key={safehouse} value={safehouse}>{safehouse}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-brand-border px-4 py-3 text-sm">
          <option value="all">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-white border border-brand-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-stone border-b border-brand-border">
              {['Case', 'Internal Code', 'Safehouse', 'Category', 'Risk', 'Status', 'Caseworker', 'Admission', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && filtered.map((resident) => (
              <tr key={resident.residentId} className="hover:bg-brand-cream transition-colors border-b border-brand-border">
                <td className="px-4 py-3.5 font-mono text-xs text-brand-muted">{resident.caseControlNo}</td>
                <td className="px-4 py-3.5 text-brand-charcoal">{resident.internalCode}</td>
                <td className="px-4 py-3.5 text-brand-muted">{resident.safehouseName}</td>
                <td className="px-4 py-3.5 text-brand-muted">{resident.caseCategory ?? '—'}</td>
                <td className="px-4 py-3.5 text-brand-charcoal">{resident.currentRiskLevel ?? '—'}</td>
                <td className="px-4 py-3.5 text-brand-charcoal">{resident.caseStatus}</td>
                <td className="px-4 py-3.5 text-brand-muted">{resident.assignedSocialWorker ?? '—'}</td>
                <td className="px-4 py-3.5 text-brand-muted">{formatDate(resident.dateOfAdmission)}</td>
                <td className="px-4 py-3.5">
                  <Link to={`/staff/cases/${resident.residentId}`} className="text-brand-bronze text-xs font-medium hover:underline">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="px-4 py-10 text-center text-brand-muted">Loading residents…</div>}
      </div>
    </div>
  )
}
