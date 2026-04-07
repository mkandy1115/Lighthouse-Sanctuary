import { NavLink } from 'react-router-dom'
import { ChevronLeft, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SidebarItem = {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

export function Sidebar({
  collapsed,
  onToggle,
  items,
  title,
  subtitle,
  footerAction,
}: {
  collapsed: boolean
  onToggle: () => void
  items: SidebarItem[]
  title: string
  subtitle: string
  footerAction: () => void
}) {
  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col bg-sidebar shadow-sidebar md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cn('flex items-center border-b border-sidebar-border', collapsed ? 'justify-center px-2 py-4' : 'justify-between px-5 py-5')}>
        {!collapsed && (
          <div>
            <p className="text-base font-semibold leading-none text-sidebar-text-active">{title}</p>
            <p className="mt-1 text-xs text-sidebar-text-muted">{subtitle}</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded p-1 text-sidebar-text-muted transition-colors hover:text-sidebar-text-active"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length === 2}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-sidebar-active font-medium text-sidebar-text-active'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active',
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-2 py-3">
        <button
          onClick={footerAction}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-sidebar-text-active',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
