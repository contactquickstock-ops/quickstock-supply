import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdMenu, MdClose, MdLocalShipping, MdStar,
  MdPhone, MdEmail, MdLocationOn, MdArrowForward,
  MdCheckCircle, MdShoppingCart, MdSecurity,
  MdCardGiftcard, MdHeadsetMic, MdStorefront,
  MdPeople, MdVerified, MdFavorite,
} from 'react-icons/md'
import { FaFacebookF } from 'react-icons/fa'

// ── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { emoji: '🌾', label: 'Rice & Grains'      },
  { emoji: '🥚', label: 'Eggs & Dairy'       },
  { emoji: '🛢️', label: 'Cooking Oil'        },
  { emoji: '🥤', label: 'Beverages'          },
  { emoji: '🥫', label: 'Canned Goods'       },
  { emoji: '🍜', label: 'Noodles & Pasta'    },
  { emoji: '🧂', label: 'Condiments'         },
  { emoji: '🍫', label: 'Snacks & Sweets'    },
]

const PRODUCTS = [
  { name: 'Ganador Premium Rice',    unit: '5kg',   price: 250,  badge: 'Best Seller', emoji: '🌾' },
  { name: 'San Marino Corned Tuna',  unit: 'per can', price: 78, badge: 'Popular',    emoji: '🥫' },
  { name: 'Datu Puti Vinegar',       unit: '350mL', price: 32,   badge: 'Sale',        emoji: '🧂' },
  { name: 'Lucky Me Pancit Canton',  unit: 'per pack', price: 15, badge: 'Popular',   emoji: '🍜' },
  { name: 'Magnolia Gold Butter',    unit: '225g',  price: 85,   badge: 'Fresh',       emoji: '🧈' },
  { name: 'Pepsi Regular',           unit: '1.5L',  price: 55,   badge: 'Hot',         emoji: '🥤' },
]

const FEATURES = [
  {
    icon: MdLocalShipping,
    title: 'Fast Delivery',
    desc:  'Same-day delivery right to your doorstep — quick and hassle-free.',
  },
  {
    icon: MdVerified,
    title: 'Quality Products',
    desc:  'Every item is checked for freshness and quality before it reaches you.',
  },
  {
    icon: MdCardGiftcard,
    title: 'Rewards & Points',
    desc:  'Earn 1 point for every ₱100 spent and redeem them for exciting rewards.',
  },
  {
    icon: MdHeadsetMic,
    title: '24/7 Support',
    desc:  'Our team is always ready to help you with any concern.',
  },
]

const STEPS = [
  { n: '01', title: 'Create Account',   desc: 'Register and wait for admin approval to activate your account.' },
  { n: '02', title: 'Browse & Order',   desc: 'Browse our catalog, add items to your cart, and place your order.' },
  { n: '03', title: 'Get Delivered',    desc: 'A driver is assigned and your order arrives at your door.' },
]

const STATS = [
  { icon: MdStorefront,      value: '500+',   label: 'Products'         },
  { icon: MdPeople,          value: '200+',   label: 'Happy Customers'  },
  { icon: MdLocalShipping,   value: '1-Day',  label: 'Delivery'         },
  { icon: MdStar,            value: '4.9★',   label: 'Customer Rating'  },
]

