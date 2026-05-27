import { useEffect, useState, useCallback } from 'react'
import { MdStar, MdCheckCircle, MdShoppingCart, MdFormatQuote, MdCampaign } from 'react-icons/md'
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
  const { user }                      = useAuth()
  const [points,       setPoints]       = useState(null)
  const [rewards,      setRewards]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [testimonials, setTestimonials] = useState([])
  const [posts,        setPosts]        = useState([])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [
      { data: pointsRow },
      { data: rewardsData },
      { data: testimonialsData },
      { data: postsData },
    ] = await Promise.all([
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
      supabase
        .from('testimonials')
        .select('id, customer_name, store_type, message, photo_url, image_url')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('posts')
        .select('id, title, content, image_url, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6),
    ])

    setPoints(pointsRow?.total_points ?? 0)
    setRewards(rewardsData ?? [])
    setTestimonials(testimonialsData ?? [])
    setPosts(postsData ?? [])
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

        {/* ── Testimonials ── */}
        {!loading && testimonials.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-gray-700 font-bold text-base">
                What Our Customers Say
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Real feedback from fellow store owners and business partners
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map(t => {
                const initials = (t.customer_name ?? '?')[0].toUpperCase()
                return (
                  <div key={t.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm
                      flex flex-col overflow-hidden">

                    {/* Featured photo */}
                    {t.image_url && (
                      <div className="h-40 bg-gray-100 overflow-hidden shrink-0">
                        <img src={t.image_url} alt="featured"
                          className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      {/* Quote icon + stars */}
                      <div className="flex items-center justify-between">
                        <MdFormatQuote size={28} className="text-[#168AFF]/20 -scale-x-100" />
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <MdStar key={s} size={13} className="text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-gray-600 text-sm leading-relaxed italic flex-1 line-clamp-4">
                        "{t.message}"
                      </p>

                      {/* Person */}
                      <div className="flex items-center gap-3 pt-2.5 border-t border-gray-50">
                        <div className="w-10 h-10 rounded-full overflow-hidden
                          bg-[#168AFF]/10 text-[#168AFF] flex items-center
                          justify-center font-bold text-sm shrink-0">
                          {t.photo_url
                            ? <img src={t.photo_url} alt={t.customer_name}
                                className="w-full h-full object-cover" />
                            : initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-800 font-bold text-sm truncate">
                            {t.customer_name}
                          </p>
                          {t.store_type && (
                            <p className="text-gray-400 text-xs truncate">{t.store_type}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Posts (reward claim highlights) ── */}
        {!loading && posts.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-gray-700 font-bold text-base">
                Reward Claim Highlights
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                See what other members are redeeming with their points
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map(p => (
                <div key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm
                    flex flex-col overflow-hidden">

                  {/* Image */}
                  {p.image_url ? (
                    <div className="h-40 bg-gray-100 overflow-hidden shrink-0">
                      <img src={p.image_url} alt={p.title}
                        className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 bg-[#168AFF]/5 flex items-center justify-center shrink-0">
                      <MdCampaign size={32} className="text-[#168AFF]/20" />
                    </div>
                  )}

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <MdStar size={12} className="text-yellow-400 shrink-0" />
                      <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wide">
                        Reward Claimed
                      </span>
                    </div>
                    <h4 className="text-gray-800 font-bold text-sm leading-snug line-clamp-2">
                      {p.title}
                    </h4>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {p.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </CustomerLayout>
  )
}
