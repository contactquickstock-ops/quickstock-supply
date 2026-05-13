import { Link } from 'react-router-dom'
import {
  MdLocalShipping, MdStar, MdArrowForward,
  MdCheckCircle, MdShoppingCart,
  MdCardGiftcard, MdHeadsetMic, MdStorefront,
  MdPeople, MdVerified,
} from 'react-icons/md'
import PublicLayout from '../../layouts/PublicLayout'

const CATEGORIES = [
  { emoji: '🌾', label: 'Rice & Grains'   },
  { emoji: '🥚', label: 'Eggs & Dairy'    },
  { emoji: '🛢️', label: 'Cooking Oil'     },
  { emoji: '🥤', label: 'Beverages'       },
  { emoji: '🥫', label: 'Canned Goods'    },
  { emoji: '🍜', label: 'Noodles & Pasta' },
  { emoji: '🧂', label: 'Condiments'      },
  { emoji: '🍫', label: 'Snacks & Sweets' },
]

const FEATURES = [
  { icon: MdLocalShipping, title: 'Fast Delivery',    desc: 'Same-day delivery right to your doorstep — quick and hassle-free.'             },
  { icon: MdVerified,      title: 'Quality Products', desc: 'Every item is checked for freshness and quality before it reaches you.'         },
  { icon: MdCardGiftcard,  title: 'Rewards & Points', desc: 'Earn 1 point for every ₱100 spent and redeem them for exciting rewards.'        },
  { icon: MdHeadsetMic,    title: '24/7 Support',     desc: 'Our team is always ready to help you with any concern anytime.'                 },
]

const STEPS = [
  { n: '01', title: 'Create Account',  desc: 'Register and wait for admin approval to activate your account.' },
  { n: '02', title: 'Browse & Order',  desc: 'Browse our catalog, add items to your cart, and place your order.' },
  { n: '03', title: 'Get Delivered',   desc: 'A driver is assigned and your order arrives at your door.' },
]

const STATS = [
  { icon: MdStorefront,    value: '500+',  label: 'Products'        },
  { icon: MdPeople,        value: '200+',  label: 'Happy Customers' },
  { icon: MdLocalShipping, value: '1-Day', label: 'Delivery'        },
  { icon: MdStar,          value: '4.9★',  label: 'Customer Rating' },
]

export default function LandingPage() {
  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#00B14F] via-[#00A046] to-[#007A35]
        text-white py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Text */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
              text-white text-xs font-bold px-4 py-1.5 rounded-full">
              <MdLocalShipping size={14} /> Fast &amp; Fresh Delivery
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white">
              Your Supplies,<br />
              <span className="text-yellow-300">Delivered</span> to Your Door.
            </h1>
            <p className="text-white/85 text-lg leading-relaxed max-w-md">
              <em>Diretso sa Tindahan Mo.</em> — Order fresh groceries and daily essentials
              online. Convenient, affordable, and fast.
            </p>
            <div className="flex flex-wrap gap-3">
              {/* Order Now → browse products page */}
              <Link to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                  text-gray-900 font-bold rounded-xl hover:bg-yellow-300
                  transition shadow-lg text-sm">
                Order Now <MdArrowForward size={18} />
              </Link>
              <Link to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15
                  text-white font-bold rounded-xl hover:bg-white/25
                  transition border border-white/30 text-sm">
                Learn More
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {['500+ Products', 'Same-Day Delivery', 'Earn Reward Points'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
                  <MdCheckCircle size={15} className="text-yellow-300" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Visual card */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-white/10 rounded-3xl border border-white/20
                backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <img src="/logo.jpg" alt="QuickStock Supply"
                  className="w-64 h-64 object-contain drop-shadow-2xl" />
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900
                px-4 py-2 rounded-2xl shadow-lg font-bold text-sm text-center">
                FREE Delivery<br />
                <span className="text-xs font-medium">on ₱500+ orders</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#00B14F]
                px-4 py-2 rounded-2xl shadow-lg font-bold text-sm">
                4.9 ★ Rated<br />
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
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-[#00B14F]" />
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

      {/* ── Categories ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Browse</span>
            <h2 className="text-3xl font-black text-gray-800">Shop by Category</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Find everything your household needs — from grains to snacks.
            </p>
          </div>
          {/* Categories are display-only — no navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map(({ emoji, label }) => (
              <div key={label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                  p-5 flex flex-col items-center gap-3 text-center select-none">
                <span className="text-4xl">{emoji}</span>
                <span className="text-gray-700 font-semibold text-sm">{label}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00B14F]
                text-white font-bold rounded-xl hover:bg-[#009940] transition text-sm shadow-sm">
              View All Products <MdArrowForward size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Why Us</span>
            <h2 className="text-3xl font-black text-gray-800">Why Choose QuickStock?</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              We make grocery shopping easy, fast, and rewarding.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="group bg-gray-50 rounded-2xl border border-gray-100 p-6
                  hover:border-[#00B14F] hover:bg-green-50 transition-all duration-200
                  space-y-3 text-center">
                <div className="w-14 h-14 bg-[#00B14F] rounded-2xl flex items-center
                  justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Simple Steps</span>
            <h2 className="text-3xl font-black text-gray-800">How It Works</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">Ordering from QuickStock is quick and easy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-10 left-1/4 right-1/4
              h-0.5 bg-green-100 z-0" />
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#00B14F] flex items-center
                  justify-center shadow-lg">
                  <span className="text-white font-black text-2xl">{n}</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rewards Teaser ── */}
      <section className="py-14 px-4 bg-gradient-to-r from-[#00B14F] to-[#007A35] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 bg-white/20 text-white
              text-xs font-bold px-4 py-1.5 rounded-full">
              <MdStar size={14} className="text-yellow-300" /> Loyalty Rewards
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Earn Points on<br />Every Order!
            </h2>
            <p className="text-white/85 text-base leading-relaxed max-w-md">
              Get <strong className="text-yellow-300">1 point for every ₱100</strong> you spend.
              Redeem your points for exclusive rewards and discounts.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Free Delivery Voucher', 'Discount Coupons', 'Gift Items'].map(r => (
                <span key={r} className="flex items-center gap-2 bg-white/15 px-4 py-2
                  rounded-xl text-white font-medium text-sm border border-white/20">
                  <MdStar size={14} className="text-yellow-300" /> {r}
                </span>
              ))}
            </div>
            {/* "View Rewards" → /rewards page */}
            <Link to="/rewards"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                text-gray-900 font-bold rounded-xl hover:bg-yellow-300
                transition shadow-lg text-sm w-fit">
              View Rewards <MdArrowForward size={18} />
            </Link>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { pts: '100 pts',  label: 'Free Delivery'  },
              { pts: '200 pts',  label: '₱50 Discount'   },
              { pts: '500 pts',  label: 'Gift Item'       },
              { pts: '1000 pts', label: 'Premium Bundle'  },
            ].map(({ pts, label }) => (
              <div key={label}
                className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-2">
                <p className="text-yellow-300 font-black text-xl">{pts}</p>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-white/60 text-xs">Redeemable reward</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Delivery Banner ── */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100
          shadow-sm p-8 sm:p-12 text-center space-y-5">
          <span className="text-4xl">🚚</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
            Get <span className="text-[#00B14F]">FREE Delivery</span> on Orders ₱500+
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Sign up today and enjoy free delivery on your qualifying orders. No promo code needed.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00B14F]
              text-white font-bold rounded-xl hover:bg-[#009940] transition shadow-md text-sm">
            Sign Up for Free <MdArrowForward size={18} />
          </Link>
        </div>
      </section>

    </PublicLayout>
  )
}
