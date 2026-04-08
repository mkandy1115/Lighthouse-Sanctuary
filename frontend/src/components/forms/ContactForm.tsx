import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export function ContactForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Your name" maxLength={100} required />
      <Input placeholder="Email address" type="email" maxLength={254} required />
      <Textarea placeholder="How can we help?" maxLength={2000} required />
      <Button type="submit">Send message</Button>
    </form>
  )
}

export default ContactForm
