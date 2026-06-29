'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { CheckCircle, Circle, Lock, Star, Zap, Trophy } from 'lucide-react'

const LEVELS = [
  { level: 1, title: 'Foundation',        xpMin: 0,    xpMax: 500,
    topics: ['Shruti & Laya basics', 'Sarali Varisai', 'Basic Alankarams', 'Sa Ri Ga Ma Pa Dha Ni'] },
  { level: 2, title: 'Githam & Swarajati', xpMin: 500,  xpMax: 1200,
    topics: ['Simple Keerthanas', 'Githam compositions', 'Swarajati practice', 'Raga introduction'] },
  { level: 3, title: 'Varnams',            xpMin: 1200, xpMax: 2500,
    topics: ['Tana Varnams', 'Pada Varnams', 'Complex alankarams', 'Raga exploration'] },
  { level: 4, title: 'Keerthanams',        xpMin: 2500, xpMax: 5000,
    topics: ['Tyagaraja Keerthanams', 'Muttusvami Dikshitar', 'Syama Sastri', 'Manodharma Sangitam'] },
  { level: 5, title: 'Alapana & RTP',      xpMin: 5000, xpMax: Infinity,
    topics: ['Full Alapana', 'Niraval', 'Kalpana Svaras', 'Ragam Tanam Pallavi'] },
]

export default function LearningPath() {
  const [userXP, setXP]  = useState(0)
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    api.students.myStats()
      .then((d: any) => setXP(d?.student?.xp ?? 0))
      .catch(() => {})
      .finally(() => setLoad(false))
  }, [])

  const currentIdx = LEVELS.findIndex((l, i) => {
    const next = LEVELS[i + 1]
    return userXP >= l.xpMin && (!next || userXP < next.xpMin)
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Learning Path</h1>
            <p className="text-stone-500 text-sm mt-1">Your structured journey through Carnatic music.</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 flex-shrink-0">
            <Zap size={16} className="text-amber-600"/>
            <div>
              <p className="text-xs text-stone-500">Total XP</p>
              <p className="text-lg font-bold text-amber-700">{loading ? '…' : userXP}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-stone-200 z-0"/>
          <div className="space-y-4">
            {LEVELS.map((l, i) => {
              const isCompleted = userXP >= (LEVELS[i + 1]?.xpMin ?? Infinity) || (i < currentIdx)
              const isActive    = i === currentIdx
              const isLocked    = !isCompleted && !isActive

              const progressInLevel = Math.max(0, userXP - l.xpMin)
              const levelSpan       = (LEVELS[i + 1]?.xpMin ?? l.xpMin + 1000) - l.xpMin
              const pct             = Math.min(100, Math.round((progressInLevel / levelSpan) * 100))

              return (
                <div key={l.level} className={`relative z-10 bg-white border-2 rounded-2xl p-5 ml-12 shadow-sm transition-all ${
                  isActive ? 'border-amber-500 shadow-amber-100' : isCompleted ? 'border-green-200' : 'border-stone-100 opacity-60'
                }`}>
                  <div className={`absolute -left-[52px] top-5 w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 font-bold text-sm ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isActive    ? 'bg-amber-700 border-amber-700 text-white' : 'bg-stone-100 border-stone-200 text-stone-400'
                  }`}>
                    {isCompleted ? <CheckCircle size={18}/> : isLocked ? <Lock size={14}/> : l.level}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-semibold text-stone-800 text-base sm:text-lg">Level {l.level}: {l.title}</h3>
                        {isActive    && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">Current</span>}
                        {isCompleted && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Done</span>}
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 text-xs mt-1">
                        <Star size={11} className="text-amber-500" fill="currentColor"/>
                        <span>{l.xpMin} XP to unlock</span>
                      </div>
                    </div>
                    {isCompleted && <Trophy size={20} className="text-amber-500 flex-shrink-0"/>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {l.topics.map(t => (
                      <div key={t} className="flex items-center gap-2">
                        {isCompleted ? <CheckCircle size={13} className="text-green-500 flex-shrink-0"/> :
                          isActive   ? <Circle size={13} className="text-amber-400 flex-shrink-0"/> :
                                       <Lock size={11} className="text-stone-300 flex-shrink-0"/>}
                        <span className="text-xs text-stone-600">{t}</span>
                      </div>
                    ))}
                  </div>

                  {isActive && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-stone-400 mb-1.5">
                        <span>Progress in this level</span>
                        <span>{progressInLevel} / {levelSpan} XP ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
