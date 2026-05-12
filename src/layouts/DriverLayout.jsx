import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MdDirectionsCar, MdHistory, MdPerson, MdLogout } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

const NAV_ITEMS = [
  { label: 'Deliveries', icon: MdDirectionsCar, path: '/driver/dashboard' },
  { label: 'History',    icon: MdHistory,       path: '/driver/history'   },
  { label: 'Profile',    icon: MdPerson,        path: '/driver/profile'   },
]

export default function DriverLayout({ children }) {
  const { profile }  = useAuth()
  const location     = useLocation()
  const navigate     = useNavigate()
  const initials     = (profile?.full_name ?? 'D')[0].toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top bar ── */}
      <header className="fixed top-0 inset-x-0 z-30 bg-[#1A2E74] shadow-md">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">

          {/* Brand */}
          <img src="/logo.png" alt="QuickStock Supply"
            className="h-8 object-contain bg-white rounded-lg px-1.5 py-0.5" />

          {/* Driver identity + logout */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-white text-xs font-semibold leading-tight">
                {profile?.full_name ?? 'Driver'}
              </p>
              <p className="text-white/60 text-[10px]">Driver</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center
              text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20
                text-white transition"
            >
              <MdLogout size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 pt-14 pb-20">
        <div className="max-w-lg mx-auto px-4 py-5">
          {children}
        </div>
      </main>

      {/* ── Bottom navigation ── */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100
        shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3
                  text-xs font-semibold transition-colors
                  ${active ? 'text-[#1A2E74]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon size={22} />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8
                    h-0.5 bg-[#1A2E74] rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
