'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'

const TALAS = [
  { name: 'Adi Tala',      beats: 8,  pattern: [1,0,0,0,1,0,1,0],   description: 'Most common tala — 4+2+2 structure' },
  { name: 'Rupaka Tala',   beats: 3,  pattern: [1,0,0],              description: '3-beat cycle — very common in devotional music' },
  { name: 'Misra Chapu',   beats: 7,  pattern: [1,0,1,0,0,1,0],     description: '7-beat cycle — 3+2+2 feel' },
  { name: 'Khanda Chapu',  beats: 5,  pattern: [1,0,1,0,0],         description: '5-beat cycle — 2+3 feel' },
  { name: 'Tisra Triputa', beats: 7,  pattern: [1,0,0,1,0,1,0],     description: '7-beat cycle — 3+2+2 variant' },
  { name: 'Sankeerna Jati',beats: 9,  pattern: [1,0,0,0,1,0,0,1,0], description: '9-beat cycle — complex tala' },
]

const SUBDIVISIONS = [
  { label: '1 (basic)', value: 1 },
  { label: '2 (duple)',  value: 2 },
  { label: '3 (tisra)',  value: 3 },
]

// Web Audio API click synthesiser
function makeClick(ctx: AudioContext, time: number, isStrong: boolean, isSub: boolean) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  if (isStrong) {
    osc.frequency.value = 880       // high pitch for beat 1
    gain.gain.setValueAtTime(0.9, time)
  } else if (isSub) {
    osc.frequency.value = 330       // mid for subdivisions
    gain.gain.setValueAtTime(0.3, time)
  } else {
    osc.frequency.value = 550       // mid for regular beats
    gain.gain.setValueAtTime(0.6, time)
  }

  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)
  osc.start(time)
  osc.stop(time + 0.1)
}

