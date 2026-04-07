import { cn } from '@/lib/utils'

export function Avatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-bronze-muted text-xs font-semibold text-brand-bronze',
        className,
      )}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  )
}

export default Avatar
