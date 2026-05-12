import { useEffect, useState, useCallback, useMemo } from 'react'
import { MdShoppingCart, MdSearch, MdImageNotSupported } from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-2/5 mt-1" />
        <div className="h-9 bg-gray-100 rounded-xl mt-2" />
      </div>
    </div>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product, isAdding, onAddToCart }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
      flex flex-col hover:shadow-md transition-shadow">

      {/* Image */}
      <div className="h-44 bg-gray-50 shrink-0 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <MdImageNotSupported size={36} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] font-semibold text-[#1A2E74] uppercase tracking-wide">
          {product.category ?? '—'}
        </p>
        <h4 className="text-gray-800 font-bold text-sm leading-snug line-clamp-2 mt-0.5">
          {product.name}
        </h4>
        <p className="text-gray-800 font-bold text-base mt-auto pt-2">
          ₱{Number(product.price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          <span className="text-gray-400 font-normal text-xs">
            {' '}/ {product.unit_type ?? 'unit'}
          </span>
        </p>
      </div>

      {/* Add to Cart */}
      <div className="px-3 pb-3 shrink-0">
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl
            text-sm font-semibold transition-all duration-200
            ${isAdding
              ? 'bg-green-100 text-green-600 scale-95'
              : 'bg-[#1A2E74] text-white hover:bg-[#162060] active:scale-95'}`}
        >
          <MdShoppingCart size={16} />
          {isAdding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [activeCategory, setCategory] = useState('All')
  const [addingId, setAddingId]       = useState(null)
  const { addToCart }                 = useCart()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, name, description, category, price, unit_type, image_url')
      .eq('is_available', true)
      .order('category')
      .order('name')
    setProducts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Derive categories from loaded data
  const categories = useMemo(() => {
    const unique = [...new Set(products.map(p => p.category).filter(Boolean))].sort()
    return ['All', ...unique]
  }, [products])

  // When the active category is no longer in the list (e.g. all items of that
  // category become unavailable between fetches), reset to All
  useEffect(() => {
    if (activeCategory !== 'All' && !categories.includes(activeCategory)) {
      setCategory('All')
    }
  }, [categories, activeCategory])

  // Filtered product list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(p => {
      const matchSearch = !q || (p.name ?? '').toLowerCase().includes(q)
      const matchCat    = activeCategory === 'All' || p.category === activeCategory
      return matchSearch && matchCat
    })
  }, [products, search, activeCategory])

  function handleAddToCart(product) {
    setAddingId(product.id)
    addToCart(product)
    toast.success(`${product.name} added to cart!`, { duration: 2000 })
    setTimeout(() => setAddingId(null), 700)
  }

  return (
    <CustomerLayout>
      <div className="space-y-5">

        {/* Page heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Browse Products</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Fresh products available for delivery
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:max-w-sm">
          <MdSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-[#1A2E74]/30 focus:border-[#1A2E74]
              transition"
          />
        </div>

        {/* Category filter tabs */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                  ${activeCategory === cat
                    ? 'bg-[#1A2E74] text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#1A2E74] hover:text-[#1A2E74]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
            px-5 py-16 text-center text-gray-400 text-sm">
            {search || activeCategory !== 'All'
              ? 'No products match your search or filter.'
              : 'No products available right now. Check back soon!'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdding={addingId === product.id}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} shown
              {activeCategory !== 'All' && ` in ${activeCategory}`}
            </p>
          </>
        )}
      </div>
    </CustomerLayout>
  )
}
