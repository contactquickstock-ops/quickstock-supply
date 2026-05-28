import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  MdLocalShipping, MdStar, MdArrowForward,
  MdCheckCircle, MdShoppingCart,
  MdCardGiftcard, MdHeadsetMic,
  MdPeople, MdVerified, MdFormatQuote,
} from 'react-icons/md'
import PublicLayout from '../../layouts/PublicLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

const FEATURES = [
  { icon: MdLocalShipping, title: 'Fast Delivery',                             desc: 'Same-day delivery right to your store within business hours (8:00 AM – 8:00 PM). Orders after 8:00 PM are delivered the next day.'              },
  { icon: MdVerified,      title: 'Quality Products',                          desc: 'Every item is checked for freshness and quality before it reaches you.'                   },
  { icon: MdCardGiftcard,  title: 'Rewards & Points (For Premium Members Only)', desc: 'Earn 1 point for every ₱100 spent and redeem them for exclusive rewards.'              },
  { icon: MdHeadsetMic,    title: 'Quality Customer Service',                  desc: 'Our dedicated team is always here to assist you with every concern, every step of the way.' },
]

const STEPS = [
  { n: '01', title: 'Create Account', desc: 'Register and wait for admin approval to activate your account.'      },
  { n: '02', title: 'Browse & Order', desc: 'Browse our catalog, add items to your cart, and place your order.'   },
  { n: '03', title: 'Get Delivered',  desc: 'A driver is assigned and delivers to your store within business hours (8:00 AM – 8:00 PM). Orders after 8:00 PM arrive the next day.' },
]

const STATS = [
  { icon: MdVerified,      value: 'Quality',  label: 'Products'       },
  { icon: MdPeople,        value: '1,000+',   label: 'Happy Partners' },
  { icon: MdLocalShipping, value: 'Same Day', label: 'Delivery'       },
  { icon: MdHeadsetMic,    value: 'Reliable', label: 'Service'        },
]

const REWARD_CARDS = [
  { value: '₱500+',        label: 'Free Delivery',  sub: 'Orders ₱500 & above'     },
  { value: 'Every ₱100',   label: '= 1 Point',      sub: 'Earn as you spend'        },
  { value: 'Earn Points',  label: 'Redeem Rewards', sub: 'Your points, your choice' },
  { value: 'Accumulative', label: 'No Expiry',      sub: 'Points never expire'      },
]

