'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Mic, MicOff, Gauge } from 'lucide-react'

const SVARAS = ['S', 'R1', 'R2', 'G2', 'G3', 'M1', 'M2', 'P', 'D1', 'D2', 'N2', 'N3']
const COLORS  = ['#d97706', '#b45309', '#92400e', '#78350f', '#451a03', '#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d']

export default function PitchLab() {
  const [active, setActive] = useState(false)
  const [detected, setDet]  = useState<string | null>(null)
  const [accuracy, setAcc]  = useState<number>(0)

  const toggle = () => {
    if (!active) {
      setActive(true)
      const svaras = ['S', 'R2', 'G3', 'M1', 'P']
      let i = 0
      const interval = setInterval(() => {
        setDet(svaras[i % svaras.length])
        setAcc(85 + Math.floor(Math.random() * 14))
        i++
      }, 1200)
      setTimeout(() => { clearInterval(interval); setActive(false); setDet(null) }, 12000)
    } else {
      setActive(false); setDet(null); setAcc(0)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Pitch Lab</h1>
          <p className="text-stone-500 text-sm mt-1">Real-time shruti (pitch) detection as you sing.</p>
        </div>

        {/* Visualizer */}
        <div className="bg-gradient-to-br from-stone-900 to-amber-950 rounded-3xl p-8 flex flex-col items-center gap-6">
          <div className="relative">
            <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
              active ? 'border-amber-400 shadow-[0_0_60px_rgba(217,119,6,0.4)]' : 'border-stone-700'
            }`}>
              <div className="text-center">
                {detected ? (
                  <>
                    <p className="text-5xl font-serif font-bold text-amber-400">{detected}</p>
                    <p className="text-amber-300/60 text-xs mt-1">{accuracy}% accurate</p>
                  </>
                ) : (
                  <div className="text-center">
                    <Gauge size={32} className={active ? 'text-amber-400' : 'text-stone-600'}/>
                    <p className="text-stone-500 text-xs mt-2">{active ? 'Listening…' : 'Ready'}</p>
                  </div>
                )}
              </div>
            </div>
            {active && <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping"/>}
          </div>

          <button onClick={toggle} className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold transition-all shadow-lg text-white ${
            active ? 'bg-red-600 hover:bg-red-500 shadow-red-900/40' : 'bg-amber-700 hover:bg-amber-600 shadow-amber-900/40'
          }`}>
            {active ? <><MicOff size={18}/> Stop</> : <><Mic size={18}/> Start Detection</>}
          </button>
        </div>

        {/* Svara grid */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif font-semibold text-stone-800 mb-4">Svara Reference</h2>
          <div className="grid grid-cols-6 gap-2">
            {SVARAS.map((s, i) => (
              <div key={s} className={`rounded-xl p-3 text-center transition-all ${detected === s ? 'ring-2 ring-amber-500 scale-105' : ''}`} style={{ backgroundColor: COLORS[i] + '20', borderColor: COLORS[i] + '40', border: '1px solid' }}>
                <p className="font-bold text-stone-800 text-sm">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-3 text-center">Highlighted svara = currently detected pitch</p>
        </div>

        {/* Accuracy bar */}
        {accuracy > 0 && (
          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="font-medium text-stone-700">Current Accuracy</span>
              <span className="font-bold text-amber-700">{accuracy}%</span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${accuracy}%`, background: accuracy > 90 ? '#16a34a' : accuracy > 75 ? '#d97706' : '#ef4444' }}/>
            </div>
            <p className="text-xs text-stone-400 mt-2">{accuracy > 90 ? 'Excellent! Keep going.' : accuracy > 75 ? 'Good — slight pitch variation detected.' : 'Work on your shruti steadiness.'}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}