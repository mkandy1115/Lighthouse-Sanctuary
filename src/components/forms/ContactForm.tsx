import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export function ContactForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Your name" />
      <Input placeholder="Email address" type="email" />
      <Textarea placeholder="How can we help?" />
      <Button type="button">Send message</Button>
    </form>
  )
}

export default ContactForm
