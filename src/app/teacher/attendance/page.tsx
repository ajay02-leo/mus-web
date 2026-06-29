'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'

export default function TeacherAttendance() {
  const [sessions, setSessions]   = useState<any[]>([])
  const [students, setStudents]   = useState<any[]>([])
  const [loading, setLoad]        = useState(true)
  const [selectedSess, setSel]    = useState<string | null>(null)
  const [attendance, setAtt]      = useState<Record<string, 'PRESENT'|'ABSENT'|'LATE'>>({})
  const [saving, setSaving]       = useState(false)
  const [savedMsg, setSavedMsg]   = useState(false)

  useEffect(() => {
    Promise.all([api.sessions.list(), api.students.list()])
      .then(([s, st]) => { setSessions(s ?? []); setStudents(st ?? []) })
      .catch(() => {}).finally(() => setLoad(false))
  }, [])

  const mark = (studentId: string, status: 'PRESENT'|'ABSENT'|'LATE') =>
    setAtt(prev => ({ ...prev, [studentId]: status }))

  const saveAll = async () => {
    if (!selectedSess || !Object.keys(attendance).length) return
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(attendance).map(([studentId, status]) =>
          api.sessions.markAttendance(selectedSess, { studentId, status })
        )
      )
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    } catch {}
    setSaving(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Attendance</h1>
          <p className="text-stone-500 text-sm mt-1">Mark attendance for your sessions.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Session list */}
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800 text-sm">Sessions</h2>
            </div>
            {loading
              ? <div className="p-6 text-center"><div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"/></div>
              : sessions.length === 0
                ? <p className="p-4 text-stone-400 text-sm text-center">No sessions</p>
                : (
                  <div className="divide-y divide-stone-50">
                    {sessions.map((s: any) => (
                      <button key={s.id} onClick={() => { setSel(s.id); setAtt({}) }}
                        className={`w-full text-left px-4 py-3.5 hover:bg-amber-50 transition-colors ${selectedSess === s.id ? 'bg-amber-50 border-l-2 border-amber-500' : ''}`}>
                        <p className="text-sm font-medium text-stone-800">{s.title ?? s.course?.title ?? 'Session'}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString() : ''}</p>
                      </button>
                    ))}
                  </div>
                )
            }
          </div>

          {/* Attendance marking */}
          <div className="md:col-span-2 bg-white border border-stone-100 rounded-2xl shadow-sm">
            {!selectedSess ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm flex-col gap-2 p-12">
                <Users size={32} className="text-stone-200"/>
                <p>Select a session to mark attendance</p>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                  <h2 className="font-semibold text-stone-800">Mark Attendance</h2>
                  <button onClick={saveAll} disabled={saving || !Object.keys(attendance).length}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      savedMsg ? 'bg-green-600 text-white' : 'bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white'
                    }`}>
                    {saving ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/> : null}
                    {savedMsg ? '✓ Saved!' : 'Save All'}
                  </button>
                </div>
                <div className="divide-y divide-stone-50">
                  {students.map((s: any) => {
                    const status = attendance[s.id]
                    const name = s.displayName ?? s.name ?? 'Student'
                    return (
                      <div key={s.id} className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                            {name[0]?.toUpperCase() ?? 'S'}
                          </div>
                          <p className="text-sm font-medium text-stone-800">{name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {(['PRESENT', 'LATE', 'ABSENT'] as const).map(st => (
                            <button key={st} onClick={() => mark(s.id, st)}
                              className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                status === st
                                  ? st === 'PRESENT' ? 'bg-green-600 text-white' : st === 'LATE' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
                                  : 'border border-stone-200 text-stone-500 hover:border-stone-300'
                              }`}>
                              <span className="hidden sm:inline">
                                {st === 'PRESENT' ? <><CheckCircle size={11} className="inline mr-1"/>Present</> : st === 'LATE' ? <><Clock size={11} className="inline mr-1"/>Late</> : <><XCircle size={11} className="inline mr-1"/>Absent</>}
                              </span>
                              <span className="sm:hidden">
                                {st === 'PRESENT' ? '✓' : st === 'LATE' ? '~' : '✗'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {students.length === 0 && <p className="p-6 text-stone-400 text-sm text-center">No students enrolled.</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