export default function LandingPage() {
  const [testimonials, setTestimonials] = useState([])
  const [howStep, setHowStep]           = useState(0)
  // howStep: 0=01glow 1=line1fill 2=02glow 3=line2fill 4=03glow 5=reset

  useEffect(() => {
    const timings = [1200, 600, 1200, 600, 1400, 150]
    const t = setTimeout(() => setHowStep(s => (s + 1) % 6), timings[howStep])
    return () => clearTimeout(t)
  }, [howStep])

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('id, customer_name, store_type, message, photo_url, image_url')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setTestimonials(data ?? []))
  }, [])

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-[#168AFF] via-[#1480F5] to-[#0D5FC4]
        text-white py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Text */}
          <div className="space-y-6 order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
              text-white text-xs font-bold px-4 py-1.5 rounded-full">
              <MdLocalShipping size={14} /> Fast &amp; Reliable Supply Delivery
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white">
              Your Supplies,<br />
              <span className="text-yellow-300">Delivered Directly</span><br />
              to Your Store.
            </h1>
            <p className="text-white/85 text-lg leading-relaxed max-w-md">
              Restocking made simple for sari-sari stores, restaurants, and small
              businesses. Order essential products online and receive them the same day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products"
                className="btn-glow inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                  text-gray-900 font-bold rounded-xl hover:bg-yellow-300
                  transition text-sm">
                Order Now <MdArrowForward size={18} />
              </Link>
              <Link to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15
                  text-white font-bold rounded-xl hover:bg-white/25
                  transition border border-white/30 text-sm">
                Learn More
              </Link>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {[
                'Quality Products.',
                'Same-Day Delivery',
                'Earn Rewards Points (For Premium Clients Only)',
              ].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
                  <MdCheckCircle size={15} className="text-yellow-300 shrink-0" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Visual card */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="relative">
              <div className="w-72 h-72 sm:w-96 sm:h-96 lg:w-120 lg:h-120 bg-white/10 rounded-3xl border border-white/20
                backdrop-blur-sm flex items-center justify-center shadow-2xl overflow-hidden">
                <video
                  src="/hero-animation.mp4"
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900
                px-4 py-2 rounded-2xl shadow-lg font-bold text-sm text-center">
                FREE Delivery<br />
                <span className="text-xs font-medium">on ₱500+ orders</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#168AFF]
                px-4 py-2 rounded-2xl shadow-lg font-bold text-sm">
                4.9 <span className="text-yellow-400">★</span> Rated<br />
                <span className="text-xs text-gray-500 font-medium">by customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label}
                className="flex flex-col sm:flex-row items-center justify-center
                  gap-2 sm:gap-3 py-5 px-3 text-center sm:text-left">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-[#168AFF]" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-800">{value}</p>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership CTA ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto bg-linear-to-br from-[#168AFF] to-[#0D5FC4]
          rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 bg-white/20 text-white
                text-xs font-bold px-4 py-1.5 rounded-full">
                <MdCardGiftcard size={14} /> Premium Membership
              </span>
              <h2 className="text-3xl font-black text-white leading-tight">
                Upgrade to Premium.<br />
                <span className="text-yellow-300">Earn More, Get More.</span>
              </h2>
              <p className="text-white/85 text-base leading-relaxed">
                Join QuickStock Premium and unlock exclusive rewards, earn points on every
                order, and enjoy priority deliveries — all for just ₱1,500 for 2 years.
              </p>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                  text-gray-900 font-bold rounded-xl hover:bg-yellow-300
                  transition shadow-lg text-sm w-fit">
                Get Premium Access <MdArrowForward size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: MdStar,          title: 'Earn Points',       desc: '1 pt per ₱100 spent'      },
                { icon: MdLocalShipping, title: 'Priority Delivery', desc: 'Premium clients first'     },
                { icon: MdCardGiftcard,  title: 'Exclusive Rewards', desc: 'Redeem for free items'     },
                { icon: MdVerified,      title: 'Only ₱1,500',       desc: '2-year membership'         },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title}
                  className="bg-white/10 border border-white/20 rounded-2xl p-4 space-y-2">
                  <Icon size={22} className="text-yellow-300" />
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-white/70 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">Why Us</span>
            <h2 className="text-3xl font-black text-gray-800">
              Why Choose Quick<span className="text-yellow-400">Stock</span>?
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              We make restocking easy, fast, and rewarding for your business.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="group bg-white rounded-2xl border border-gray-100 p-6
                  hover:border-[#168AFF] hover:bg-blue-50 transition-all duration-300
                  space-y-3 text-center">
                <div className="w-14 h-14 bg-[#168AFF] group-hover:bg-[#5BABFF] rounded-2xl
                  flex items-center justify-center mx-auto shadow-md
                  group-hover:scale-105 transition-all duration-300">
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">Simple Steps</span>
            <h2 className="text-3xl font-black text-gray-800">How It Works</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">Ordering from QuickStock is quick and easy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">

            {/* Line 1: step 01 → 02 */}
            <div className="hidden sm:block absolute top-10 left-1/4 right-1/2 h-0.5 bg-blue-100 z-0 overflow-hidden">
              <div className="h-full bg-[#168AFF]" style={{
                width: howStep >= 1 && howStep < 5 ? '100%' : '0%',
                transition: howStep === 5 ? 'none' : 'width 600ms ease-in-out',
              }} />
            </div>

            {/* Line 2: step 02 → 03 */}
            <div className="hidden sm:block absolute top-10 left-1/2 right-1/4 h-0.5 bg-blue-100 z-0 overflow-hidden">
              <div className="h-full bg-[#168AFF]" style={{
                width: howStep >= 3 && howStep < 5 ? '100%' : '0%',
                transition: howStep === 5 ? 'none' : 'width 600ms ease-in-out',
              }} />
            </div>

            {STEPS.map(({ n, title, desc }, i) => {
              const isActive =
                (i === 0 && howStep === 0) ||
                (i === 1 && howStep === 2) ||
                (i === 2 && howStep === 4)
              return (
                <div key={n} className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div className={`w-20 h-20 rounded-2xl bg-[#168AFF] flex items-center justify-center
                    transition-transform duration-300
                    ${isActive ? 'step-glow scale-110' : 'scale-100 shadow-lg'}`}>
                    <span className="text-white font-black text-2xl">{n}</span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Rewards Teaser ── */}
      <section className="py-14 px-4 bg-linear-to-r from-[#168AFF] to-[#0D5FC4] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 bg-white/20 text-white
              text-xs font-bold px-4 py-1.5 rounded-full">
              <MdStar size={14} className="text-yellow-400" /> Loyalty Rewards
            </span>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Earn Points on<br />Every Order!
              </h2>
              <span className="inline-flex items-center gap-1.5 bg-yellow-400/20
                text-yellow-300 text-xs font-bold px-3 py-1.5 rounded-full
                border border-yellow-400/30">
                <MdStar size={12} className="text-yellow-400" /> For Premium Members Only
              </span>
            </div>
            <p className="text-white/85 text-base leading-relaxed max-w-md">
              Get <strong className="text-yellow-300">1 point for every ₱100</strong> you spend.
              Redeem your points for exclusive rewards and discounts.
            </p>
            <Link to="/rewards"
              className="btn-glow flex items-center justify-center gap-3 px-10 py-4 bg-yellow-400
                text-gray-900 font-black rounded-xl hover:bg-yellow-300
                transition text-base w-full sm:w-auto">
              View Rewards <MdArrowForward size={22} />
            </Link>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {REWARD_CARDS.map(({ value, label, sub }) => (
              <div key={label}
                className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-1">
                <p className="text-yellow-300 font-black text-lg leading-tight">{value}</p>
                <p className="text-white font-bold text-sm">{label}</p>
                <p className="text-white/60 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials (only shown when there are published ones) ── */}
      {testimonials.length > 0 && (
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-10">

            {/* Heading */}
            <div className="text-center space-y-2">
              <span className="text-[#168AFF] font-bold text-sm uppercase tracking-widest">
                Testimonials
              </span>
              <h2 className="text-3xl font-black text-gray-800">
                What Our <span className="text-[#168AFF]">Customers Say</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Real feedback from sari-sari stores, restaurants, and businesses
                we serve every day.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => {
                const initials = (t.customer_name ?? '?')[0].toUpperCase()
                return (
                  <div key={t.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm
                      flex flex-col overflow-hidden hover:shadow-md hover:border-[#168AFF]/30
                      transition-all duration-300">

                    {/* Featured photo (if any) */}
                    {t.image_url && (
                      <div className="h-44 bg-gray-100 overflow-hidden shrink-0">
                        <img src={t.image_url} alt="featured"
                          className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="p-6 flex flex-col gap-4 flex-1">
                      {/* Quote icon + stars */}
                      <div className="flex items-center justify-between">
                        <MdFormatQuote size={32} className="text-[#168AFF]/25 -scale-x-100" />
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <MdStar key={s} size={14} className="text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-gray-600 text-sm leading-relaxed italic flex-1 line-clamp-4">
                        "{t.message}"
                      </p>

                      {/* Person */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-[#168AFF]/10
                          text-[#168AFF] flex items-center justify-center font-bold text-base
                          shrink-0">
                          {t.photo_url
                            ? <img src={t.photo_url} alt={t.customer_name}
                                className="w-full h-full object-cover" />
                            : initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-800 font-bold text-sm truncate">
                            {t.customer_name}
                          </p>
                          {t.store_type && (
                            <p className="text-gray-400 text-xs truncate">{t.store_type}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </section>
      )}

      {/* ── Call to Action ── */}
      <section className="py-14 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-[#168AFF]/20 text-[#168AFF]
            text-xs font-bold px-4 py-1.5 rounded-full">
            <MdShoppingCart size={14} /> Get Started Today
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Ready to Stock Up<br />
            <span className="text-yellow-300">Your Business?</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            Join QuickStock and experience fast, reliable supply delivery for your
            sari-sari store, restaurant, or small business. Register now and get
            your first order delivered today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#168AFF]
                text-white font-bold rounded-xl hover:bg-[#1270DB] transition shadow-lg text-sm">
              Create Account <MdArrowForward size={18} />
            </Link>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10
                text-white font-bold rounded-xl hover:bg-white/20 transition
                border border-white/20 text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
