import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import { getStoredAuthUser } from '@/lib/auth'
import {
  createResident,
  deleteResident,
  getResident,
  getResidents,
  getSafehouses,
  updateResident,
  type SafehouseListItem,
  type StaffResidentListItem,
  type UpdateResidentPayload,
} from '@/lib/staff'
import { formatDate } from '@/lib/formatters'

const CASE_CATEGORIES = [
  'Neglected',
  'Surrendered',
  'Foundling',
  'Abandoned',
  'Other',
] as const

const REFERRAL_SOURCES = [
  'NGO',
  'Government Agency',
  'Court Order',
  'Self-Referral',
  'Community',
  'Police',
] as const

const RISK_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const

const CASE_STATUSES = ['Active', 'Closed', 'Transferred'] as const

function toInputDate(v: unknown): string {
  if (v == null || v === '') return ''
  return String(v).slice(0, 10)
}

function emptyCreateForm() {
  return {
    caseControlNo: '',
    internalCode: '',
    safehouseId: '1',
    caseStatus: 'Active',
    sex: 'F',
    dateOfBirth: '2010-01-01',
    dateOfAdmission: new Date().toISOString().slice(0, 10),
    caseCategory: 'Neglected',
    assignedSocialWorker: '',
    referralSource: 'NGO',
    currentRiskLevel: 'Medium',
    initialCaseAssessment: '',
    subCatTrafficked: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatAtRisk: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4Ps: false,
    familySoloParent: false,
    familyIndigenous: false,
    familyInformalSettler: false,
  }
}

function emptyEditForm() {
  return {
    caseControlNo: '',
    internalCode: '',
    safehouseId: '1',
    caseStatus: 'Active',
    sex: 'F',
    dateOfBirth: '',
    dateOfAdmission: '',
    caseCategory: '',
    assignedSocialWorker: '',
    referralSource: '',
    currentRiskLevel: '',
    initialRiskLevel: '',
    initialCaseAssessment: '',
    reintegrationStatus: '',
    reintegrationType: '',
    notesRestricted: '',
    subCatTrafficked: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatAtRisk: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4Ps: false,
    familySoloParent: false,
    familyIndigenous: false,
    familyInformalSettler: false,
  }
}

