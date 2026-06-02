import { useState } from 'react'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'

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
    body: 'Orders are subject to product availability. Payment is Cash on Delivery (COD) only — pay in cash when your order arrives at your door. No advance payment is required. A ₱25 convenience fee applies to all non-member orders. Premium Members enjoy FREE delivery on orders ₱500 and above.',
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

export default function CustomerTerms() {
  const [open, setOpen] = useState(null)

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">Terms &amp; Conditions</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            By using QuickStock Supply, you agree to the following terms.
          </p>
        </div>

        <div className="space-y-2">
          {SECTIONS.map(({ title, body }, i) => (
            <div key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left
                  hover:bg-gray-50 active:bg-gray-50 transition">
                <span className="font-bold text-gray-800 text-sm">{title}</span>
                {open === i
                  ? <MdExpandLess size={20} className="text-[#168AFF] shrink-0" />
                  : <MdExpandMore size={20} className="text-gray-400 shrink-0" />}
              </button>
              {open === i && (
                <div className="px-5 pb-4 border-t border-gray-50">
                  <p className="text-gray-500 text-sm leading-relaxed pt-3">{body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-xs text-center leading-relaxed pb-4">
          By creating an account and using QuickStock Supply, you acknowledge that you have
          read, understood, and agreed to these Terms and Conditions.
        </p>

      </div>
    </CustomerLayout>
  )
}
