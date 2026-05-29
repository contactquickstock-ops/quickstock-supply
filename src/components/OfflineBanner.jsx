import { useState, useEffect } from 'react'
import { MdWifiOff, MdRefresh } from 'react-icons/md'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline  = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed inset-0 z-[9998] bg-white flex flex-col items-center justify-center
      gap-5 px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
        <MdWifiOff size={48} className="text-gray-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-800">No Internet</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          Please check your WiFi or mobile data connection and try again.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-7 py-3 bg-[#168AFF]
          text-white font-bold rounded-xl text-sm hover:bg-[#1270DB] transition">
        <MdRefresh size={18} />
        Try Again
      </button>
    </div>
  )
}