export default function CaseListPage() {
  const isAdmin = getStoredAuthUser()?.role === 'Admin'
  const [residents, setResidents] = useState<StaffResidentListItem[]>([])
  const [safehouses, setSafehouses] = useState<SafehouseListItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [safehouseFilter, setSafehouseFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyCreateForm)
  const [editForm, setEditForm] = useState(emptyEditForm)

  const reloadResidents = useCallback(async () => {
    setResidents(await getResidents())
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        setError('')
        const [residentList, houseList] = await Promise.all([getResidents(), getSafehouses()])
        setResidents(residentList)
        setSafehouses(houseList)
        if (houseList.length > 0) {
          setForm((f) => ({ ...f, safehouseId: String(houseList[0].safehouseId) }))
        }
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
      const matchesRisk = riskFilter === 'all' || resident.currentRiskLevel === riskFilter
      return matchesSearch && matchesStatus && matchesSafehouse && matchesRisk
    })
  }, [residents, riskFilter, safehouseFilter, search, statusFilter])

  const safehouseNames = Array.from(new Set(residents.map((resident) => resident.safehouseName))).sort()
  function openCreateModal() {
    setForm((f) => ({
      ...emptyCreateForm(),
      safehouseId: safehouses[0] ? String(safehouses[0].safehouseId) : f.safehouseId,
    }))
    setIsModalOpen(true)
    setError('')
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      await createResident({
        caseControlNo: form.caseControlNo,
        internalCode: form.internalCode,
        safehouseId: Number(form.safehouseId),
        caseStatus: form.caseStatus,
        sex: form.sex,
        dateOfBirth: form.dateOfBirth,
        dateOfAdmission: form.dateOfAdmission,
        caseCategory: form.caseCategory,
        assignedSocialWorker: form.assignedSocialWorker || null,
        referralSource: form.referralSource,
        currentRiskLevel: form.currentRiskLevel,
        initialCaseAssessment: form.initialCaseAssessment || null,
        subCatTrafficked: form.subCatTrafficked,
        subCatPhysicalAbuse: form.subCatPhysicalAbuse,
        subCatSexualAbuse: form.subCatSexualAbuse,
        subCatAtRisk: form.subCatAtRisk,
        isPwd: form.isPwd,
        pwdType: form.pwdType || null,
        hasSpecialNeeds: form.hasSpecialNeeds,
        specialNeedsDiagnosis: form.specialNeedsDiagnosis || null,
        familyIs4Ps: form.familyIs4Ps,
        familySoloParent: form.familySoloParent,
        familyIndigenous: form.familyIndigenous,
        familyInformalSettler: form.familyInformalSettler,
      })
      await reloadResidents()
      setIsModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create participant.')
    } finally {
      setSaving(false)
    }
  }

  async function openEditModal(residentId: number) {
    setError('')
    setEditingId(residentId)
    setIsEditModalOpen(true)
    setEditLoading(true)
    try {
      const data = await getResident(residentId)
      const r = data.resident as Record<string, unknown>
      setEditForm({
        caseControlNo: String(r.caseControlNo ?? ''),
        internalCode: String(r.internalCode ?? ''),
        safehouseId: String(r.safehouseId ?? '1'),
        caseStatus: String(r.caseStatus ?? 'Active'),
        sex: String(r.sex ?? 'F'),
        dateOfBirth: toInputDate(r.dateOfBirth),
        dateOfAdmission: toInputDate(r.dateOfAdmission),
        caseCategory: String(r.caseCategory ?? ''),
        assignedSocialWorker: String(r.assignedSocialWorker ?? ''),
        referralSource: String(r.referralSource ?? ''),
        currentRiskLevel: String(r.currentRiskLevel ?? ''),
        initialRiskLevel: String(r.initialRiskLevel ?? ''),
        initialCaseAssessment: String(r.initialCaseAssessment ?? ''),
        reintegrationStatus: String(r.reintegrationStatus ?? ''),
        reintegrationType: String(r.reintegrationType ?? ''),
        notesRestricted: String(r.notesRestricted ?? ''),
        subCatTrafficked: Boolean(r.subCatTrafficked),
        subCatPhysicalAbuse: Boolean(r.subCatPhysicalAbuse),
        subCatSexualAbuse: Boolean(r.subCatSexualAbuse),
        subCatAtRisk: Boolean(r.subCatAtRisk),
        isPwd: Boolean(r.isPwd),
        pwdType: String(r.pwdType ?? ''),
        hasSpecialNeeds: Boolean(r.hasSpecialNeeds),
        specialNeedsDiagnosis: String(r.specialNeedsDiagnosis ?? ''),
        familyIs4Ps: Boolean(r.familyIs4Ps),
        familySoloParent: Boolean(r.familySoloParent),
        familyIndigenous: Boolean(r.familyIndigenous),
        familyInformalSettler: Boolean(r.familyInformalSettler),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load participant.')
      setIsEditModalOpen(false)
      setEditingId(null)
    } finally {
      setEditLoading(false)
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (editingId == null) return
    const payload: UpdateResidentPayload = {
      caseControlNo: editForm.caseControlNo.trim(),
      internalCode: editForm.internalCode.trim(),
      safehouseId: Number(editForm.safehouseId),
      caseStatus: editForm.caseStatus,
      sex: editForm.sex,
      dateOfBirth: editForm.dateOfBirth,
      dateOfAdmission: editForm.dateOfAdmission,
      caseCategory: editForm.caseCategory.trim() || null,
      assignedSocialWorker: editForm.assignedSocialWorker.trim() || null,
      referralSource: editForm.referralSource.trim() || null,
      currentRiskLevel: editForm.currentRiskLevel.trim() || null,
      initialRiskLevel: editForm.initialRiskLevel.trim() || null,
      initialCaseAssessment: editForm.initialCaseAssessment.trim() || null,
      reintegrationStatus: editForm.reintegrationStatus.trim() || null,
      reintegrationType: editForm.reintegrationType.trim() || null,
      notesRestricted: editForm.notesRestricted.trim() || null,
      subCatTrafficked: editForm.subCatTrafficked,
      subCatPhysicalAbuse: editForm.subCatPhysicalAbuse,
      subCatSexualAbuse: editForm.subCatSexualAbuse,
      subCatAtRisk: editForm.subCatAtRisk,
      isPwd: editForm.isPwd,
      pwdType: editForm.pwdType.trim() || null,
      hasSpecialNeeds: editForm.hasSpecialNeeds,
      specialNeedsDiagnosis: editForm.specialNeedsDiagnosis.trim() || null,
      familyIs4Ps: editForm.familyIs4Ps,
      familySoloParent: editForm.familySoloParent,
      familyIndigenous: editForm.familyIndigenous,
      familyInformalSettler: editForm.familyInformalSettler,
    }
    try {
      setSaving(true)
      setError('')
      await updateResident(editingId, payload)
      await reloadResidents()
      setIsEditModalOpen(false)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update participant.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(resident: StaffResidentListItem) {
    const msg = [
      'Are you sure you want to do this?',
      '',
      `This will permanently remove participant ${resident.internalCode} (${resident.caseControlNo}). This cannot be undone.`,
    ].join('\n')
    try {
      setError('')
      const didDelete = await deleteResident(resident.residentId, msg)
      if (!didDelete) return
      await reloadResidents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete participant.')
    }
  }

  function closeEditModal() {
    setIsEditModalOpen(false)
    setEditingId(null)
    setEditForm(emptyEditForm())
  }

  const safehouseSelectOptions =
    safehouses.length > 0
      ? safehouses
      : residents.length > 0
        ? Array.from(new Map(residents.map((r) => [r.safehouseId, r.safehouseName])).entries()).map(
            ([id, name]) => ({ safehouseId: id, name, safehouseCode: '', region: '', city: '', province: '', country: '', status: '' }),
          )
        : []

  return (
    <div className="animate-fade-in">
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add participant">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              value={form.caseControlNo}
              onChange={(e) => setForm((f) => ({ ...f, caseControlNo: e.target.value }))}
              placeholder="Case control #"
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <input
              required
              value={form.internalCode}
              onChange={(e) => setForm((f) => ({ ...f, internalCode: e.target.value }))}
              placeholder="Internal code"
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.safehouseId}
              onChange={(e) => setForm((f) => ({ ...f, safehouseId: e.target.value }))}
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            >
              {safehouseSelectOptions.map((sh) => (
                <option key={sh.safehouseId} value={sh.safehouseId}>
                  {sh.name}
                </option>
              ))}
            </select>
            <select
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            >
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.caseStatus}
              onChange={(e) => setForm((f) => ({ ...f, caseStatus: e.target.value }))}
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            >
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={form.caseCategory}
              onChange={(e) => setForm((f) => ({ ...f, caseCategory: e.target.value }))}
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            >
              {CASE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-brand-muted">
              Date of birth
              <input
                type="date"
                required
                value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              />
            </label>
            <label className="text-xs text-brand-muted">
              Date of admission
              <input
                type="date"
                required
                value={form.dateOfAdmission}
                onChange={(e) => setForm((f) => ({ ...f, dateOfAdmission: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              />
            </label>
          </div>
          <select
            value={form.referralSource}
            onChange={(e) => setForm((f) => ({ ...f, referralSource: e.target.value }))}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          >
            {REFERRAL_SOURCES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={form.currentRiskLevel}
            onChange={(e) => setForm((f) => ({ ...f, currentRiskLevel: e.target.value }))}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          >
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            value={form.assignedSocialWorker}
            onChange={(e) => setForm((f) => ({ ...f, assignedSocialWorker: e.target.value }))}
            placeholder="Assigned social worker"
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          />
          <textarea
            value={form.initialCaseAssessment}
            onChange={(e) => setForm((f) => ({ ...f, initialCaseAssessment: e.target.value }))}
            placeholder="Initial case assessment (optional)"
            rows={2}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          />
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-brand-border p-3 text-xs text-brand-charcoal">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.subCatTrafficked} onChange={(e) => setForm((f) => ({ ...f, subCatTrafficked: e.target.checked }))} />Trafficked</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.subCatPhysicalAbuse} onChange={(e) => setForm((f) => ({ ...f, subCatPhysicalAbuse: e.target.checked }))} />Physical abuse</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.subCatSexualAbuse} onChange={(e) => setForm((f) => ({ ...f, subCatSexualAbuse: e.target.checked }))} />Sexual abuse</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.subCatAtRisk} onChange={(e) => setForm((f) => ({ ...f, subCatAtRisk: e.target.checked }))} />At risk</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isPwd} onChange={(e) => setForm((f) => ({ ...f, isPwd: e.target.checked }))} />PWD</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.hasSpecialNeeds} onChange={(e) => setForm((f) => ({ ...f, hasSpecialNeeds: e.target.checked }))} />Special needs</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.familyIs4Ps} onChange={(e) => setForm((f) => ({ ...f, familyIs4Ps: e.target.checked }))} />4Ps family</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.familySoloParent} onChange={(e) => setForm((f) => ({ ...f, familySoloParent: e.target.checked }))} />Solo parent</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.familyIndigenous} onChange={(e) => setForm((f) => ({ ...f, familyIndigenous: e.target.checked }))} />Indigenous</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.familyInformalSettler} onChange={(e) => setForm((f) => ({ ...f, familyInformalSettler: e.target.checked }))} />Informal settler</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.pwdType} onChange={(e) => setForm((f) => ({ ...f, pwdType: e.target.value }))} placeholder="PWD type" className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal" />
            <input value={form.specialNeedsDiagnosis} onChange={(e) => setForm((f) => ({ ...f, specialNeedsDiagnosis: e.target.value }))} placeholder="Special needs diagnosis" className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal" />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save participant'}
          </button>
        </form>
      </Modal>

      <Modal open={isEditModalOpen} onClose={closeEditModal} title="Edit participant">
        {editLoading ? (
          <p className="text-sm text-brand-muted py-6 text-center">Loading…</p>
        ) : (
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={editForm.caseControlNo}
                onChange={(e) => setEditForm((f) => ({ ...f, caseControlNo: e.target.value }))}
                placeholder="Case control #"
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              />
              <input
                required
                value={editForm.internalCode}
                onChange={(e) => setEditForm((f) => ({ ...f, internalCode: e.target.value }))}
                placeholder="Internal code"
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editForm.safehouseId}
                onChange={(e) => setEditForm((f) => ({ ...f, safehouseId: e.target.value }))}
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              >
                {safehouseSelectOptions.map((sh) => (
                  <option key={sh.safehouseId} value={sh.safehouseId}>
                    {sh.name}
                  </option>
                ))}
              </select>
              <select
                value={editForm.sex}
                onChange={(e) => setEditForm((f) => ({ ...f, sex: e.target.value }))}
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editForm.caseStatus}
                onChange={(e) => setEditForm((f) => ({ ...f, caseStatus: e.target.value }))}
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              >
                {CASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={editForm.caseCategory}
                onChange={(e) => setEditForm((f) => ({ ...f, caseCategory: e.target.value }))}
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              >
                <option value="">— Category —</option>
                {editForm.caseCategory
                  && !CASE_CATEGORIES.includes(editForm.caseCategory as (typeof CASE_CATEGORIES)[number]) ? (
                    <option value={editForm.caseCategory}>{editForm.caseCategory}</option>
                  ) : null}
                {CASE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-brand-muted">
                Date of birth
                <input
                  type="date"
                  required
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
                />
              </label>
              <label className="text-xs text-brand-muted">
                Date of admission
                <input
                  type="date"
                  required
                  value={editForm.dateOfAdmission}
                  onChange={(e) => setEditForm((f) => ({ ...f, dateOfAdmission: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
                />
              </label>
            </div>
            <input
              value={editForm.referralSource}
              onChange={(e) => setEditForm((f) => ({ ...f, referralSource: e.target.value }))}
              placeholder="Referral source"
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editForm.currentRiskLevel}
                onChange={(e) => setEditForm((f) => ({ ...f, currentRiskLevel: e.target.value }))}
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              >
                <option value="">— Current risk —</option>
                {RISK_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={editForm.initialRiskLevel}
                onChange={(e) => setEditForm((f) => ({ ...f, initialRiskLevel: e.target.value }))}
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
              >
                <option value="">— Initial risk —</option>
                {RISK_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={editForm.assignedSocialWorker}
              onChange={(e) => setEditForm((f) => ({ ...f, assignedSocialWorker: e.target.value }))}
              placeholder="Assigned social worker"
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <textarea
              value={editForm.initialCaseAssessment}
              onChange={(e) => setEditForm((f) => ({ ...f, initialCaseAssessment: e.target.value }))}
              placeholder="Initial case assessment"
              rows={2}
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <input
              value={editForm.reintegrationType}
              onChange={(e) => setEditForm((f) => ({ ...f, reintegrationType: e.target.value }))}
              placeholder="Reintegration type"
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <input
              value={editForm.reintegrationStatus}
              onChange={(e) => setEditForm((f) => ({ ...f, reintegrationStatus: e.target.value }))}
              placeholder="Reintegration status"
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <textarea
              value={editForm.notesRestricted}
              onChange={(e) => setEditForm((f) => ({ ...f, notesRestricted: e.target.value }))}
              placeholder="Restricted notes"
              rows={2}
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-brand-border p-3 text-xs text-brand-charcoal">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.subCatTrafficked} onChange={(e) => setEditForm((f) => ({ ...f, subCatTrafficked: e.target.checked }))} />Trafficked</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.subCatPhysicalAbuse} onChange={(e) => setEditForm((f) => ({ ...f, subCatPhysicalAbuse: e.target.checked }))} />Physical abuse</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.subCatSexualAbuse} onChange={(e) => setEditForm((f) => ({ ...f, subCatSexualAbuse: e.target.checked }))} />Sexual abuse</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.subCatAtRisk} onChange={(e) => setEditForm((f) => ({ ...f, subCatAtRisk: e.target.checked }))} />At risk</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.isPwd} onChange={(e) => setEditForm((f) => ({ ...f, isPwd: e.target.checked }))} />PWD</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.hasSpecialNeeds} onChange={(e) => setEditForm((f) => ({ ...f, hasSpecialNeeds: e.target.checked }))} />Special needs</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.familyIs4Ps} onChange={(e) => setEditForm((f) => ({ ...f, familyIs4Ps: e.target.checked }))} />4Ps family</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.familySoloParent} onChange={(e) => setEditForm((f) => ({ ...f, familySoloParent: e.target.checked }))} />Solo parent</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.familyIndigenous} onChange={(e) => setEditForm((f) => ({ ...f, familyIndigenous: e.target.checked }))} />Indigenous</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editForm.familyInformalSettler} onChange={(e) => setEditForm((f) => ({ ...f, familyInformalSettler: e.target.checked }))} />Informal settler</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={editForm.pwdType} onChange={(e) => setEditForm((f) => ({ ...f, pwdType: e.target.value }))} placeholder="PWD type" className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal" />
              <input value={editForm.specialNeedsDiagnosis} onChange={(e) => setEditForm((f) => ({ ...f, specialNeedsDiagnosis: e.target.value }))} placeholder="Special needs diagnosis" className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal" />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        )}
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Participants</h1>
          <p className="text-brand-muted text-sm mt-1">
            Caseload inventory · {residents.length} total · {filtered.length} shown
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-bronze text-white text-sm font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          + Add participant
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case number or worker…"
          className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
        >
          <option value="all">All statuses</option>
          {Array.from(new Set(residents.map((resident) => resident.caseStatus))).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={safehouseFilter}
          onChange={(e) => setSafehouseFilter(e.target.value)}
          className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
        >
          <option value="all">All safehouses</option>
          {safehouseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {isAdmin && (
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          >
            <option value="all">All risks</option>
            {RISK_LEVELS.map((risk) => (
              <option key={risk} value={risk}>
                {risk}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-brand-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[880px]">
          <thead>
            <tr className="bg-brand-stone border-b border-brand-border">
              {['Case', 'Internal Code', 'Safehouse', 'Category', 'Risk', 'Status', 'Caseworker', 'Admission', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {!isLoading
              && filtered.map((resident) => (
                <tr
                  key={resident.residentId}
                  className="hover:bg-brand-cream transition-colors border-b border-brand-border"
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-brand-muted">{resident.caseControlNo}</td>
                  <td className="px-4 py-3.5 text-brand-charcoal">{resident.internalCode}</td>
                  <td className="px-4 py-3.5 text-brand-muted">{resident.safehouseName}</td>
                  <td className="px-4 py-3.5 text-brand-muted">{resident.caseCategory ?? '—'}</td>
                  <td className="px-4 py-3.5 text-brand-charcoal">{resident.currentRiskLevel ?? '—'}</td>
                  <td className="px-4 py-3.5 text-brand-charcoal">{resident.caseStatus}</td>
                  <td className="px-4 py-3.5 text-brand-muted">{resident.assignedSocialWorker ?? '—'}</td>
                  <td className="px-4 py-3.5 text-brand-muted">{formatDate(resident.dateOfAdmission)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/admin/cases/${resident.residentId}`}
                        className="text-brand-bronze text-xs font-medium hover:underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(resident.residentId)}
                        className="text-brand-charcoal text-xs font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(resident)}
                        className="text-rose-600 text-xs font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {isLoading && <div className="px-4 py-10 text-center text-brand-muted">Loading participants…</div>}
      </div>
    </div>
  )
}
