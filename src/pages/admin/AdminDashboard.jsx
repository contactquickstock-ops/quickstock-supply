import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  MdShoppingCart, MdPendingActions,
  MdDirectionsCar, MdPeople,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

// ── helpers ──────────────────────────────────────────────────────────────────

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildWeekBuckets(rows) {
  const today = new Date()
  const buckets = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets[key] = { day: DAY_ABBR[d.getDay()], orders: 0 }
  }
  rows.forEach(({ created_at }) => {
    const key = created_at?.slice(0, 10)
    if (buckets[key]) buckets[key].orders++
  })
  return Object.values(buckets)
}

const STATUS_BADGE = {
  completed:  'bg-green-100  text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  cancelled:  'bg-red-100    text-red-700',
  active:     'bg-blue-100   text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
}

// ── sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ title, value, icon: Icon, iconColor, iconBg, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-gray-400 text-sm truncate">{title}</p>
        {loading
          ? <div className="mt-1 h-7 w-16 bg-gray-100 animate-pulse rounded-lg" />
          : <p className="text-gray-800 text-2xl font-bold leading-tight">{value}</p>
        }
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5 text-sm">
      <p className="text-gray-500 font-medium">{label}</p>
      <p className="text-[#1A2E74] font-bold mt-0.5">
        {payload[0].value} order{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function SkeletonRows({ cols = 5, rows = 5 }) {
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

// ── main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeDrivers: 0,
    totalMembers: 0,
  })
  const [chartData, setChartData]       = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading]           = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: activeDrivers },
      { count: totalMembers },
      { data: recentRaw },
      { data: weekRaw },
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),

      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'driver')
        .eq('status', 'approved'),

      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer'),

      supabase
        .from('orders')
        .select('id, customer_name, status, total, created_at')
        .order('created_at', { ascending: false })
        .limit(10),

      supabase
        .from('orders')
        .select('created_at')
        .gte('created_at', weekStart.toISOString()),
    ])

    setStats({
      totalOrders:  totalOrders  ?? 0,
      pendingOrders: pendingOrders ?? 0,
      activeDrivers: activeDrivers ?? 0,
      totalMembers:  totalMembers  ?? 0,
    })

    setChartData(buildWeekBuckets(weekRaw ?? []))

    setRecentOrders(
      (recentRaw ?? []).map(o => ({
        id:       o.id,
        customer: o.customer_name ?? 'Unknown',
        status:   o.status ?? 'unknown',
        total:    o.total ?? 0,
        date:     new Date(o.created_at).toLocaleDateString('en-PH', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
      }))
    )

    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Page heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Overview</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={MdShoppingCart}
            iconColor="text-[#1A2E74]"
            iconBg="bg-green-50"
            loading={loading}
          />
          <SummaryCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={MdPendingActions}
            iconColor="text-yellow-500"
            iconBg="bg-yellow-50"
            loading={loading}
          />
          <SummaryCard
            title="Active Drivers"
            value={stats.activeDrivers}
            icon={MdDirectionsCar}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
            loading={loading}
          />
          <SummaryCard
            title="Total Members"
            value={stats.totalMembers}
            icon={MdPeople}
            iconColor="text-purple-500"
            iconBg="bg-purple-50"
            loading={loading}
          />
        </div>

        {/* ── Bar chart ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 font-semibold text-base mb-1">Orders per Day</h3>
          <p className="text-gray-400 text-xs mb-5">Last 7 days</p>

          {loading ? (
            <div className="h-[260px] flex items-center justify-center">
              <div className="flex gap-2 items-end">
                {[40, 70, 55, 90, 65, 80, 45].map((h, i) => (
                  <div
                    key={i}
                    className="w-9 bg-gray-100 animate-pulse rounded-t-lg"
                    style={{ height: h }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4', radius: 6 }} />
                <Bar
                  dataKey="orders"
                  fill="#1A2E74"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={52}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Recent orders table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-700 font-semibold text-base">Recent Orders</h3>
              <p className="text-gray-400 text-xs mt-0.5">Latest 10 transactions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  {['Order ID', 'Customer', 'Status', 'Total', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={5} rows={5} />
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-gray-400 text-sm">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 text-gray-400 font-mono text-xs">
                        #{String(order.id).slice(-6).padStart(6, '0')}
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium whitespace-nowrap">
                        {order.customer}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                            text-xs font-medium capitalize
                            ${STATUS_BADGE[order.status.toLowerCase()] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium whitespace-nowrap">
                        ₱{Number(order.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                        {order.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
