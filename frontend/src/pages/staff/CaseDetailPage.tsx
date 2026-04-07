import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getResident, type ResidentDetailResponse } from '@/lib/staff'
import { formatDate } from '@/lib/formatters'

export default function CaseDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [data, setData] = useState<ResidentDetailResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setData(await getResident(id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load case.')
      }
    }

    load()
  }, [id])

  if (error) {
    return <div className="py-16 text-center text-rose-700">{error}</div>
  }

  if (!data) {
    return <div className="py-16 text-center text-brand-muted">Loading case detail…</div>
  }

  const resident = data.resident as Record<string, unknown>

  return (
    <div className="animate-fade-in max-w-5xl">
      <Link to="/admin/cases" className="inline-flex items-center gap-1 text-brand-muted text-sm hover:text-brand-bronze mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to participants
      </Link>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-brand-border p-6">
          <p className="text-brand-muted font-mono text-sm">{String(resident.caseControlNo ?? '')}</p>
          <h1 className="font-serif text-3xl text-brand-charcoal mt-1">{String(resident.internalCode ?? 'Resident')}</h1>
          <p className="text-brand-muted text-sm mt-2">
            {String(resident.caseCategory ?? 'Uncategorized')} · {String(resident.caseStatus ?? 'Unknown')} · {data.safehouseName ?? 'Unassigned safehouse'}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div><dt className="text-brand-muted text-xs mb-1">Assigned Social Worker</dt><dd className="text-brand-charcoal">{String(resident.assignedSocialWorker ?? '—')}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-1">Current Risk</dt><dd className="text-brand-charcoal">{String(resident.currentRiskLevel ?? '—')}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-1">Referral Source</dt><dd className="text-brand-charcoal">{String(resident.referralSource ?? '—')}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-1">Date of Admission</dt><dd className="text-brand-charcoal">{resident.dateOfAdmission ? formatDate(String(resident.dateOfAdmission)) : '—'}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-1">Present Age</dt><dd className="text-brand-charcoal">{String(resident.presentAge ?? '—')}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-1">Reintegration Status</dt><dd className="text-brand-charcoal">{String(resident.reintegrationStatus ?? '—')}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-1">Disability</dt><dd className="text-brand-charcoal">{Boolean(resident.isPwd) ? String(resident.pwdType ?? 'Yes') : 'No'}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-1">Special Needs</dt><dd className="text-brand-charcoal">{Boolean(resident.hasSpecialNeeds) ? String(resident.specialNeedsDiagnosis ?? 'Yes') : 'No'}</dd></div>
          </div>
        </div>

        <div className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-4 text-sm">Family Profile Flags</h2>
          <div className="space-y-2 text-sm text-brand-charcoal">
            <div>4Ps beneficiary: {Boolean(resident.familyIs4Ps) ? 'Yes' : 'No'}</div>
            <div>Solo parent: {Boolean(resident.familySoloParent) ? 'Yes' : 'No'}</div>
            <div>Indigenous: {Boolean(resident.familyIndigenous) ? 'Yes' : 'No'}</div>
            <div>Parent with disability: {Boolean(resident.familyParentPwd) ? 'Yes' : 'No'}</div>
            <div>Informal settler: {Boolean(resident.familyInformalSettler) ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="bg-white rounded-xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-semibold text-brand-charcoal text-sm">Process Recordings</h2>
          </div>
          <div className="divide-y divide-brand-border">
            {data.processRecordings.map((record) => (
              <div key={record.recordingId} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-brand-charcoal">{record.sessionType ?? 'Session'} · {record.socialWorker ?? 'Unassigned worker'}</div>
                  <div className="text-xs text-brand-muted">{formatDate(record.sessionDate)}</div>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{record.sessionNarrative ?? 'No narrative recorded.'}</p>
                <p className="mt-2 text-xs text-brand-muted">Interventions: {record.interventionsApplied ?? '—'}</p>
                <p className="mt-1 text-xs text-brand-muted">Follow-up: {record.followUpActions ?? '—'}</p>
              </div>
            ))}
            {data.processRecordings.length === 0 && <div className="px-5 py-8 text-center text-brand-muted">No process recordings yet.</div>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-semibold text-brand-charcoal text-sm">Home Visitations</h2>
          </div>
          <div className="divide-y divide-brand-border">
            {data.homeVisitations.map((visit) => (
              <div key={visit.visitationId} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-brand-charcoal">{visit.visitType ?? 'Visit'} · {visit.socialWorker ?? 'Unassigned worker'}</div>
                  <div className="text-xs text-brand-muted">{formatDate(visit.visitDate)}</div>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{visit.observations ?? 'No observations recorded.'}</p>
                <p className="mt-2 text-xs text-brand-muted">Cooperation: {visit.familyCooperationLevel ?? '—'} · Outcome: {visit.visitOutcome ?? '—'}</p>
              </div>
            ))}
            {data.homeVisitations.length === 0 && <div className="px-5 py-8 text-center text-brand-muted">No home visits yet.</div>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-semibold text-brand-charcoal text-sm">Intervention Plans / Conference Notes</h2>
          </div>
          <div className="divide-y divide-brand-border">
            {data.interventions.map((plan) => (
              <div key={plan.planId} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-brand-charcoal">{plan.planCategory ?? 'Plan'} · {plan.status ?? 'Unknown status'}</div>
                  <div className="text-xs text-brand-muted">{plan.caseConferenceDate ? formatDate(plan.caseConferenceDate) : 'No conference date'}</div>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{plan.planDescription}</p>
                <p className="mt-2 text-xs text-brand-muted">Services: {plan.servicesProvided ?? '—'}</p>
              </div>
            ))}
            {data.interventions.length === 0 && <div className="px-5 py-8 text-center text-brand-muted">No intervention plans yet.</div>}
          </div>
        </section>
      </div>
    </div>
  )
}
