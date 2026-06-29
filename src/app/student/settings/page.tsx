'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Bell, Shield } from 'lucide-react'

export default function StudentSettings() {
  const [notifs, setNotifs]   = useState({ assignments: true, sessions: true, reminders: true, marketing: false })
  const [privacy, setPrivacy] = useState({ profile: 'students', progress: 'teacher' })
  const [saved, setSaved]     = useState(false)
  const [loading, setLoad]    = useState(true)

  useEffect(() => {
    api.settings.get().then((s: any) => {
      if (s) {
        setNotifs({
          assignments: s.notifAssignments ?? true,
          sessions:    s.notifSessions ?? true,
          reminders:   s.notifReminders ?? true,
          marketing:   s.notifMarketing ?? false,
        })
        setPrivacy({
          profile:  s.profileVisibility ?? 'students',
          progress: s.progressVisibility ?? 'teacher',
        })
      }
    }).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const save = async () => {
    await api.settings.update({
      notifAssignments:   notifs.assignments,
      notifSessions:      notifs.sessions,
      notifReminders:     notifs.reminders,
      notifMarketing:     notifs.marketing,
      profileVisibility:  privacy.profile,
      progressVisibility: privacy.progress,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (key: keyof typeof notifs) => {
    setNotifs(p => ({ ...p, [key]: !p[key] }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Settings</h1>
            <p className="text-stone-500 text-sm mt-1">Manage your account preferences.</p>
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
              { key: 'assignments' as const, label: 'New assignments', desc: 'When your teacher assigns new practice pieces' },
              { key: 'sessions' as const,    label: 'Upcoming sessions', desc: 'Reminders before your scheduled classes' },
              { key: 'reminders' as const,   label: 'Practice reminders', desc: 'Daily practice streak reminders' },
              { key: 'marketing' as const,   label: 'News & updates', desc: 'Platform updates and new features' },
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

        {/* Privacy */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-amber-600"/>
            <h2 className="font-serif font-semibold text-stone-800">Privacy</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'profile' as const,  label: 'Profile visibility', opts: ['public', 'students', 'teacher', 'private'] },
              { key: 'progress' as const, label: 'Progress visibility', opts: ['public', 'teacher', 'private'] },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-stone-800">{s.label}</p>
                <select value={privacy[s.key]} onChange={e => setPrivacy(p => ({ ...p, [s.key]: e.target.value }))}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none capitalize">
                  {s.opts.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
                </select>
              </div>
            ))}
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
