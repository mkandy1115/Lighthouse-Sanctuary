import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function HeroSection({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-brand-border dark:border-slate-700 px-6 py-16 shadow-card-lg md:px-12',
        'bg-[linear-gradient(155deg,#FAFAF8_0%,#F5F4F1_55%,#EDE8DF_100%)] dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900',
        className,
      )}
    >
      <div className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-brand-bronze/10 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-brand-teal/10 blur-3xl" />
      <div className="relative max-w-3xl">
        {eyebrow && <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-bronze dark:text-brand-bronze-light">{eyebrow}</p>}
        <h1 className="font-serif text-4xl leading-tight text-brand-charcoal dark:text-white md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-muted dark:text-slate-300 md:text-lg">{description}</p>
        {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </section>
  )
}

export default HeroSection
