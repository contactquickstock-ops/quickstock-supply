import { Link } from 'react-router-dom'
import { MdDirectionsCar, MdInventory2, MdPeople } from 'react-icons/md'

const FEATURES = [
  { icon: MdInventory2,    title: 'Wide Product Range',   desc: 'From grains to beverages — everything your household needs.'  },
  { icon: MdDirectionsCar, title: 'Fast Delivery',        desc: 'Assigned drivers ensure your order arrives quickly.'           },
  { icon: MdPeople,        title: 'Member Benefits',      desc: 'Join our membership program and earn points on every order.'  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Navbar ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <img src="/logo.png" alt="QuickStock Supply" className="h-9 object-contain" />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-600
                hover:text-gray-800 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1A2E74]
                rounded-xl hover:bg-[#162060] transition shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="text-center max-w-xl">
          <div className="inline-flex items-center gap-2 bg-[#1A2E74]/10 text-[#1A2E74]
            px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1A2E74]" />
            Fast & Reliable Supply Delivery
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-800 leading-tight">
            Your Supplies,
            <span className="text-[#1A2E74]"> Delivered.</span>
          </h1>

          <p className="text-gray-400 text-lg mt-4 leading-relaxed">
            Order fresh groceries and essentials from QuickStock.
            Fast delivery, member rewards, and real-time tracking.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <Link
              to="/register"
              className="px-7 py-3 bg-[#1A2E74] text-white font-bold rounded-xl
                hover:bg-[#162060] transition shadow-md text-sm"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 text-gray-600 font-bold rounded-xl border
                border-gray-200 hover:bg-gray-50 transition text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-5 pb-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="w-11 h-11 bg-[#1A2E74]/10 rounded-xl flex items-center
                justify-center mb-4">
                <Icon size={22} className="text-[#1A2E74]" />
              </div>
              <h3 className="text-gray-800 font-bold text-sm">{title}</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-5 text-center
        text-xs text-gray-400">
        © {new Date().getFullYear()} QuickStock Supply. All rights reserved.
      </footer>
    </div>
  )
}
