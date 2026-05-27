import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdImage,
  MdSearch, MdPublic, MdVisibilityOff, MdUpload,
  MdFormatQuote, MdStar,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import toast from 'react-hot-toast'

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition`

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer
          ${checked ? 'bg-[#168AFF]' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow
          transition-all duration-200
          ${checked ? 'left-[23px]' : 'left-[3px]'}`} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}

// ── Create / Edit Modal ────────────────────────────────────────────────────────
function TestimonialModal({ item = null, onClose, onSaved }) {
  const isEdit       = !!item
  const fileInputRef = useRef(null)

  const [name,         setName]         = useState(item?.customer_name ?? '')
  const [storeType,    setStoreType]    = useState(item?.store_type    ?? '')
  const [message,      setMessage]      = useState(item?.message       ?? '')
  const [published,    setPublished]    = useState(item?.published     ?? true)
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(item?.photo_url ?? null)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleSave() {
    if (!name.trim())    { setError('Customer name is required.');  return }
    if (!message.trim()) { setError('Testimonial message is required.'); return }

    setSaving(true)
    setError(null)

    try {
      let photoUrl = item?.photo_url ?? null

      if (imageFile) {
        const ext      = imageFile.type.split('/')[1] || 'jpg'
        const fileName = `testimonial-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('testimonials')
          .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false })
        if (upErr) throw new Error(upErr.message)
        const { data: urlData } = supabase.storage.from('testimonials').getPublicUrl(fileName)
        photoUrl = urlData.publicUrl
      }

      if (!imagePreview && !imageFile) photoUrl = null

      const payload = {
        customer_name: name.trim(),
        store_type:    storeType.trim() || null,
        message:       message.trim(),
        photo_url:     photoUrl,
        published,
      }

      if (isEdit) {
        const { error: err } = await supabase.from('testimonials').update(payload).eq('id', item.id)
        if (err) throw new Error(err.message)
        toast.success('Testimonial updated.')
      } else {
        const { error: err } = await supabase.from('testimonials').insert(payload)
        if (err) throw new Error(err.message)
        toast.success('Testimonial added!')
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg
        max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5
          border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-gray-800 font-bold text-base">
              {isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Customer quote shown on landing page and rewards tab
            </p>
          </div>
          <button onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition">
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
              text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Name + Store in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(null) }}
                placeholder="e.g. Maria Santos"
                className={INPUT_CLS}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Store / Role
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={storeType}
                onChange={e => setStoreType(e.target.value)}
                placeholder="e.g. Sari-sari Store Owner"
                className={INPUT_CLS}
                disabled={saving}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Testimonial Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => { setMessage(e.target.value); setError(null) }}
              placeholder="Write what the customer said about QuickStock…"
              className={`${INPUT_CLS} resize-none`}
              disabled={saving}
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Customer Photo
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="flex items-start gap-4">

              {/* Circle preview */}
              <div
                onClick={() => !saving && fileInputRef.current?.click()}
                className={`relative w-20 h-20 rounded-full overflow-hidden
                  border-2 border-dashed cursor-pointer shrink-0 group transition
                  ${imagePreview ? 'border-transparent' : 'border-gray-200 hover:border-[#168AFF]'}`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Photo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                      transition-colors flex items-center justify-center rounded-full">
                      <MdUpload size={18} className="text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <MdImage size={24} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 pt-1">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Upload a photo of the customer. If not provided, their initials will be shown instead.
                </p>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={saving}
              className="hidden"
            />
          </div>

          {/* Publish toggle */}
          <Toggle
            checked={published}
            onChange={setPublished}
            label={published
              ? 'Published — visible to customers'
              : 'Draft — hidden from customers'}
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50 transition
              disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#168AFF] text-white text-sm font-bold
              rounded-xl hover:bg-[#1270DB] transition shadow-sm
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Testimonial'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({ item, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('testimonials').delete().eq('id', item.id)
    if (error) {
      toast.error('Failed to delete.')
      setDeleting(false)
    } else {
      toast.success('Testimonial deleted.')
      onDeleted()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center
          justify-center mx-auto">
          <MdDelete size={24} className="text-red-500" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-gray-800 font-bold text-base">Remove Testimonial?</h3>
          <p className="text-gray-500 text-sm">
            <span className="font-semibold">{item.customer_name}</span>'s testimonial
            will be permanently removed.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50 transition
              disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold
              rounded-xl hover:bg-red-600 transition disabled:opacity-60">
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Testimonial preview card (admin) ────────────────────────────────────────────
function TestimonialRow({ item, onEdit, onDelete, onToggle, toggling }) {
  const initials = (item.customer_name ?? '?')[0].toUpperCase()
  const isBusy   = toggling === item.id

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/70 transition">

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#168AFF]/10
        text-[#168AFF] flex items-center justify-center font-bold text-base
        shrink-0 border border-[#168AFF]/20">
        {item.photo_url
          ? <img src={item.photo_url} alt={item.customer_name}
              className="w-full h-full object-cover" />
          : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-800 font-bold text-sm">{item.customer_name}</span>
          {item.store_type && (
            <span className="text-gray-400 text-xs">· {item.store_type}</span>
          )}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            text-[10px] font-semibold shrink-0
            ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {item.published
              ? <><MdPublic size={10} /> Published</>
              : <><MdVisibilityOff size={10} /> Draft</>}
          </span>
        </div>
        <p className="text-gray-400 text-xs mt-0.5 line-clamp-2 italic leading-relaxed">
          "{item.message}"
        </p>
        {/* Stars */}
        <div className="flex items-center gap-0.5 mt-1">
          {[1,2,3,4,5].map(s => (
            <MdStar key={s} size={11} className="text-yellow-400" />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onToggle(item)}
          disabled={isBusy}
          title={item.published ? 'Set to draft' : 'Publish'}
          className={`p-2 rounded-lg transition disabled:opacity-40
            ${item.published
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {item.published ? <MdPublic size={16} /> : <MdVisibilityOff size={16} />}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-2 rounded-lg bg-blue-50 text-[#168AFF] hover:bg-blue-100 transition"
        >
          <MdEdit size={16} />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
        >
          <MdDelete size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Testimonials() {
  const [items,     setItems]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(null) // null | 'create' | item-obj
  const [delTarget, setDelTarget] = useState(null)
  const [toggling,  setToggling]  = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function togglePublish(item) {
    setToggling(item.id)
    const { error } = await supabase
      .from('testimonials')
      .update({ published: !item.published })
      .eq('id', item.id)
    if (error) {
      toast.error('Failed to update.')
    } else {
      setItems(prev =>
        prev.map(t => t.id === item.id ? { ...t, published: !item.published } : t)
      )
      toast.success(item.published ? 'Testimonial hidden.' : 'Testimonial published.')
    }
    setToggling(null)
  }

  const filtered = items.filter(t =>
    (t.customer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.message       ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.store_type    ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const publishedCount = items.filter(t => t.published).length

  return (
    <AdminLayout pageTitle="Testimonials">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Testimonials</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Customer quotes shown on the landing page and rewards tab
            </p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#168AFF]
              text-white text-sm font-bold rounded-xl hover:bg-[#1270DB]
              transition shadow-sm"
          >
            <MdAdd size={18} /> Add Testimonial
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',     value: items.length,                  color: 'bg-gray-100 text-gray-600'   },
            { label: 'Published', value: publishedCount,                 color: 'bg-green-100 text-green-700' },
            { label: 'Drafts',    value: items.length - publishedCount,  color: 'bg-gray-100 text-gray-500'   },
          ].map(({ label, value, color }) => (
            <span key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5
                rounded-full text-xs font-semibold ${color}`}>
              {loading ? '—' : value} {label}
            </span>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center
            justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold text-gray-700">All Testimonials</p>
            <div className="relative">
              <MdSearch size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name or message…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                  w-56 transition"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-lg" />
                    <div className="h-3 bg-gray-100 rounded-lg w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-400">
              <MdFormatQuote size={40} className="mx-auto mb-3 text-gray-200 rotate-180" />
              <p className="text-sm font-medium">
                {search ? 'No testimonials match your search.'
                  : 'No testimonials yet. Add your first one!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(item => (
                <TestimonialRow
                  key={item.id}
                  item={item}
                  onEdit={setModal}
                  onDelete={setDelTarget}
                  onToggle={togglePublish}
                  toggling={toggling}
                />
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {items.length} testimonial{items.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <TestimonialModal
          item={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchItems() }}
        />
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <DeleteConfirm
          item={delTarget}
          onClose={() => setDelTarget(null)}
          onDeleted={() => { setDelTarget(null); fetchItems() }}
        />
      )}
    </AdminLayout>
  )
}
