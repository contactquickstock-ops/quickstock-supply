import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MdAdd, MdClose, MdEdit, MdImage,
  MdSearch, MdStar, MdHistory,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

const EMPTY_FORM = {
  name:           '',
  description:    '',
  pointsRequired: '',
  isActive:       true,
  imageFile:      null,
  imagePreview:   null,
}

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
        <div className="h-6 bg-gray-100 rounded-full w-1/3 mt-1" />
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

function SkeletonRows({ cols = 5, rows = 4 }) {
  return Array.from({ length: rows }, (_, i) => (
    <tr key={i} className="border-b border-gray-50">
      {Array.from({ length: cols }, (_, j) => (
        <td key={j} className="px-5 py-4">
          <div className="h-4 bg-gray-100 animate-pulse rounded-lg" />
        </td>
      ))}
    </tr>
  ))
}

// ── Reward Card ───────────────────────────────────────────────────────────────

function RewardCard({ reward, toggling, onEdit, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
      flex flex-col hover:shadow-md transition-shadow">

      {/* Image */}
      <div className="relative h-36 bg-gray-50 shrink-0">
        {reward.image_url ? (
          <img
            src={reward.image_url}
            alt={reward.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <MdStar size={40} />
          </div>
        )}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-semibold
          ${reward.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {reward.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <h4 className="text-gray-800 font-bold text-sm leading-snug line-clamp-1">
          {reward.name ?? '—'}
        </h4>
        {reward.description && (
          <p className="text-gray-400 text-xs line-clamp-2">{reward.description}</p>
        )}
        <div className="mt-auto pt-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
            bg-yellow-50 text-yellow-700 text-xs font-bold">
            <MdStar size={12} />
            {Number(reward.points_required ?? 0).toLocaleString()} pts
          </span>
        </div>
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
            ${reward.is_active
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
        >
          {toggling
            ? 'Updating…'
            : reward.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Rewards() {
  const [rewards, setRewards]           = useState([])
  const [redemptions, setRedemptions]   = useState([])
  const [loadingR, setLoadingR]         = useState(true)
  const [loadingH, setLoadingH]         = useState(true)
  const [error, setError]               = useState(null)
  const [histSearch, setHistSearch]     = useState('')
  const [showModal, setShowModal]       = useState(false)
  const [editReward, setEditReward]     = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formError, setFormError]       = useState(null)
  const [saving, setSaving]             = useState(false)
  const [toggling, setToggling]         = useState(null)
  const fileInputRef                    = useRef(null)

  // ── data fetching ───────────────────────────────────────────────────────────

  const fetchRewards = useCallback(async () => {
    setLoadingR(true)
    const { data, error: err } = await supabase
      .from('rewards')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError('Failed to load rewards.')
    else setRewards(data ?? [])
    setLoadingR(false)
  }, [])

  const fetchRedemptions = useCallback(async () => {
    setLoadingH(true)
    const { data, error: err } = await supabase
      .from('redeemed_rewards')
      .select('*, profiles(full_name, email), rewards(name, points_required)')
      .order('redeemed_at', { ascending: false })
      .limit(100)
    if (err) setError('Failed to load redemption history.')
    else setRedemptions(data ?? [])
    setLoadingH(false)
  }, [])

  useEffect(() => {
    fetchRewards()
    fetchRedemptions()
  }, [fetchRewards, fetchRedemptions])

  // ── modal helpers ───────────────────────────────────────────────────────────

  function openAdd() {
    setEditReward(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(reward) {
    setEditReward(reward)
    setForm({
      name:           reward.name ?? '',
      description:    reward.description ?? '',
      pointsRequired: reward.points_required ?? '',
      isActive:       reward.is_active ?? true,
      imageFile:      null,
      imagePreview:   reward.image_url ?? null,
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
      imageFile:    file,
      imagePreview: URL.createObjectURL(file),
    }))
    e.target.value = ''
  }

  async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`
    const { error: uploadErr } = await supabase.storage
      .from('rewards')
      .upload(fileName, file)
    if (uploadErr) throw new Error(uploadErr.message)
    const { data: urlData } = supabase.storage
      .from('rewards')
      .getPublicUrl(fileName)
    return urlData.publicUrl
  }

  // ── save (add / edit) ───────────────────────────────────────────────────────

  async function handleSave(e) {
    e.preventDefault()
    const { name, description, pointsRequired, isActive, imageFile } = form

    if (!name.trim() || pointsRequired === '') {
      setFormError('Name and Points Required are required.')
      return
    }
    if (isNaN(Number(pointsRequired)) || Number(pointsRequired) < 1) {
      setFormError('Points Required must be a positive number.')
      return
    }
    if (!editReward && !imageFile) {
      setFormError('Please upload a reward image.')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      let imageUrl = editReward?.image_url ?? null
      if (imageFile) imageUrl = await uploadImage(imageFile)

      const payload = {
        name:            name.trim(),
        description:     description.trim(),
        points_required: Number(pointsRequired),
        is_active:       isActive,
        image_url:       imageUrl,
      }

      if (editReward) {
        const { data: updated, error: err } = await supabase
          .from('rewards')
          .update(payload)
          .eq('id', editReward.id)
          .select()
          .single()
        if (err) throw new Error(err.message)
        setRewards(prev => prev.map(r => r.id === editReward.id ? updated : r))
      } else {
        const { data: inserted, error: err } = await supabase
          .from('rewards')
          .insert(payload)
          .select()
          .single()
        if (err) throw new Error(err.message)
        setRewards(prev => [inserted, ...prev])
      }

      setShowModal(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── toggle active ───────────────────────────────────────────────────────────

  async function toggleActive(reward) {
    setToggling(reward.id)
    setError(null)
    const { error: err } = await supabase
      .from('rewards')
      .update({ is_active: !reward.is_active })
      .eq('id', reward.id)
    if (err) {
      setError('Failed to update reward status.')
    } else {
      setRewards(prev =>
        prev.map(r => r.id === reward.id ? { ...r, is_active: !r.is_active } : r)
      )
    }
    setToggling(null)
  }

  // ── derived ─────────────────────────────────────────────────────────────────

  const counts = {
    total:    rewards.length,
    active:   rewards.filter(r => r.is_active).length,
    inactive: rewards.filter(r => !r.is_active).length,
  }

  const filteredHistory = redemptions.filter(rd => {
    const q = histSearch.toLowerCase()
    return (
      (rd.profiles?.full_name ?? '').toLowerCase().includes(q) ||
      (rd.profiles?.email     ?? '').toLowerCase().includes(q) ||
      (rd.rewards?.name       ?? '').toLowerCase().includes(q)
    )
  })

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout pageTitle="Rewards">
      <div className="space-y-8 max-w-7xl mx-auto">

        {/* ── Section 1: Reward Catalog ── */}
        <div className="space-y-5">

          {/* Heading + Add button */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Reward Catalog</h2>
              <p className="text-gray-400 text-sm mt-0.5">Create and manage redeemable rewards</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                bg-[#00B14F] text-white text-sm font-semibold
                hover:bg-[#009940] transition shadow-sm"
            >
              <MdAdd size={18} />
              Add Reward
            </button>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Total',    value: counts.total,    color: 'bg-gray-100  text-gray-600'  },
              { label: 'Active',   value: counts.active,   color: 'bg-green-100 text-green-700' },
              { label: 'Inactive', value: counts.inactive, color: 'bg-gray-100  text-gray-500'  },
            ].map(({ label, value, color }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}
              >
                {loadingR ? '—' : value} {label}
              </span>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Reward grid */}
          {loadingR ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : rewards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
              px-5 py-16 text-center text-gray-400 text-sm">
              No rewards yet. Click "Add Reward" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rewards.map(reward => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  toggling={toggling === reward.id}
                  onEdit={() => openEdit(reward)}
                  onToggle={() => toggleActive(reward)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100" />

        {/* ── Section 2: Redemption History ── */}
        <div className="space-y-5">

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MdHistory size={22} className="text-gray-400" />
                Redemption History
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">
                Log of all rewards redeemed by customers
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-gray-700 font-semibold text-base">All Redemptions</h3>
              <div className="relative">
                <MdSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search customer or reward…"
                  value={histSearch}
                  onChange={e => setHistSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                    w-56 transition"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                    {['Customer', 'Email', 'Reward', 'Points Used', 'Redeemed On'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingH ? (
                    <SkeletonRows cols={5} rows={4} />
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center text-gray-400 text-sm">
                        {histSearch
                          ? 'No redemptions match your search.'
                          : 'No redemptions recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(rd => {
                      const name     = rd.profiles?.full_name ?? '—'
                      const email    = rd.profiles?.email     ?? '—'
                      const initials = (rd.profiles?.full_name ?? '?')[0].toUpperCase()
                      const rewardName = rd.rewards?.name ?? '—'
                      const pts      = rd.rewards?.points_required ?? rd.points_used ?? 0
                      const date     = new Date(rd.redeemed_at ?? rd.created_at).toLocaleDateString('en-PH', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })

                      return (
                        <tr
                          key={rd.id}
                          className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                        >
                          {/* Customer */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full bg-[#00B14F]/10 text-[#00B14F]
                                  flex items-center justify-center font-bold text-sm shrink-0"
                              >
                                {initials}
                              </div>
                              <span className="text-gray-700 font-medium whitespace-nowrap">
                                {name}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                            {email}
                          </td>

                          {/* Reward name */}
                          <td className="px-5 py-4 text-gray-700 font-medium whitespace-nowrap">
                            {rewardName}
                          </td>

                          {/* Points used */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5
                              rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
                              <MdStar size={11} />
                              {Number(pts).toLocaleString()} pts
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                            {date}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            {!loadingH && filteredHistory.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
                Showing {filteredHistory.length} of {redemptions.length} redemption{redemptions.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-gray-800 font-bold text-base">
                  {editReward ? 'Edit Reward' : 'Add New Reward'}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {editReward ? 'Update reward details' : 'Fill in the details below'}
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

            {/* Scrollable body */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 space-y-4">

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    {formError}
                  </div>
                )}

                {/* Image */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Reward Image{!editReward && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <div
                    onClick={() => !saving && fileInputRef.current?.click()}
                    className={`relative w-full h-36 rounded-xl border-2 border-dashed
                      flex items-center justify-center overflow-hidden cursor-pointer
                      transition-colors group
                      ${form.imagePreview
                        ? 'border-transparent'
                        : 'border-gray-200 hover:border-[#00B14F]'}`}
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
                            Click to change
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-300 select-none">
                        <MdImage size={32} />
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
                    Reward Name<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Free Delivery Voucher"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    disabled={saving}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                      transition disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="What does this reward include?"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    disabled={saving}
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                      transition disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                  />
                </div>

                {/* Points required */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Points Required<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <MdStar
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-400 pointer-events-none"
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 500"
                      value={form.pointsRequired}
                      onChange={e => setForm(f => ({ ...f, pointsRequired: e.target.value }))}
                      disabled={saving}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                        transition disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl
                  bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Active</p>
                    <p className="text-xs text-gray-400 mt-0.5">Customers can redeem this reward</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    disabled={saving}
                    aria-label="Toggle active"
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0
                      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00B14F]/50
                      ${form.isActive ? 'bg-[#00B14F]' : 'bg-gray-300'}
                      disabled:opacity-50`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                        transition-transform duration-200
                        ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="px-6 pb-6 flex gap-3">
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
                    bg-[#00B14F] rounded-xl hover:bg-[#009940]
                    transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? (editReward ? 'Saving…' : 'Adding…')
                    : (editReward ? 'Save Changes' : 'Add Reward')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
