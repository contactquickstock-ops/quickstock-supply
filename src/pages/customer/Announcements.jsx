import { useEffect, useState } from 'react'
import { MdCampaign, MdCalendarToday, MdExpandMore, MdExpandLess } from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

export default function Announcements() {
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, title, content, image_url, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <CustomerLayout>
      <div className="space-y-5 max-w-3xl mx-auto">

        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Latest updates and news from QuickStock Supply
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-100 rounded-lg w-24" />
                  <div className="h-5 bg-gray-100 rounded-lg w-2/3" />
                  <div className="h-4 bg-gray-100 rounded-lg" />
                  <div className="h-4 bg-gray-100 rounded-lg w-4/5" />
                </div>
              </div>
            ))}
          </div>

        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center
              justify-center mx-auto mb-4">
              <MdCampaign size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold text-base">No announcements yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon for updates!</p>
          </div>

        ) : (
          <div className="space-y-5">
            {posts.map(post => {
              const isExpanded  = expanded === post.id
              const isLong      = post.content.length > 220
              const date = new Date(post.created_at).toLocaleDateString('en-PH', {
                weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
              })

              return (
                <article key={post.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm
                    overflow-hidden hover:border-[#168AFF]/30 transition">

                  {/* Image */}
                  {post.image_url && (
                    <div className="w-full h-52 overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 space-y-3">

                    {/* Date */}
                    <p className="text-gray-400 text-xs flex items-center gap-1.5">
                      <MdCalendarToday size={12} />
                      {date}
                    </p>

                    {/* Title */}
                    <h3 className="text-gray-800 font-bold text-base leading-snug">
                      {post.title}
                    </h3>

                    {/* Content */}
                    <p className={`text-gray-600 text-sm leading-relaxed
                      ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                      {post.content}
                    </p>

                    {/* Read more / less */}
                    {isLong && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : post.id)}
                        className="inline-flex items-center gap-1 text-[#168AFF]
                          text-xs font-semibold hover:underline"
                      >
                        {isExpanded
                          ? <><MdExpandLess size={16} /> Show less</>
                          : <><MdExpandMore size={16} /> Read more</>}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
