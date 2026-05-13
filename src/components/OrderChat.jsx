import { useState, useEffect, useRef, useCallback } from 'react'
import { MdSend, MdChat } from 'react-icons/md'
import { supabaseAdmin } from '../services/supabaseAdmin'

const fmt = iso =>
  new Date(iso).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

export default function OrderChat({ orderId, userId, userRole, isActive }) {
  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef(null)

  const fetchMessages = useCallback(async () => {
    const { data } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }, [orderId])

  useEffect(() => {
    fetchMessages()
    if (!isActive) return
    const t = setInterval(fetchMessages, 3000)
    return () => clearInterval(t)
  }, [fetchMessages, isActive])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !isActive || sending) return
    setSending(true)
    await supabaseAdmin.from('messages').insert({
      order_id:    orderId,
      sender_id:   userId,
      sender_role: userRole,
      content:     text.trim(),
    })
    setText('')
    await fetchMessages()
    setSending(false)
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 overflow-hidden bg-gray-50">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100">
        <MdChat size={14} className="text-[#168AFF]" />
        <span className="text-xs font-bold text-gray-700">
          {userRole === 'customer' ? 'Message Driver' : 'Message Customer'}
        </span>
        {!isActive && (
          <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Chat closed
          </span>
        )}
        {isActive && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-green-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-[140px] max-h-52">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-xs py-5">
            {isActive ? 'No messages yet. Say hello!' : 'No messages for this order.'}
          </p>
        ) : messages.map(msg => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                ${isMe
                  ? 'bg-[#168AFF] text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm'}`}>
                {!isMe && (
                  <p className="text-[10px] font-bold text-[#168AFF] mb-0.5 capitalize">
                    {msg.sender_role}
                  </p>
                )}
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-0.5 text-right
                  ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                  {fmt(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isActive ? (
        <form onSubmit={handleSend}
          className="flex gap-2 px-3 py-2.5 border-t border-gray-100 bg-white">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
              transition disabled:bg-gray-50"
          />
          <button type="submit"
            disabled={!text.trim() || sending}
            className="p-2.5 rounded-xl bg-[#168AFF] text-white hover:bg-[#1270DB]
              disabled:opacity-40 disabled:cursor-not-allowed transition">
            <MdSend size={16} />
          </button>
        </form>
      ) : (
        <div className="px-3 py-2.5 border-t border-gray-100 bg-white text-center">
          <p className="text-xs text-gray-400">
            This order has been {messages.length > 0 ? 'completed' : 'closed'}
          </p>
        </div>
      )}
    </div>
  )
}
