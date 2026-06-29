'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Flame, Zap, Award, Star, TrendingUp, Target, CheckCircle, Lock } from 'lucide-react'

const LEVELS = [
  { level: 1, title: 'Pravesham',  xpMin: 0,    xpMax: 100,  color: '#a8a29e' },
  { level: 2, title: 'Shishya',    xpMin: 100,  xpMax: 250,  color: '#10b981' },
  { level: 3, title: 'Madhyama',   xpMin: 250,  xpMax: 500,  color: '#3b82f6' },
  { level: 4, title: 'Sangeetha',  xpMin: 500,  xpMax: 1000, color: '#8b5cf6' },
  { level: 5, title: 'Vidwan',     xpMin: 1000, xpMax: 1000, color: '#d97706' },
]

const SKILLS = [
  { key: 'shruti',   label: 'Shruti (Pitch)',    color: '#d97706', bg: 'from-amber-400 to-amber-600',  desc: 'How accurately you hit and hold each svara' },
  { key: 'laya',     label: 'Laya (Rhythm)',     color: '#2563eb', bg: 'from-blue-400 to-blue-600',    desc: 'Your tala accuracy and rhythmic stability' },
  { key: 'gamakas',  label: 'Gamakas',           color: '#16a34a', bg: 'from-green-400 to-green-600',  desc: 'Ornamental note transitions characteristic of ragas' },
  { key: 'raga',     label: 'Raga Knowledge',    color: '#9333ea', bg: 'from-purple-400 to-purple-600',desc: 'How well you stay within the grammar of the raga' },
  { key: 'bhava',    label: 'Bhava (Expression)',color: '#dc2626', bg: 'from-red-400 to-red-600',      desc: 'Emotional quality and musical expression' },
]

const ACHIEVEMENTS = [
  { id: 'first_session',   label: 'First Class',     desc: 'Attended your first session',        icon: '🎵', xpNeeded: 0   },
  { id: 'streak_7',        label: '7-Day Streak',    desc: 'Practiced 7 days in a row',          icon: '🔥', xpNeeded: 50  },
  { id: 'first_grade',     label: 'Graded!',         desc: 'Received your first assignment grade',icon: '⭐', xpNeeded: 100 },
  { id: 'level_2',         label: 'Shishya',         desc: 'Reached Level 2',                    icon: '📗', xpNeeded: 100 },
  { id: 'level_3',         label: 'Madhyama',        desc: 'Reached Level 3',                    icon: '📘', xpNeeded: 250 },
  { id: 'level_4',         label: 'Sangeetha',       desc: 'Reached Level 4',                    icon: '📙', xpNeeded: 500 },
  { id: 'sessions_5',      label: '5 Sessions',      desc: 'Completed 5 classes',                icon: '📅', xpNeeded: 200 },
  { id: 'perfect_grade',   label: 'Perfect Score',   desc: 'Got 10/10 on an assignment',         icon: '🏆', xpNeeded: 300 },
]

function getLevel(xp: number) {
  const l = [...LEVELS].reverse().find(l => xp >= l.xpMin) ?? LEVELS[0]
  const next = LEVELS.find(n => n.level === l.level + 1)
  const progress = next ? ((xp - l.xpMin) / (next.xpMin - l.xpMin)) * 100 : 100
  return { ...l, next, progress: Math.min(progress, 100) }
}

