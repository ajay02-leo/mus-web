'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Play, Mic, MicOff, Music, Clock, ChevronDown, ChevronUp, BookOpen, Lightbulb, Save, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const EXERCISES = [
  {
    id: 'sarali-1',
    title: 'Sarali Varisai 1',
    raga: 'Mayamalavagowla',
    duration: '5 min',
    level: 'Beginner',
    desc: 'Basic ascending-descending exercise covering all 7 svaras.',
    teacherNotes: [
      'Start with Sa fixed to your shruti box. Sa must feel like "home".',
      'Sing each svara with full resonance — do not rush. Slow is better than fast and wrong.',
      'Listen carefully to the 3rd (Ga) and 6th (Da) — these are unique to Mayamalavagowla.',
      'Keep your jaw relaxed. Tension in the jaw creates tension in the voice.',
      'Practice at least 3 full ascending-descending cycles without pause.',
    ],
    keyPoints: ['Sruti alignment on Sa', 'Pure Ga (E♭) & Da (A♭)', 'Even tempo throughout'],
  },
  {
    id: 'janta-varisai',
    title: 'Janta Varisai',
    raga: 'Mayamalavagowla',
    duration: '7 min',
    level: 'Beginner',
    desc: 'Double-note pattern exercises for consistent pitch repetition.',
    teacherNotes: [
      'Each svara is sung twice — both times must sound identical in pitch and volume.',
      'Common mistake: second note of the pair dips slightly. Stay conscious of this.',
      'Try clapping the tala softly while singing to develop rhythm awareness.',
      'Record yourself and listen back — your ear will catch what your mind misses.',
    ],
    keyPoints: ['Equal pitch on both notes of each pair', 'Maintain tala while singing', 'Record and self-evaluate'],
  },
  {
    id: 'datu-varisai',
    title: 'Datu Varisai',
    raga: 'General',
    duration: '8 min',
    level: 'Intermediate',
    desc: 'Skip-note patterns to build interval recognition and agility.',
    teacherNotes: [
      'Datu means "skip" — you jump over svaras. This is harder than stepwise movement.',
      'The key skill here is accuracy on landing. The skipped-to note must be in perfect sruti.',
      'Start very slow. Speed will come naturally once the intervals are internalized.',
      'These patterns also train your brain to think in terms of intervals, not just steps.',
    ],
    keyPoints: ['Accurate landing on skipped svaras', 'Build interval memory', 'Slow → medium → fast progression'],
  },
  {
    id: 'alankarams',
    title: 'Alankarams',
    raga: 'General',
    duration: '10 min',
    level: 'Intermediate',
    desc: '7 alankara patterns — the foundation of all Carnatic improvisation.',
    teacherNotes: [
      'Alankarams are the grammar of Carnatic music. Master these before anything else.',
      'Each of the 7 patterns has a specific ascending and descending form.',
      'Practice in Adi tala (8 beats) — count on your fingers or tap on a surface.',
      'Once all 7 are solid, try them in different speeds (1x, 1.5x, 2x).',
      'These patterns will appear inside every raga and every composition you ever learn.',
    ],
    keyPoints: ['7 distinct patterns A through G', 'Practice in Adi tala', 'Three speeds: slow/medium/fast'],
  },
  {
    id: 'githam-vatapi',
    title: 'Githam – Vatapi Ganapathim',
    raga: 'Hamsadhvani',
    duration: '12 min',
    level: 'Beginner',
    desc: 'Your first complete composition — Vatapi in the auspicious raga Hamsadhvani.',
    teacherNotes: [
      'This is the most commonly taught first githam. Respect its simplicity.',
      'Hamsadhvani uses only 5 svaras: Sa Ri Ga Pa Ni. Notice the absence of Ma and Da.',
      'The raga has a bright, joyful character — let that reflect in your singing.',
      'Learn the sahitya (lyrics) separately first, then add the melody.',
      'Timing matters: each syllable maps to a beat. Never rush the slower syllables.',
    ],
    keyPoints: ['5-svara raga (pentatonic)', 'Bright, devotional character', 'Sahitya + melody alignment'],
  },
  {
    id: 'kalyani-alapana',
    title: 'Kalyani – Free Alapana',
    raga: 'Kalyani',
    duration: '15 min',
    level: 'Intermediate',
    desc: 'Explore Kalyani freely — no tala, pure raga expression.',
    teacherNotes: [
      'Alapana is free-form: there is no tala, only the raga.',
      'Kalyani is the Carnatic equivalent of Yaman. It has a raised 4th (Prati Madhyamam).',
      'Start low (mandara sthayi), explore slowly upward. Do not rush to the high octave.',
      'Listen to recordings of masters. Alapana is best learned by deep listening.',
      'The goal is not to show off speed — it is to show the beauty of the raga.',
      'Even 2 minutes of genuine expression is worth more than 10 minutes of scale running.',
    ],
    keyPoints: ['Prati Madhyamam (F#)', 'Slow exploration from low to high', 'Expression over speed'],
  },
]