const BADGE_COLORS = {
  'Best Seller': 'bg-yellow-400 text-yellow-900',
  'Popular':     'bg-blue-500   text-white',
  'Sale':        'bg-red-500    text-white',
  'Fresh':       'bg-green-500  text-white',
  'Hot':         'bg-orange-500 text-white',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NavLinks({ mobile = false, onClose }) {
  const cls = mobile
    ? 'block py-3 px-4 text-gray-700 font-semibold text-base hover:text-[#00B14F] hover:bg-green-50 rounded-xl transition'
    : 'text-gray-700 font-semibold text-sm hover:text-[#00B14F] transition whitespace-nowrap'
  return (
    <>
      {[
        ['Home',       '#hero'    ],
        ['About Us',   '#about'   ],
        ['Products',   '#products'],
        ['Rewards',    '#rewards' ],
        ['Contact Us', '#contact' ],
      ].map(([label, href]) => (
        <a key={label} href={href} className={cls} onClick={onClose}>
          {label}
        </a>
      ))}
    </>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">

      {/* ── Announcement Bar ── */}
      <div className="bg-[#00B14F] text-white text-xs sm:text-sm text-center py-2 px-4 font-medium">
        🚚 FREE delivery on orders ₱500 and above &nbsp;|&nbsp; Open Mon – Sat · 8 AM to 6 PM
      </div>

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Top row: logo + follow us */}
          <div className="flex items-center justify-between h-14 border-b border-gray-50">
            {/* Logo */}
            <Link to="/">
              <img src="/logo.jpg" alt="QuickStock Supply" className="h-10 object-contain" />
            </Link>

            {/* Follow us */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">Follow us:</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 bg-[#1877F2] rounded-full flex items-center justify-center
                  hover:opacity-90 transition"
                aria-label="Facebook"
              >
                <FaFacebookF size={13} className="text-white" />
              </a>
            </div>
          </div>

          {/* Nav row */}
          <div className="flex items-center justify-between h-12">

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7">
              <NavLinks />
            </nav>

            {/* Auth buttons + mobile toggle */}
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              <Link
                to="/login"
                className="hidden sm:inline-flex px-4 py-1.5 text-sm font-semibold
                  text-[#00B14F] border border-[#00B14F] rounded-lg hover:bg-green-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-4 py-1.5 text-sm font-semibold
                  text-white bg-[#00B14F] rounded-lg hover:bg-[#009940] transition shadow-sm"
              >
                Sign Up
              </Link>
              <button
                className="md:hidden p-2 text-gray-600 hover:text-[#00B14F] transition"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <MdClose size={26} /> : <MdMenu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1
            shadow-lg">
            <NavLinks mobile onClose={() => setMenuOpen(false)} />
            <div className="pt-3 flex gap-2">
              <Link to="/login"
                className="flex-1 py-2.5 text-center text-sm font-semibold text-[#00B14F]
                  border border-[#00B14F] rounded-xl hover:bg-green-50 transition">
                Login
              </Link>
              <Link to="/register"
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white
                  bg-[#00B14F] rounded-xl hover:bg-[#009940] transition">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section id="hero"
        className="bg-gradient-to-br from-[#00B14F] via-[#00A046] to-[#007A35]
          text-white py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10
          items-center">

          {/* Left: text */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
              text-white text-xs font-bold px-4 py-1.5 rounded-full">
              <MdLocalShipping size={14} />
              Fast & Fresh Delivery
            </span>

            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white">
              Your Supplies,<br />
              <span className="text-yellow-300">Delivered</span> to Your Door.
            </h1>

            <p className="text-white/85 text-lg leading-relaxed max-w-md">
              <em>Diretso sa Tindahan Mo.</em> — Order fresh groceries and
              daily essentials online. Convenient, affordable, and fast.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                  text-gray-900 font-bold rounded-xl hover:bg-yellow-300
                  transition shadow-lg text-sm"
              >
                Order Now <MdArrowForward size={18} />
              </Link>
              <a
                href="#about"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15
                  text-white font-bold rounded-xl hover:bg-white/25
                  transition border border-white/30 text-sm"
              >
                Learn More
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {['500+ Products', 'Same-Day Delivery', 'Earn Reward Points'].map(t => (
                <span key={t}
                  className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
                  <MdCheckCircle size={15} className="text-yellow-300" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: visual card */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-white/10 rounded-3xl border border-white/20
                backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <img src="/logo.jpg" alt="QuickStock Supply"
                  className="w-64 h-64 object-contain drop-shadow-2xl" />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900
                px-4 py-2 rounded-2xl shadow-lg font-bold text-sm">
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
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center
                  justify-center shrink-0">
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
      <section id="products" className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">
              Browse
            </span>
            <h2 className="text-3xl font-black text-gray-800">Shop by Category</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Find everything your household needs — from grains to snacks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map(({ emoji, label }) => (
              <Link to="/register" key={label}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm
                  p-5 flex flex-col items-center gap-3 text-center
                  hover:border-[#00B14F] hover:shadow-md transition-all duration-200">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  {emoji}
                </span>
                <span className="text-gray-700 font-semibold text-sm group-hover:text-[#00B14F]
                  transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section id="about" className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">
              Why Us
            </span>
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

      {/* ── Featured Products ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex items-end justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">
                Handpicked
              </span>
              <h2 className="text-3xl font-black text-gray-800">Featured Products</h2>
            </div>
            <Link to="/register"
              className="inline-flex items-center gap-1 text-[#00B14F] font-semibold
                text-sm hover:gap-2 transition-all">
              View All <MdArrowForward size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PRODUCTS.map(({ name, unit, price, badge, emoji }) => (
              <div key={name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                  overflow-hidden hover:shadow-md hover:border-[#00B14F]/30
                  transition-all duration-200 flex flex-col">
                {/* Image area */}
                <div className="relative bg-green-50 h-28 flex items-center justify-center">
                  <span className="text-5xl">{emoji}</span>
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg
                    text-[10px] font-bold ${BADGE_COLORS[badge] ?? 'bg-gray-200 text-gray-700'}`}>
                    {badge}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3 flex flex-col flex-1 gap-1.5">
                  <p className="text-gray-800 font-semibold text-xs leading-snug line-clamp-2">
                    {name}
                  </p>
                  <p className="text-gray-400 text-[10px]">{unit}</p>
                  <p className="text-[#00B14F] font-black text-base mt-auto">
                    ₱{price.toLocaleString()}
                  </p>
                  <Link to="/register"
                    className="mt-1 w-full py-1.5 bg-[#00B14F] text-white text-xs font-bold
                      rounded-lg text-center hover:bg-[#009940] transition flex items-center
                      justify-center gap-1">
                    <MdShoppingCart size={12} /> Add to Cart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">

          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">
              Simple Steps
            </span>
            <h2 className="text-3xl font-black text-gray-800">How It Works</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Ordering from QuickStock is quick and easy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 left-1/4 right-1/4 h-0.5
              bg-green-100 z-0" />

            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative z-10 flex flex-col items-center text-center
                gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#00B14F] flex items-center
                  justify-center shadow-lg">
                  <span className="text-white font-black text-2xl">{n}</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rewards Section ── */}
      <section id="rewards"
        className="py-14 px-4 bg-gradient-to-r from-[#00B14F] to-[#007A35] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10
          items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 bg-white/20 text-white
              text-xs font-bold px-4 py-1.5 rounded-full">
              <MdStar size={14} className="text-yellow-300" />
              Loyalty Rewards
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Earn Points on<br />Every Order!
            </h2>
            <p className="text-white/85 text-base leading-relaxed max-w-md">
              Get <strong className="text-yellow-300">1 point for every ₱100</strong> you spend.
              Redeem your points for exclusive rewards and discounts.
              The more you order, the more you earn!
            </p>
            <div className="flex flex-wrap gap-4">
              {['Free Delivery Voucher', 'Discount Coupons', 'Gift Items'].map(r => (
                <span key={r}
                  className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl
                    text-white font-medium text-sm border border-white/20">
                  <MdStar size={14} className="text-yellow-300" /> {r}
                </span>
              ))}
            </div>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
                text-gray-900 font-bold rounded-xl hover:bg-yellow-300
                transition shadow-lg text-sm w-fit">
              Join & Start Earning <MdArrowForward size={18} />
            </Link>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { pts: '100 pts',  label: 'Free Delivery',    color: 'bg-white/15' },
              { pts: '200 pts',  label: '₱50 Discount',     color: 'bg-white/10' },
              { pts: '500 pts',  label: 'Gift Item',         color: 'bg-white/10' },
              { pts: '1000 pts', label: 'Premium Bundle',   color: 'bg-white/15' },
            ].map(({ pts, label, color }) => (
              <div key={label}
                className={`${color} border border-white/20 rounded-2xl p-5 space-y-2`}>
                <p className="text-yellow-300 font-black text-xl">{pts}</p>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-white/60 text-xs">Redeemable reward</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery Promo Banner ── */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100
          shadow-sm p-8 sm:p-12 text-center space-y-5">
          <span className="text-4xl">🚚</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
            Get <span className="text-[#00B14F]">FREE Delivery</span> on Orders ₱500+
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Sign up today and enjoy free delivery on your qualifying orders.
            No promo code needed.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00B14F]
              text-white font-bold rounded-xl hover:bg-[#009940] transition
              shadow-md text-sm">
            Sign Up for Free <MdArrowForward size={18} />
          </Link>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">
              Get In Touch
            </span>
            <h2 className="text-3xl font-black text-gray-800">Contact Us</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Have questions? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { icon: MdPhone,       label: 'Phone',   value: '+63 912 345 6789'           },
              { icon: MdEmail,       label: 'Email',   value: 'contactquickstock@gmail.com' },
              { icon: MdLocationOn,  label: 'Address', value: 'Philippines'                },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}
                className="flex flex-col items-center gap-3 text-center p-6 bg-gray-50
                  rounded-2xl border border-gray-100 hover:border-[#00B14F] transition">
                <div className="w-12 h-12 bg-[#00B14F] rounded-xl flex items-center
                  justify-center shadow-md">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-0.5">{label}</p>
                  <p className="text-gray-800 font-semibold text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-300">

        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1
          sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <img src="/logo.jpg" alt="QuickStock Supply"
              className="h-14 object-contain bg-white rounded-xl px-3 py-1.5" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted online grocery supplier.
              Fast, fresh, and affordable — delivered straight to your door.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Follow us:</span>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center
                  justify-center hover:opacity-90 transition"
                aria-label="Facebook">
                <FaFacebookF size={13} className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Quick Links</h4>
            <ul className="space-y-2.5">
              {['Home', 'About Us', 'Products', 'Rewards', 'Contact Us'].map(l => (
                <li key={l}>
                  <a href={`#${l.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-[#00B14F] text-sm transition
                      flex items-center gap-1.5">
                    <MdArrowForward size={12} className="text-[#00B14F]" /> {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">My Account</h4>
            <ul className="space-y-2.5">
              {[
                ['Login',           '/login'   ],
                ['Register',        '/register'],
                ['My Orders',       '/login'   ],
                ['Rewards & Points','/login'   ],
                ['Membership',      '/login'   ],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link to={path}
                    className="text-gray-400 hover:text-[#00B14F] text-sm transition
                      flex items-center gap-1.5">
                    <MdArrowForward size={12} className="text-[#00B14F]" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Contact Info</h4>
            <ul className="space-y-3">
              {[
                { icon: MdPhone,       text: '+63 912 345 6789'            },
                { icon: MdEmail,       text: 'contactquickstock@gmail.com' },
                { icon: MdLocationOn,  text: 'Philippines'                 },
              ].map(({ icon: Icon, text }) => (
                <li key={text}
                  className="flex items-start gap-2.5 text-gray-400 text-sm">
                  <Icon size={16} className="text-[#00B14F] shrink-0 mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <p className="text-gray-500 text-xs font-medium mb-2">Business Hours</p>
              <p className="text-gray-400 text-xs">Mon – Sat: 8:00 AM – 6:00 PM</p>
              <p className="text-gray-400 text-xs">Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row
            items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} QuickStock Supply. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <MdFavorite size={12} className="text-red-400" /> in the Philippines
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