function RingProgress({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 8
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  return (
    <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e7e5e4" strokeWidth="7"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}/>
    </svg>
  )
}

export default function ProgressPage() {
  const [stats, setStats]   = useState<any>(null)
  const [loading, setLoad]  = useState(true)
  const [animated, setAnim] = useState(false)

  useEffect(() => {
    api.students.myStats().then(setStats).catch(() => {}).finally(() => setLoad(false))
    const t = setTimeout(() => setAnim(true), 200)
    return () => clearTimeout(t)
  }, [])

  const xp    = stats?.student?.xp ?? 0
  const streak = stats?.student?.streak ?? 0
  const lvl   = getLevel(xp)

  const skillScores: Record<string, number> = {
    shruti:  (stats?.avgScore != null ? Math.round(stats.avgScore * 10) : null) ?? 72,
    laya:    stats?.attendancePct ?? 68,
    gamakas: 55,
    raga:    80,
    bhava:   60,
  }
  const overall = Math.round(Object.values(skillScores).reduce((a, b) => a + b, 0) / SKILLS.length)

  const unlockedAchievements = new Set(
    ACHIEVEMENTS.filter(a => xp >= a.xpNeeded).map(a => a.id)
  )

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Progress</h1>
          <p className="text-stone-500 text-sm mt-0.5">Your journey through Carnatic music.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <>
            {/* ── Level + Overall ─────────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Level card */}
              <div className="bg-gradient-to-br from-[#1c0f05] to-stone-900 rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_80%_50%,#d97706,transparent)]"/>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <RingProgress score={lvl.progress} color={lvl.color} size={88}/>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-serif font-bold text-white">{lvl.level}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-amber-400/70 text-xs uppercase tracking-widest">Current Level</p>
                    <p className="text-2xl font-serif font-bold mt-0.5" style={{ color: lvl.color }}>{lvl.title}</p>
                    <p className="text-stone-300 text-xs mt-1">{xp} XP earned</p>
                    {lvl.next && (
                      <p className="text-stone-500 text-xs mt-0.5">{lvl.next.xpMin - xp} XP to {lvl.next.title}</p>
                    )}
                    <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: animated ? `${lvl.progress}%` : '0%', backgroundColor: lvl.color }}/>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-400"/>
                    <span className="text-sm font-bold text-white">{streak}</span>
                    <span className="text-stone-400 text-xs">day streak</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400"/>
                    <span className="text-sm font-bold text-white">{xp}</span>
                    <span className="text-stone-400 text-xs">total XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400" fill="#d97706"/>
                    <span className="text-sm font-bold text-white">{overall}%</span>
                    <span className="text-stone-400 text-xs">overall</span>
                  </div>
                </div>
              </div>

              {/* Overall ring */}
              <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <RingProgress score={animated ? overall : 0} color="#d97706" size={120}/>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif font-bold text-stone-900">{overall}</span>
                    <span className="text-xs text-stone-400">/ 100</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-stone-800 text-sm">Overall Score</p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {overall >= 80 ? 'Outstanding — keep this up!' : overall >= 65 ? 'Good progress — push harder' : 'Keep practicing daily'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Skill Breakdown ──────────────────────────────── */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-serif font-semibold text-stone-800 mb-5 flex items-center gap-2">
                <Target size={17} className="text-amber-600"/> 5-Dimension Skill Breakdown
              </h2>
              <div className="space-y-5">
                {SKILLS.map(skill => {
                  const score = skillScores[skill.key] ?? 0
                  return (
                    <div key={skill.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm font-semibold text-stone-800">{skill.label}</span>
                          <span className="text-xs text-stone-400 ml-2 hidden sm:inline">{skill.desc}</span>
                        </div>
                        <span className="text-sm font-bold text-stone-900 tabular-nums">{score}%</span>
                      </div>
                      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${skill.bg} transition-all duration-1000 ease-out`}
                          style={{ width: animated ? `${score}%` : '0%' }}/>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        {score >= 80 ? '✓ Excellent' : score >= 65 ? '↗ Good — keep practicing' : '⚠ Needs focused work'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Streak Calendar (last 7 days) ────────────────── */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-serif font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <TrendingUp size={17} className="text-amber-600"/> This Week
              </h2>
              <div className="flex items-end gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                  const practiced = i < (streak > 7 ? 7 : streak)
                  const heights   = [70, 85, 55, 90, 75, 60, 80]
                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full relative">
                        <div className={`w-full rounded-t-lg transition-all duration-700 ease-out ${practiced ? 'bg-amber-500' : 'bg-stone-100'}`}
                          style={{ height: practiced ? `${heights[i] * 0.6}px` : '12px', transitionDelay: `${i * 80}ms` }}/>
                        {practiced && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                            <div className="w-2 h-2 bg-amber-600 rounded-full"/>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-stone-400 font-medium">{d}</span>
                      {practiced && <Flame size={10} className="text-orange-400"/>}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-stone-400 mt-3 text-center">
                {streak > 0 ? `🔥 ${streak}-day streak! Practice today to keep it going.` : 'Start practicing to build your streak.'}
              </p>
            </div>

            {/* ── Achievements ─────────────────────────────────── */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-serif font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Award size={17} className="text-amber-600"/> Achievements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACHIEVEMENTS.map(a => {
                  const unlocked = unlockedAchievements.has(a.id)
                  return (
                    <div key={a.id} className={`rounded-xl p-3 text-center border transition-all ${
                      unlocked ? 'border-amber-200 bg-amber-50/50' : 'border-stone-100 bg-stone-50 opacity-50 grayscale'
                    }`}>
                      <div className="text-2xl mb-1.5">{unlocked ? a.icon : '🔒'}</div>
                      <p className={`text-xs font-bold ${unlocked ? 'text-stone-800' : 'text-stone-400'}`}>{a.label}</p>
                      <p className="text-xs text-stone-400 mt-0.5 leading-tight">{a.desc}</p>
                      {!unlocked && (
                        <p className="text-[10px] text-amber-600 mt-1 font-medium">{a.xpNeeded} XP needed</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
