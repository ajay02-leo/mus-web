'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Bell, Shield, CreditCard } from 'lucide-react'

export default function TeacherSettings() {
  const [notifs, setNotifs]     = useState({ newStudents: true, submissions: true, sessions: true, payments: true })
  const [autoAccept, setAutoAcc] = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    api.settings.get().then((s: any) => {
      if (s) {
        setNotifs({
          newStudents: s.notifNewStudents ?? true,
          submissions: s.notifSubmissions ?? true,
          sessions:    s.notifSessions ?? true,
          payments:    s.notifPayments ?? true,
        })
        setAutoAcc(s.autoAcceptEnroll ?? false)
      }
    }).catch(() => {})
  }, [])

  const save = async () => {
    await api.settings.update({
      notifNewStudents: notifs.newStudents,
      notifSubmissions: notifs.submissions,
      notifSessions:    notifs.sessions,
      notifPayments:    notifs.payments,
      autoAcceptEnroll: autoAccept,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (key: keyof typeof notifs) =>
    setNotifs(p => ({ ...p, [key]: !p[key] }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Settings</h1>
            <p className="text-stone-500 text-sm mt-1">Manage your teaching preferences.</p>
          </div>
          <button onClick={save}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-amber-700 hover:bg-amber-600 text-white'}`}>
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} className="text-amber-600"/>
            <h2 className="font-serif font-semibold text-stone-800">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'newStudents' as const, label: 'New student enrollments', desc: 'When a student joins your course' },
              { key: 'submissions' as const, label: 'Assignment submissions', desc: 'When a student submits an assignment' },
              { key: 'sessions' as const,    label: 'Session reminders', desc: 'Before your scheduled sessions' },
              { key: 'payments' as const,    label: 'Payment notifications', desc: 'When you receive a payment' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-stone-800">{n.label}</p>
                  <p className="text-xs text-stone-400">{n.desc}</p>
                </div>
                <button onClick={() => toggle(n.key)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${notifs[n.key] ? 'bg-amber-600' : 'bg-stone-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[n.key] ? 'translate-x-5' : 'translate-x-0'}`}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching preferences */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={18} className="text-amber-600"/>
            <h2 className="font-serif font-semibold text-stone-800">Teaching Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone-800">Auto-accept student enrollments</p>
                <p className="text-xs text-stone-400">Automatically accept new students without manual approval</p>
              </div>
              <button onClick={() => setAutoAcc(!autoAccept)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${autoAccept ? 'bg-amber-600' : 'bg-stone-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${autoAccept ? 'translate-x-5' : 'translate-x-0'}`}/>
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-red-500"/>
            <h2 className="font-serif font-semibold text-stone-800">Account</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 border border-stone-200 rounded-xl text-sm text-stone-700 hover:border-stone-300 transition-colors">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 border border-red-100 rounded-xl text-sm text-red-600 hover:border-red-200 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
