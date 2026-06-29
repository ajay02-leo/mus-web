'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { User, Phone, MapPin, Music, Star, Save } from 'lucide-react'

const INSTRUMENTS = ['Carnatic Vocal', 'Veena', 'Violin', 'Flute', 'Mridangam', 'Ghatam', 'Kanjira']

export default function TeacherProfile() {
  const { user } = useAuth()
  const [name, setName]     = useState('')
  const [bio, setBio]       = useState('')
  const [phone, setPhone]   = useState('')
  const [city, setCity]     = useState('')
  const [specialty, setSpec] = useState('Carnatic Vocal')
  const [rate, setRate]     = useState(800)
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.teachers.getMyProfile()
      .then((profile: any) => {
        setName(profile.displayName ?? '')
        setBio(profile.bio ?? '')
        setSpec(profile.specialization?.[0] ?? 'Carnatic Vocal')
        setRate(profile.hourlyRate ?? 800)
      })
      .catch(() => {
        if (user?.teacher) {
          setName(user.teacher.displayName ?? '')
          setBio(user.teacher.bio ?? '')
          setSpec(user.teacher.specialization?.[0] ?? 'Carnatic Vocal')
          setRate(user.teacher.hourlyRate ?? 800)
        }
      })
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.teachers.updateMyProfile({
        displayName: name,
        bio,
        specialization: [specialty],
        hourlyRate: rate,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Failed to save')
    }
    setSaving(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Teacher Profile</h1>
          <p className="text-stone-500 text-sm mt-1">Your public teacher profile seen by students.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar + preview */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-3xl font-serif">
                {(name || user?.teacher?.displayName || '?')[0]?.toUpperCase()}
              </div>
              <div className="text-center">
                <p className="font-serif font-semibold text-stone-900 text-lg">{name || user?.teacher?.displayName}</p>
                <p className="text-stone-400 text-sm">{user?.email}</p>
                <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-semibold">Teacher</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900 to-stone-900 rounded-2xl p-5 text-white">
              <p className="text-amber-300/60 text-xs uppercase tracking-widest mb-2">Profile Preview</p>
              <h3 className="font-serif font-bold text-lg">{name || user?.teacher?.displayName}</h3>
              <p className="text-amber-400/70 text-sm">{specialty}</p>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className="text-amber-400" fill="#d97706"/>)}
                <span className="text-amber-300/60 text-xs ml-1">New teacher</span>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="bg-amber-800/40 border border-amber-700/40 text-amber-300 px-2 py-0.5 rounded-full">₹{rate}/hr</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><User size={13}/> Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><Music size={13}/> Specialty</label>
                  <select value={specialty} onChange={e => setSpec(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none">
                    {INSTRUMENTS.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Hourly Rate (₹)</label>
                  <input type="number" min={0} value={rate} onChange={e => setRate(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5"><MapPin size={13}/> City</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Chennai"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none transition-all"/>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Bio</label>
                  <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
                    placeholder="Tell students about your musical journey, training lineage, and teaching style…"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none resize-none transition-all"/>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${saved ? 'bg-green-600 text-white' : 'bg-amber-700 hover:bg-amber-600 text-white'}`}>
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Save size={15}/>}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
