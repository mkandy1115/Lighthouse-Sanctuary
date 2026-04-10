import { useEffect, useMemo, useState } from 'react'
import { getReportsSummary, type ReportsSummaryResponse } from '@/lib/staff'
import { formatPercent, formatUsdFromPhp } from '@/lib/formatters'
import { useTableSort } from '@/lib/tableSort'

export default function ReportsPage() {
  const [data, setData] = useState<ReportsSummaryResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setData(await getReportsSummary())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load reports summary.')
      }
    }
    load()
  }, [])

  const donationRows = data?.donationsByMonth ?? []
  const safehouseRows = data?.safehouseComparisons ?? []
  const outcomeRows = useMemo(() => (data?.residentOutcomeMetrics ?? []).slice(0, 12), [data?.residentOutcomeMetrics])
  const donationSort = useTableSort<(typeof donationRows)[number], 'month' | 'raised' | 'donors'>(
    donationRows,
    (row, key) => row[key],
  )
  const safehouseSort = useTableSort<(typeof safehouseRows)[number], 'safehouse' | 'education' | 'health' | 'visits' | 'recordings'>(
    safehouseRows,
    (row, key) => {
      switch (key) {
        case 'safehouse': return Number(row.safehouseId)
        case 'education': return Number(row.avgEducationProgress ?? 0)
        case 'health': return Number(row.avgHealthScore ?? 0)
        case 'visits': return Number(row.totalHomeVisitations ?? 0)
        case 'recordings': return Number(row.totalProcessRecordings ?? 0)
        default: return ''
      }
    },
  )
  const outcomeSort = useTableSort<(typeof outcomeRows)[number], 'month' | 'activeResidents' | 'education' | 'health' | 'incidents'>(
    outcomeRows,
    (row, key) => {
      switch (key) {
        case 'month': return String(row.monthStart)
        case 'activeResidents': return Number(row.activeResidents ?? 0)
        case 'education': return Number(row.avgEducationProgress ?? 0)
        case 'health': return Number(row.avgHealthScore ?? 0)
        case 'incidents': return Number(row.incidentCount ?? 0)
        default: return ''
      }
    },
  )

  if (error) {
    return <div className="py-16 text-center text-rose-700">{error}</div>
  }

  if (!data) {
    return <div className="py-16 text-center text-brand-muted">Loading reports…</div>
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-charcoal">Reports & Analytics</h1>
        <p className="text-brand-muted text-sm mt-1">Aggregated insights for fundraising, resident outcomes, safehouse performance, and reintegration.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <p className="text-xs text-brand-muted uppercase tracking-wider font-medium mb-2">Reintegration Success</p>
          <p className="font-serif text-3xl text-brand-bronze">
            {data.reintegration.totalTracked > 0
              ? formatPercent((data.reintegration.completed / data.reintegration.totalTracked) * 100, 0)
              : '0%'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <p className="text-xs text-brand-muted uppercase tracking-wider font-medium mb-2">Donation Months Tracked</p>
          <p className="font-serif text-3xl text-brand-teal">{data.donationsByMonth.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <p className="text-xs text-brand-muted uppercase tracking-wider font-medium mb-2">Safehouse Comparison Rows</p>
          <p className="font-serif text-3xl text-brand-charcoal">{data.safehouseComparisons.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-brand-border">
          <h2 className="font-semibold text-brand-charcoal text-sm">Donation Trends Over Time</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationSort.toggleSort('month')} className="hover:text-brand-charcoal">Month{donationSort.indicator('month')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationSort.toggleSort('raised')} className="hover:text-brand-charcoal">Raised{donationSort.indicator('raised')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationSort.toggleSort('donors')} className="hover:text-brand-charcoal">Distinct Donors{donationSort.indicator('donors')}</button></th>
            </tr>
          </thead>
          <tbody>
            {donationSort.sortedRows.map((row) => (
              <tr key={row.month} className="border-b border-brand-border/50">
                <td className="px-4 py-3 text-brand-charcoal">{row.month}</td>
                <td className="px-4 py-3 font-semibold text-brand-charcoal">{formatUsdFromPhp(row.raised)}</td>
                <td className="px-4 py-3 text-brand-muted">{row.donors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-semibold text-brand-charcoal text-sm">Safehouse Performance Comparison</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => safehouseSort.toggleSort('safehouse')} className="hover:text-brand-charcoal">Safehouse{safehouseSort.indicator('safehouse')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => safehouseSort.toggleSort('education')} className="hover:text-brand-charcoal">Avg Education{safehouseSort.indicator('education')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => safehouseSort.toggleSort('health')} className="hover:text-brand-charcoal">Avg Health{safehouseSort.indicator('health')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => safehouseSort.toggleSort('visits')} className="hover:text-brand-charcoal">Home Visits{safehouseSort.indicator('visits')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => safehouseSort.toggleSort('recordings')} className="hover:text-brand-charcoal">Process Recordings{safehouseSort.indicator('recordings')}</button></th>
              </tr>
            </thead>
            <tbody>
              {safehouseSort.sortedRows.map((row, index) => (
                <tr key={index} className="border-b border-brand-border/50">
                  <td className="px-4 py-3 text-brand-charcoal">Safehouse #{String(row.safehouseId)}</td>
                  <td className="px-4 py-3 text-brand-muted">{Number(row.avgEducationProgress ?? 0).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-brand-muted">{Number(row.avgHealthScore ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-brand-muted">{String(row.totalHomeVisitations)}</td>
                  <td className="px-4 py-3 text-brand-muted">{String(row.totalProcessRecordings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-semibold text-brand-charcoal text-sm">Resident Outcome Metrics</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => outcomeSort.toggleSort('month')} className="hover:text-brand-charcoal">Month Start{outcomeSort.indicator('month')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => outcomeSort.toggleSort('activeResidents')} className="hover:text-brand-charcoal">Active Residents{outcomeSort.indicator('activeResidents')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => outcomeSort.toggleSort('education')} className="hover:text-brand-charcoal">Avg Education{outcomeSort.indicator('education')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => outcomeSort.toggleSort('health')} className="hover:text-brand-charcoal">Avg Health{outcomeSort.indicator('health')}</button></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => outcomeSort.toggleSort('incidents')} className="hover:text-brand-charcoal">Incidents{outcomeSort.indicator('incidents')}</button></th>
              </tr>
            </thead>
            <tbody>
              {outcomeSort.sortedRows.map((row, index) => (
                <tr key={index} className="border-b border-brand-border/50">
                  <td className="px-4 py-3 text-brand-charcoal">{String(row.monthStart).slice(0, 10)}</td>
                  <td className="px-4 py-3 text-brand-muted">{String(row.activeResidents)}</td>
                  <td className="px-4 py-3 text-brand-muted">{Number(row.avgEducationProgress ?? 0).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-brand-muted">{Number(row.avgHealthScore ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-brand-muted">{String(row.incidentCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
