'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { FileText, Clock, CheckCircle, Upload, Star } from 'lucide-react'

export default function StudentAssignments() {
  const [items, setItems]     = useState<any[]>([])
  const [loading, setLoad]    = useState(true)
  const [selected, setSel]    = useState<any>(null)
  const [submitting, setSubmit] = useState<string | null>(null)

  useEffect(() => {
    api.assignments.list().then(d => setItems(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const handleSubmit = async (id: string) => {
    setSubmit(id)
    try {
      await api.assignments.submit(id, { notes: 'Submitted via app' })
      setItems(p => p.map(a => a.id === id ? { ...a, status: 'SUBMITTED' } : a))
    } catch { /* ignore */ } finally { setSubmit(null) }
  }

  const badge = (status: string) => {
    if (status === 'GRADED')    return 'bg-green-50 text-green-700'
    if (status === 'SUBMITTED') return 'bg-blue-50 text-blue-700'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Assignments</h1>
          <p className="text-stone-500 text-sm mt-1">Practice pieces assigned by your teacher.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {['All', 'Pending', 'Submitted', 'Graded'].map(f => (
            <button key={f} className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700 transition-colors first:bg-amber-700 first:text-white first:border-amber-700">
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center">
            <FileText size={36} className="text-stone-300 mx-auto mb-3"/>
            <p className="text-stone-500 font-medium">No assignments yet</p>
            <p className="text-stone-400 text-sm mt-1">Your teacher will assign practice pieces here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a: any) => (
              <div key={a.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:border-amber-200 transition-colors cursor-pointer" onClick={() => setSel(a)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold text-stone-800">{a.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge(a.status)}`}>{a.status}</span>
                    </div>
                    <p className="text-stone-400 text-sm mt-1">{a.raga} — {a.type}</p>
                    {a.description && <p className="text-stone-500 text-sm mt-2 line-clamp-2">{a.description}</p>}
                    {a.grade !== null && a.grade !== undefined && (
                      <div className="flex items-center gap-1 mt-2 text-amber-600">
                        <Star size={14} fill="currentColor"/>
                        <span className="text-sm font-bold">{a.grade}/10</span>
                        {a.feedback && <span className="text-stone-400 text-xs ml-1 truncate max-w-xs">— {a.feedback}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {a.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-stone-400 justify-end">
                        <Clock size={11}/>
                        <span>Due {new Date(a.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {a.status === 'PENDING' && (
                      <button onClick={e => { e.stopPropagation(); handleSubmit(a.id) }} disabled={submitting === a.id}
                        className="mt-2 inline-flex items-center gap-1 bg-amber-700 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-60">
                        {submitting === a.id ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/> : <Upload size={12}/>}
                        Submit
                      </button>
                    )}
                    {a.status === 'GRADED' && <CheckCircle size={18} className="text-green-500 mt-2 ml-auto"/>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}