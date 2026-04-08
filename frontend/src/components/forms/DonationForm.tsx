import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export function DonationForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Donation amount" type="number" min={1} max={100000} required />
      <Select defaultValue="one-time">
        <option value="one-time">One-time gift</option>
        <option value="monthly">Monthly gift</option>
      </Select>
      <Button type="submit">Continue</Button>
    </form>
  )
}

export default DonationForm