export default function PracticePage() {
  const [recording, setRec]   = useState(false)
  const [expanded, setExpand] = useState<string | null>(null)
  const [notes, setNotes]     = useState<Record<string, string>>({})
  const [saved, setSaved]     = useState<Record<string, boolean>>({})
  const [counts, setCounts]   = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      const n = localStorage.getItem('practice_notes')
      const c = localStorage.getItem('practice_counts')
      if (n) setNotes(JSON.parse(n))
      if (c) setCounts(JSON.parse(c))
    } catch {}
  }, [])

  const saveNote = (id: string) => {
    const updated = { ...notes }
    localStorage.setItem('practice_notes', JSON.stringify(updated))
    setSaved(p => ({ ...p, [id]: true }))
    setTimeout(() => setSaved(p => ({ ...p, [id]: false })), 2000)
  }

  const markPracticed = (id: string) => {
    const updated = { ...counts, [id]: (counts[id] ?? 0) + 1 }
    setCounts(updated)
    localStorage.setItem('practice_counts', JSON.stringify(updated))
  }

  const totalPracticed = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Practice Studio</h1>
            <p className="text-stone-500 text-sm mt-0.5">Guided exercises with teacher notes.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/student/pitch" className="bg-white border border-stone-200 hover:border-amber-300 text-stone-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors">🎵 Pitch Lab</Link>
            <Link href="/student/tala"  className="bg-white border border-stone-200 hover:border-amber-300 text-stone-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors">🥁 Tala</Link>
          </div>
        </div>

        {/* Record banner */}
        <div className="bg-gradient-to-r from-amber-900 to-stone-900 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="text-white min-w-0">
            <p className="text-amber-300/70 text-xs uppercase tracking-widest mb-0.5">Session Recorder</p>
            <p className="font-serif text-lg font-bold">Free Practice Mode</p>
            <p className="text-amber-200/50 text-xs mt-0.5">Record yourself → listen back → note 3 things to improve</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {recording && (
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"/>
                <span className="text-red-200 text-xs font-mono">REC</span>
              </div>
            )}
            <button onClick={() => setRec(!recording)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                recording ? 'bg-red-500 hover:bg-red-400 animate-pulse' : 'bg-white/20 hover:bg-white/30'
              }`}>
              {recording ? <MicOff size={20} className="text-white"/> : <Mic size={20} className="text-white"/>}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Sessions', value: totalPracticed, icon: '🎵' },
            { label: 'Exercises Tried', value: Object.keys(counts).length, icon: '📋' },
            { label: 'Streak Goal', value: '30 min/day', icon: '🔥' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-stone-100 rounded-xl p-3 text-center shadow-sm">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-lg font-serif font-bold text-stone-900">{s.value}</p>
              <p className="text-xs text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Exercise list */}
        <div className="space-y-3">
          <h2 className="font-serif font-semibold text-stone-800 flex items-center gap-2 text-sm uppercase tracking-wider text-stone-500">
            <Music size={14}/> Exercises ({EXERCISES.length})
          </h2>
          {EXERCISES.map(ex => {
            const isOpen     = expanded === ex.id
            const practiced  = counts[ex.id] ?? 0
            const myNote     = notes[ex.id] ?? ''
            return (
              <div key={ex.id} className={`bg-white border-2 rounded-2xl shadow-sm transition-all ${
                isOpen ? 'border-amber-400 shadow-amber-100' : 'border-stone-100 hover:border-stone-200'
              }`}>
                {/* Card header */}
                <button className="w-full p-4 flex items-start gap-3 text-left" onClick={() => setExpand(isOpen ? null : ex.id)}>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Music size={16} className="text-amber-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-800 text-sm">{ex.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ex.level === 'Beginner' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{ex.level}</span>
                      {practiced > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">×{practiced} done</span>
                      )}
                    </div>
                    <p className="text-xs text-amber-600 font-medium mt-0.5">{ex.raga}</p>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed pr-4">{ex.desc}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-stone-400">
                      <Clock size={11}/> {ex.duration}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-stone-300 mt-1">
                    {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-stone-100 divide-y divide-stone-50">
                    {/* Teacher Notes */}
                    <div className="p-4">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                        <Lightbulb size={13}/> Teacher's Guidance
                      </h4>
                      <ul className="space-y-2">
                        {ex.teacherNotes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                            <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ex.keyPoints.map((kp, i) => (
                          <span key={i} className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                            ✓ {kp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* My Notes */}
                    <div className="p-4">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <BookOpen size={13}/> My Practice Notes
                      </h4>
                      <textarea
                        rows={3}
                        value={myNote}
                        onChange={e => setNotes(p => ({ ...p, [ex.id]: e.target.value }))}
                        placeholder="What went well? What needs work? Write down 1-2 specific things to focus on next time…"
                        className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none resize-none text-stone-700 placeholder-stone-300"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => saveNote(ex.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${saved[ex.id] ? 'bg-green-100 text-green-700' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}>
                          {saved[ex.id] ? <><CheckCircle size={12}/> Saved!</> : <><Save size={12}/> Save Note</>}
                        </button>
                        <button onClick={() => markPracticed(ex.id)}
                          className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                          <Play size={12}/> Mark Practiced
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
