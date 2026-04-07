import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import { createSupporter, getSupporters, type SupporterListItem } from '@/lib/staff'
import { formatDate, formatUsdFromPhp } from '@/lib/formatters'

export default function StaffDonorListPage() {
  const [supporters, setSupporters] = useState<SupporterListItem[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    supporterType: 'MonetaryDonor',
    displayName: '',
    email: '',
    phone: '',
    relationshipType: 'International',
    status: 'Active',
    acquisitionChannel: 'Website',
  })

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        setSupporters(await getSupporters())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load supporters.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return supporters
    return supporters.filter((supporter) =>
      supporter.displayName.toLowerCase().includes(q)
      || supporter.supporterType.toLowerCase().includes(q)
      || (supporter.email ?? '').toLowerCase().includes(q))
  }, [search, supporters])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const created = await createSupporter(form)
    setSupporters((current) => [created, ...current])
    setIsModalOpen(false)
    setForm({
      supporterType: 'MonetaryDonor',
      displayName: '',
      email: '',
      phone: '',
      relationshipType: 'International',
      status: 'Active',
      acquisitionChannel: 'Website',
    })
  }

  return (
    <div className="animate-fade-in">
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Supporter">
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="Display name"
            className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              className="rounded-lg border border-brand-border px-4 py-3 text-sm"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone"
              className="rounded-lg border border-brand-border px-4 py-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.supporterType}
              onChange={(e) => setForm((f) => ({ ...f, supporterType: e.target.value }))}
              className="rounded-lg border border-brand-border px-4 py-3 text-sm"
            >
              <option value="MonetaryDonor">Monetary Donor</option>
              <option value="InKindDonor">In-Kind Donor</option>
              <option value="Volunteer">Volunteer</option>
              <option value="SkillsContributor">Skills Contributor</option>
              <option value="SocialMediaAdvocate">Social Media Advocate</option>
              <option value="PartnerOrganization">Partner Organization</option>
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="rounded-lg border border-brand-border px-4 py-3 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">
            Save Supporter
          </button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Donors & Contributions</h1>
          <p className="text-brand-muted text-sm mt-1">{supporters.length} supporter records</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          + Add Supporter
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search supporters…"
          className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm"
        />
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Supporter', 'Type', 'Total Given', 'Last Gift', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && filtered.map((supporter) => (
              <tr key={supporter.supporterId} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-brand-charcoal">{supporter.displayName}</div>
                  <div className="text-xs text-brand-muted">{supporter.email ?? 'No email on file'}</div>
                </td>
                <td className="px-4 py-3 text-brand-muted">{supporter.supporterType}</td>
                <td className="px-4 py-3 text-brand-charcoal font-semibold">{formatUsdFromPhp(supporter.totalGiven)}</td>
                <td className="px-4 py-3 text-brand-muted">{supporter.lastGiftDate ? formatDate(supporter.lastGiftDate) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    supporter.status === 'Active' ? 'bg-brand-teal-muted text-brand-teal' : 'bg-brand-stone text-brand-muted'
                  }`}>
                    {supporter.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/staff/donors/${supporter.supporterId}`} className="text-brand-bronze text-xs font-medium hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brand-muted">No supporters matched your search.</td>
              </tr>
            )}
          </tbody>
        </table>
        {isLoading && <div className="px-4 py-10 text-center text-brand-muted">Loading supporters…</div>}
      </div>
    </div>
  )
}
