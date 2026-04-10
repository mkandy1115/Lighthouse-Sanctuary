import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortState<K extends string> {
  key: K | null
  direction: SortDirection
}

function toComparable(value: unknown): number | string {
  if (value == null) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'boolean') return value ? 1 : 0
  if (value instanceof Date) return value.getTime()

  const raw = String(value).trim()
  if (!raw) return ''

  const asNumber = Number(raw.replace(/[$,%\s,]/g, ''))
  if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) return asNumber

  const asDate = Date.parse(raw)
  if (!Number.isNaN(asDate)) return asDate

  return raw.toLowerCase()
}

function compareValues(a: unknown, b: unknown): number {
  const va = toComparable(a)
  const vb = toComparable(b)

  if (typeof va === 'number' && typeof vb === 'number') return va - vb
  return String(va).localeCompare(String(vb))
}

export function useTableSort<T, K extends string>(
  rows: T[],
  getValue: (row: T, key: K) => unknown,
) {
  const [sort, setSort] = useState<SortState<K>>({ key: null, direction: 'asc' })

  function toggleSort(key: K) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compareValues(getValue(a, sort.key as K), getValue(b, sort.key as K)))
  }, [getValue, rows, sort.direction, sort.key])

  function indicator(key: K) {
    if (sort.key !== key) return ''
    return sort.direction === 'asc' ? ' ▲' : ' ▼'
  }

  return {
    sort,
    sortedRows,
    toggleSort,
    indicator,
  }
}
