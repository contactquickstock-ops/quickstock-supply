import { useState } from 'react'
import { MdGavel, MdExpandMore, MdExpandLess } from 'react-icons/md'
import PublicLayout from '../../layouts/PublicLayout'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By registering and using the QuickStock Supply platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our service.',
  },
  {
    title: '2. Eligibility',
    body: 'To use QuickStock Supply, you must be a registered business owner, store operator, or authorized representative, and provide accurate and truthful information during registration. Your account must be approved by our admin team before you can place orders.',
  },
  {
    title: '3. Account Registration',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account. One account per business is allowed. QuickStock Supply reserves the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: '4. Orders and Payment',
    body: 'Orders are subject to product availability. Payment is Cash on Delivery (COD) only — pay in cash when your order arrives at your door. No advance payment is required. Free delivery applies to orders ₱500 and above. A ₱25 delivery fee applies to orders below ₱500.',
  },
  {
    title: '5. Delivery Policy',
    body: 'QuickStock Supply offers same-day delivery within business hours (8:00 AM – 8:00 PM). Orders placed after 8:00 PM will be delivered the next business day. We are not liable for delays caused by force major events such as typhoons, floods, or road closures.',
  },
  {
    title: '6. Cancellation Policy',
    body: 'Customers may cancel an order only while the order status is Pending, Confirmed, or Assigned. Once the status changes to On the Way, cancellation is no longer possible — the order is already en route for delivery. To cancel, go to My Orders, open the order, and tap Cancel Order. A reason must be provided before the cancellation is processed.',
  },
  {
    title: '7. Premium Membership',
    body: 'Premium Membership is ₱1,500 for the first 2 years and ₱1,000/year for renewal. Applications require proof of payment and are subject to admin approval. Membership fees are non-refundable once approved. QuickStock Supply reserves the right to revoke membership for violations of these terms.',
  },
  {
    title: '8. Rewards and Points',
    body: 'Only active Premium Members are eligible to earn reward points — 1 point per ₱100 spent on delivered orders. Points do not expire. Expired memberships stop earning points, but existing points remain redeemable. QuickStock Supply reserves the right to modify the rewards program at any time with prior notice.',
  },
  {
    title: '9. Privacy and Data',
    body: 'We collect personal information (name, contact number, address, business details) solely to process orders and manage your account. Your information will not be shared with third parties without your consent, except as required by law.',
  },
  {
    title: '10. Prohibited Conduct',
    body: 'Users are prohibited from providing false information, creating multiple accounts to abuse promotions, or using the platform for any unlawful purpose.',
  },
  {
    title: '11. Contact Us',
    body: 'For questions or concerns, contact us at contactquickstock@gmail.com or call us at 09304453799 (Monday–Sunday, 8:00 AM–8:00 PM).',
  },
]

export default function TermsPage() {
  const [open, setOpen] = useState(null)

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-[#168AFF] to-[#0D5FC4] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white
            text-xs font-bold px-4 py-1.5 rounded-full">
            <MdGavel size={14} /> Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/85 text-base leading-relaxed max-w-xl mx-auto">
            Please read these terms carefully before using QuickStock Supply.
            By creating an account, you agree to the following terms.
          </p>
        </div>
      </section>

      {/* ── Sections ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-3">
          {SECTIONS.map(({ title, body }, i) => (
            <div key={title}
              className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="font-bold text-gray-800 text-sm">{title}</span>
                {open === i
                  ? <MdExpandLess size={20} className="text-[#168AFF] shrink-0" />
                  : <MdExpandMore size={20} className="text-gray-400 shrink-0" />}
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </PublicLayout>
  )
}
