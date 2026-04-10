import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import { createSupporter, getSupporters, updateSupporter, type SupporterListItem } from '@/lib/staff'
import { formatDate, formatUsdFromPhp } from '@/lib/formatters'
import { useTableSort } from '@/lib/tableSort'
import { looksUnsafe, sanitizeText, validateEmail } from '@/lib/validation'

export default function StaffDonorListPage() {
  const [supporters, setSupporters] = useState<SupporterListItem[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
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
  const supportersSort = useTableSort<SupporterListItem, 'supporter' | 'type' | 'totalGiven' | 'lastGift' | 'status'>(
    filtered,
    (supporter, key) => {
      switch (key) {
        case 'supporter': return supporter.displayName
        case 'type': return supporter.supporterType
        case 'totalGiven': return supporter.totalGiven
        case 'lastGift': return supporter.lastGiftDate ?? ''
        case 'status': return supporter.status
        default: return ''
      }
    },
  )

  function resetForm() {
    setEditingId(null)
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

  function openCreate() {
    resetForm()
    setIsModalOpen(true)
    setError('')
  }

  function openEdit(s: SupporterListItem) {
    setEditingId(s.supporterId)
    setForm({
      supporterType: s.supporterType,
      displayName: s.displayName,
      email: s.email ?? '',
      phone: s.phone ?? '',
      relationshipType: s.relationshipType ?? 'International',
      status: s.status,
      acquisitionChannel: 'Website',
    })
    setIsModalOpen(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const displayName = sanitizeText(form.displayName, 160)
    const email = sanitizeText(form.email, 254).toLowerCase()
    const phone = sanitizeText(form.phone, 40)
    if (!displayName) {
      setError('Display name is required.')
      return
    }
    if (email && !validateEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (looksUnsafe(displayName)) {
      setError('Display name contains unsafe input.')
      return
    }

    try {
      if (editingId != null) {
        const updated = await updateSupporter(editingId, {
          displayName,
          email: email || null,
          phone: phone || null,
          status: form.status,
          supporterType: form.supporterType,
          relationshipType: form.relationshipType,
        })
        setSupporters((current) => current.map((x) => (x.supporterId === editingId ? { ...x, ...updated } : x)))
      } else {
        const created = await createSupporter({
          ...form,
          displayName,
          email,
          phone,
        })
        setSupporters((current) => [created, ...current])
      }
      setIsModalOpen(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save supporter.')
    }
  }

  return (
    <div className="animate-fade-in">
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingId != null ? 'Edit supporter' : 'Add supporter'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="Display name"
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone"
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.supporterType}
              onChange={(e) => setForm((f) => ({ ...f, supporterType: e.target.value }))}
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
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
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">
            {editingId != null ? 'Save changes' : 'Save supporter'}
          </button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Donors & Contributions</h1>
          <p className="text-brand-muted text-sm mt-1">{supporters.length} supporter records</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
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
          className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
        />
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                <button type="button" onClick={() => supportersSort.toggleSort('supporter')} className="hover:text-brand-charcoal">
                  Supporter{supportersSort.indicator('supporter')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                <button type="button" onClick={() => supportersSort.toggleSort('type')} className="hover:text-brand-charcoal">
                  Type{supportersSort.indicator('type')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                <button type="button" onClick={() => supportersSort.toggleSort('totalGiven')} className="hover:text-brand-charcoal">
                  Total Given{supportersSort.indicator('totalGiven')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                <button type="button" onClick={() => supportersSort.toggleSort('lastGift')} className="hover:text-brand-charcoal">
                  Last Gift{supportersSort.indicator('lastGift')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                <button type="button" onClick={() => supportersSort.toggleSort('status')} className="hover:text-brand-charcoal">
                  Status{supportersSort.indicator('status')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && supportersSort.sortedRows.map((supporter) => (
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
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => openEdit(supporter)} className="text-left text-brand-bronze text-xs font-medium hover:underline">
                      Edit
                    </button>
                    <Link to={`/admin/donors/${supporter.supporterId}`} className="text-brand-charcoal text-xs font-medium hover:underline">
                      View →
                    </Link>
                  </div>
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
