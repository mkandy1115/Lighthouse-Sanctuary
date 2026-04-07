import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BreadcrumbNav({
  items,
}: {
  items: { label: string; to?: string }[]
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-brand-muted">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {item.to ? (
              <Link to={item.to} className="transition-colors hover:text-brand-bronze">
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-charcoal">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default BreadcrumbNav
