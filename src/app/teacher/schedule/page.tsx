'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Calendar, Plus, Clock, Video, Trash2 } from 'lucide-react'

export default function TeacherSchedule() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoad]      = useState(true)
  const [adding, setAdding]     = useState(false)
  const [schedErr, setSchedErr] = useState('')
  const [form, setForm]         = useState({ title: '', scheduledAt: '', duration: 60, meetingUrl: '' })

  useEffect(() => {
    api.sessions.list().then(d => setSessions(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const upcoming = sessions.filter((s: any) => s.status === 'SCHEDULED')
  const past      = sessions.filter((s: any) => s.status === 'COMPLETED')

  const handleSchedule = async () => {
    if (!form.scheduledAt) return
    setSchedErr('')
    try {
      const session = await api.sessions.create({ title: form.title || undefined, scheduledAt: form.scheduledAt, duration: form.duration, meetingUrl: form.meetingUrl || undefined })
      setSessions(p => [...p, session])
      setForm({ title: '', scheduledAt: '', duration: 60, meetingUrl: '' })
      setAdding(false)
    } catch (e: any) { setSchedErr(e?.message ?? 'Failed to schedule. Are you logged in as a teacher?') }
  }

  const handleDelete = async (id: string) => {
    await api.sessions.delete(id).catch(() => {})
    setSessions(p => p.filter(s => s.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Schedule</h1>
            <p className="text-stone-500 text-sm mt-1">Manage your teaching sessions.</p>
          </div>
          <button onClick={() => setAdding(!adding)} className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0">
            <Plus size={16}/> New Session
          </button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-800 mb-4">Schedule New Session</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Title / Topic</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Kalyani Alapana"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Date & Time</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Duration (minutes)</label>
                <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white">
                  {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Meeting URL (optional)</label>
                <input value={form.meetingUrl} onChange={e => setForm(p => ({ ...p, meetingUrl: e.target.value }))} placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
            </div>
            {schedErr && <p className="text-red-500 text-xs mt-2">{schedErr}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={handleSchedule} disabled={!form.scheduledAt} className="bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">Schedule</button>
              <button onClick={() => { setAdding(false); setSchedErr('') }} className="border border-stone-200 hover:border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
            {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
            : upcoming.length === 0 ? <div className="bg-white border border-stone-100 rounded-2xl p-8 text-center text-stone-400 text-sm shadow-sm">No upcoming sessions.</div>
            : (
              <div className="space-y-3">
                {upcoming.map((s: any) => (
                  <div key={s.id} className="bg-white border border-stone-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={22} className="text-amber-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800">{s.title ?? 'Carnatic Session'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                        <span className="flex items-center gap-1"><Clock size={11}/> {s.duration ?? 60} min</span>
                        {s.meetingUrl && <span className="flex items-center gap-1"><Video size={11}/> Online</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-stone-900">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</p>
                      <p className="text-xs text-stone-400">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </div>
                    <button onClick={() => handleDelete(s.id)} className="text-stone-300 hover:text-red-400 transition-colors p-1.5">
                      <Trash2 size={15}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Past Sessions ({past.length})</h2>
            {past.length === 0 ? <div className="text-stone-400 text-sm">No past sessions.</div> : (
              <div className="space-y-2">
                {past.map((s: any) => (
                  <div key={s.id} className="bg-stone-50 border border-stone-100 rounded-xl px-5 py-3 flex items-center gap-4 opacity-70">
                    <Calendar size={16} className="text-stone-400 flex-shrink-0"/>
                    <p className="text-sm text-stone-700 flex-1">{s.title ?? 'Session'}</p>
                    <p className="text-xs text-stone-400">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString() : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}