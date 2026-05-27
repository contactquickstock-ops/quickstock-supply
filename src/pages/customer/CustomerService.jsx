import { useState } from 'react'
import {
  MdPhone, MdEmail, MdLocationOn, MdCheckCircle,
  MdAccessTime, MdSend, MdGavel, MdExpandMore, MdExpandLess,
} from 'react-icons/md'
import { FaFacebookF } from 'react-icons/fa'
import CustomerLayout from '../../layouts/CustomerLayout'

const WEB3FORMS_KEY = 'f9fe7cd7-4658-48d8-9e4c-027212395013'

const FB_URL = 'https://www.facebook.com/profile.php?id=61570722723997'

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'We offer same-day delivery. Orders will be delivered on the same day they are confirmed, subject to availability.',
  },
  {
    q: 'Is there a minimum order amount?',
    a: 'There is no minimum order amount. However, orders below ₱500 incur a ₱25 delivery fee. Orders ₱500 and above enjoy FREE delivery — even without a membership.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept Cash on Delivery (COD) and GCash. For GCash, send the exact amount to our official GCash number and upload your payment screenshot during checkout. Our admin will verify it before confirming your order.',
  },
  {
    q: 'How do I earn reward points?',
    a: 'Only active Premium Members earn reward points — 1 point for every ₱100 spent. Points are credited automatically once your order is delivered.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Orders can be cancelled before they are confirmed by our admin. Once confirmed, cancellations are no longer accepted. Contact us immediately if you need to cancel.',
  },
  {
    q: 'How does Premium Membership work?',
    a: 'Premium Membership costs ₱1,500 for the first 2 years. Renewal is ₱1,000/year. Members earn reward points on every delivered order. Apply through the Membership tab and upload your proof of payment.',
  },
  {
    q: 'What happens to my points if my membership expires?',
    a: 'Your existing points remain valid and can still be redeemed even after your membership expires. However, you will stop earning new points until you renew.',
  },
  {
    q: 'When can I apply for membership renewal?',
    a: 'You can apply for renewal anytime within 30 days before your membership expires, or after it has already expired. Simply go to the Membership tab and click "Renew Now".',
  },
]

