import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export function DonationForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Donation amount" />
      <Select defaultValue="one-time">
        <option value="one-time">One-time gift</option>
        <option value="monthly">Monthly gift</option>
      </Select>
      <Button type="button">Continue</Button>
    </form>
  )
}

export default DonationForm
