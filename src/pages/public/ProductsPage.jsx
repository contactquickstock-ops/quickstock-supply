import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MdShoppingCart, MdArrowForward, MdLock, MdImage } from 'react-icons/md'
import PublicLayout from '../../layouts/PublicLayout'
import { supabaseAdmin } from '../../services/supabaseAdmin'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
      flex flex-col animate-pulse">
      <div className="h-28 bg-gray-100" />
      <div className="p-3 space-y-2 flex-1">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-1/3 mt-1" />
        <div className="h-8 bg-gray-100 rounded-lg mt-2" />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeCategory, setCategory] = useState('All')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabaseAdmin
        .from('products')
        .select('id, name, description, category, price, unit_type, image_url')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-[#168AFF] to-[#0D5FC4] text-white py-14 px-4">
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
            <Link to="/register" className="text-[#168AFF] font-bold hover:underline">
              Register here
            </Link> or <Link to="/login" className="text-[#168AFF] font-bold hover:underline">
              Login
            </Link>
          </span>
        </div>
      </div>

      {/* ── Products section ── */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-7">

          {/* Category filter tabs */}
          {!loading && categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition
                    ${activeCategory === cat
                      ? 'bg-[#168AFF] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#168AFF] hover:text-[#168AFF]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
              px-5 py-20 text-center text-gray-400 text-sm">
              {products.length === 0
                ? 'No products available yet. Check back soon!'
                : 'No products in this category.'}
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm">
                Showing <span className="font-bold text-gray-800">{filtered.length}</span> products
                {activeCategory !== 'All' && (
                  <span> in <span className="text-[#168AFF] font-semibold">{activeCategory}</span></span>
                )}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filtered.map(product => (
                  <div key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm
                      overflow-hidden hover:shadow-md hover:border-[#168AFF]/30
                      transition-all duration-200 flex flex-col">
                    {/* Image area */}
                    <div className="relative bg-blue-50 h-28 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MdImage size={40} className="text-gray-200" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1 gap-1.5">
                      {product.category && (
                        <p className="text-[10px] font-semibold text-[#168AFF] uppercase tracking-wide">
                          {product.category}
                        </p>
                      )}
                      <p className="text-gray-800 font-semibold text-xs leading-snug line-clamp-2">{product.name}</p>
                      {product.unit_type && (
                        <p className="text-gray-400 text-[10px]">per {product.unit_type}</p>
                      )}
                      <p className="text-[#168AFF] font-black text-base mt-auto">
                        ₱{Number(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <Link to="/login"
                        className="mt-1 w-full py-1.5 border border-[#168AFF] text-[#168AFF]
                          text-xs font-bold rounded-lg text-center hover:bg-blue-50
                          transition flex items-center justify-center gap-1">
                        <MdShoppingCart size={12} /> Login to Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-[#168AFF]">
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
