import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const TPL_APPROVE = import.meta.env.VITE_EMAILJS_TEMPLATE_APPROVED
const TPL_REJECT  = import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTED

export async function sendApprovalEmail(customer) {
  if (!SERVICE_ID || !PUBLIC_KEY || !TPL_APPROVE) return
  return emailjs.send(SERVICE_ID, TPL_APPROVE, {
    to_email:  customer.email,
    to_name:   customer.full_name ?? 'Customer',
    login_url: window.location.origin + '/login',
  }, PUBLIC_KEY)
}

export async function sendRejectionEmail(customer, reason) {
  if (!SERVICE_ID || !PUBLIC_KEY || !TPL_REJECT) return
  return emailjs.send(SERVICE_ID, TPL_REJECT, {
    to_email: customer.email,
    to_name:  customer.full_name ?? 'Customer',
    reason:   reason || 'No reason provided.',
  }, PUBLIC_KEY)
}
