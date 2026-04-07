import { Lightbulb } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'

export function SocialRecommendation({ text }: { text: string }) {
  return (
    <Alert variant="info">
      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-bronze" />
        <p>{text}</p>
      </div>
    </Alert>
  )
}

export default SocialRecommendation
