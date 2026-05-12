import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import {
  MdDashboard,
  MdShoppingCart,
  MdDirectionsCar,
  MdPeople,
  MdInventory2,
  MdCardMembership,
  MdStar,
  MdMenu,
  MdClose,
  MdLogout,
} from 'react-icons/md'

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: MdDashboard,       path: '/admin/dashboard'   },
  { label: 'Orders',      icon: MdShoppingCart,    path: '/admin/orders'      },
  { label: 'Drivers',     icon: MdDirectionsCar,   path: '/admin/drivers'     },
  { label: 'Customers',   icon: MdPeople,           path: '/admin/customers'   },
  { label: 'Products',    icon: MdInventory2,       path: '/admin/products'    },
  { label: 'Memberships', icon: MdCardMembership,   path: '/admin/memberships' },
  { label: 'Rewards',     icon: MdStar,             path: '/admin/rewards'     },
]

export default function AdminLayout({ children, pageTitle = 'Dashboard' }) {
  const [open, setOpen] = useState(false)
  const { profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = (profile?.full_name ?? 'A')[0].toUpperCase()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#00B14F] z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-green-400/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-[#00B14F] font-extrabold text-sm leading-none">Q</span>
            </div>
            <span className="text-white font-bold text-base tracking-tight">QuickStock</span>
          </div>
          <button
            className="lg:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 select-none
                  ${active
                    ? 'bg-white text-[#00B14F] shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'}
                `}
              >
                <Icon size={19} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-5 border-t border-green-400/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/75
              hover:bg-white/10 hover:text-white text-sm font-medium w-full
              transition-all duration-150"
          >
            <MdLogout size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="shrink-0 bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
            >
              <MdMenu size={24} />
            </button>
            <div>
              <h1 className="text-gray-800 font-semibold text-base leading-tight">{pageTitle}</h1>
              <p className="text-gray-400 text-xs">QuickStock Supply</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {profile?.full_name ?? 'Admin'}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {profile?.role ?? 'superadmin'}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full bg-[#00B14F] flex items-center justify-center
                text-white font-bold text-sm shadow-sm shrink-0"
            >
              {initials}
            </div>
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
