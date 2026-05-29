import { useState } from 'react'
import {
  MdPhone, MdEmail, MdCheckCircle,
  MdAccessTime, MdSend,
} from 'react-icons/md'
import { FaFacebookF } from 'react-icons/fa'
import CustomerLayout from '../../layouts/CustomerLayout'

const WEB3FORMS_KEY = 'f9fe7cd7-4658-48d8-9e4c-027212395013'
const FB_URL = 'https://www.facebook.com/profile.php?id=61570722723997'

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition`

export default function CustomerService() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: MdPhone, label: 'Phone', value: '09304453799',                sub: 'Mon–Sun, 8:00AM–8:00PM' },
            { icon: MdEmail, label: 'Email', value: 'contactquickstock@gmail.com', sub: 'We reply within 24h'    },
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

      </div>
    </CustomerLayout>
  )
}
