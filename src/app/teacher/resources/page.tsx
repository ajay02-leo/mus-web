'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Library, Plus, Link2, FileText, Music, Video, Trash2 } from 'lucide-react'

const TYPE_ICONS: Record<string, any> = {
  PDF: FileText, AUDIO: Music, VIDEO: Video, LINK: Link2, OTHER: FileText,
}

export default function TeacherResources() {
  const [items, setItems]   = useState<any[]>([])
  const [loading, setLoad]  = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm]     = useState({ title: '', type: 'PDF', url: '', raga: '', description: '' })

  useEffect(() => {
    api.resources.list().then(d => setItems(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoad(false))
  }, [])

  const TYPE_COLORS: Record<string, string> = {
    PDF: 'bg-red-50 text-red-700', AUDIO: 'bg-amber-50 text-amber-700',
    VIDEO: 'bg-blue-50 text-blue-700', LINK: 'bg-green-50 text-green-700', OTHER: 'bg-stone-50 text-stone-700',
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Resources</h1>
            <p className="text-stone-500 text-sm mt-1">Share learning materials with your students.</p>
          </div>
          <button onClick={() => setAdding(!adding)} className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0">
            <Plus size={16}/> Add Resource
          </button>
        </div>

        {adding && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-800 mb-4">Add Resource</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Resource title"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white">
                  {['PDF', 'AUDIO', 'VIDEO', 'LINK', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Raga (optional)</label>
                <input value={form.raga} onChange={e => setForm(p => ({ ...p, raga: e.target.value }))} placeholder="e.g. Kalyani"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">URL / Link</label>
                <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://…"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white"/>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Add</button>
              <button onClick={() => setAdding(false)} className="border border-stone-200 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
            <Library size={36} className="text-stone-200 mx-auto mb-3"/>
            <p className="text-stone-500">No resources yet</p>
            <p className="text-stone-400 text-sm mt-1">Add PDF notes, audio recordings, or video links for your students.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((r: any) => {
              const Icon = TYPE_ICONS[r.type] ?? FileText
              return (
                <div key={r.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:border-amber-200 transition-colors group">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[r.type] ?? 'bg-stone-50 text-stone-700'}`}>
                      <Icon size={18}/>
                    </div>
                    <button className="text-stone-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 leading-tight">{r.title}</h3>
                  {r.raga && <p className="text-xs text-amber-600 font-medium">{r.raga}</p>}
                  {r.description && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{r.description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLORS[r.type] ?? ''}`}>{r.type}</span>
                    {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-600 text-xs font-medium transition-colors">Open →</a>}
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