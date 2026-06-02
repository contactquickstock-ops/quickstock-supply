import PublicLayout from '../../layouts/PublicLayout'
import { Link } from 'react-router-dom'
import { MdArrowForward } from 'react-icons/md'

const FAQS = [
  {
    q: 'How do I create an account?',
    a: 'Click "Sign Up" at the top of the page, fill in your business details, and wait for admin approval. Once approved, you can start browsing and placing orders.',
  },
  {
    q: 'How long does delivery take?',
    a: 'We offer same-day delivery within business hours (8:00 AM – 8:00 PM). Orders placed after 8:00 PM will be delivered the next business day.',
  },
  {
    q: 'Is there a minimum order amount?',
    a: 'There is no minimum order amount. A ₱25 convenience fee applies to all non-member orders. Premium Members enjoy FREE delivery on orders ₱500 and above.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept Cash on Delivery (COD) only. Pay in cash when your order is delivered to your door. No advance payment is required.',
  },
  {
    q: 'How do I earn reward points?',
    a: 'Only active Premium Members earn reward points — 1 point for every ₱100 spent. Points are credited automatically once your order is delivered. Non-members do not earn points.',
  },
  {
    q: 'How does Premium Membership work?',
    a: 'Premium Membership costs ₱1,500 for the first 2 years. After that, renewal is ₱1,000 per year. Members earn reward points on every order and enjoy priority delivery. Apply through your account and upload your proof of payment for admin approval.',
  },
  {
    q: 'What happens to my points if my membership expires?',
    a: 'Expired memberships stop earning new points. However, your existing points remain valid and can still be redeemed for rewards. You can renew your membership anytime — even before it expires — to continue earning.',
  },
]

export default function FAQPage() {
  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-[#168AFF] to-[#0D5FC4] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white
            text-xs font-bold px-4 py-1.5 rounded-full">
            Got Questions?
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto">
            Find answers to the most common questions about QuickStock — ordering,
            delivery, membership, and more.
          </p>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-start gap-2">
                <span className="w-5 h-5 bg-[#168AFF] text-white rounded-full flex items-center
                  justify-center text-xs font-black shrink-0 mt-0.5">?</span>
                {q}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed pl-7">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-[#168AFF]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Still Have Questions?
          </h2>
          <p className="text-white/85 text-base">
            Reach out to our team — we're happy to help you anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition
                shadow-lg text-sm">
              Contact Us <MdArrowForward size={18} />
            </Link>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15
                text-white font-bold rounded-xl hover:bg-white/25 transition
                border border-white/30 text-sm">
              Create Account
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
