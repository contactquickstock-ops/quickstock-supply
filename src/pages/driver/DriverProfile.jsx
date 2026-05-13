import { useState, useRef, useEffect } from 'react'
import { MdCameraAlt, MdLock, MdEdit, MdCheckCircle } from 'react-icons/md'
import DriverLayout from '../../layouts/DriverLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function DriverProfile() {
  const { user, profile }                         = useAuth()
  const initials                                  = (profile?.full_name ?? 'D')[0].toUpperCase()

  const [contact, setContact]                     = useState(profile?.contact_number ?? '')
  const [avatarUrl, setAvatarUrl]                 = useState(profile?.avatar_url ?? null)

  // Sync avatar and contact when profile loads (may arrive after mount)
  useEffect(() => {
    if (profile?.avatar_url && !avatarUrl) setAvatarUrl(profile.avatar_url)
    if (profile?.contact_number && !contact) setContact(profile.contact_number)
  }, [profile?.avatar_url, profile?.contact_number]) // eslint-disable-line react-hooks/exhaustive-deps
  const [uploadingPhoto, setUploadingPhoto]       = useState(false)
  const [savingContact, setSavingContact]         = useState(false)
  const [contactSaved, setContactSaved]           = useState(false)
  const fileInputRef                              = useRef(null)

  // ── Photo upload ──────────────────────────────────────────────────────────
  // Uses a fixed filename per driver so re-uploads overwrite the old photo.
  async function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const fileName = `driver-${user.id}.jpg`

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
      if (uploadErr) throw new Error(uploadErr.message)

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      const photoUrl = urlData.publicUrl

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: photoUrl })
        .eq('id', user.id)
      if (updateErr) throw new Error(updateErr.message)

      // Bust the CDN cache by appending a timestamp
      setAvatarUrl(`${photoUrl}?t=${Date.now()}`)
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error('Failed to update photo: ' + err.message)
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  // ── Contact number save ───────────────────────────────────────────────────
  async function handleSaveContact(e) {
    e.preventDefault()
    if (!contact.trim()) {
      toast.error('Contact number cannot be empty.')
      return
    }

    setSavingContact(true)
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ contact_number: contact.trim() })
        .eq('id', user.id)
      if (err) throw new Error(err.message)

      setContactSaved(true)
      toast.success('Contact number updated!')
      setTimeout(() => setContactSaved(false), 2500)
    } catch (err) {
      toast.error('Failed to save: ' + err.message)
    } finally {
      setSavingContact(false)
    }
  }

  return (
    <DriverLayout>
      <div className="space-y-5 max-w-sm mx-auto">

        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Update your contact details and photo
          </p>
        </div>

        {/* ── Avatar ── */}
        <div className="flex flex-col items-center gap-3 py-2">
          <button
            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="relative group"
            aria-label="Change profile photo"
          >
            {/* Circle */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#168AFF]
              flex items-center justify-center shadow-lg ring-4 ring-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-black text-3xl">{initials}</span>
              )}
            </div>

            {/* Hover / loading overlay */}
            <div className={`absolute inset-0 rounded-full flex items-center
              justify-center transition-colors
              ${uploadingPhoto
                ? 'bg-black/40'
                : 'bg-black/0 group-hover:bg-black/35'}`}>
              {uploadingPhoto ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent
                  rounded-full animate-spin" />
              ) : (
                <MdCameraAlt
                  size={26}
                  className="text-white opacity-0 group-hover:opacity-100
                    transition-opacity drop-shadow"
                />
              )}
            </div>
          </button>

          <p className="text-xs text-gray-400 text-center">
            {uploadingPhoto ? 'Uploading…' : 'Tap photo to change'}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={uploadingPhoto}
            className="hidden"
          />
        </div>

        {/* ── Read-only fields (admin-managed) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <MdLock size={13} className="text-gray-300 shrink-0" />
            <p className="text-xs text-gray-400">
              Name and email are managed by admin
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Full Name
            </label>
            <div className="px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100
              text-sm text-gray-500 select-none">
              {profile?.full_name ?? '—'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100
              text-sm text-gray-500 select-none">
              {profile?.email ?? '—'}
            </div>
          </div>
        </div>

        {/* ── Editable fields ── */}
        <form
          onSubmit={handleSaveContact}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center gap-2 pb-1">
            <MdEdit size={13} className="text-[#168AFF] shrink-0" />
            <p className="text-xs font-semibold text-[#168AFF]">You can edit this</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Contact Number
            </label>
            <input
              type="tel"
              value={contact}
              onChange={e => { setContact(e.target.value); setContactSaved(false) }}
              placeholder="e.g. 09171234567"
              disabled={savingContact}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                transition disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={savingContact || uploadingPhoto}
            className={`w-full py-3 font-bold rounded-xl text-sm
              flex items-center justify-center gap-2
              active:scale-[0.98] transition-all
              ${contactSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-[#168AFF] text-white hover:bg-[#1270DB]'}
              disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {contactSaved
              ? <><MdCheckCircle size={17} /> Saved!</>
              : savingContact
                ? 'Saving…'
                : 'Save Changes'}
          </button>
        </form>
      </div>
    </DriverLayout>
  )
}