const TC_SECTIONS = [
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
    body: 'Orders are subject to product availability. Accepted payment methods are Cash on Delivery (COD) and GCash. For GCash payments, you must upload a real and unaltered screenshot of your payment confirmation. Our admin reviews all GCash proofs before accepting your order. Submitting fake or manipulated payment proofs is grounds for immediate account termination. Free delivery applies to orders ₱500 and above. A ₱25 delivery fee applies to orders below ₱500 unless you have an active Premium Membership.',
  },
  {
    title: '5. Delivery Policy',
    body: 'QuickStock Supply offers same-day delivery. Orders will be delivered on the same day they are confirmed, subject to availability. We are not liable for delays caused by force majeure events such as typhoons, floods, or road closures.',
  },
  {
    title: '6. Premium Membership',
    body: 'Premium Membership is ₱1,500 for the first 2 years and ₱1,000/year for renewal. Applications require proof of payment and are subject to admin approval. Membership fees are non-refundable once approved. QuickStock Supply reserves the right to revoke membership for violations of these terms.',
  },
  {
    title: '7. Rewards and Points',
    body: 'Only active Premium Members are eligible to earn reward points — 1 point per ₱100 spent on delivered orders. Points do not expire. Expired memberships stop earning points, but existing points remain redeemable. QuickStock Supply reserves the right to modify the rewards program at any time with prior notice.',
  },
  {
    title: '8. Privacy and Data',
    body: 'We collect personal information (name, contact number, address, business details) solely to process orders and manage your account. Your information will not be shared with third parties without your consent, except as required by law.',
  },
  {
    title: '9. Prohibited Conduct',
    body: 'Users are prohibited from providing false information, uploading fake or edited payment proofs, creating multiple accounts to abuse promotions, or using the platform for any unlawful purpose.',
  },
  {
    title: '10. Contact Us',
    body: 'For questions or concerns, contact us at contactquickstock@gmail.com, call us at 09304453799 (Monday–Sunday, 8:00 AM–8:00 PM), or visit us at Lubogan, Toril, Davao City.',
  },
]

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition`

export default function CustomerService() {
  const [sent,      setSent]      = useState(false)
  const [sending,   setSending]   = useState(false)
  const [sendError, setSendError] = useState(null)
  const [form,      setForm]      = useState({ name: '', email: '', subject: '', message: '' })
  const [openTC,    setOpenTC]    = useState(null)   // index of open T&C accordion item

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setSendError(null)
    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name:  form.name,
          email:      form.email,
          subject:    `[QuickStock Service] ${form.subject}`,
          message:    form.message,
          botcheck:   '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        throw new Error(data.message || 'Failed to send. Please try again.')
      }
    } catch (err) {
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <h2 className="text-xl font-bold text-gray-800">Customer Service</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Have a question or concern? We're here to help.
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MdPhone,      label: 'Phone',   value: '09304453799',               sub: 'Mon–Sun, 8:00AM–8:00PM' },
            { icon: MdEmail,      label: 'Email',   value: 'contactquickstock@gmail.com', sub: 'We reply within 24h'    },
            { icon: MdLocationOn, label: 'Address', value: 'Lubogan, Toril Davao City',  sub: 'Service area'           },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label}
              className="flex flex-col items-center gap-2.5 text-center p-5 bg-white
                rounded-2xl border border-gray-100 shadow-sm hover:border-[#168AFF] transition">
              <div className="w-11 h-11 bg-[#168AFF] rounded-xl flex items-center
                justify-center shadow-sm">
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">{label}</p>
                <p className="text-gray-800 font-bold text-sm mt-0.5">{value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Business hours + Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MdAccessTime size={18} className="text-[#168AFF]" />
              <h3 className="font-bold text-gray-800 text-sm">Business Hours</h3>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Monday – Sunday</span>
              <span className="text-gray-800 font-semibold">8:00 AM – 8:00 PM</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 space-y-3">
            <h3 className="font-bold text-gray-800 text-sm">Follow Us</h3>
            <p className="text-gray-500 text-sm">
              Stay updated with new products and promos on our Facebook page.
            </p>
            <a href={FB_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2]
                text-white font-bold rounded-xl hover:opacity-90 transition text-sm">
              <FaFacebookF size={14} /> Follow on Facebook
            </a>
          </div>
        </div>

        {/* Contact form */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">Send a Message</h3>
            <p className="text-gray-400 text-sm">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          {sent ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center space-y-3">
              <MdCheckCircle size={40} className="text-[#168AFF] mx-auto" />
              <h3 className="font-bold text-gray-800 text-base">Message Sent!</h3>
              <p className="text-gray-500 text-sm">
                Thank you for reaching out. We'll reply to your email within 24 hours.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                className="text-[#168AFF] font-semibold text-sm hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                  <input type="text" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Juan Dela Cruz" className={INPUT_CLS} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com" className={INPUT_CLS} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
                <input type="text" required value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="How can we help you?" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message *</label>
                <textarea required rows={5} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write your message here…"
                  className={`${INPUT_CLS} resize-none`} />
              </div>
              {sendError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {sendError}
                </div>
              )}
              <button type="submit" disabled={sending}
                className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl
                  hover:bg-[#1270DB] transition shadow-sm flex items-center
                  justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {sending
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                  : <><MdSend size={16} /> Send Message</>}
              </button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-800">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1.5">
                <h4 className="font-bold text-gray-800 text-sm flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#168AFF] text-white rounded-full flex items-center
                    justify-center text-xs font-black shrink-0 mt-0.5">?</span>
                  {q}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed pl-7">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MdGavel size={18} className="text-[#168AFF]" />
            <h3 className="text-base font-bold text-gray-800">Terms and Conditions</h3>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Effective Date: June 1, 2026 · By using QuickStock Supply, you agree to the following terms.
          </p>
          <div className="space-y-2">
            {TC_SECTIONS.map((section, i) => {
              const isOpen = openTC === i
              return (
                <div key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenTC(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4
                      text-left hover:bg-gray-50 transition">
                    <span className="text-gray-800 font-bold text-sm">{section.title}</span>
                    {isOpen
                      ? <MdExpandLess size={20} className="text-gray-400 shrink-0" />
                      : <MdExpandMore size={20} className="text-gray-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-50">
                      <p className="text-gray-500 text-sm leading-relaxed pt-3">
                        {section.body}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-gray-400 text-xs text-center leading-relaxed px-4">
            By creating an account and using QuickStock Supply, you acknowledge that you have read,
            understood, and agreed to these Terms and Conditions.
          </p>
        </div>

      </div>
    </CustomerLayout>
  )
}
