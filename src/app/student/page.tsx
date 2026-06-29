'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Music, BookOpen, Calendar, TrendingUp, Star, Clock, CheckCircle, Zap, Target, Award, Flame, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const RAGA_OF_DAY = { name: 'Kalyani', arohana: 'S R2 G3 M2 P D2 N3 S', avarohana: 'S N3 D2 P M2 G3 R2 S', mood: 'Devotion & Serenity', time: 'Evening' }

const LEVELS = [
  { level: 1, title: 'Pravesham',  xpMin: 0,    xpMax: 100,  color: '#a8a29e', bg: 'from-stone-400 to-stone-500' },
  { level: 2, title: 'Shishya',    xpMin: 100,  xpMax: 250,  color: '#10b981', bg: 'from-emerald-400 to-emerald-600' },
  { level: 3, title: 'Madhyama',   xpMin: 250,  xpMax: 500,  color: '#3b82f6', bg: 'from-blue-400 to-blue-600' },
  { level: 4, title: 'Sangeetha',  xpMin: 500,  xpMax: 1000, color: '#8b5cf6', bg: 'from-purple-400 to-purple-600' },
  { level: 5, title: 'Vidwan',     xpMin: 1000, xpMax: 1000, color: '#d97706', bg: 'from-amber-400 to-amber-600' },
]

function getLevel(xp: number) {
  const l = [...LEVELS].reverse().find(l => xp >= l.xpMin) ?? LEVELS[0]
  const next = LEVELS.find(n => n.level === l.level + 1)
  const progress = next ? ((xp - l.xpMin) / (next.xpMin - l.xpMin)) * 100 : 100
  return { ...l, next, progress: Math.min(progress, 100) }
}

const DAILY_CHALLENGES = [
  { id: 'c1', label: 'Sing Sarali Varisai ×3',   xp: 10, done: false },
  { id: 'c2', label: 'Identify 3 ragas by ear',   xp: 15, done: false },
  { id: 'c3', label: 'Practice for 20 minutes',   xp: 20, done: false },
]

