'use client'
import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Star, CheckCircle, Clock } from 'lucide-react'

export default function ReviewQueue() {
  const [items, setItems]  = useState<any[]>([])
  const [loading, setLoad] = useState(true)
  const [grading, setGrading] = useState<Record<string, { score: number; feedback: string; saving: boolean; done: boolean }>>({})

  useEffect(() => {
    api.assignments.reviewQueue()
      .then(data => {
        setItems(data)
        const init: typeof grading = {}
        data.forEach((s: any) => { init[s.id] = { score: 8, feedback: '', saving: false, done: false } })
        setGrading(init)
      })
      .catch(() => {}).finally(() => setLoad(false))
  }, [])

  const setField = (id: string, field: 'score' | 'feedback', value: any) =>
    setGrading(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))

  const submitGrade = async (sub: any) => {
    const g = grading[sub.id]
    if (!g) return
    setGrading(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], saving: true } }))
    try {
      await api.assignments.grade(sub.assignment.id, {
        submissionId: sub.id,
        score: g.score,
        feedback: g.feedback,
      })
      setGrading(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], saving: false, done: true } }))
      setItems(prev => prev.filter(s => s.id !== sub.id))
    } catch {
      setGrading(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], saving: false } }))
    }
  }

  const requestRevision = async (sub: any) => {
    const g = grading[sub.id]
    setGrading(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], saving: true } }))
    try {
      await api.assignments.grade(sub.assignment.id, {
        submissionId: sub.id,
        score: g?.score ?? 0,
        feedback: g?.feedback ?? '',
      })
      setItems(prev => prev.filter(s => s.id !== sub.id))
    } catch {
      setGrading(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], saving: false } }))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Review Queue</h1>
          <p className="text-stone-500 text-sm mt-1">Student submissions waiting for your feedback.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
            <CheckCircle size={36} className="text-green-300 mx-auto mb-3"/>
            <p className="text-stone-600 font-medium">Queue is clear!</p>
            <p className="text-stone-400 text-sm mt-1">All submissions have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((sub: any) => {
              const g = grading[sub.id] ?? { score: 8, feedback: '', saving: false, done: false }
              return (
                <div key={sub.id} className="bg-white border-2 border-blue-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">NEW SUBMISSION</span>
                      </div>
                      <h3 className="font-serif font-semibold text-stone-800">{sub.assignment?.title}</h3>
                      <p className="text-stone-400 text-sm">
                        {sub.assignment?.raga ? `${sub.assignment.raga} · ` : ''}by {sub.student?.displayName ?? 'Student'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-400 flex-shrink-0">
                      <Clock size={11}/> {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'recently'}
                    </div>
                  </div>

                  {sub.notes && (
                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 mb-4 text-sm text-stone-600">
                      <p className="text-xs text-stone-400 font-semibold mb-1">Student note:</p>
                      {sub.notes}
                    </div>
                  )}

                  {sub.recordingUrl && (
                    <div className="mb-4">
                      <a href={sub.recordingUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors">
                        🎵 Listen to recording
                      </a>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Score (0–10)</label>
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={10} value={g.score}
                          onChange={e => setField(sub.id, 'score', Number(e.target.value))}
                          className="flex-1 accent-amber-600"/>
                        <span className="w-6 text-center text-sm font-bold text-amber-700">{g.score}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Feedback</label>
                      <input value={g.feedback} onChange={e => setField(sub.id, 'feedback', e.target.value)}
                        placeholder="Your feedback…"
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:border-amber-400 focus:outline-none"/>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => submitGrade(sub)} disabled={g.saving}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
                      {g.saving ? <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/></> : <CheckCircle size={13}/>}
                      Submit Grade
                    </button>
                    <button onClick={() => requestRevision(sub)} disabled={g.saving}
                      className="border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors hover:border-stone-300">
                      Request Re-submission
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
