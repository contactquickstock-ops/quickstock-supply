import { MdArrowForward, MdCheckCircle, MdLocalShipping, MdVerified, MdCardGiftcard, MdHeadsetMic } from 'react-icons/md'
import { Link } from 'react-router-dom'
import PublicLayout from '../../layouts/PublicLayout'

const VALUES = [
  { icon: MdLocalShipping, title: 'Speed',    desc: 'We deliver same-day within business hours (8:00 AM – 8:00 PM). Orders after 8:00 PM are delivered the next day.'     },
  { icon: MdVerified,      title: 'Quality',  desc: 'We source only fresh, high-quality products for every order.'                         },
  { icon: MdCardGiftcard,  title: 'Generosity', desc: 'We reward loyalty — Premium clients earn points on every purchase.'               },
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
          <div className="space-y-5 order-2 lg:order-1">
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
                'Wide selection of quality essential products',
                'Fast same-day delivery within business hours (8:00 AM – 8:00 PM)',
                'Rewards points on every purchase (For Premium Clients)',
                '₱1,000 annual renewal to stay Premium and continue earning points',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 text-gray-700 text-sm">
                  <MdCheckCircle size={18} className="text-[#168AFF] shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200
              rounded-2xl px-4 py-3 mt-1">
              <MdLocalShipping size={20} className="text-[#168AFF] shrink-0" />
              <p className="text-[#168AFF] text-sm font-semibold leading-snug">
                Redeem for free delivery — Priority deliveries for Premium clients.
              </p>
            </div>
          </div>
          {/* Sari-sari store illustration */}
          <div className="order-1 lg:order-2 rounded-3xl overflow-hidden border border-blue-100 shadow-sm h-72 sm:h-80 relative select-none">

            {/* Sky */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100" />

            {/* Sun */}
            <div className="absolute top-5 left-6 w-10 h-10 bg-yellow-300 rounded-full shadow-md opacity-90" />
            <div className="absolute top-5 left-6 w-10 h-10 bg-yellow-200 rounded-full animate-ping opacity-30" />

            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-stone-300" />
            <div className="absolute bottom-14 left-0 right-0 h-1 bg-stone-400 opacity-40" />

            {/* ── Store ── */}
            <div className="absolute bottom-14 left-6 right-16">

              {/* QuickStock sign */}
              <div className="bg-[#168AFF] py-1.5 px-3 rounded-t-xl text-center shadow">
                <span className="text-white font-black text-[11px] tracking-wider">⚡ QuickStock Supply</span>
              </div>

              {/* Striped awning */}
              <div className="h-4 flex overflow-hidden rounded-none">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#168AFF]' : 'bg-white'}`} />
                ))}
              </div>

              {/* Store body */}
              <div className="bg-amber-50 border-2 border-amber-200 h-36 relative">

                {/* Product shelves */}
                <div className="absolute top-2 left-2 right-2 h-20 bg-white rounded border border-gray-200 overflow-hidden">
                  <div className="text-[8px] text-gray-400 font-semibold px-2 pt-1">Products</div>
                  <div className="flex gap-0.5 items-end px-2 pb-1 h-12">
                    {[
                      ['bg-red-400',    'h-8'],  ['bg-blue-400',   'h-6'],
                      ['bg-green-400',  'h-10'], ['bg-yellow-400', 'h-7'],
                      ['bg-purple-400', 'h-9'],  ['bg-orange-400', 'h-8'],
                      ['bg-pink-400',   'h-6'],  ['bg-teal-400',   'h-10'],
                      ['bg-indigo-400', 'h-7'],  ['bg-rose-400',   'h-9'],
                    ].map(([c, h], i) => (
                      <div key={i} className={`flex-1 ${c} ${h} rounded-sm opacity-75`} />
                    ))}
                  </div>
                </div>

                {/* Counter */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-amber-200 border-t-2 border-amber-300 rounded-b" />

                {/* Tindera */}
                <div className="absolute bottom-9 right-2 flex flex-col items-center gap-0">
                  <span className="text-3xl leading-none">👩</span>
                  <span className="text-[8px] text-amber-700 font-bold">Tindera</span>
                </div>

              </div>
            </div>

            {/* QuickStock delivery beside store */}
            <div className="absolute bottom-14 right-2 flex flex-col items-center gap-1">
              <div className="bg-[#168AFF] rounded-xl px-2 py-2 shadow-xl text-center">
                <span className="text-2xl block leading-none">🛒</span>
                <span className="text-white text-[8px] font-black block mt-0.5">QuickStock</span>
              </div>
              <span className="text-[8px] text-stone-500 font-semibold">Delivery</span>
            </div>

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
                className="group bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-3 text-center
                  hover:border-[#5BABFF] hover:bg-blue-50 transition-all duration-300">
                <div className="w-14 h-14 bg-[#168AFF] group-hover:bg-[#5BABFF] rounded-2xl
                  flex items-center justify-center mx-auto shadow-md
                  group-hover:scale-105 transition-all duration-300">
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
