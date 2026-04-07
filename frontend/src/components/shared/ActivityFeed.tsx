import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function ActivityFeed({
  title,
  items,
}: {
  title: string
  items: { time: string; text: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={`${item.time}-${item.text}`} className="flex gap-3 text-sm">
              <span className="w-20 shrink-0 pt-0.5 text-brand-muted">{item.time}</span>
              <span className="text-brand-charcoal">{item.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
