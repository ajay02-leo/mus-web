'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Calendar, Clock, Video, User } from 'lucide-react'

export default function StudentClasses() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    api.sessions.list().then(d => setSessions(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const upcoming = sessions.filter((s: any) => s.status === 'SCHEDULED')
  const past     = sessions.filter((s: any) => s.status === 'COMPLETED')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">My Classes</h1>
          <p className="text-stone-500 text-sm mt-1">Your upcoming and past sessions.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
              {upcoming.length === 0 ? (
                <div className="bg-white border border-stone-100 rounded-2xl p-8 text-center text-stone-400 text-sm">No upcoming classes. Your teacher will schedule sessions for you.</div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((s: any) => (
                    <div key={s.id} className="bg-white border border-stone-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Calendar size={18} className="text-amber-600"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-stone-800 text-sm sm:text-base">{s.title ?? 'Carnatic Class'}</h3>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-stone-900">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</p>
                              <p className="text-xs text-stone-400">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-stone-400 flex-wrap">
                            <span className="flex items-center gap-1"><User size={11}/> {s.teacher?.name ?? 'Teacher'}</span>
                            <span className="flex items-center gap-1"><Clock size={11}/> {s.duration ?? 60} min</span>
                            {s.meetingUrl && <span className="flex items-center gap-1 text-blue-500"><Video size={11}/> Online</span>}
                          </div>
                          {s.meetingUrl && (
                            <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors">
                              <Video size={12}/> Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Past Classes ({past.length})</h2>
              {past.length === 0 ? (
                <div className="bg-white border border-stone-100 rounded-2xl p-8 text-center text-stone-400 text-sm">No past classes yet.</div>
              ) : (
                <div className="space-y-2">
                  {past.map((s: any) => (
                    <div key={s.id} className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center gap-4 opacity-75">
                      <Calendar size={18} className="text-stone-400 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700">{s.title ?? 'Carnatic Class'}</p>
                        <p className="text-xs text-stone-400">{s.raga}</p>
                      </div>
                      <span className="text-xs text-stone-400">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}