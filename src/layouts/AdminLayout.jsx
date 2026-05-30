import { useState, useRef, useEffect } from 'react'
import { supabaseAdmin } from '../services/supabaseAdmin'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import {
  MdDashboard, MdShoppingCart, MdDirectionsCar, MdPeople,
  MdInventory2, MdCardMembership, MdStar, MdMenu, MdClose,
  MdLogout, MdEmail, MdAdminPanelSettings, MdVerified, MdCampaign,
  MdDynamicFeed,
} from 'react-icons/md'

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: MdDashboard,      path: '/admin/dashboard'   },
  { label: 'Orders',      icon: MdShoppingCart,   path: '/admin/orders'      },
  { label: 'Drivers',     icon: MdDirectionsCar,  path: '/admin/drivers'     },
  { label: 'Customers',   icon: MdPeople,          path: '/admin/customers'   },
  { label: 'Products',    icon: MdInventory2,      path: '/admin/products'    },
  { label: 'Memberships', icon: MdCardMembership,  path: '/admin/memberships' },
  { label: 'Rewards',     icon: MdStar,            path: '/admin/rewards'     },
  { label: 'Testimonials', icon: MdCampaign,       path: '/admin/posts'       },
  { label: 'Posts',       icon: MdDynamicFeed,     path: '/admin/feed'        },
]

export default function AdminLayout({ children, pageTitle = 'Dashboard' }) {
  const [open, setOpen]               = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { profile } = useAuth()
  const location    = useLocation()
  const navigate    = useNavigate()
  const profileRef  = useRef(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    function onOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [profileOpen])

  const [pendingOrders,      setPendingOrders]      = useState(0)
  const [pendingCustomers,   setPendingCustomers]   = useState(0)
  const [pendingMemberships, setPendingMemberships] = useState(0)

  useEffect(() => {
    function refreshCounts() {
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed'])
        .then(({ count }) => setPendingOrders(count ?? 0))
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true })
        .eq('role', 'customer').eq('status', 'pending')
        .then(({ count }) => setPendingCustomers(count ?? 0))
      supabaseAdmin.from('memberships').select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .then(({ count }) => setPendingMemberships(count ?? 0))
    }

    refreshCounts()

    // Real-time — any order change immediately refreshes badge counts
    const channel = supabase
      .channel('admin-layout-counts-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refreshCounts)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = (profile?.full_name ?? 'A')[0].toUpperCase()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0d1b2e] z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2f50]">
          <img src="/logo.jpg" alt="QuickStock Supply"
            className="h-10 object-contain bg-white rounded-xl px-1.5 py-0.5" />
          <button
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar">
            <MdClose size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path)
            return (
              <Link key={path} to={path}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 select-none
                  ${active
                    ? 'bg-[#168AFF] text-white shadow-md'
                    : 'text-blue-200/70 hover:bg-[#1a2f50] hover:text-white'}
                `}>
                <Icon size={19} />
                {label}
                {label === 'Orders' && pendingOrders > 0 && (
                  <span className="ml-auto min-w-4.5 h-4.5 px-1 bg-red-500 text-white
                    text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {pendingOrders > 99 ? '99+' : pendingOrders}
                  </span>
                )}
                {label === 'Customers' && pendingCustomers > 0 && (
                  <span className="ml-auto min-w-4.5 h-4.5 px-1 bg-orange-500 text-white
                    text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {pendingCustomers > 99 ? '99+' : pendingCustomers}
                  </span>
                )}
                {label === 'Memberships' && pendingMemberships > 0 && (
                  <span className="ml-auto min-w-4.5 h-4.5 px-1 bg-yellow-500 text-white
                    text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {pendingMemberships > 99 ? '99+' : pendingMemberships}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-5 border-t border-[#1a2f50]">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-blue-200/70
              hover:bg-[#1a2f50] hover:text-white text-sm font-medium w-full
              transition-all duration-150">
            <MdLogout size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="shrink-0 bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5
          flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar">
              <MdMenu size={24} />
            </button>
            <div>
              <h1 className="text-gray-800 font-semibold text-base leading-tight">{pageTitle}</h1>
              <p className="text-gray-400 text-xs">QuickStock Supply</p>
            </div>
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl
                hover:bg-gray-100 transition"
              aria-label="Profile menu">
              <div className="w-9 h-9 rounded-full bg-[#168AFF] flex items-center justify-center
                text-white font-bold text-sm shadow-sm shrink-0">
                {initials}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {profile?.full_name ?? 'Admin'}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {profile?.role ?? 'superadmin'}
                </p>
              </div>
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl
                shadow-xl border border-gray-100 overflow-hidden z-50">

                {/* Header */}
                <div className="bg-[#0d1b2e] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#168AFF] flex items-center
                      justify-center text-white font-black text-lg shrink-0
                      ring-2 ring-white/20">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {profile?.full_name ?? '—'}
                      </p>
                      <p className="text-blue-200/70 text-xs truncate mt-0.5">
                        {profile?.email ?? '—'}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5
                        bg-[#168AFF]/30 text-blue-200 text-[10px] font-bold rounded-full">
                        <MdAdminPanelSettings size={10} /> Super Admin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="px-4 py-3 border-b border-gray-50 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <MdEmail size={15} className="text-gray-400 shrink-0" />
                    <span className="truncate">{profile?.email ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <MdVerified size={15} className="text-[#168AFF] shrink-0" />
                    <span>Account status: <span className="font-semibold text-green-600">Active</span></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <MdAdminPanelSettings size={15} className="text-gray-400 shrink-0" />
                    <span className="capitalize">{profile?.role ?? 'superadmin'}</span>
                  </div>
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
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-5">
          {children}
        </main>
      </div>
    </div>
  )
}
