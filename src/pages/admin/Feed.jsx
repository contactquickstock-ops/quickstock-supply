import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdImage,
  MdSearch, MdPublic, MdVisibilityOff, MdUpload,
  MdCampaign,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import toast from 'react-hot-toast'

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition`

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer
          ${checked ? 'bg-[#168AFF]' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-0.75 w-[18px] h-[18px] bg-white rounded-full shadow
          transition-all duration-200 ${checked ? 'left-5.75' : 'left-0.75'}`} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}

// ── Image upload box ───────────────────────────────────────────────────────────
function ImageUploadBox({ preview, onFile, onRemove, disabled }) {
  const ref = useRef(null)
  return (
    <div>
      <div
        onClick={() => !disabled && ref.current?.click()}
        className={`relative overflow-hidden cursor-pointer border-2 border-dashed
          w-full h-48 rounded-xl flex items-center justify-center group transition
          ${preview ? 'border-transparent' : 'border-gray-200 hover:border-[#168AFF]'}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
              transition-colors flex items-center justify-center">
              <MdUpload size={20}
                className="text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300 select-none px-3 text-center">
            <MdImage size={32} />
            <span className="text-xs text-gray-400 font-medium">Click to upload post image</span>
          </div>
        )}
      </div>
      {preview && (
        <button type="button" onClick={onRemove}
          className="mt-1.5 text-xs text-red-500 hover:underline block">
          Remove
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" disabled={disabled}
        onChange={e => { const f = e.target.files[0]; if (f) { onFile(f); e.target.value = '' } }} />
    </div>
  )
}

// ── Create / Edit Modal ────────────────────────────────────────────────────────
function PostModal({ item = null, onClose, onSaved }) {
  const isEdit = !!item

  const [title,     setTitle]     = useState(item?.title   ?? '')
  const [content,   setContent]   = useState(item?.content ?? '')
  const [published, setPublished] = useState(item?.published ?? true)

  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(item?.image_url ?? null)

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  async function upload(file) {
    const ext      = file.type.split('/')[1] || 'jpg'
    const fileName = `post-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('posts')
      .upload(fileName, file, { contentType: file.type, upsert: false })
    if (upErr) throw new Error(upErr.message)
    const { data } = supabase.storage.from('posts').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSave() {
    if (!title.trim())   { setError('Post title is required.');   return }
    if (!content.trim()) { setError('Post content is required.'); return }

    setSaving(true)
    setError(null)
    try {
      let imageUrl = item?.image_url ?? null

      if (imageFile)  imageUrl = await upload(imageFile)
      if (!imagePreview && !imageFile) imageUrl = null

      const payload = {
        title:     title.trim(),
        content:   content.trim(),
        image_url: imageUrl,
        published,
      }

      if (isEdit) {
        const { error: err } = await supabase.from('posts').update(payload).eq('id', item.id)
        if (err) throw new Error(err.message)
        toast.success('Post updated.')
      } else {
        const { error: err } = await supabase.from('posts').insert(payload)
        if (err) throw new Error(err.message)
        toast.success('Post published!')
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
      bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg
        max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-gray-800 font-bold text-base">
              {isEdit ? 'Edit Post' : 'New Post'}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Share a story about a customer who claimed their reward
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} disabled={saving}
              onChange={e => { setTitle(e.target.value); setError(null) }}
              placeholder="e.g. Maria redeemed a free sack of rice!" className={INPUT_CLS} />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea rows={5} value={content} disabled={saving}
              onChange={e => { setContent(e.target.value); setError(null) }}
              placeholder="Describe the story — who claimed the reward, what they got, a special note…"
              className={`${INPUT_CLS} resize-none`} />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Post Image
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <ImageUploadBox
              preview={imagePreview}
              onFile={f => { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }}
              onRemove={() => { setImageFile(null); setImagePreview(null) }}
              disabled={saving}
            />
          </div>

          {/* Published toggle */}
          <Toggle
            checked={published}
            onChange={setPublished}
            label={published ? 'Published — visible to customers' : 'Draft — hidden'}
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-[#168AFF] text-white text-sm font-bold
              rounded-xl hover:bg-[#1270DB] transition shadow-sm disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Post'}
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
    const { error } = await supabase.from('posts').delete().eq('id', item.id)
    if (error) { toast.error('Failed to delete.'); setDeleting(false) }
    else { toast.success('Post deleted.'); onDeleted() }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <MdDelete size={24} className="text-red-500" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-gray-800 font-bold text-base">Delete Post?</h3>
          <p className="text-gray-500 text-sm line-clamp-2">
            "<span className="font-semibold">{item.title}</span>" will be permanently deleted.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold
              rounded-xl hover:bg-red-600 transition disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Post Row ───────────────────────────────────────────────────────────────────
function PostRow({ item, onEdit, onDelete, onToggle, toggling }) {
  const isBusy = toggling === item.id
  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/70 transition">
      {/* Thumbnail */}
      <div className="w-16 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
        {item.image_url
          ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          : <MdCampaign size={22} className="text-gray-300" />}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-800 font-bold text-sm line-clamp-1">{item.title}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            text-[10px] font-semibold shrink-0
            ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {item.published ? <><MdPublic size={10} /> Published</> : <><MdVisibilityOff size={10} /> Draft</>}
          </span>
        </div>
        <p className="text-gray-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">
          {item.content}
        </p>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onToggle(item)} disabled={isBusy} title={item.published ? 'Set to draft' : 'Publish'}
          className={`p-2 rounded-lg transition disabled:opacity-40
            ${item.published ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          {item.published ? <MdPublic size={16} /> : <MdVisibilityOff size={16} />}
        </button>
        <button onClick={() => onEdit(item)}
          className="p-2 rounded-lg bg-blue-50 text-[#168AFF] hover:bg-blue-100 transition">
          <MdEdit size={16} />
        </button>
        <button onClick={() => onDelete(item)}
          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
          <MdDelete size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Feed() {
  const [items,     setItems]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [toggling,  setToggling]  = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function togglePublish(item) {
    setToggling(item.id)
    const { error } = await supabase.from('posts')
      .update({ published: !item.published }).eq('id', item.id)
    if (error) toast.error('Failed to update.')
    else {
      setItems(prev => prev.map(p => p.id === item.id ? { ...p, published: !item.published } : p))
      toast.success(item.published ? 'Post hidden.' : 'Post published.')
    }
    setToggling(null)
  }

  const filtered = items.filter(p =>
    (p.title   ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.content ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const publishedCount = items.filter(p => p.published).length

  return (
    <AdminLayout pageTitle="Posts">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Posts</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Highlight customers who claimed their rewards — shown on the landing page and rewards tab
            </p>
          </div>
          <button onClick={() => setModal('create')}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#168AFF]
              text-white text-sm font-bold rounded-xl hover:bg-[#1270DB] transition shadow-sm">
            <MdAdd size={18} /> New Post
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',     value: items.length,                 color: 'bg-gray-100 text-gray-600'   },
            { label: 'Published', value: publishedCount,                color: 'bg-green-100 text-green-700' },
            { label: 'Drafts',    value: items.length - publishedCount, color: 'bg-gray-100 text-gray-500'   },
          ].map(({ label, value, color }) => (
            <span key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
              {loading ? '—' : value} {label}
            </span>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold text-gray-700">All Posts</p>
            <div className="relative">
              <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Search title or content…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] w-56 transition" />
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-16 h-14 bg-gray-100 rounded-xl shrink-0" />
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
              <MdCampaign size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium">
                {search ? 'No posts match your search.' : 'No posts yet. Create your first one!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(item => (
                <PostRow key={item.id} item={item}
                  onEdit={setModal} onDelete={setDelTarget}
                  onToggle={togglePublish} toggling={toggling} />
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {items.length} post{items.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <PostModal
          item={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchItems() }}
        />
      )}
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
