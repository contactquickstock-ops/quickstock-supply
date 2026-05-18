import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MdSearch, MdAdd, MdClose, MdEdit, MdImage,
  MdCheckCircle, MdCancel,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

const UNIT_TYPES = ['kg', 'g', 'L', 'mL', 'piece', 'dozen', 'box', 'pack', 'bottle', 'can', 'bag', 'sack']

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  price: '',
  unitType: 'kg',
  isAvailable: true,
  imageFile: null,
  imagePreview: null,
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-5 bg-gray-100 rounded-lg w-1/2" />
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

function ProductCard({ product, toggling, onEdit, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
      flex flex-col hover:shadow-md transition-shadow">

      {/* Image */}
      <div className="relative h-44 bg-gray-50 shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <MdImage size={44} />
          </div>
        )}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-semibold
          ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {product.is_available ? 'Available' : 'Hidden'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <span className="text-[10px] font-semibold text-[#168AFF] uppercase tracking-wide">
          {product.category ?? '—'}
        </span>
        <h4 className="text-gray-800 font-bold text-sm leading-snug line-clamp-1">
          {product.name ?? '—'}
        </h4>
        {product.description && (
          <p className="text-gray-400 text-xs line-clamp-2 mt-0.5">{product.description}</p>
        )}
        <p className="text-gray-800 font-bold text-base mt-auto pt-2">
          ₱{Number(product.price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          <span className="text-gray-400 font-normal text-xs"> / {product.unit_type ?? 'unit'}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2
            rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50
            text-xs font-semibold transition"
        >
          <MdEdit size={14} />
          Edit
        </button>
        <button
          onClick={onToggle}
          disabled={toggling}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2
            rounded-xl text-xs font-semibold transition
            disabled:opacity-50 disabled:cursor-not-allowed
            ${product.is_available
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
        >
          {product.is_available
            ? <><MdCancel size={14} />{toggling ? 'Hiding…' : 'Hide'}</>
            : <><MdCheckCircle size={14} />{toggling ? 'Showing…' : 'Show'}</>}
        </button>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [toggling, setToggling]   = useState(null)
  const fileInputRef              = useRef(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError('Failed to load products.')
    } else {
      setProducts(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function openAdd() {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(product) {
    setEditProduct(product)
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      category: product.category ?? '',
      price: product.price ?? '',
      unitType: product.unit_type ?? 'kg',
      isAvailable: product.is_available ?? true,
      imageFile: null,
      imagePreview: product.image_url ?? null,
    })
    setFormError(null)
    setShowModal(true)
  }

  function closeModal() {
    if (saving) return
    setShowModal(false)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({
      ...f,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }))
    e.target.value = ''
  }

  async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`
    const { error: uploadErr } = await supabase.storage
      .from('products')
      .upload(fileName, file)
    if (uploadErr) throw new Error(uploadErr.message)
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)
    return urlData.publicUrl
  }

  async function handleSave(e) {
    e.preventDefault()
    const { name, description, category, price, unitType, isAvailable, imageFile } = form

    if (!name.trim() || !category.trim() || price === '') {
      setFormError('Name, Category, and Price are required.')
      return
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
      setFormError('Price must be a valid positive number.')
      return
    }
    if (!editProduct && !imageFile) {
      setFormError('Please upload a product image.')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      let imageUrl = editProduct?.image_url ?? null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const payload = {
        name:         name.trim(),
        description:  description.trim(),
        category:     category.trim(),
        price:        Number(price),
        unit_type:    unitType,
        is_available: isAvailable,
        image_url:    imageUrl,
      }

      if (editProduct) {
        const { data: updated, error: err } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editProduct.id)
          .select()
          .single()
        if (err) throw new Error(err.message)
        setProducts(prev => prev.map(p => p.id === editProduct.id ? updated : p))
      } else {
        const { data: inserted, error: err } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single()
        if (err) throw new Error(err.message)
        setProducts(prev => [inserted, ...prev])
      }

      setShowModal(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailability(product) {
    setToggling(product.id)
    setError(null)
    const { error: err } = await supabase
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id)
    if (err) {
      setError('Failed to update availability.')
    } else {
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p)
      )
    }
    setToggling(null)
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    return (
      (p.name ?? '').toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q)
    )
  })

  const counts = {
    total:     products.length,
    available: products.filter(p => p.is_available).length,
    hidden:    products.filter(p => !p.is_available).length,
  }

  return (
    <AdminLayout pageTitle="Products">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Page heading + Search + Add */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Products</h2>
            <p className="text-gray-400 text-sm mt-0.5">Manage your product catalog</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search name or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                  w-52 transition"
              />
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                bg-[#168AFF] text-white text-sm font-semibold
                hover:bg-[#1270DB] transition shadow-sm"
            >
              <MdAdd size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',     value: counts.total,     color: 'bg-gray-100 text-gray-600' },
            { label: 'Available', value: counts.available, color: 'bg-green-100 text-green-700' },
            { label: 'Hidden',    value: counts.hidden,    color: 'bg-gray-100 text-gray-500' },
          ].map(({ label, value, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}
            >
              {loading ? '—' : value} {label}
            </span>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
            px-5 py-16 text-center text-gray-400 text-sm">
            {search
              ? 'No products match your search.'
              : 'No products yet. Click "Add Product" to create one.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  toggling={toggling === product.id}
                  onEdit={() => openEdit(product)}
                  onToggle={() => toggleAvailability(product)}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-gray-800 font-bold text-base">
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {editProduct ? 'Update product details' : 'Fill in the details below'}
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                aria-label="Close"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 space-y-4">

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    {formError}
                  </div>
                )}

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Product Image{!editProduct && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <div
                    onClick={() => !saving && fileInputRef.current?.click()}
                    className={`relative w-full h-44 rounded-xl border-2 border-dashed
                      flex items-center justify-center overflow-hidden cursor-pointer
                      transition-colors group
                      ${form.imagePreview
                        ? 'border-transparent'
                        : 'border-gray-200 hover:border-[#168AFF]'}`}
                  >
                    {form.imagePreview ? (
                      <>
                        <img
                          src={form.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                          transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-semibold opacity-0
                            group-hover:opacity-100 transition-opacity">
                            Click to change image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-300 select-none">
                        <MdImage size={36} />
                        <span className="text-xs text-gray-400">Click to upload image</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={saving}
                    className="hidden"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Product Name<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rice, Cooking Oil"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    disabled={saving}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                      transition disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief product description…"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    disabled={saving}
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                      transition disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Category<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    list="product-categories"
                    placeholder="e.g. Grains, Beverages"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    disabled={saving}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                      transition disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <datalist id="product-categories">
                    {['Grains', 'Beverages', 'Dairy', 'Meat', 'Vegetables', 'Fruits',
                      'Condiments', 'Snacks', 'Canned Goods', 'Frozen Foods', 'Cleaning'].map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Price + Unit Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Price (₱)<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      disabled={saving}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                        transition disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Unit Type
                    </label>
                    <select
                      value={form.unitType}
                      onChange={e => setForm(f => ({ ...f, unitType: e.target.value }))}
                      disabled={saving}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                        transition disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                {/* Availability toggle */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl
                  bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Available</p>
                    <p className="text-xs text-gray-400 mt-0.5">Visible to customers when enabled</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                    disabled={saving}
                    aria-label="Toggle availability"
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0
                      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#168AFF]/50
                      ${form.isAvailable ? 'bg-[#168AFF]' : 'bg-gray-300'}
                      disabled:opacity-50`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                        transition-transform duration-200
                        ${form.isAvailable ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="px-6 pb-6 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600
                    border border-gray-200 rounded-xl hover:bg-gray-50
                    transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white
                    bg-[#168AFF] rounded-xl hover:bg-[#1270DB]
                    transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? (editProduct ? 'Saving…' : 'Adding…')
                    : (editProduct ? 'Save Changes' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
