import { MdArrowForward, MdCheckCircle, MdLocalShipping, MdVerified, MdCardGiftcard, MdHeadsetMic } from 'react-icons/md'
import { Link } from 'react-router-dom'
import PublicLayout from '../../layouts/PublicLayout'

const VALUES = [
  { icon: MdLocalShipping, title: 'Speed',    desc: 'We deliver same-day so your store or your business never runs out of essentials.'     },
  { icon: MdVerified,      title: 'Quality',  desc: 'We source only fresh, high-quality products for every order.'                         },
  { icon: MdCardGiftcard,  title: 'Generosity', desc: 'We reward loyalty — every peso you spend earns you points.'                         },
  { icon: MdHeadsetMic,    title: 'Service',  desc: 'Our team is always here to assist you every step of the way.'                         },
]


export default function AboutPage() {
  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-[#168AFF] to-[#0D5FC4] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white
            text-xs font-bold px-4 py-1.5 rounded-full">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">About QuickStock</h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto">
            We are a Filipino online supply service committed to making restocking
            simple, fast, and rewarding for every sari-sari store, restaurant, and small business.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">Our Story</span>
            <h2 className="text-3xl font-black text-gray-800">
              Built for Every Filipino Business
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              QuickStock Supply was created to support hardworking Filipino entrepreneurs
              and small businesses by providing a faster and more reliable way to restock
              essential goods.
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              We believe small businesses deserve modern supply solutions, rewarding
              partnerships, and dependable access to inventory that helps their stores
              grow every day.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                'Wide selection of 500+ everyday products',
                'Fast same-day delivery by trusted drivers',
                'Rewards points on every purchase',
                'Membership program with exclusive benefits',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 text-gray-700 text-sm">
                  <MdCheckCircle size={18} className="text-[#168AFF] shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-3xl p-8 flex items-center justify-center border border-blue-100">
            <img src="/logo.jpg" alt="QuickStock Supply" className="w-64 h-64 object-contain" />
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#168AFF] text-white rounded-3xl p-8 space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-2xl font-black text-white">Our Mission</h3>
            <p className="text-white/85 text-base leading-relaxed">
              At QuickStock, our mission is to make restocking simple, fast, and reliable
              for sari-sari stores, restaurants, and small businesses. We aim to help local
              entrepreneurs grow by providing convenient access to essential products,
              transparent inventory management, and rewarding customer partnerships. Through
              technology and dependable service, QuickStock is committed to bring basic
              commodity supplies directly to every store with efficiency, quality and trust.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 space-y-4 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🔭</span>
            </div>
            <h3 className="text-2xl font-black text-gray-800">Our Vision</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              The vision of QuickStock is to become the most trusted digital supply partner
              for small businesses across the Philippines. We envision a future where every
              sari-sari store and local restaurant can easily access affordable, efficient,
              and reliable delivery through one seamless platform. QuickStock aims to empower
              communities by helping entrepreneurs grow stronger, smarter, and more connected
              in the modern retail economy.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">What We Stand For</span>
            <h2 className="text-3xl font-black text-gray-800">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-3 text-center
                  hover:border-[#168AFF] hover:bg-blue-50 transition-all">
                <div className="w-14 h-14 bg-[#168AFF] rounded-2xl flex items-center
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

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-[#168AFF]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-3xl font-black text-white">Ready to Order?</h2>
          <p className="text-white/85 text-base">
            Join hundreds of happy partners and get your supplies delivered today.
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