export default function TalaKeeper() {
  const [playing, setPlaying]     = useState(false)
  const [muted, setMuted]         = useState(false)
  const [tala, setTala]           = useState(TALAS[0])
  const [bpm, setBpm]             = useState(60)
  const [subdivision, setSub]     = useState(1)
  const [beat, setBeat]           = useState(-1)
  const [subBeat, setSubBeat]     = useState(-1)
  const [tapTimes, setTapTimes]   = useState<number[]>([])
  const [tapBpm, setTapBpm]       = useState<number | null>(null)

  const audioCtxRef  = useRef<AudioContext | null>(null)
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextRef      = useRef(0)     // next beat time (audioCtx.currentTime)
  const beatIdxRef   = useRef(0)     // which beat in the tala
  const subIdxRef    = useRef(0)     // which subdivision
  const mutedRef     = useRef(false)

  mutedRef.current = muted

  const stopScheduler = useCallback(() => {
    if (schedulerRef.current) clearInterval(schedulerRef.current)
    schedulerRef.current = null
    setBeat(-1)
    setSubBeat(-1)
    beatIdxRef.current = 0
    subIdxRef.current  = 0
  }, [])

  const startScheduler = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    nextRef.current    = ctx.currentTime + 0.05
    beatIdxRef.current = 0
    subIdxRef.current  = 0

    const beatSec   = 60 / bpm
    const subSec    = beatSec / subdivision
    const LOOKAHEAD = 0.1   // schedule 100ms ahead
    const INTERVAL  = 25    // check every 25ms

    schedulerRef.current = setInterval(() => {
      while (nextRef.current < ctx.currentTime + LOOKAHEAD) {
        const beatIdx  = beatIdxRef.current % tala.beats
        const isBeat   = subIdxRef.current === 0
        const isStrong = isBeat && tala.pattern[beatIdx] === 1
        const isSub    = !isBeat

        if (!mutedRef.current) {
          makeClick(ctx, nextRef.current, isStrong, isSub)
        }

        // Update visual on next animation frame
        const scheduledTime = nextRef.current
        const now = ctx.currentTime
        setTimeout(() => {
          if (isBeat) { setBeat(beatIdx); setSubBeat(-1) }
          else        { setSubBeat(subIdxRef.current) }
        }, (scheduledTime - now) * 1000)

        nextRef.current += subSec
        subIdxRef.current++
        if (subIdxRef.current >= subdivision) {
          subIdxRef.current = 0
          beatIdxRef.current++
        }
      }
    }, INTERVAL)
  }, [bpm, tala, subdivision])

  useEffect(() => {
    if (playing) {
      startScheduler()
    } else {
      stopScheduler()
    }
    return stopScheduler
  }, [playing, bpm, tala, subdivision, startScheduler, stopScheduler])

  // Tap tempo
  function handleTap() {
    const now = Date.now()
    setTapTimes(prev => {
      const times = [...prev, now].slice(-8)
      if (times.length >= 2) {
        const intervals = times.slice(1).map((t, i) => t - times[i])
        const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const detected = Math.round(60000 / avgMs)
        const clamped = Math.max(40, Math.min(200, detected))
        setTapBpm(clamped)
        setBpm(clamped)
      }
      return times
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Tala Keeper</h1>
          <p className="text-stone-500 text-sm mt-1">Interactive rhythm trainer with authentic beat sounds.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Tala selector */}
          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif font-semibold text-stone-800 mb-4">Select Tala</h2>
            <div className="space-y-2">
              {TALAS.map(t => (
                <button key={t.name} onClick={() => { setTala(t); setPlaying(false) }}
                  className={`w-full px-4 py-3 rounded-xl transition-all text-left ${
                    tala.name === t.name ? 'bg-amber-50 border-2 border-amber-400 text-amber-800' : 'border border-stone-100 hover:border-stone-200 text-stone-700'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{t.name}</span>
                    <span className="text-xs text-stone-400">{t.beats} beats</span>
                  </div>
                  {tala.name === t.name && <p className="text-xs text-amber-600 mt-0.5">{t.description}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Visualiser + controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-stone-900 to-amber-950 rounded-2xl p-6">
              <div className="text-center mb-6">
                <p className="text-amber-300/60 text-xs uppercase tracking-widest mb-1">Now Playing</p>
                <p className="font-serif text-2xl font-bold text-white">{tala.name}</p>
                <p className="text-amber-400/60 text-sm">{bpm} BPM · {tala.beats} beats {subdivision > 1 ? `· ÷${subdivision}` : ''}</p>
              </div>

              {/* Beat indicators */}
              <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
                {tala.pattern.map((isStrong, i) => {
                  const isActive = beat === i
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`flex items-center justify-center rounded-full font-bold text-sm transition-all duration-75 ${
                        isActive
                          ? isStrong ? 'w-12 h-12 bg-amber-400 text-amber-900 shadow-[0_0_20px_rgba(217,119,6,0.7)] scale-125'
                                     : 'w-10 h-10 bg-amber-700 text-white scale-110'
                          : isStrong ? 'w-10 h-10 border-2 border-amber-600 text-amber-500'
                                     : 'w-8 h-8 border border-stone-700 text-stone-500'
                      }`}>{i + 1}</div>
                      {/* Subdivision dots */}
                      {subdivision > 1 && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: subdivision - 1 }).map((_, si) => (
                            <div key={si} className={`w-1.5 h-1.5 rounded-full transition-all duration-75 ${
                              beat === i && subBeat === si + 1 ? 'bg-amber-400' : 'bg-stone-700'
                            }`}/>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setMuted(!muted)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  {muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                </button>
                <button onClick={() => { setPlaying(false); setBeat(-1); beatIdxRef.current = 0 }}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <RotateCcw size={16}/>
                </button>
                <button onClick={() => setPlaying(!playing)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg transition-all ${
                    playing ? 'bg-red-500 hover:bg-red-400' : 'bg-amber-700 hover:bg-amber-600'
                  }`}>
                  {playing ? <Pause size={24}/> : <Play size={24} className="translate-x-0.5"/>}
                </button>
              </div>
            </div>

            {/* Tempo + tap */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-stone-800">Tempo</h3>
                <div className="flex items-center gap-3">
                  {tapBpm && <span className="text-xs text-stone-400">Tap detected: {tapBpm} BPM</span>}
                  <span className="font-bold text-amber-700">{bpm} BPM</span>
                </div>
              </div>
              <input type="range" min={40} max={200} value={bpm} onChange={e => setBpm(Number(e.target.value))}
                className="w-full accent-amber-600 h-2"/>
              <div className="flex gap-2 mt-3 flex-wrap">
                {[40, 60, 80, 100, 120, 160].map(t => (
                  <button key={t} onClick={() => setBpm(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${bpm === t ? 'bg-amber-100 text-amber-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}>
                    {t}
                  </button>
                ))}
                <button onClick={handleTap}
                  className="ml-auto px-4 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-700 transition-colors active:scale-95">
                  TAP
                </button>
              </div>
            </div>

            {/* Subdivision */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-stone-800 mb-3">Subdivision (Kaalapramana)</h3>
              <div className="flex gap-2">
                {SUBDIVISIONS.map(s => (
                  <button key={s.value} onClick={() => setSub(s.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${subdivision === s.value ? 'bg-amber-700 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">
                {subdivision === 1 ? 'Basic: one click per beat' :
                 subdivision === 2 ? 'Duple: two clicks per beat (chatusra)' :
                                     'Triple: three clicks per beat (tisra)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
