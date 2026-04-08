import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export function HomeVisitForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Visit date" type="date" required />
      <Select defaultValue="safe">
        <option value="safe">Safe</option>
        <option value="follow-up">Needs follow-up</option>
        <option value="referred">Referred</option>
      </Select>
      <Button type="submit">Log Visit</Button>
    </form>
  )
}

export default HomeVisitForm
