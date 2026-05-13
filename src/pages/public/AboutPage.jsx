import { MdArrowForward, MdCheckCircle, MdLocalShipping, MdVerified, MdCardGiftcard, MdHeadsetMic } from 'react-icons/md'
import { Link } from 'react-router-dom'
import PublicLayout from '../../layouts/PublicLayout'

const VALUES = [
  { icon: MdLocalShipping, title: 'Speed',      desc: 'We deliver same-day so your household never runs out of essentials.' },
  { icon: MdVerified,      title: 'Quality',    desc: 'We source only fresh, high-quality products for every order.'        },
  { icon: MdCardGiftcard,  title: 'Generosity', desc: 'We reward loyalty — every peso you spend earns you points.'          },
  { icon: MdHeadsetMic,    title: 'Service',    desc: 'Our team is always here to assist you every step of the way.'        },
]

const MILESTONES = [
  { year: '2024', text: 'QuickStock Supply was founded in the Philippines.' },
  { year: '2025', text: 'Launched online ordering platform and mobile-friendly site.' },
  { year: '2025', text: 'Introduced the Rewards & Membership program.' },
  { year: '2026', text: 'Expanded product catalog to 500+ items across all categories.' },
]

export default function AboutPage() {
  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#00B14F] to-[#007A35] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white
            text-xs font-bold px-4 py-1.5 rounded-full">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">About QuickStock</h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto">
            We are a Filipino online grocery supply service committed to making everyday
            shopping fast, fresh, and rewarding for every household.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Our Story</span>
            <h2 className="text-3xl font-black text-gray-800">
              Built for Every Filipino Household
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              QuickStock Supply started with a simple vision: make grocery shopping easier
              for Filipino families. We noticed that getting basic supplies often meant
              long queues, traffic, and wasted time.
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              So we built a platform that lets you order your essentials online — from
              rice and cooking oil to snacks and beverages — and have them delivered
              straight to your door. <em>Diretso sa Tindahan Mo.</em>
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                'Wide selection of 500+ everyday products',
                'Fast same-day delivery by trusted drivers',
                'Rewards points on every purchase',
                'Membership program with exclusive benefits',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 text-gray-700 text-sm">
                  <MdCheckCircle size={18} className="text-[#00B14F] shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-50 rounded-3xl p-8 flex items-center justify-center border border-green-100">
            <img src="/logo.jpg" alt="QuickStock Supply" className="w-64 h-64 object-contain" />
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#00B14F] text-white rounded-3xl p-8 space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-2xl font-black text-white">Our Mission</h3>
            <p className="text-white/85 text-base leading-relaxed">
              To provide every Filipino household with fast, affordable, and reliable
              access to quality grocery supplies — delivered with care and convenience.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 space-y-4 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🔭</span>
            </div>
            <h3 className="text-2xl font-black text-gray-800">Our Vision</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              To become the most trusted and loved online grocery delivery service in
              the Philippines — known for speed, quality, and genuine care for customers.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">What We Stand For</span>
            <h2 className="text-3xl font-black text-gray-800">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-3 text-center
                  hover:border-[#00B14F] hover:bg-green-50 transition-all">
                <div className="w-14 h-14 bg-[#00B14F] rounded-2xl flex items-center
                  justify-center mx-auto shadow-md">
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Milestones ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Our Journey</span>
            <h2 className="text-3xl font-black text-gray-800">Milestones</h2>
          </div>
          <div className="space-y-4">
            {MILESTONES.map(({ year, text }, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-16 h-16 bg-[#00B14F] rounded-2xl flex items-center
                  justify-center shrink-0 shadow-md">
                  <span className="text-white font-black text-sm">{year}</span>
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100
                  shadow-sm px-5 py-4 flex items-center">
                  <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-[#00B14F]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-3xl font-black text-white">Ready to Order?</h2>
          <p className="text-white/85 text-base">
            Join hundreds of happy customers and get your supplies delivered today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition shadow-lg text-sm">
              Get Started <MdArrowForward size={18} />
            </Link>
            <Link to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15
                text-white font-bold rounded-xl hover:bg-white/25 transition
                border border-white/30 text-sm">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
