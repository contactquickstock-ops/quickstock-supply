import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MdStar, MdArrowForward, MdCheckCircle, MdCardGiftcard, MdImage } from 'react-icons/md'
import PublicLayout from '../../layouts/PublicLayout'
import { supabaseAdmin } from '../../services/supabaseAdmin'

const HOW_IT_WORKS = [
  { step: '01', title: 'Create an Account',  desc: 'Register and get approved by our admin to access the store.' },
  { step: '02', title: 'Place Orders',       desc: 'Every ₱100 you spend earns you 1 reward point automatically.' },
  { step: '03', title: 'Accumulate Points',  desc: 'Watch your points grow with every order you place.'          },
  { step: '04', title: 'Redeem Rewards',     desc: 'Use your points to claim exclusive vouchers and gifts.'      },
]

const TIERS = [
  { name: 'Starter',  min: 0,    max: 199,  color: 'bg-gray-100 text-gray-700',    star: '⭐' },
  { name: 'Silver',   min: 200,  max: 499,  color: 'bg-slate-200 text-slate-700',  star: '🥈' },
  { name: 'Gold',     min: 500,  max: 999,  color: 'bg-yellow-100 text-yellow-800', star: '🥇' },
  { name: 'Platinum', min: 1000, max: null, color: 'bg-green-100 text-green-800',  star: '💎' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      overflow-hidden flex animate-pulse gap-4 p-5">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabaseAdmin
        .from('rewards')
        .select('id, name, description, points_required, image_url')
        .eq('is_active', true)
        .order('points_required', { ascending: true })
      setRewards(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-[#00B14F] to-[#007A35] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white
            text-xs font-bold px-4 py-1.5 rounded-full">
            <MdStar size={14} className="text-yellow-300" /> Loyalty Program
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">
            Rewards &amp; Points
          </h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto">
            Shop and earn — every peso you spend brings you closer to amazing rewards.
            The more you order, the more you get back.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <div className="bg-white/15 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-yellow-300 font-black text-2xl">1 pt</p>
              <p className="text-white/80 text-xs">per ₱100 spent</p>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-yellow-300 font-black text-2xl">No</p>
              <p className="text-white/80 text-xs">expiry on points</p>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-yellow-300 font-black text-2xl">Free</p>
              <p className="text-white/80 text-xs">to join</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl font-black text-gray-800">How to Earn & Redeem</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-[#00B14F] rounded-2xl flex items-center
                  justify-center shadow-md">
                  <span className="text-white font-black text-lg">{step}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership Tiers ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Tiers</span>
            <h2 className="text-3xl font-black text-gray-800">Membership Levels</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Climb through the tiers as you earn more points and unlock better benefits.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TIERS.map(({ name, min, max, color, star }) => (
              <div key={name}
                className={`rounded-2xl border p-5 text-center space-y-2 ${color}`}>
                <span className="text-3xl">{star}</span>
                <h3 className="font-black text-base">{name}</h3>
                <p className="text-xs font-medium opacity-80">
                  {max ? `${min}–${max} pts` : `${min}+ pts`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rewards Catalog (live from DB) ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Catalog</span>
            <h2 className="text-3xl font-black text-gray-800">Available Rewards</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Redeem your earned points for any of these exciting rewards.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : rewards.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 px-5 py-16
              text-center text-gray-400 text-sm">
              No rewards available yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rewards.map(reward => (
                <div key={reward.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5
                    flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-green-50
                    border border-gray-100 flex items-center justify-center shrink-0">
                    {reward.image_url ? (
                      <img
                        src={reward.image_url}
                        alt={reward.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdImage size={28} className="text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-[#00B14F] text-white
                        text-xs font-bold px-2 py-0.5 rounded-lg">
                        <MdStar size={10} /> {Number(reward.points_required).toLocaleString()} pts
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">{reward.name}</h3>
                    {reward.description && (
                      <p className="text-gray-500 text-xs leading-relaxed">{reward.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#00B14F] font-bold text-sm uppercase tracking-widest">Benefits</span>
            <h2 className="text-3xl font-black text-gray-800">Why Join Our Rewards Program?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Points never expire — accumulate at your own pace',
              'Earn on every single order, no minimum required',
              'Redeem for free delivery, discounts, or gift items',
              'Climb membership tiers for exclusive perks',
              'Track your points balance inside your account',
              'Surprise bonus points on special occasions',
            ].map(b => (
              <div key={b} className="flex items-start gap-3 bg-white rounded-xl
                border border-gray-100 px-4 py-3 shadow-sm">
                <MdCheckCircle size={18} className="text-[#00B14F] shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-linear-to-r from-[#00B14F] to-[#007A35]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <MdCardGiftcard size={48} className="text-yellow-300 mx-auto" />
          <h2 className="text-3xl font-black text-white">Start Earning Today!</h2>
          <p className="text-white/85 text-base">
            Join for free and start collecting points on your very first order.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400
              text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition
              shadow-lg text-sm">
            Create Free Account <MdArrowForward size={18} />
          </Link>
        </div>
      </section>

    </PublicLayout>
  )
}
