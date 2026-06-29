'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { FileText, Plus, Star } from 'lucide-react'

export default function TeacherAssignments() {
  const [items, setItems]   = useState<any[]>([])
  const [loading, setLoad]  = useState(true)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')
  const [grading, setGrade] = useState<string | null>(null)
  const [score, setScore]   = useState(8)
  const [feedback, setFbk]  = useState('')
  const [form, setForm]     = useState({ title: '', raga: '', dueDate: '', instructions: '' })

  useEffect(() => {
    api.assignments.list().then(d => setItems(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setSaving(true); setFormErr('')
    try {
      const assignment = await api.assignments.create({ title: form.title, raga: form.raga, dueDate: form.dueDate || undefined, description: form.instructions })
      setItems(p => [assignment, ...p])
      setForm({ title: '', raga: '', dueDate: '', instructions: '' })
      setAdding(false)
    } catch (e: any) { setFormErr(e?.message ?? 'Failed to create. Are you logged in as a teacher?') } finally { setSaving(false) }
  }

  const handleGrade = async (assignmentId: string) => {
    const item = items.find(i => i.id === assignmentId)
    const submission = item?.submissions?.[0]
    if (!submission) return
    try {
      await api.assignments.grade(assignmentId, { submissionId: submission.id, score, feedback })
      setItems(p => p.map(i => i.id === assignmentId ? { ...i, status: 'GRADED', grade: score, submissions: [] } : i))
      setGrade(null)
    } catch { /* ignore */ }
  }

  const badge = (s: string) => {
    if (s === 'GRADED')    return 'bg-green-50 text-green-700'
    if (s === 'SUBMITTED') return 'bg-blue-50 text-blue-700 ring-2 ring-blue-200'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Assignments</h1>
            <p className="text-stone-500 text-sm mt-1">Create, review, and grade student assignments.</p>
          </div>
          <button onClick={() => setAdding(!adding)} className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0">
            <Plus size={16}/> New Assignment
          </button>
        </div>

        {adding && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-800 mb-4">Create Assignment</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Sarali Varisai — 3 sets" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Raga</label>
                <input value={form.raga} onChange={e => setForm(p => ({ ...p, raga: e.target.value }))} placeholder="e.g. Kalyani" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Instructions</label>
                <textarea rows={3} value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder="What should the student practice?" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white resize-none"/>
              </div>
            </div>
            {formErr && <p className="text-red-500 text-xs mt-2">{formErr}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreate} disabled={saving || !form.title.trim()} className="bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                {saving ? 'Creating…' : 'Create'}
              </button>
              <button onClick={() => { setAdding(false); setFormErr('') }} className="border border-stone-200 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
            <FileText size={36} className="text-stone-200 mx-auto mb-3"/>
            <p className="text-stone-500">No assignments yet</p>
            <p className="text-stone-400 text-sm mt-1">Create an assignment to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a: any) => (
              <div key={a.id} className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-serif font-semibold text-stone-800">{a.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge(a.status)}`}>{a.status}</span>
                    </div>
                    <p className="text-stone-400 text-sm">{a.raga}</p>
                    {a.grade !== null && a.grade !== undefined && (
                      <div className="flex items-center gap-1 mt-1.5 text-amber-600">
                        <Star size={13} fill="currentColor"/><span className="text-sm font-bold">{a.grade}/10</span>
                      </div>
                    )}
                  </div>
                  {a.status === 'SUBMITTED' && !grading && (
                    <button onClick={() => setGrade(a.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex-shrink-0">
                      Grade
                    </button>
                  )}
                </div>

                {grading === a.id && (
                  <div className="border-t border-stone-100 p-5 bg-blue-50">
                    <h4 className="font-semibold text-stone-800 mb-3 text-sm">Grade Submission</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Score (0–10)</label>
                        <div className="flex items-center gap-3">
                          <input type="range" min={0} max={10} value={score} onChange={e => setScore(Number(e.target.value))} className="flex-1 accent-amber-600"/>
                          <span className="font-bold text-amber-700 w-8 text-center">{score}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Feedback</label>
                        <input value={feedback} onChange={e => setFbk(e.target.value)} placeholder="Brief feedback for student"
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleGrade(a.id)} className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">Submit Grade</button>
                      <button onClick={() => setGrade(null)} className="border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}