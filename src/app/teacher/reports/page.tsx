'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { BarChart2, Download, Calendar, TrendingUp } from 'lucide-react'

export default function TeacherReports() {
  const [month, setMonth]   = useState(new Date().getMonth() + 1)
  const [year, setYear]     = useState(new Date().getFullYear())
  const [report, setReport] = useState<any>(null)
  const [loading, setLoad]  = useState(false)

  const fetchReport = () => {
    setLoad(true)
    api.reports.monthly(month, year).then(setReport).catch(() => {}).finally(() => setLoad(false))
  }

  useEffect(() => { fetchReport() }, [month, year])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Reports</h1>
            <p className="text-stone-500 text-sm mt-1">Monthly progress report for your students.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white">
              {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white">
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="flex items-center gap-1.5 border border-stone-200 hover:border-amber-300 text-stone-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-white">
              <Download size={15}/> Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : !report || !report.students?.length ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
            <BarChart2 size={36} className="text-stone-200 mx-auto mb-3"/>
            <p className="text-stone-500">No data for {MONTHS[month-1]} {year}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Sessions', value: report.totalSessions ?? 0, icon: Calendar },
                { label: 'Avg Attendance', value: `${report.avgAttendance ?? 0}%`, icon: TrendingUp },
                { label: 'Assignments Graded', value: report.gradedCount ?? 0, icon: BarChart2 },
              ].map(s => (
                <div key={s.label} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400">{s.label}</span>
                    <s.icon size={15} className="text-amber-600"/>
                  </div>
                  <p className="text-2xl font-serif font-bold text-stone-900">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Per-student table */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100">
                <h2 className="font-serif font-semibold text-stone-800">Student Report — {MONTHS[month-1]} {year}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase">Student</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 uppercase">Sessions</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 uppercase">Attendance</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 uppercase">Assignments</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 uppercase">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {report.students.map((s: any) => (
                      <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                              {s.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-stone-800">{s.name}</p>
                              <p className="text-xs text-stone-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center px-4 py-4 text-stone-700 font-medium">{s.sessions ?? 0}</td>
                        <td className="text-center px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(s.attendanceRate ?? 0) >= 80 ? 'bg-green-50 text-green-700' : (s.attendanceRate ?? 0) >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                            {s.attendanceRate ?? 0}%
                          </span>
                        </td>
                        <td className="text-center px-4 py-4 text-stone-700 font-medium">{s.assignments ?? 0}</td>
                        <td className="text-center px-4 py-4">
                          {s.avgScore !== null ? (
                            <span className="font-bold text-amber-700">{s.avgScore}/10</span>
                          ) : <span className="text-stone-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}