'use client'
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react'

const TALAS = [
  { name: 'Adi Tala',    beats: 8,  pattern: [1,0,0,0,1,0,1,0] },
  { name: 'Rupaka Tala', beats: 3,  pattern: [1,0,0] },
  { name: 'Misra Chapu', beats: 7,  pattern: [1,0,1,0,0,1,0] },
  { name: 'Khanda Chapu',beats: 5,  pattern: [1,0,1,0,0] },
  { name: 'Tisra Triputa',beats: 7, pattern: [1,0,0,1,0,1,0] },
]

const TEMPOS = [40, 60, 80, 100, 120, 160]

export default function TalaKeeper() {
  const [playing, setPlaying]   = useState(false)
  const [tala, setTala]         = useState(TALAS[0])
  const [bpm, setBpm]           = useState(60)
  const [beat, setBeat]         = useState(-1)
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (playing) {
      const ms = (60 / bpm) * 1000
      let b = 0
      intervalRef.current = setInterval(() => {
        setBeat(b % tala.beats)
        b++
      }, ms)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setBeat(-1)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, bpm, tala])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Tala Keeper</h1>
          <p className="text-stone-500 text-sm mt-1">Interactive rhythm trainer — practice with the correct beat cycle.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Tala selector */}
          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif font-semibold text-stone-800 mb-4">Select Tala</h2>
            <div className="space-y-2">
              {TALAS.map(t => (
                <button key={t.name} onClick={() => { setTala(t); setPlaying(false) }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                    tala.name === t.name ? 'bg-amber-50 border-2 border-amber-400 text-amber-800' : 'border border-stone-100 hover:border-stone-200 text-stone-700'
                  }`}>
                  <span className="font-medium text-sm">{t.name}</span>
                  <span className="text-xs text-stone-400">{t.beats} beats</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visualizer + controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-stone-900 to-amber-950 rounded-2xl p-6">
              <div className="text-center mb-6">
                <p className="text-amber-300/60 text-xs uppercase tracking-widest mb-1">Now Playing</p>
                <p className="font-serif text-2xl font-bold text-white">{tala.name}</p>
                <p className="text-amber-400/60 text-sm">{bpm} BPM · {tala.beats} beats</p>
              </div>

              {/* Beat indicators */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {tala.pattern.map((isStrong, i) => (
                  <div key={i} className={`flex items-center justify-center rounded-full font-bold text-sm transition-all duration-100 ${
                    beat === i
                      ? (isStrong ? 'w-12 h-12 bg-amber-400 text-amber-900 shadow-[0_0_20px_rgba(217,119,6,0.6)] scale-110' : 'w-10 h-10 bg-amber-700 text-white scale-105')
                      : (isStrong ? 'w-10 h-10 border-2 border-amber-600 text-amber-500' : 'w-8 h-8 border border-stone-700 text-stone-500')
                  }`}>
                    {i + 1}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-8">
                <button onClick={() => { setPlaying(false); setBeat(-1) }}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <RotateCcw size={16}/>
                </button>
                <button onClick={() => setPlaying(!playing)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg transition-all ${
                    playing ? 'bg-red-500 hover:bg-red-400' : 'bg-amber-700 hover:bg-amber-600'
                  }`}>
                  {playing ? <Pause size={24}/> : <Play size={24} className="translate-x-0.5"/>}
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <Volume2 size={16}/>
                </button>
              </div>
            </div>

            {/* Tempo */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Tempo</h3>
                <span className="font-bold text-amber-700">{bpm} BPM</span>
              </div>
              <input type="range" min={40} max={200} value={bpm} onChange={e => setBpm(Number(e.target.value))}
                className="w-full accent-amber-600 h-2"/>
              <div className="flex justify-between mt-3 gap-2 flex-wrap">
                {TEMPOS.map(t => (
                  <button key={t} onClick={() => setBpm(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${bpm === t ? 'bg-amber-100 text-amber-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}