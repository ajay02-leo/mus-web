'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { BookOpen, Plus, Users, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-50 text-green-700',
  INTERMEDIATE: 'bg-amber-50 text-amber-700',
  ADVANCED: 'bg-red-50 text-red-700',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  APPROVED:       { label: 'Approved',       color: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle },
  REJECTED:       { label: 'Rejected',       color: 'bg-red-50 text-red-700 border-red-200',         icon: XCircle },
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoad]    = useState(true)
  const [adding, setAdding]   = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm]       = useState({ title: '', description: '', raga: '', level: 'BEGINNER', price: 0 })

  useEffect(() => {
    api.courses.my()
      .then(d => setCourses(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoad(false))
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setSaving(true); setError(''); setSuccess(false)
    try {
      const course = await api.courses.create({
        title: form.title,
        description: form.description,
        ragas: form.raga ? [form.raga] : [],
        level: form.level,
        price: form.price,
      })
      setCourses(p => [course, ...p])
      setForm({ title: '', description: '', raga: '', level: 'BEGINNER', price: 0 })
      setAdding(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create course')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    await api.courses.delete(id).catch(() => {})
    setCourses(p => p.filter(c => c.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">My Courses</h1>
            <p className="text-stone-500 text-sm mt-1">Create courses — admin reviews before publishing to students.</p>
          </div>
          <button onClick={() => { setAdding(!adding); setError(''); setSuccess(false) }}
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0">
            <Plus size={16}/> New Course
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
            <CheckCircle size={16} className="text-green-600 flex-shrink-0"/>
            Course submitted for admin review. It will appear in the marketplace once approved.
          </div>
        )}

        {adding && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-800 mb-1">New Course</h3>
            <p className="text-xs text-stone-500 mb-4">Your course will be reviewed by admin before going live.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Course Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Introduction to Carnatic Vocal"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Raga Focus</label>
                <input value={form.raga} onChange={e => setForm(p => ({ ...p, raga: e.target.value }))}
                  placeholder="e.g. Multiple / Shankarabharanam"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Level</label>
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white">
                  {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Price (₹)</label>
                <input type="number" value={form.price} min={0}
                  onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What will students learn in this course?"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white resize-none"/>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreate} disabled={saving || !form.title.trim()}
                className="bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                {saving ? 'Submitting…' : 'Submit for Review'}
              </button>
              <button onClick={() => { setAdding(false); setError('') }}
                className="border border-stone-200 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
            <BookOpen size={36} className="text-stone-200 mx-auto mb-3"/>
            <p className="text-stone-500">No courses yet</p>
            <p className="text-stone-400 text-sm mt-1">Create a course — once approved by admin, students can enroll.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c: any) => {
              const st = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.PENDING_REVIEW
              const StatusIcon = st.icon
              return (
                <div key={c.id} className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden hover:border-amber-200 transition-colors group">
                  <div className="bg-gradient-to-br from-amber-900 to-stone-900 p-5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${LEVEL_COLORS[c.level] ?? ''}`}>
                        {c.level}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold border ${st.color}`}>
                        <StatusIcon size={10}/> {st.label}
                      </span>
                    </div>
                    <h3 className="font-serif font-semibold text-white leading-tight">{c.title}</h3>
                    {c.ragas?.length > 0 && <p className="text-amber-400/70 text-xs mt-1">{c.ragas[0]}</p>}
                  </div>
                  <div className="p-4">
                    {c.description && (
                      <p className="text-stone-500 text-xs leading-relaxed mb-3 line-clamp-2">{c.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-stone-400">
                        <Users size={11}/> {c._count?.enrollments ?? 0} enrolled
                      </span>
                      <span className="font-bold text-amber-700 text-sm">₹{(c.price ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    {c.status === 'REJECTED' && (
                      <p className="text-xs text-red-500 mt-2">Rejected by admin. Edit and resubmit.</p>
                    )}
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(c.id)}
                        className="w-9 flex items-center justify-center border border-stone-200 hover:border-red-200 text-stone-300 hover:text-red-400 rounded-xl transition-colors py-2">
                        <Trash2 size={13}/>
                      </button>
                    </div>
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
