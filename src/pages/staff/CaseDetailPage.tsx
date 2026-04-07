import { Link, useParams } from 'react-router-dom'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav'
import CaseStatusBadge from '@/components/shared/CaseStatusBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import RiskIndicator from '@/components/shared/RiskIndicator'
import SensitiveDataMask from '@/components/shared/SensitiveDataMask'
import Timeline from '@/components/shared/Timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { mockParticipants } from '@/data/participants'
import { formatDate } from '@/lib/formatters'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const c = mockParticipants.find((participant) => participant.id === id) ?? mockParticipants[0]

  if (!c) {
    return (
      <div className="text-brand-muted text-center py-24">
        Case {id} not found.
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <BreadcrumbNav
        items={[
          { label: 'Staff', to: '/staff' },
          { label: 'Cases', to: '/staff/cases' },
          { label: c.caseNumber },
        ]}
      />
      <Link
        to="/staff/cases"
        className="inline-flex items-center gap-1 text-brand-muted text-sm hover:text-brand-bronze mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Cases
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-brand-muted font-mono text-sm">{c.caseNumber}</p>
          <h1 className="font-serif text-3xl text-brand-charcoal mt-1">
            {c.firstName} {c.sensitiveDetails.fullName.split(' ')[1]?.charAt(0) ?? ''}.
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {c.program.join(', ')} · Assigned to {c.assignedCaseworkerName}
          </p>
        </div>
        <CaseStatusBadge status={c.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
            <SensitiveDataMask
              label="Date of Birth"
              value={formatDate(c.sensitiveDetails.dateOfBirth, 'long')}
              resourceId={`${c.id}:dateOfBirth`}
              resourceType="case-field"
            />
            <div>
              <dt className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Intake Date</dt>
              <dd className="text-sm text-brand-charcoal">{formatDate(c.intakeDate, 'long')}</dd>
            </div>
            <SensitiveDataMask
              label="Location"
              value={c.sensitiveDetails.originCity}
              resourceId={`${c.id}:location`}
              resourceType="case-field"
            />
            <SensitiveDataMask
              label="Family Contact"
              value={c.sensitiveDetails.familyContact ?? 'Not available'}
              resourceId={`${c.id}:familyContact`}
              resourceType="case-field"
            />
          </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">Risk level</p>
              <div className="mt-2"><RiskIndicator level={c.riskLevel} /></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">Progress score</p>
              <p className="mt-1 text-sm text-brand-charcoal">{c.progressScore}%</p>
              <ProgressBar className="mt-2" value={c.progressScore} tone="teal" />
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-2 text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-sm">Sensitive fields stay masked by default. Any reveal action is logged by the privacy helper.</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-brand-muted">{c.notes}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline items={c.timeline} />
        </CardContent>
      </Card>
    </div>
  )
}
