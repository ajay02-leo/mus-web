'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Play, Pause, Upload, BarChart2 } from 'lucide-react'

export default function RecordingCompare() {
  const [playing, setPlaying] = useState<'teacher'|'student'|null>(null)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Recording Compare</h1>
          <p className="text-stone-500 text-sm mt-1">Compare your recording side-by-side with your teacher&apos;s reference.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Teacher reference */}
          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full"/>
              <h2 className="font-semibold text-stone-800">Teacher&apos;s Reference</h2>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-100 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-stone-700 mb-0.5">Sarali Varisai — Set 1</p>
              <p className="text-xs text-stone-400">Raga: General · Duration: 2:30</p>
            </div>
            {/* Waveform placeholder */}
            <div className="h-20 bg-stone-100 rounded-xl flex items-center justify-center gap-0.5 overflow-hidden px-4">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="w-1.5 bg-amber-400/60 rounded-full flex-shrink-0" style={{ height: `${20 + Math.sin(i * 0.4) * 20 + Math.random() * 15}px` }}/>
              ))}
            </div>
            <button onClick={() => setPlaying(playing === 'teacher' ? null : 'teacher')}
              className="mt-3 flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              {playing === 'teacher' ? <><Pause size={14}/> Pause</> : <><Play size={14}/> Play</>}
            </button>
          </div>

          {/* Your recording */}
          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-stone-400 rounded-full"/>
              <h2 className="font-semibold text-stone-800">Your Recording</h2>
            </div>
            <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center mb-4">
              <Upload size={28} className="text-stone-300 mx-auto mb-2"/>
              <p className="text-sm text-stone-400">Upload your recording</p>
              <p className="text-xs text-stone-300 mt-1">MP3, M4A, WAV up to 20MB</p>
              <button className="mt-3 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors">Browse files</button>
            </div>
            <div className="h-20 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-300">Upload a recording to see waveform</div>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={18} className="text-amber-600"/>
            <h2 className="font-semibold text-stone-800">Pitch Analysis</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Pitch Accuracy', value: '—', sub: 'Upload recording' },
              { label: 'Rhythm Match',   value: '—', sub: 'Upload recording' },
              { label: 'Tempo Variance', value: '—', sub: 'Upload recording' },
            ].map(m => (
              <div key={m.label} className="bg-stone-50 rounded-xl p-4">
                <p className="text-2xl font-serif font-bold text-stone-300">{m.value}</p>
                <p className="text-xs font-semibold text-stone-600 mt-1">{m.label}</p>
                <p className="text-xs text-stone-400 mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}