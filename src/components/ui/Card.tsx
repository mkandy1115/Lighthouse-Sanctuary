import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-brand-border bg-brand-cream shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn('px-5 py-4 border-b border-brand-border', className)}>{children}</div>
}

export function CardTitle({
  className,
  children,
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return <h2 className={cn('font-semibold text-brand-charcoal', className)}>{children}</h2>
}

export function CardContent({
  className,
  children,
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export default Card
