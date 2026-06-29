'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Search, User, ChevronRight } from 'lucide-react'

const LEVEL_LABELS: Record<string, string> = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' }
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-50 text-green-700',
  INTERMEDIATE: 'bg-amber-50 text-amber-700',
  ADVANCED: 'bg-purple-50 text-purple-700',
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoad]      = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    api.students.list().then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const filtered = students.filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.course?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">My Students</h1>
          <p className="text-stone-500 text-sm mt-1">Manage and track all your enrolled students.</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all bg-white shadow-sm"/>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
            <User size={36} className="text-stone-200 mx-auto mb-3"/>
            <p className="text-stone-500">No students found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-5 px-5 py-3 border-b border-stone-100 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                <div className="col-span-2">Student</div>
                <div className="text-center">Level</div>
                <div className="text-center">Sessions</div>
                <div className="text-right">Status</div>
              </div>
              <div className="divide-y divide-stone-50">
                {filtered.map((s: any) => (
                  <div key={s.id} className="grid grid-cols-5 px-5 py-4 items-center hover:bg-stone-50 transition-colors">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                        {s.name?.[0]?.toUpperCase() ?? 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{s.name}</p>
                        <p className="text-xs text-stone-400 truncate">{s.email}</p>
                        {s.course?.title && <p className="text-xs text-amber-600 truncate">{s.course.title}</p>}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[s.levelLabel] ?? 'bg-stone-100 text-stone-600'}`}>
                        {LEVEL_LABELS[s.levelLabel] ?? s.levelLabel ?? 'Beginner'}
                      </span>
                    </div>
                    <div className="text-center text-sm text-stone-600 font-medium">
                      {s.totalSessions ?? 0}
                    </div>
                    <div className="flex justify-end">
                      <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((s: any) => (
                <div key={s.id} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-base flex-shrink-0">
                    {s.name?.[0]?.toUpperCase() ?? 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{s.name}</p>
                    <p className="text-xs text-stone-400 truncate">{s.email}</p>
                    {s.course?.title && <p className="text-xs text-amber-600 truncate">{s.course.title}</p>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[s.levelLabel] ?? 'bg-stone-100 text-stone-600'}`}>
                        {LEVEL_LABELS[s.levelLabel] ?? 'Beginner'}
                      </span>
                      <span className="text-xs text-stone-400">{s.totalSessions ?? 0} sessions</span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 flex-shrink-0"/>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
