import { useEffect, useState, useCallback } from 'react'
import { MdStar, MdCheckCircle, MdShoppingCart } from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'

function SkeletonBalance() {
  return <div className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
}

function SkeletonRewardCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-6 bg-gray-100 rounded-full w-1/3 mt-1" />
        <div className="h-7 bg-gray-100 rounded-xl mt-2" />
      </div>
    </div>
  )
}

function BalanceCard({ points }) {
  return (
    <div className="relative bg-linear-to-br from-yellow-400 to-orange-400
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

function RewardCard({ reward, canRedeem, myPoints }) {
  const shortage = reward.points_required - myPoints

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col
      transition-shadow hover:shadow-md
      ${canRedeem ? 'border-gray-100' : 'border-gray-100'}`}>

      {/* Image */}
      <div className="h-36 bg-gray-50 shrink-0 overflow-hidden relative">
        {reward.image_url ? (
          <img src={reward.image_url} alt={reward.name} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <MdStar size={36} />
          </div>
        )}
        {/* Overlay badge on image */}
        {canRedeem && (
          <div className="absolute top-2.5 right-2.5 bg-green-500 text-white
            text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <MdCheckCircle size={10} /> Claimable
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
        <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1
            rounded-full text-xs font-bold
            ${canRedeem ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
            <MdStar size={12} />
            {Number(reward.points_required ?? 0).toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Status footer — no button */}
      <div className="px-4 pb-4 shrink-0">
        {canRedeem ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50
            border border-green-100 rounded-xl">
            <MdShoppingCart size={14} className="text-green-600 shrink-0" />
            <p className="text-green-700 text-xs font-semibold">
              Select in your cart to redeem
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50
            border border-gray-100 rounded-xl">
            <p className="text-gray-400 text-xs font-medium">Not enough points</p>
            <span className="text-xs font-bold text-[#168AFF]">
              +{shortage.toLocaleString()} needed
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomerRewards() {
  const { user }              = useAuth()
  const [points, setPoints]   = useState(null)
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <CustomerLayout>
      <div className="space-y-6 max-w-4xl mx-auto">

        <div>
          <h2 className="text-xl font-bold text-gray-800">Rewards</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Your points and available rewards — redeem them when placing an order
          </p>
        </div>

        {loading ? <SkeletonBalance /> : <BalanceCard points={points} />}

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
                  myPoints={points ?? 0}
                  canRedeem={(points ?? 0) >= reward.points_required}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}
