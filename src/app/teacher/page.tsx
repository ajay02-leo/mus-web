'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Users, Calendar, BookOpen, TrendingUp, FileText, CheckSquare, Plus, Clock } from 'lucide-react'
import Link from 'next/link'

export default function TeacherDashboard() {
  const [students, setStudents]   = useState<any[]>([])
  const [sessions, setSessions]   = useState<any[]>([])
  const [assignments, setAssign]  = useState<any[]>([])
  const [loading, setLoad]        = useState(true)

  useEffect(() => {
    Promise.all([
      api.students.list(),
      api.sessions.list(),
      api.assignments.list(),
    ]).then(([s, sess, a]) => {
      setStudents(s ?? [])
      setSessions((sess ?? []).slice(0, 4))
      setAssign((a ?? []).slice(0, 4))
    }).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const QUICK_LINKS = [
    { href: '/teacher/students',    icon: Users,       label: 'Students',   count: students.length },
    { href: '/teacher/schedule',    icon: Calendar,    label: 'Schedule',   count: sessions.length },
    { href: '/teacher/assignments', icon: FileText,    label: 'Assignments', count: assignments.length },
    { href: '/teacher/attendance',  icon: CheckSquare, label: 'Attendance', count: null },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Teacher Dashboard</h1>
            <p className="text-stone-500 text-sm mt-1">Manage your students, sessions, and assignments.</p>
          </div>
          <Link href="/teacher/schedule" className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0">
            <Plus size={16}/> New Session
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Students', value: loading ? '—' : students.length, icon: Users, color: 'text-amber-600' },
            { label: 'Sessions This Month', value: loading ? '—' : sessions.length, icon: Calendar, color: 'text-blue-600' },
            { label: 'Open Assignments', value: loading ? '—' : assignments.filter((a: any) => a.status !== 'GRADED').length, icon: FileText, color: 'text-orange-500' },
            { label: 'Pending Reviews', value: loading ? '—' : assignments.filter((a: any) => a.status === 'SUBMITTED').length, icon: TrendingUp, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-400 font-medium">{s.label}</span>
                <s.icon size={16} className={s.color}/>
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map(q => (
            <Link key={q.href} href={q.href} className="bg-white border border-stone-100 rounded-2xl p-4 flex flex-col items-center gap-2.5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <q.icon size={18} className="text-amber-700"/>
              </div>
              <span className="text-xs font-semibold text-stone-700">{q.label}</span>
              {q.count !== null && <span className="text-xs text-stone-400">{q.count} total</span>}
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Upcoming sessions */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
            <div className="p-5 border-b border-stone-50 flex items-center justify-between">
              <h2 className="font-serif font-semibold text-stone-800">Upcoming Sessions</h2>
              <Link href="/teacher/schedule" className="text-amber-700 text-xs font-medium hover:text-amber-600">View all</Link>
            </div>
            <div className="divide-y divide-stone-50">
              {loading ? <div className="p-5 text-stone-400 text-sm text-center">Loading…</div>
              : sessions.length === 0 ? <div className="p-5 text-stone-400 text-sm text-center">No sessions scheduled</div>
              : sessions.map((s: any) => (
                <div key={s.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar size={17} className="text-amber-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{s.student?.name ?? 'Student'}</p>
                    <p className="text-xs text-stone-400">{s.raga ?? 'Carnatic Session'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-stone-700">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString() : ''}</p>
                    <p className="text-xs text-stone-400 flex items-center gap-1 justify-end"><Clock size={10}/> {s.duration ?? 60}m</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments to review */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
            <div className="p-5 border-b border-stone-50 flex items-center justify-between">
              <h2 className="font-serif font-semibold text-stone-800">Assignments to Review</h2>
              <Link href="/teacher/assignments" className="text-amber-700 text-xs font-medium hover:text-amber-600">View all</Link>
            </div>
            <div className="divide-y divide-stone-50">
              {loading ? <div className="p-5 text-stone-400 text-sm text-center">Loading…</div>
              : assignments.length === 0 ? <div className="p-5 text-stone-400 text-sm text-center">No assignments yet</div>
              : assignments.map((a: any) => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{a.title}</p>
                    <p className="text-xs text-stone-400 truncate">{a.raga}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    a.status === 'GRADED' ? 'bg-green-50 text-green-700' :
                    a.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent students */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
          <div className="p-5 border-b border-stone-50 flex items-center justify-between">
            <h2 className="font-serif font-semibold text-stone-800">My Students</h2>
            <Link href="/teacher/students" className="text-amber-700 text-xs font-medium hover:text-amber-600">View all</Link>
          </div>
          <div className="divide-y divide-stone-50">
            {loading ? <div className="p-5 text-stone-400 text-sm text-center">Loading…</div>
            : students.length === 0 ? <div className="p-5 text-stone-400 text-sm text-center">No students yet</div>
            : students.slice(0, 5).map((s: any) => (
              <div key={s.id} className="p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 font-bold text-amber-700 text-sm">
                  {s.name?.[0]?.toUpperCase() ?? 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800">{s.name}</p>
                  <p className="text-xs text-stone-400">{s.email}</p>
                </div>
                <span className="text-xs text-stone-400">Level {s.studentProfile?.level ?? 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}