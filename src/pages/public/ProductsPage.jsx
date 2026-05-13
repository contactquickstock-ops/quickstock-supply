import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdShoppingCart, MdArrowForward, MdLock } from 'react-icons/md'
import PublicLayout from '../../layouts/PublicLayout'

const CATEGORIES = ['All', 'Rice & Grains', 'Eggs & Dairy', 'Cooking Oil', 'Beverages', 'Canned Goods', 'Noodles & Pasta', 'Condiments', 'Snacks']

const PRODUCTS = [
  { name: 'Ganador Premium Rice',      cat: 'Rice & Grains',  unit: '5kg bag',    price: 250, emoji: '🌾', badge: 'Best Seller' },
  { name: 'Dinorado Rice',             cat: 'Rice & Grains',  unit: '5kg bag',    price: 280, emoji: '🌾', badge: 'Popular'     },
  { name: 'Sinandomeng Rice',          cat: 'Rice & Grains',  unit: '5kg bag',    price: 240, emoji: '🌾', badge: null          },
  { name: 'Farm Fresh Eggs',           cat: 'Eggs & Dairy',   unit: 'per tray',   price: 175, emoji: '🥚', badge: 'Fresh'       },
  { name: 'Magnolia Gold Butter',      cat: 'Eggs & Dairy',   unit: '225g',       price: 85,  emoji: '🧈', badge: null          },
  { name: 'Bear Brand Milk',           cat: 'Eggs & Dairy',   unit: '300g',       price: 68,  emoji: '🥛', badge: 'Popular'     },
  { name: 'Baguio Oil Canola',         cat: 'Cooking Oil',    unit: '1L',         price: 130, emoji: '🛢️', badge: null          },
  { name: 'Minola Coconut Oil',        cat: 'Cooking Oil',    unit: '1L',         price: 115, emoji: '🛢️', badge: 'Best Seller' },
  { name: 'Pepsi Regular',             cat: 'Beverages',      unit: '1.5L',       price: 55,  emoji: '🥤', badge: 'Hot'         },
  { name: 'Coca-Cola',                 cat: 'Beverages',      unit: '1.5L',       price: 58,  emoji: '🥤', badge: null          },
  { name: 'C2 Green Tea',              cat: 'Beverages',      unit: '500mL',      price: 28,  emoji: '🍵', badge: null          },
  { name: 'Lipton Iced Tea',           cat: 'Beverages',      unit: '1L',         price: 45,  emoji: '🍹', badge: null          },
  { name: 'San Marino Corned Tuna',    cat: 'Canned Goods',   unit: 'per can',    price: 78,  emoji: '🥫', badge: 'Popular'     },
  { name: 'Argentina Corned Beef',     cat: 'Canned Goods',   unit: '260g',       price: 95,  emoji: '🥫', badge: null          },
  { name: 'Lucky Me Pancit Canton',    cat: 'Noodles & Pasta', unit: 'per pack',  price: 15,  emoji: '🍜', badge: 'Hot'         },
  { name: 'Quickchow Instant Mami',    cat: 'Noodles & Pasta', unit: 'per pack',  price: 14,  emoji: '🍜', badge: null          },
  { name: 'Datu Puti Vinegar',         cat: 'Condiments',     unit: '350mL',      price: 32,  emoji: '🧂', badge: null          },
  { name: 'Mang Tomas Sauce',          cat: 'Condiments',     unit: '320g',       price: 48,  emoji: '🍶', badge: 'Popular'     },
  { name: 'Sky Flakes Crackers',       cat: 'Snacks',         unit: 'per pack',   price: 35,  emoji: '🍘', badge: null          },
  { name: 'Nova Country Cheddar',      cat: 'Snacks',         unit: 'per pack',   price: 30,  emoji: '🍫', badge: null          },
]

const BADGE_COLORS = {
  'Best Seller': 'bg-yellow-400 text-yellow-900',
  'Popular':     'bg-blue-500 text-white',
  'Fresh':       'bg-green-500 text-white',
  'Hot':         'bg-orange-500 text-white',
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.cat === activeCategory)

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#00B14F] to-[#007A35] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white
            text-xs font-bold px-4 py-1.5 rounded-full">
            Our Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Our Products</h1>
          <p className="text-white/85 text-base leading-relaxed">
            Browse our wide selection of fresh groceries and everyday essentials.
            Sign in to start ordering.
          </p>
        </div>
      </section>

      {/* ── Login notice ── */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2
          text-yellow-800 text-sm font-medium">
          <MdLock size={16} className="text-yellow-600 shrink-0" />
          <span>
            Create an account and get approved to place orders. &nbsp;
            <Link to="/register" className="text-[#00B14F] font-bold hover:underline">
              Register here
            </Link> or <Link to="/login" className="text-[#00B14F] font-bold hover:underline">
              Login
            </Link>
          </span>
        </div>
      </div>

      {/* ── Products section ── */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-7">

          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition
                  ${activeCategory === cat
                    ? 'bg-[#00B14F] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00B14F] hover:text-[#00B14F]'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="text-gray-500 text-sm">
            Showing <span className="font-bold text-gray-800">{filtered.length}</span> products
            {activeCategory !== 'All' && (
              <span> in <span className="text-[#00B14F] font-semibold">{activeCategory}</span></span>
            )}
          </p>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map(({ name, unit, price, emoji, badge }) => (
              <div key={name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                  overflow-hidden hover:shadow-md hover:border-[#00B14F]/30
                  transition-all duration-200 flex flex-col">
                {/* Image area */}
                <div className="relative bg-green-50 h-28 flex items-center justify-center">
                  <span className="text-5xl">{emoji}</span>
                  {badge && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg
                      text-[10px] font-bold ${BADGE_COLORS[badge] ?? 'bg-gray-200 text-gray-700'}`}>
                      {badge}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-3 flex flex-col flex-1 gap-1.5">
                  <p className="text-gray-800 font-semibold text-xs leading-snug line-clamp-2">{name}</p>
                  <p className="text-gray-400 text-[10px]">{unit}</p>
                  <p className="text-[#00B14F] font-black text-base mt-auto">
                    ₱{price.toLocaleString()}
                  </p>
                  {/* Not clickable — requires login */}
                  <Link to="/login"
                    className="mt-1 w-full py-1.5 border border-[#00B14F] text-[#00B14F]
                      text-xs font-bold rounded-lg text-center hover:bg-green-50
                      transition flex items-center justify-center gap-1">
                    <MdShoppingCart size={12} /> Login to Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-[#00B14F]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Start Ordering?
          </h2>
          <p className="text-white/85 text-base">
            Create your account today and get access to our full product catalog.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
              text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition
              shadow-lg text-sm">
            Create Free Account <MdArrowForward size={18} />
          </Link>
        </div>
      </section>

    </PublicLayout>
  )
}