export default function StudentDashboard() {
  const [stats, setStats]         = useState<any>(null)
  const [assignments, setAssign]  = useState<any[]>([])
  const [sessions, setSessions]   = useState<any[]>([])
  const [loading, setLoad]        = useState(true)
  const [animated, setAnim]       = useState(false)
  const [challenges, setChallenges] = useState(DAILY_CHALLENGES)

  useEffect(() => {
    Promise.all([
      api.students.myStats(),
      api.assignments.list(),
      api.sessions.list(),
    ]).then(([s, a, sess]) => {
      setStats(s)
      setAssign((a ?? []).slice(0, 3))
      setSessions((sess ?? []).slice(0, 3))
    }).catch(() => {}).finally(() => setLoad(false))
    const t = setTimeout(() => setAnim(true), 300)
    return () => clearTimeout(t)
  }, [])

  const xp     = stats?.student?.xp ?? 0
  const streak = stats?.student?.streak ?? 0
  const lvl   = getLevel(xp)

  const QUICK_LINKS = [
    { href: '/student/learn',     icon: TrendingUp, label: 'Learning Path', color: 'bg-amber-100 text-amber-700' },
    { href: '/student/practice',  icon: Music,      label: 'Practice',      color: 'bg-stone-100 text-stone-700' },
    { href: '/student/ai',        icon: Zap,        label: 'AI Guru',       color: 'bg-purple-100 text-purple-700' },
    { href: '/student/raga',      icon: Star,       label: 'Raga of Day',   color: 'bg-rose-100 text-rose-700' },
  ]

  const toggleChallenge = (id: string) =>
    setChallenges(cs => cs.map(c => c.id === id ? { ...c, done: !c.done } : c))

  const completedChallenges = challenges.filter(c => c.done).length

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">My Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Welcome back! Here&apos;s your practice summary.</p>
        </div>

        {/* XP Level Card */}
        <div className="bg-gradient-to-r from-[#1c0f05] to-stone-900 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-shrink-0">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lvl.bg} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-serif font-bold text-xl">{lvl.level}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-amber-400/70 text-xs uppercase tracking-widest">Level {lvl.level}</p>
                <span className="text-white font-serif font-bold text-lg">{lvl.title}</span>
              </div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${lvl.bg} transition-all duration-1000 ease-out`}
                  style={{ width: animated ? `${lvl.progress}%` : '0%' }}/>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-stone-400 text-xs">{xp} XP</p>
                {lvl.next && <p className="text-stone-500 text-xs">{lvl.next.xpMin} XP → {lvl.next.title}</p>}
              </div>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Flame size={14} className="text-orange-400"/>
                  <span className="text-white font-bold text-sm">{streak}</span>
                </div>
                <p className="text-stone-500 text-xs">streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Award size={14} className="text-amber-400"/>
                  <span className="text-white font-bold text-sm">{xp}</span>
                </div>
                <p className="text-stone-500 text-xs">total XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Avg Score', value: loading ? '—' : stats?.avgScore != null ? `${stats.avgScore}/10` : '—', icon: Target, color: 'text-amber-600' },
            { label: 'Practice Streak', value: loading ? '—' : `${streak} days`, icon: Zap, color: 'text-orange-500' },
            { label: 'Assignments', value: loading ? '—' : `${stats?.totalAssignments ?? 0}`, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Total XP', value: loading ? '—' : `${xp}`, icon: Award, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-400 font-medium">{s.label}</span>
                <s.icon size={15} className={s.color}/>
              </div>
              <div className="text-xl font-serif font-bold text-stone-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map(q => (
            <Link key={q.href} href={q.href} className="bg-white border border-stone-100 rounded-2xl p-4 flex flex-col items-center gap-2.5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${q.color}`}>
                <q.icon size={18}/>
              </div>
              <span className="text-xs font-semibold text-stone-700">{q.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: assignments + upcoming sessions */}
          <div className="lg:col-span-2 space-y-5">
            {/* Assignments */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
              <div className="p-5 border-b border-stone-50 flex items-center justify-between">
                <h2 className="font-serif font-semibold text-stone-800">Pending Assignments</h2>
                <Link href="/student/assignments" className="text-amber-700 text-xs font-medium hover:text-amber-600">View all</Link>
              </div>
              <div className="divide-y divide-stone-50">
                {loading ? (
                  <div className="p-5 text-stone-400 text-sm text-center">Loading…</div>
                ) : assignments.length === 0 ? (
                  <div className="p-5 text-stone-400 text-sm text-center">No pending assignments</div>
                ) : assignments.map((a: any) => (
                  <div key={a.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{a.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{a.raga}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        a.status === 'GRADED' ? 'bg-green-50 text-green-700' :
                        a.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>{a.status}</span>
                      {a.dueDate && <span className="text-xs text-stone-400 hidden sm:flex items-center gap-1"><Clock size={11}/> {new Date(a.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming sessions */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
              <div className="p-5 border-b border-stone-50 flex items-center justify-between">
                <h2 className="font-serif font-semibold text-stone-800">Upcoming Classes</h2>
                <Link href="/student/classes" className="text-amber-700 text-xs font-medium hover:text-amber-600">View all</Link>
              </div>
              <div className="divide-y divide-stone-50">
                {loading ? (
                  <div className="p-5 text-stone-400 text-sm text-center">Loading…</div>
                ) : sessions.length === 0 ? (
                  <div className="p-5 text-stone-400 text-sm text-center">No upcoming classes scheduled</div>
                ) : sessions.map((s: any) => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-amber-600"/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{s.title ?? 'Carnatic Class'}</p>
                        <p className="text-xs text-stone-400">{s.teacher?.name ?? 'Teacher'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-stone-700">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString() : ''}</p>
                      <p className="text-xs text-stone-400">{s.duration ?? 60} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Daily challenges */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="font-serif font-semibold text-stone-800 text-sm">Daily Challenges</h2>
                <span className="text-xs text-amber-600 font-semibold">{completedChallenges}/{challenges.length} done</span>
              </div>
              <div className="p-3 space-y-2">
                {challenges.map(c => (
                  <button key={c.id} onClick={() => toggleChallenge(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${c.done ? 'bg-green-50 border border-green-100' : 'bg-stone-50 border border-stone-100 hover:border-amber-200'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${c.done ? 'border-green-500 bg-green-500' : 'border-stone-300'}`}>
                      {c.done && <CheckCircle size={12} className="text-white"/>}
                    </div>
                    <span className={`text-xs flex-1 font-medium ${c.done ? 'text-green-700 line-through' : 'text-stone-700'}`}>{c.label}</span>
                    <span className="text-xs text-amber-600 font-bold flex-shrink-0">+{c.xp} XP</span>
                  </button>
                ))}
                {completedChallenges === challenges.length && (
                  <div className="text-center py-2">
                    <p className="text-xs text-green-600 font-semibold">🎉 All done! Great practice today.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Raga of the Day */}
            <div className="bg-gradient-to-br from-amber-900 to-stone-900 rounded-2xl p-5 text-white">
              <p className="text-amber-300/70 text-xs font-bold uppercase tracking-widest mb-3">Raga of the Day</p>
              <h3 className="font-serif text-xl font-bold text-amber-400 mb-3">{RAGA_OF_DAY.name}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-amber-200/60 text-xs mb-0.5">Arohana</p>
                  <p className="text-amber-100 font-mono text-xs">{RAGA_OF_DAY.arohana}</p>
                </div>
                <div>
                  <p className="text-amber-200/60 text-xs mb-0.5">Avarohana</p>
                  <p className="text-amber-100 font-mono text-xs">{RAGA_OF_DAY.avarohana}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="bg-amber-800/40 border border-amber-700/40 text-amber-300 text-xs px-2 py-0.5 rounded-full">{RAGA_OF_DAY.mood}</span>
                <span className="bg-amber-800/40 border border-amber-700/40 text-amber-300 text-xs px-2 py-0.5 rounded-full">{RAGA_OF_DAY.time}</span>
              </div>
              <Link href="/student/raga" className="mt-3 flex items-center gap-1 text-amber-400 text-xs hover:text-amber-300 transition-colors">
                Explore raga <ChevronRight size={12}/>
              </Link>
            </div>

            {/* Quick progress link */}
            <Link href="/student/progress" className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:border-amber-200 transition-all group">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-amber-600"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">Full Progress Report</p>
                <p className="text-xs text-stone-400">Skills · Achievements · Streak</p>
              </div>
              <ChevronRight size={16} className="text-stone-300 group-hover:text-amber-500 transition-colors flex-shrink-0"/>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
