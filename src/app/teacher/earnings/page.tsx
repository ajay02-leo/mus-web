'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react'

export default function TeacherEarnings() {
  const [data, setData]   = useState<any>(null)
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    import('@/lib/api').then(({ api }) =>
      api.earnings.my()
        .then(setData)
        .catch(() => {})
        .finally(() => setLoad(false))
    )
  }, [])

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-24"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
    </DashboardLayout>
  )

  const monthly: { month: string; amount: number }[] = data?.monthly ?? []
  const total = data?.total ?? 0
  const sessionsTaught = data?.sessionsTaught ?? 0
  const recent: any[] = data?.recent ?? []

  const amounts = monthly.map(m => m.amount)
  const maxAmt = Math.max(...amounts, 1)
  const thisMonthAmt = amounts[amounts.length - 1] ?? 0
  const lastMonthAmt = amounts[amounts.length - 2] ?? 0
  const growth = lastMonthAmt > 0 ? Math.round(((thisMonthAmt - lastMonthAmt) / lastMonthAmt) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Earnings</h1>
          <p className="text-stone-500 text-sm mt-1">Track your teaching income and payments.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'This Month', value: `₹${thisMonthAmt.toLocaleString('en-IN')}`, icon: IndianRupee, sub: `${growth > 0 ? '+' : ''}${growth}% vs last month`, positive: growth >= 0 },
            { label: 'Total (6 months)', value: `₹${total.toLocaleString('en-IN')}`, icon: TrendingUp, sub: 'Last 6 months', positive: true },
            { label: 'Sessions Taught', value: String(sessionsTaught), icon: Calendar, sub: 'this month', positive: true },
          ].map(s => (
            <div key={s.label} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-400">{s.label}</span>
                <s.icon size={16} className="text-amber-600"/>
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">{s.value}</div>
              <p className={`text-xs mt-1 font-medium ${s.positive ? 'text-green-600' : 'text-red-500'}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif font-semibold text-stone-800 mb-6">Monthly Earnings</h2>
          {monthly.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">No earnings data yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {monthly.map(({ month, amount }) => {
                const pct = (amount / maxAmt) * 100
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-stone-600">₹{(amount / 1000).toFixed(1)}k</span>
                    <div className="w-full rounded-t-lg bg-amber-200 hover:bg-amber-400 transition-colors cursor-default" style={{ height: `${Math.max(pct, 2)}%` }}/>
                    <span className="text-xs text-stone-400">{month}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-serif font-semibold text-stone-800">Recent Payments</h2>
          </div>
          {recent.length === 0 ? (
            <p className="p-8 text-stone-400 text-sm text-center">No payments recorded yet.</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {recent.map((t: any) => (
                <div key={t.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                      ₹
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{t.description ?? 'Payment'}</p>
                      <p className="text-xs text-stone-400">{new Date(t.createdAt).toLocaleDateString('en-IN')} · {t.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <ArrowUpRight size={15}/>
                    <span>₹{t.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
