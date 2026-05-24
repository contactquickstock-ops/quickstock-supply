import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  MdMenu, MdClose, MdArrowForward,
  MdPhone, MdEmail, MdLocationOn, MdFavorite,
} from 'react-icons/md'
import { FaFacebookF } from 'react-icons/fa'

const NAV = [
  { label: 'Home',       path: '/'         },
  { label: 'About Us',   path: '/about'    },
  { label: 'Products',   path: '/products' },
  { label: 'Rewards',    path: '/rewards'  },
  { label: 'Contact Us', path: '/contact'  },
]

const FB_URL = 'https://www.facebook.com/profile.php?id=61570722723997'

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Announcement bar ── */}
      <div className="bg-[#168AFF] text-white text-xs sm:text-sm text-center
        py-2 px-4 font-medium shrink-0">
        🚚 FREE delivery on orders ₱500 and above &nbsp;|&nbsp; Open Mon – Sun · 8:00 AM – 8:00 PM
      </div>

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Mobile: single row — logo + hamburger */}
          {/* Desktop: two rows — logo row + nav row */}

          {/* Logo row (always visible) */}
          <div className="flex items-center justify-between h-16 md:h-14 md:border-b md:border-gray-50">
            <Link to="/">
              <img src="/logo.jpg" alt="QuickStock Supply"
                className="h-14 md:h-10 object-contain" />
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-[#168AFF] transition"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu">
              {menuOpen ? <MdClose size={26} /> : <MdMenu size={26} />}
            </button>
          </div>

          {/* Nav row — desktop only */}
          <div className="hidden md:flex items-center justify-between h-12">

            {/* Desktop nav */}
            <nav className="flex items-center gap-7">
              {NAV.map(({ label, path }) => {
                const active = pathname === path
                return (
                  <Link key={path} to={path}
                    className={`text-sm font-semibold transition whitespace-nowrap
                      ${active
                        ? 'text-[#168AFF] border-b-2 border-[#168AFF] pb-0.5'
                        : 'text-gray-700 hover:text-[#168AFF]'}`}>
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="px-4 py-1.5 text-sm font-semibold
                  text-[#168AFF] border border-[#168AFF] rounded-lg
                  hover:bg-blue-50 transition">
                Login
              </Link>
              <Link to="/register"
                className="px-4 py-1.5 text-sm font-semibold
                  text-white bg-[#168AFF] rounded-lg hover:bg-[#1270DB]
                  transition shadow-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4
            pt-2 space-y-1 shadow-lg">
            {NAV.map(({ label, path }) => (
              <Link key={path} to={path}
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-gray-700 font-semibold text-base
                  hover:text-[#168AFF] hover:bg-blue-50 rounded-xl transition">
                {label}
              </Link>
            ))}
            <div className="pt-3 flex gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-sm font-semibold
                  text-[#168AFF] border border-[#168AFF] rounded-xl hover:bg-blue-50 transition">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-sm font-semibold
                  text-white bg-[#168AFF] rounded-xl hover:bg-[#1270DB] transition">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 [&_p]:text-justify">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1
          sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <img src="/logo.jpg" alt="QuickStock Supply"
              className="h-14 object-contain bg-white rounded-xl px-3 py-1.5" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted supply partner for sari-sari stores, restaurants, and small
              businesses. Fast, affordable, and reliable — delivered directly to your store.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Follow us:</span>
              <a href={FB_URL} target="_blank" rel="noopener noreferrer"
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
              {NAV.map(({ label, path }) => (
                <li key={label}>
                  <Link to={path}
                    className="text-gray-400 hover:text-[#168AFF] text-sm transition
                      flex items-center gap-1.5">
                    <MdArrowForward size={12} className="text-[#168AFF]" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">My Account</h4>
            <ul className="space-y-2.5">
              {[
                ['Login',            '/login'   ],
                ['Register',         '/register'],
                ['My Orders',        '/login'   ],
                ['Rewards & Points', '/login'   ],
                ['Membership',       '/login'   ],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link to={path}
                    className="text-gray-400 hover:text-[#168AFF] text-sm transition
                      flex items-center gap-1.5">
                    <MdArrowForward size={12} className="text-[#168AFF]" /> {label}
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
                [MdPhone,      '09304453799'                 ],
                [MdEmail,      'contactquickstock@gmail.com' ],
                [MdLocationOn, 'Davao City, Philippines'      ],
              ].map(([Icon, text]) => (
                <li key={text} className="flex items-start gap-2.5 text-gray-400 text-sm">
                  <Icon size={16} className="text-[#168AFF] shrink-0 mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <p className="text-gray-500 text-xs font-medium mb-1.5">Business Hours</p>
              <p className="text-gray-400 text-xs">Mon – Sun: 8:00 AM – 8:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row
            items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} QuickStock Supply. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <MdFavorite size={12} className="text-red-400 mx-0.5" /> in the Philippines
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
