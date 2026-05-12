import { useEffect, useState, useCallback } from 'react'
import { MdStar } from 'react-icons/md'
import Swal from 'sweetalert2'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function SkeletonBalance() {
  return (
    <div className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
  )
}

function SkeletonRewardCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-6 bg-gray-100 rounded-full w-1/3 mt-1" />
        <div className="h-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

// ── Points balance card ───────────────────────────────────────────────────────

function BalanceCard({ points }) {
  return (
    <div className="relative bg-gradient-to-br from-yellow-400 to-orange-400
      rounded-2xl p-6 text-white shadow-lg overflow-hidden">
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -left-4 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <MdStar size={18} className="text-yellow-200" />
          <p className="text-white/80 text-sm font-medium">Your Points Balance</p>
        </div>
        <p className="text-5xl font-black tracking-tight">
          {Number(points ?? 0).toLocaleString()}
        </p>
        <p className="text-white/70 text-xs mt-2">
          pts · Earn 1 point for every ₱100 spent · Points never expire
        </p>
      </div>
    </div>
  )
}

// ── Reward card ───────────────────────────────────────────────────────────────

function RewardCard({ reward, canRedeem, redeeming, onRedeem }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
      flex flex-col hover:shadow-md transition-shadow">

      {/* Image */}
      <div className="h-36 bg-gray-50 shrink-0 overflow-hidden">
        {reward.image_url ? (
          <img
            src={reward.image_url}
            alt={reward.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <MdStar size={36} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <h4 className="text-gray-800 font-bold text-sm leading-snug line-clamp-1">
          {reward.name}
        </h4>
        {reward.description && (
          <p className="text-gray-400 text-xs line-clamp-2">{reward.description}</p>
        )}
        <div className="mt-auto pt-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1
            rounded-full text-xs font-bold
            ${canRedeem ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
            <MdStar size={12} />
            {Number(reward.points_required ?? 0).toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Redeem button */}
      <div className="px-4 pb-4 shrink-0">
        <button
          onClick={onRedeem}
          disabled={!canRedeem || redeeming}
          className={`w-full py-2 rounded-xl text-sm font-bold transition-all
            ${canRedeem && !redeeming
              ? 'bg-[#1A2E74] text-white hover:bg-[#162060] active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {redeeming ? 'Redeeming…' : canRedeem ? 'Redeem' : 'Not Enough Points'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CustomerRewards() {
  const { user }                        = useAuth()
  const [points, setPoints]             = useState(null)
  const [rewards, setRewards]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [redeemingId, setRedeemingId]   = useState(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [{ data: pointsRow }, { data: rewardsData }] = await Promise.all([
      supabase
        .from('customer_points')
        .select('total_points')
        .eq('customer_id', user.id)
        .maybeSingle(),

      supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true }),
    ])

    setPoints(pointsRow?.total_points ?? 0)
    setRewards(rewardsData ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleRedeem(reward) {
    if (!user || redeemingId) return

    const afterBalance = (points ?? 0) - reward.points_required

    // ── SweetAlert2 confirmation ──────────────────────────────────────────────
    const result = await Swal.fire({
      title: 'Confirm Redemption',
      html: `
        <p style="font-size:13px;color:#6b7280;margin-bottom:14px;">
          You are about to redeem <strong style="color:#111827">${reward.name}</strong>.
        </p>
        <div style="background:#f9fafb;border-radius:12px;padding:14px;font-size:13px;text-align:left;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;">Current balance</span>
            <span style="font-weight:700;color:#111827;">${Number(points ?? 0).toLocaleString()} pts</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;">Points to deduct</span>
            <span style="font-weight:700;color:#ef4444;">− ${Number(reward.points_required).toLocaleString()} pts</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:8px;
            border-top:1px solid #e5e7eb;font-weight:700;">
            <span style="color:#374151;">Remaining balance</span>
            <span style="color:#1A2E74;">${Number(afterBalance).toLocaleString()} pts</span>
          </div>
        </div>
        <p style="font-size:11px;color:#9ca3af;margin-top:12px;">
          This action cannot be undone.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Redeem',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1A2E74',
      cancelButtonColor: '#9ca3af',
      reverseButtons: true,
      focusConfirm: false,
      customClass: {
        popup:         'rounded-2xl',
        confirmButton: 'rounded-xl font-semibold text-sm px-5 py-2.5',
        cancelButton:  'rounded-xl font-semibold text-sm px-5 py-2.5',
      },
    })

    if (!result.isConfirmed) return

    // ── Redeem logic ──────────────────────────────────────────────────────────
    setRedeemingId(reward.id)

    try {
      // Re-verify balance server-side (guard against stale UI)
      const { data: current } = await supabase
        .from('customer_points')
        .select('total_points')
        .eq('customer_id', user.id)
        .maybeSingle()

      const currentTotal = current?.total_points ?? 0

      if (currentTotal < reward.points_required) {
        toast.error('Not enough points to redeem this reward.')
        setPoints(currentTotal)
        return
      }

      const newTotal = currentTotal - reward.points_required

      // Deduct points
      const { error: pointsErr } = await supabase
        .from('customer_points')
        .upsert({ customer_id: user.id, total_points: newTotal })
      if (pointsErr) throw new Error(pointsErr.message)

      // Record redemption
      const { error: redeemErr } = await supabase
        .from('redeemed_rewards')
        .insert({
          customer_id: user.id,
          reward_id:   reward.id,
          redeemed_at: new Date().toISOString(),
        })
      if (redeemErr) throw new Error(redeemErr.message)

      setPoints(newTotal)
      toast.success(`${reward.name} redeemed!`, { duration: 3000 })
    } catch {
      toast.error('Failed to redeem reward. Please try again.')
    } finally {
      setRedeemingId(null)
    }
  }

  return (
    <CustomerLayout>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Rewards</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Redeem your points for exclusive rewards
          </p>
        </div>

        {/* Points balance */}
        {loading ? <SkeletonBalance /> : <BalanceCard points={points} />}

        {/* Rewards catalog */}
        <div>
          <h3 className="text-gray-700 font-bold text-base mb-4">Available Rewards</h3>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonRewardCard key={i} />)}
            </div>
          ) : rewards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
              px-5 py-14 text-center text-gray-400 text-sm">
              No rewards available right now. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(reward => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  canRedeem={(points ?? 0) >= reward.points_required}
                  redeeming={redeemingId === reward.id}
                  onRedeem={() => handleRedeem(reward)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}
