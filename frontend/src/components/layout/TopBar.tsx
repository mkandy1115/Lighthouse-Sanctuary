import { Search } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'

export function TopBar({
  title,
  subtitle,
  userName,
}: {
  title: string
  subtitle: string
  userName: string
}) {
  return (
    <header className="border-b border-brand-border bg-white/90 px-6 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">{title}</h1>
          <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <Input className="w-64 pl-9" placeholder="Search people, cases, campaigns" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-cream px-2 py-1.5">
            <Avatar name={userName} className="h-8 w-8" />
            <span className="pr-2 text-sm font-medium text-brand-charcoal">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
