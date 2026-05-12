import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdStorefront, MdShoppingCart, MdReceipt,
  MdCardMembership, MdMenu, MdClose, MdLogout,
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../services/supabase'

const NAV_ITEMS = [
  { label: 'Browse',     icon: MdStorefront,    path: '/customer/dashboard'  },
  { label: 'My Orders',  icon: MdReceipt,       path: '/customer/orders'     },
  { label: 'Membership', icon: MdCardMembership, path: '/customer/membership' },
]

export default function CustomerLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { profile }  = useAuth()
  const { itemCount } = useCart()
  const location     = useLocation()
  const navigate     = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = (profile?.full_name ?? 'C')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top navbar ── */}
      <header className="fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/customer/dashboard"
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-7 h-7 bg-[#1A2E74] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-xs leading-none">Q</span>
            </div>
            <span className="text-gray-800 font-bold text-base tracking-tight hidden sm:block">
              QuickStock
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
              const active = location.pathname.startsWith(path)
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    text-sm font-medium transition
                    ${active
                      ? 'bg-[#1A2E74]/10 text-[#1A2E74]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right: cart + user + logout */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Cart icon */}
            <Link
              to="/customer/cart"
              className="relative p-2 rounded-lg text-gray-500
                hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label={`Cart (${itemCount} items)`}
            >
              <MdShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                  bg-[#1A2E74] text-white text-[10px] font-bold rounded-full
                  flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Avatar + first name (desktop) */}
            <div className="hidden sm:flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#1A2E74] flex items-center justify-center
                text-white font-bold text-sm shadow-sm shrink-0">
                {initials}
              </div>
              <span className="text-sm text-gray-700 font-medium max-w-[100px] truncate">
                {profile?.full_name?.split(' ')[0] ?? 'Hi!'}
              </span>
            </div>

            {/* Logout (desktop) */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="hidden sm:flex p-2 rounded-lg text-gray-400
                hover:text-red-500 hover:bg-red-50 transition"
            >
              <MdLogout size={18} />
            </button>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 transition"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
              const active = location.pathname.startsWith(path)
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-sm font-medium transition
                    ${active
                      ? 'bg-[#1A2E74]/10 text-[#1A2E74]'
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium text-red-500 hover:bg-red-50 transition"
            >
              <MdLogout size={18} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
