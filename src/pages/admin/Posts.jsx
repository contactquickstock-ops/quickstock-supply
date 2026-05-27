import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdImage,
  MdSearch, MdPublic, MdVisibilityOff, MdUpload,
  MdCampaign, MdCalendarToday,
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
function PostModal({ post = null, onClose, onSaved }) {
  const isEdit       = !!post
  const fileInputRef = useRef(null)

  const [title,        setTitle]        = useState(post?.title    ?? '')
  const [content,      setContent]      = useState(post?.content  ?? '')
  const [published,    setPublished]    = useState(post?.published ?? true)
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(post?.image_url ?? null)
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
    if (!title.trim())   { setError('Title is required.');   return }
    if (!content.trim()) { setError('Content is required.'); return }

    setSaving(true)
    setError(null)

    try {
      let imageUrl = post?.image_url ?? null

      // Upload new image if one was selected
      if (imageFile) {
        const ext      = imageFile.type.split('/')[1] || 'jpg'
        const fileName = `post-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('posts')
          .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false })
        if (upErr) throw new Error(upErr.message)
        const { data: urlData } = supabase.storage.from('posts').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      // If image was removed by the user
      if (!imagePreview && !imageFile) imageUrl = null

      const payload = {
        title:      title.trim(),
        content:    content.trim(),
        image_url:  imageUrl,
        published,
        updated_at: new Date().toISOString(),
      }

      if (isEdit) {
        const { error: err } = await supabase.from('posts').update(payload).eq('id', post.id)
        if (err) throw new Error(err.message)
        toast.success('Post updated.')
      } else {
        const { error: err } = await supabase.from('posts').insert(payload)
        if (err) throw new Error(err.message)
        toast.success('Post created!')
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
              {isEdit ? 'Edit Post' : 'New Post'}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {isEdit ? 'Update this announcement' : 'Create a new announcement for customers'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition">
            <MdClose size={20} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm
              px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(null) }}
              placeholder="e.g. New Products Available!"
              className={INPUT_CLS}
              disabled={saving}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={e => { setContent(e.target.value); setError(null) }}
              placeholder="Write your announcement here…"
              className={`${INPUT_CLS} resize-none`}
              disabled={saving}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Image
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div
              onClick={() => !saving && fileInputRef.current?.click()}
              className={`relative w-full h-44 rounded-xl border-2 border-dashed
                flex items-center justify-center overflow-hidden cursor-pointer
                transition-colors group
                ${imagePreview
                  ? 'border-transparent'
                  : 'border-gray-200 hover:border-[#168AFF]'}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview"
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                    transition-colors flex items-center justify-center">
                    <span className="text-white text-xs font-semibold opacity-0
                      group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <MdUpload size={14} /> Change image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300 select-none px-4 text-center">
                  <MdImage size={32} />
                  <span className="text-xs text-gray-500 font-medium">
                    Click to upload image
                  </span>
                  <span className="text-[10px] text-gray-400">JPG, PNG, or WEBP</span>
                </div>
              )}
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="mt-1.5 text-xs text-red-500 hover:underline"
              >
                Remove image
              </button>
            )}
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
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({ post, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      toast.error('Failed to delete post.')
      setDeleting(false)
    } else {
      toast.success('Post deleted.')
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
          <h3 className="text-gray-800 font-bold text-base">Delete Post?</h3>
          <p className="text-gray-500 text-sm">
            "<span className="font-semibold">{post.title}</span>" will be
            permanently removed.
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
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Posts() {
  const [posts,     setPosts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(null) // null | 'create' | post-obj
  const [delTarget, setDelTarget] = useState(null)
  const [toggling,  setToggling]  = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function togglePublish(post) {
    setToggling(post.id)
    const { error } = await supabase
      .from('posts')
      .update({ published: !post.published, updated_at: new Date().toISOString() })
      .eq('id', post.id)
    if (error) {
      toast.error('Failed to update.')
    } else {
      setPosts(prev =>
        prev.map(p => p.id === post.id ? { ...p, published: !post.published } : p)
      )
      toast.success(post.published ? 'Post hidden (draft).' : 'Post published.')
    }
    setToggling(null)
  }

  const filtered = posts.filter(p =>
    (p.title   ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.content ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const publishedCount = posts.filter(p => p.published).length

  return (
    <AdminLayout pageTitle="Posts">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Posts are shown on the landing page and customer dashboard
            </p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#168AFF]
              text-white text-sm font-bold rounded-xl hover:bg-[#1270DB]
              transition shadow-sm"
          >
            <MdAdd size={18} /> New Post
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',     value: posts.length,                    color: 'bg-gray-100 text-gray-600'   },
            { label: 'Published', value: publishedCount,                   color: 'bg-green-100 text-green-700' },
            { label: 'Drafts',    value: posts.length - publishedCount,    color: 'bg-gray-100 text-gray-500'   },
          ].map(({ label, value, color }) => (
            <span key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5
                rounded-full text-xs font-semibold ${color}`}>
              {loading ? '—' : value} {label}
            </span>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center
            justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold text-gray-700">All Posts</p>
            <div className="relative">
              <MdSearch size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search posts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                  w-56 transition"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-20 h-16 bg-gray-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                    <div className="h-3 bg-gray-100 rounded-lg" />
                    <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
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
              {filtered.map(post => {
                const date = new Date(post.created_at).toLocaleDateString('en-PH', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })
                const isBusy = toggling === post.id

                return (
                  <div key={post.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/70 transition">

                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      {post.image_url
                        ? <img src={post.image_url} alt={post.title}
                            className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <MdImage size={20} className="text-gray-300" />
                          </div>
                      }
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-gray-800 font-bold text-sm truncate">
                          {post.title}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5
                          rounded-full text-[10px] font-semibold shrink-0
                          ${post.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'}`}>
                          {post.published
                            ? <><MdPublic size={10} /> Published</>
                            : <><MdVisibilityOff size={10} /> Draft</>}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                      <p className="text-gray-300 text-[10px] mt-1 flex items-center gap-1">
                        <MdCalendarToday size={10} /> {date}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Publish toggle */}
                      <button
                        onClick={() => togglePublish(post)}
                        disabled={isBusy}
                        title={post.published ? 'Unpublish (set to draft)' : 'Publish'}
                        className={`p-2 rounded-lg transition disabled:opacity-40
                          ${post.published
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {post.published
                          ? <MdPublic size={16} />
                          : <MdVisibilityOff size={16} />}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => setModal(post)}
                        className="p-2 rounded-lg bg-blue-50 text-[#168AFF]
                          hover:bg-blue-100 transition"
                      >
                        <MdEdit size={16} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDelTarget(post)}
                        className="p-2 rounded-lg bg-red-50 text-red-500
                          hover:bg-red-100 transition"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {posts.length} post{posts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <PostModal
          post={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchPosts() }}
        />
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <DeleteConfirm
          post={delTarget}
          onClose={() => setDelTarget(null)}
          onDeleted={() => { setDelTarget(null); fetchPosts() }}
        />
      )}
    </AdminLayout>
  )
}
