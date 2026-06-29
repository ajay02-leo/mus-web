'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Music, Star } from 'lucide-react'

const RAGAS = [
  { name: 'Kalyani',          melakarta: 65, arohana: 'S R2 G3 M2 P D2 N3 S', avarohana: 'S N3 D2 P M2 G3 R2 S', mood: 'Devotion', time: 'Evening', popular: true },
  { name: 'Shankarabharanam', melakarta: 29, arohana: 'S R2 G3 M1 P D2 N3 S', avarohana: 'S N3 D2 P M1 G3 R2 S', mood: 'Serenity',  time: 'Morning', popular: true },
  { name: 'Todi',             melakarta: 8,  arohana: 'S R1 G2 M1 P D1 N2 S', avarohana: 'S N2 D1 P M1 G2 R1 S', mood: 'Pathos',    time: 'Morning', popular: true },
  { name: 'Bhairavi',         melakarta: 20, arohana: 'S R1 G2 M1 P D1 N2 S', avarohana: 'S N2 D1 P M1 G2 R1 S', mood: 'Sadness',   time: 'Any',     popular: false },
  { name: 'Hamsadhvani',      melakarta: null, arohana: 'S R2 G3 P N3 S',     avarohana: 'S N3 P G3 R2 S',       mood: 'Joy',       time: 'Evening', popular: true },
  { name: 'Kambhoji',         melakarta: 28, arohana: 'S R2 G3 M1 P D2 S',    avarohana: 'S N2 D2 P M1 G3 R2 S', mood: 'Valour',    time: 'Afternoon', popular: false },
  { name: 'Varali',           melakarta: 39, arohana: 'S R1 G2 M2 P D1 N2 S', avarohana: 'S N2 D1 P M2 G2 R1 S', mood: 'Devotion',  time: 'Night',   popular: false },
  { name: 'Mohanam',          melakarta: null, arohana: 'S R2 G3 P D2 S',     avarohana: 'S D2 P G3 R2 S',       mood: 'Love',      time: 'Evening', popular: true },
]

export default function RagaPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof RAGAS[0] | null>(RAGAS[0])

  const filtered = RAGAS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Raga Explorer</h1>
          <p className="text-stone-500 text-sm mt-1">Study the theory and svaras of Carnatic ragas.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* List */}
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ragas…"
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"/>
              </div>
            </div>
            <div className="divide-y divide-stone-50 max-h-96 overflow-y-auto">
              {filtered.map(r => (
                <button key={r.name} onClick={() => setSelected(r)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-amber-50 transition-colors ${selected?.name === r.name ? 'bg-amber-50 border-l-2 border-amber-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800 text-sm">{r.name}</p>
                      {r.melakarta && <p className="text-xs text-stone-400">Melakarta #{r.melakarta}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {r.popular && <Star size={12} className="text-amber-500" fill="currentColor"/>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gradient-to-br from-amber-900 to-stone-900 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-amber-400">{selected.name}</h2>
                    {selected.melakarta && <p className="text-amber-300/60 text-sm">Melakarta #{selected.melakarta}</p>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-amber-800/40 border border-amber-700/40 text-amber-300 text-xs px-2.5 py-1 rounded-full">{selected.mood}</span>
                    <span className="bg-amber-800/40 border border-amber-700/40 text-amber-300 text-xs px-2.5 py-1 rounded-full">{selected.time}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-amber-200/60 text-xs font-semibold uppercase tracking-wider mb-1">Arohana</p>
                    <p className="font-mono text-amber-100 text-base tracking-wider">{selected.arohana}</p>
                  </div>
                  <div>
                    <p className="text-amber-200/60 text-xs font-semibold uppercase tracking-wider mb-1">Avarohana</p>
                    <p className="font-mono text-amber-100 text-base tracking-wider">{selected.avarohana}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Music size={16} className="text-amber-600"/>
                  <h3 className="font-semibold text-stone-800">Svara Grid</h3>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['S','R','G','M','P','D','N'].map((s, i) => {
                    const present = selected.arohana.includes(s)
                    return (
                      <div key={s} className={`p-3 rounded-xl text-center text-sm font-bold transition-colors ${present ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-stone-50 text-stone-300'}`}>
                        {s}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-3">Practice Tips</h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Sing the arohana slowly first, focusing on each svara's exact pitch.</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Listen to recordings of this raga by masters before practicing.</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Practice at the recommended time of day for best tonal quality.</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Use the Pitch Lab to verify your shruti accuracy while singing.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}