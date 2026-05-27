import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdPhone, MdEmail, MdLocationOn, MdArrowForward,
  MdCheckCircle, MdAccessTime, MdSend,
} from 'react-icons/md'
import { FaFacebookF } from 'react-icons/fa'
import PublicLayout from '../../layouts/PublicLayout'

const FB_URL = 'https://www.facebook.com/profile.php?id=61570722723997'

const FAQS = [
  {
    q: 'How do I create an account?',
    a: 'Click "Sign Up" at the top of the page, fill in your business details, and wait for admin approval. Once approved, you can start browsing and placing orders.',
  },
  {
    q: 'How long does delivery take?',
    a: 'We offer same-day delivery for orders confirmed before 3:00 PM. Orders confirmed after 3:00 PM will be delivered the next available business day.',
  },
  {
    q: 'Is there a minimum order amount?',
    a: 'There is no minimum order amount. However, orders below ₱500 incur a ₱25 delivery fee. Orders ₱500 and above enjoy FREE delivery.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept Cash on Delivery (COD) and GCash. For GCash payments, you must send the exact amount to our official GCash number and upload a screenshot of your payment confirmation during checkout. Our admin will verify your proof before confirming your order.',
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
    q: 'Can I cancel my order?',
    a: 'Orders can be cancelled before they are confirmed by our admin. Once confirmed, cancellations are no longer accepted. Contact us immediately via phone or email if you need to cancel.',
  },
  {
    q: 'What happens to my points if my membership expires?',
    a: 'Expired memberships stop earning new points. However, your existing points remain valid and can still be redeemed for rewards. You can renew your membership anytime — even before it expires — to continue earning.',
  },
]

const WEB3FORMS_KEY = 'f9fe7cd7-4658-48d8-9e4c-027212395013'

export default function ContactPage() {
  const [sent,      setSent]      = useState(false)
  const [sending,   setSending]   = useState(false)
  const [sendError, setSendError] = useState(null)
  const [form,      setForm]      = useState({ name: '', email: '', subject: '', message: '' })

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
          subject:    `[QuickStock Contact] ${form.subject}`,
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
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-[#168AFF] to-[#0D5FC4] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white
            text-xs font-bold px-4 py-1.5 rounded-full">
            We're Here to Help
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Contact Us</h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto">
            Have a question, concern, or feedback? Reach out to us and our team
            will get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ── Contact Info Cards ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">Get In Touch</span>
            <h2 className="text-3xl font-black text-gray-800">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: MdPhone,      label: 'Phone',   value: '09304453799',                 sub: 'Mon–Sun, 8:00AM–8:00PM' },
              { icon: MdEmail,      label: 'Email',   value: 'contactquickstock@gmail.com',  sub: 'We reply within 24h' },
              { icon: MdLocationOn, label: 'Address', value: 'Lubogan, Toril Davao City',   sub: 'Service area'        },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label}
                className="flex flex-col items-center gap-3 text-center p-6 bg-gray-50
                  rounded-2xl border border-gray-100 hover:border-[#168AFF] transition">
                <div className="w-14 h-14 bg-[#168AFF] rounded-2xl flex items-center
                  justify-center shadow-md">
                  <Icon size={24} className="text-white" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MdAccessTime size={20} className="text-[#168AFF]" />
                <h3 className="font-bold text-gray-800 text-base">Business Hours</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Monday – Sunday</span>
                  <span className="text-gray-800 font-semibold">8:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-800 text-base">Follow Us</h3>
              <p className="text-gray-500 text-sm">
                Stay updated with new products, promos, and announcements on our Facebook page.
              </p>
              <a href={FB_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1877F2]
                  text-white font-bold rounded-xl hover:opacity-90 transition text-sm">
                <FaFacebookF size={16} /> Follow on Facebook
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">Send a Message</span>
            <h2 className="text-3xl font-black text-gray-800">Drop Us a Message</h2>
            <p className="text-gray-500 text-sm">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          {sent ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center space-y-3">
              <MdCheckCircle size={48} className="text-[#168AFF] mx-auto" />
              <h3 className="font-bold text-gray-800 text-lg">Message Sent!</h3>
              <p className="text-gray-500 text-sm">
                Thank you for reaching out. We'll reply to your email within 24 hours.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }) }}
                className="text-[#168AFF] font-semibold text-sm hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                  <input type="text" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Juan Dela Cruz"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30
                      focus:border-[#168AFF] transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30
                      focus:border-[#168AFF] transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
                <input type="text" required value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="How can we help you?"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30
                    focus:border-[#168AFF] transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message *</label>
                <textarea required rows={5} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write your message here…"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30
                    focus:border-[#168AFF] transition resize-none" />
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
      </section>

      {/* ── FAQs ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">FAQs</span>
            <h2 className="text-3xl font-black text-gray-800">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
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
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-[#168AFF]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Get Started?
          </h2>
          <p className="text-white/85 text-base">
            Register now and enjoy fast supply delivery directly to your store.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition
                shadow-lg text-sm">
              Create Account <MdArrowForward size={18} />
            </Link>
            <Link to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15
                text-white font-bold rounded-xl hover:bg-white/25 transition
                border border-white/30 text-sm">
              View Products
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
