import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdStorefront, MdShoppingCart, MdReceipt,
  MdCardMembership, MdMenu, MdClose, MdLogout,
  MdStar, MdEmail, MdVerified, MdPhone, MdPerson,
  MdSupportAgent,
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../services/supabase'

const NAV_ITEMS = [
  { label: 'Browse',           icon: MdStorefront,    path: '/customer/dashboard'  },
  { label: 'My Orders',        icon: MdReceipt,       path: '/customer/orders'     },
  { label: 'Rewards',          icon: MdStar,          path: '/customer/rewards'    },
  { label: 'Membership',       icon: MdCardMembership, path: '/customer/membership' },
  { label: 'Customer Service', icon: MdSupportAgent,  path: '/customer/service'    },
]

const PROFILE_LINKS = [
  { label: 'My Profile',  icon: MdPerson,         path: '/customer/profile'    },
  { label: 'My Orders',   icon: MdReceipt,        path: '/customer/orders'     },
  { label: 'Rewards',     icon: MdStar,           path: '/customer/rewards'    },
  { label: 'Membership',  icon: MdCardMembership, path: '/customer/membership' },
]

export default function CustomerLayout({ children }) {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { profile }   = useAuth()
  const { itemCount } = useCart()
  const location      = useLocation()
  const navigate      = useNavigate()
  const profileRef    = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [profileOpen])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials  = (profile?.full_name ?? 'C')[0].toUpperCase()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Hi!'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top navbar ── */}
      <header className="fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/customer/dashboard" className="flex items-center gap-2 shrink-0">
            <img src="/logo.jpg" alt="QuickStock Supply"
              className="h-9 object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
              const active = location.pathname.startsWith(path)
              return (
                <Link key={path} to={path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    text-sm font-medium transition
                    ${active
                      ? 'bg-[#168AFF]/10 text-[#168AFF]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                  <Icon size={17} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right: cart + profile */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Cart */}
            <Link to="/customer/cart"
              className="relative p-2 rounded-lg text-gray-500
                hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label={`Cart (${itemCount} items)`}>
              <MdShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                  bg-[#168AFF] text-white text-[10px] font-bold rounded-full
                  flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Profile dropdown trigger */}
            <div ref={profileRef} className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                  hover:bg-gray-100 transition"
                aria-label="Profile menu">
                <div className="w-8 h-8 rounded-full bg-[#168AFF] flex items-center justify-center
                  text-white font-bold text-sm shadow-sm shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <span className="text-sm text-gray-700 font-medium max-w-22.5 truncate">
                  {firstName}
                </span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl
                  shadow-xl border border-gray-100 overflow-hidden z-50">

                  {/* Header */}
                  <div className="bg-linear-to-br from-[#168AFF] to-[#0D5FC4] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center
                        justify-center text-white font-black text-lg shrink-0 overflow-hidden
                        ring-2 ring-white/30">
                        {profile?.avatar_url
                          ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          : initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">
                          {profile?.full_name ?? '—'}
                        </p>
                        <p className="text-white/75 text-xs truncate mt-0.5">
                          {profile?.email ?? '—'}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5
                          bg-green-400/20 text-green-200 text-[10px] font-bold rounded-full">
                          <MdVerified size={10} /> Approved
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-4 py-3 border-b border-gray-50 space-y-2">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <MdEmail size={15} className="text-gray-400 shrink-0" />
                      <span className="truncate">{profile?.email ?? '—'}</span>
                    </div>
                    {profile?.contact_number && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <MdPhone size={15} className="text-gray-400 shrink-0" />
                        <span>{profile.contact_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <MdCardMembership size={15} className="text-gray-400 shrink-0" />
                      <span className="capitalize">{profile?.role ?? 'customer'}</span>
                    </div>
                  </div>

                  {/* Quick links */}
                  <div className="px-2 py-2 border-b border-gray-50">
                    {PROFILE_LINKS.map(({ label, icon: Icon, path }) => (
                      <Link key={path} to={path}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm text-gray-600 hover:bg-blue-50 hover:text-[#168AFF]
                          transition font-medium">
                        <Icon size={16} className="shrink-0" />
                        {label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="px-2 py-2">
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
                        text-sm text-red-500 hover:bg-red-50 transition font-medium">
                      <MdLogout size={16} className="shrink-0" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 transition"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu">
              {menuOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">

            {/* Profile summary (mobile) */}
            <div className="flex items-start gap-3 px-3 py-3 mb-1">
              <div className="w-11 h-11 rounded-full bg-[#168AFF] flex items-center justify-center
                text-white font-bold text-sm shrink-0 overflow-hidden">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 truncate">{profile?.full_name ?? '—'}</p>
                <p className="text-xs text-gray-400 truncate">{profile?.email ?? '—'}</p>
                {profile?.contact_number && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MdPhone size={11} className="shrink-0" />
                    {profile.contact_number}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5
                    bg-[#168AFF]/10 text-[#168AFF] text-[10px] font-bold rounded-full capitalize">
                    <MdVerified size={10} /> {profile?.role ?? 'Customer'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5
                    bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                    <MdVerified size={10} /> {profile?.status ?? 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2">
              {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
                const active = location.pathname.startsWith(path)
                return (
                  <Link key={path} to={path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                      text-sm font-medium transition
                      ${active ? 'bg-[#168AFF]/10 text-[#168AFF]' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Icon size={18} />
                    {label}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-gray-100 pt-2">
              <Link to="/customer/profile"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition
                  ${location.pathname.startsWith('/customer/profile')
                    ? 'bg-[#168AFF]/10 text-[#168AFF]'
                    : 'text-gray-600 hover:bg-gray-100'}`}>
                <MdPerson size={18} />
                My Profile
              </Link>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <button onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium text-red-500 hover:bg-red-50 transition">
                <MdLogout size={18} />
                Logout
              </button>
            </div>
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
