'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { User, Mail, Phone, MapPin, Music, Save } from 'lucide-react'

export default function StudentProfile() {
  const { user } = useAuth()
  const [name, setName]   = useState(user?.name ?? '')
  const [phone, setPhone] = useState('')
  const [city, setCity]   = useState('')
  const [level, setLevel] = useState('BEGINNER')
  const [instrument, setInst] = useState('Vocal')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.students.updateProfile({ displayName: name, level })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">My Profile</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your personal information.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar card */}
          <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-3xl font-serif">
              {user?.name?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className="text-center">
              <p className="font-serif font-semibold text-stone-900 text-lg">{user?.name}</p>
              <p className="text-stone-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-semibold">Student</span>
            </div>
            <button className="w-full border border-stone-200 hover:border-amber-300 text-stone-700 text-sm py-2.5 rounded-xl font-medium transition-colors">Change Photo</button>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><User size={13}/> Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><Mail size={13}/> Email</label>
                  <input value={user?.email ?? ''} disabled className="w-full px-4 py-3 border border-stone-100 rounded-xl text-sm bg-stone-50 text-stone-400"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><Phone size={13}/> Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><MapPin size={13}/> City</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Chennai" className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><Music size={13}/> Instrument</label>
                  <select value={instrument} onChange={e => setInst(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all">
                    {['Vocal', 'Veena', 'Violin', 'Flute', 'Mridangam', 'Ghatam'].map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all">
                    {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${saved ? 'bg-green-600 text-white' : 'bg-amber-700 hover:bg-amber-600 text-white'}`}>
                <Save size={15}/>{saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}