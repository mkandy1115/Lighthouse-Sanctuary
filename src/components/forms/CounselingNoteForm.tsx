import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'

export function CounselingNoteForm() {
  return (
    <form className="space-y-4">
      <Textarea placeholder="Session themes, progress indicators, and next steps" />
      <Button type="button">Save Note</Button>
    </form>
  )
}

export default CounselingNoteForm
