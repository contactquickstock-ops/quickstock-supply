import { useState, useRef, useEffect } from 'react'
import {
  MdPerson, MdEmail, MdPhone, MdStorefront, MdLocationOn,
  MdEdit, MdSave, MdClose, MdCameraAlt, MdVerified,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
  transition disabled:bg-gray-50 disabled:text-gray-400`

export default function CustomerProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const avatarRef = useRef(null)

  const [editing,      setEditing]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [avatarFile,   setAvatarFile]   = useState(null)
  const [avatarPreview,setAvatarPreview]= useState(null)

  const [form, setForm] = useState({
    contact_number: '',
    store_name:     '',
    store_address:  '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        contact_number: profile.contact_number ?? '',
        store_name:     profile.store_name     ?? '',
        store_address:  profile.store_address  ?? '',
      })
    }
  }, [profile])

  function startEdit() {
    setForm({
      contact_number: profile?.contact_number ?? '',
      store_name:     profile?.store_name     ?? '',
      store_address:  profile?.store_address  ?? '',
    })
    setAvatarFile(null)
    setAvatarPreview(null)
    setEditing(true)
  }

  function cancelEdit() {
    setAvatarFile(null)
    setAvatarPreview(null)
    setEditing(false)
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.store_name.trim() || !form.store_address.trim()) {
      toast.error('Store name and address are required.')
      return
    }

    setSaving(true)
    try {
      let avatarUrl = profile?.avatar_url ?? null

      if (avatarFile) {
        const ext      = avatarFile.type.split('/')[1] || 'jpg'
        const fileName = `customer-${user.id}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true, contentType: avatarFile.type })
        if (uploadErr) throw new Error(uploadErr.message)
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
      }

      const updates = {
        contact_number: form.contact_number.trim(),
        store_name:     form.store_name.trim(),
        store_address:  form.store_address.trim(),
        ...(avatarUrl !== profile?.avatar_url && { avatar_url: avatarUrl }),
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (updateErr) throw new Error(updateErr.message)

      refreshProfile()
      toast.success('Profile updated!')
      setEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const initials   = (profile?.full_name ?? 'C')[0].toUpperCase()
  const avatarSrc  = avatarPreview ?? profile?.avatar_url ?? null
  const statusCfg  = profile?.status === 'approved'
    ? { label: 'Active',  cls: 'bg-green-100 text-green-700'  }
    : { label: profile?.status ?? 'Pending', cls: 'bg-yellow-100 text-yellow-700' }

  return (
    <CustomerLayout>
      <div className="max-w-xl mx-auto space-y-5">

        <div>
          <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          <p className="text-gray-400 text-sm mt-0.5">View and update your account information</p>
        </div>

        <form onSubmit={handleSave}>

          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#168AFF]/10
                  flex items-center justify-center font-black text-2xl text-[#168AFF]
                  border-4 border-white shadow-md">
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                    : initials}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#168AFF] text-white
                      rounded-full flex items-center justify-center shadow-md hover:bg-[#1270DB] transition">
                    <MdCameraAlt size={14} />
                  </button>
                )}
                <input ref={avatarRef} type="file" accept="image/*"
                  onChange={handleAvatarChange} className="hidden" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-lg leading-tight truncate">
                  {profile?.full_name ?? '—'}
                </p>
                <p className="text-gray-400 text-sm truncate mt-0.5">{profile?.email ?? '—'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5
                    bg-[#168AFF]/10 text-[#168AFF] text-[10px] font-bold rounded-full capitalize">
                    <MdVerified size={10} /> {profile?.role ?? 'customer'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5
                    text-[10px] font-bold rounded-full ${statusCfg.cls}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl
                    border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition">
                  <MdEdit size={15} />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Info / edit fields */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            {/* Read-only: Full Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <MdPerson size={13} className="text-[#168AFF]" /> Full Name
              </label>
              <p className="text-sm text-gray-700 font-medium px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                {profile?.full_name ?? '—'}
              </p>
            </div>

            {/* Read-only: Email */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <MdEmail size={13} className="text-[#168AFF]" /> Email Address
              </label>
              <p className="text-sm text-gray-700 font-medium px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100 truncate">
                {profile?.email ?? '—'}
              </p>
            </div>

            {/* Editable: Contact Number */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <MdPhone size={13} className="text-[#168AFF]" /> Mobile Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={form.contact_number}
                  onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))}
                  placeholder="09XXXXXXXXX"
                  disabled={saving}
                  className={INPUT_CLS}
                />
              ) : (
                <p className="text-sm text-gray-700 font-medium px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  {profile?.contact_number || <span className="text-gray-400 italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Editable: Store Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <MdStorefront size={13} className="text-[#168AFF]" /> Store / Business Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form.store_name}
                  onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))}
                  placeholder="e.g. My Sari-Sari Store"
                  disabled={saving}
                  className={INPUT_CLS}
                />
              ) : (
                <p className="text-sm text-gray-700 font-medium px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  {profile?.store_name || <span className="text-gray-400 italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Editable: Store Address */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <MdLocationOn size={13} className="text-[#168AFF]" /> Store / Delivery Address
              </label>
              {editing ? (
                <textarea
                  value={form.store_address}
                  onChange={e => setForm(f => ({ ...f, store_address: e.target.value }))}
                  placeholder="Complete delivery address…"
                  rows={3}
                  disabled={saving}
                  className={`${INPUT_CLS} resize-none`}
                />
              ) : (
                <p className="text-sm text-gray-700 font-medium px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
                  {profile?.store_address || <span className="text-gray-400 italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Save / Cancel */}
            {editing && (
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    border border-gray-200 text-gray-600 text-sm font-semibold
                    hover:bg-gray-50 transition disabled:opacity-50">
                  <MdClose size={15} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    bg-[#168AFF] text-white text-sm font-bold
                    hover:bg-[#1270DB] transition disabled:opacity-60">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                    : <><MdSave size={15} />Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </CustomerLayout>
  )
}
