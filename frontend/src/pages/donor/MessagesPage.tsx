import { formatDate } from '@/lib/formatters'

const messages = [
  {
    id: '1',
    from: 'Lighthouse Team',
    subject: 'Thank you for your January contribution',
    date: '2025-01-11',
    read: true,
    preview: 'Dear valued donor, your generous gift of ₱25,000 to the Emergency Shelter Fund has been received…',
  },
  {
    id: '2',
    from: 'Director — Program Services',
    subject: 'Year-End Impact Letter 2024',
    date: '2025-01-02',
    read: true,
    preview: 'As we close out an extraordinary year, we wanted to personally share the outcomes made possible by your support…',
  },
  {
    id: '3',
    from: 'Lighthouse Team',
    subject: 'New campaign: Children\'s Wellness Fund',
    date: '2024-12-18',
    read: false,
    preview: 'We are launching a new initiative to provide psychosocial and educational support to children of survivors…',
  },
]

export default function DonorMessagesPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-charcoal">Messages</h1>
        <p className="text-brand-muted text-sm mt-1">Communications from the Lighthouse team</p>
      </div>

      <div className="space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border p-4 cursor-pointer hover:shadow-card transition-all ${
              m.read ? 'bg-brand-cream border-brand-border' : 'bg-white border-brand-bronze/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {!m.read && <div className="w-2 h-2 rounded-full bg-brand-bronze shrink-0" />}
                <p className={`text-sm ${m.read ? 'text-brand-charcoal' : 'text-brand-charcoal font-semibold'}`}>
                  {m.subject}
                </p>
              </div>
              <p className="text-xs text-brand-muted shrink-0 ml-4">{formatDate(m.date)}</p>
            </div>
            <p className="text-xs text-brand-muted mb-0.5">From: {m.from}</p>
            <p className="text-xs text-brand-muted/80 leading-relaxed line-clamp-2">{m.preview}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
