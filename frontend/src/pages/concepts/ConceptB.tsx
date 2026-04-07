// Concept B — Mission SaaS: dark sidebar, data-dense dashboard aesthetic
export default function ConceptB() {
  return (
    <div className="flex min-h-screen">
      {/* Dark sidebar preview */}
      <aside className="w-64 bg-sidebar min-h-screen flex flex-col p-4">
        <div className="mb-8 px-2 pt-4">
          <p className="text-sidebar-text-active font-semibold text-lg">Lighthouse</p>
          <p className="text-sidebar-text-muted text-xs">Mission SaaS — Concept B</p>
        </div>
        {['Dashboard', 'Cases', 'Donors', 'Reports', 'Settings'].map((item) => (
          <button
            key={item}
            className="text-left px-3 py-2 rounded-lg text-sidebar-text text-sm hover:bg-sidebar-hover hover:text-sidebar-text-active transition-colors mb-1"
          >
            {item}
          </button>
        ))}
      </aside>
      {/* White content area */}
      <main className="flex-1 bg-white p-10">
        <h1 className="font-serif text-3xl text-brand-charcoal mb-2">
          Concept B — Mission SaaS
        </h1>
        <p className="text-brand-muted mb-8">
          Dark slate sidebar (#0F172A) with clean white content area. Optimized for
          data-dense internal operations.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Cases', value: '142', delta: '+8 this week' },
            { label: 'Donors YTD', value: '324', delta: '+12 this month' },
            { label: 'Funds Raised', value: '₱2.4M', delta: '+₱180K MTD' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-brand-border rounded-xl p-5 bg-brand-cream"
            >
              <p className="text-brand-muted text-xs font-medium uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="font-serif text-2xl text-brand-charcoal">{stat.value}</p>
              <p className="text-brand-teal text-xs mt-1">{stat.delta}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
