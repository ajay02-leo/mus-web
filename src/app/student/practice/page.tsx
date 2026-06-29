'use client'
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Play, Mic, MicOff, Music, Clock, ChevronDown, ChevronUp,
         BookOpen, Lightbulb, Save, CheckCircle, Upload, Trash2,
         Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

const EXERCISES = [
  { id: 'sarali-1',      title: 'Sarali Varisai 1',       raga: 'Mayamalavagowla', duration: '5 min',  level: 'Beginner',
    desc: 'Basic ascending-descending exercise covering all 7 svaras.',
    teacherNotes: ['Start with Sa fixed to your shruti box. Sa must feel like "home".',
      'Sing each svara with full resonance — do not rush.',
      'Listen carefully to the 3rd (Ga) and 6th (Da) — unique to Mayamalavagowla.',
      'Keep your jaw relaxed. Tension creates tension in the voice.',
      'Practice at least 3 full ascending-descending cycles without pause.'],
    keyPoints: ['Sruti alignment on Sa', 'Pure Ga (E♭) & Da (A♭)', 'Even tempo throughout'] },
  { id: 'janta-varisai', title: 'Janta Varisai',           raga: 'Mayamalavagowla', duration: '7 min',  level: 'Beginner',
    desc: 'Double-note pattern exercises for consistent pitch repetition.',
    teacherNotes: ['Each svara is sung twice — both times must sound identical.',
      'Common mistake: second note dips slightly. Stay conscious of this.',
      'Try clapping tala softly while singing.',
      'Record yourself and listen back.'],
    keyPoints: ['Equal pitch on both notes', 'Maintain tala while singing', 'Record and self-evaluate'] },
  { id: 'datu-varisai',  title: 'Datu Varisai',            raga: 'General',          duration: '8 min',  level: 'Intermediate',
    desc: 'Skip-note patterns to build interval recognition and agility.',
    teacherNotes: ['Datu means "skip" — you jump over svaras.',
      'The key skill is accuracy on landing. The skipped-to note must be in perfect sruti.',
      'Start very slow. Speed comes once intervals are internalized.',
      'These patterns train your brain to think in terms of intervals.'],
    keyPoints: ['Accurate landing on skipped svaras', 'Build interval memory', 'Slow → medium → fast'] },
  { id: 'alankarams',    title: 'Alankarams',              raga: 'General',          duration: '10 min', level: 'Intermediate',
    desc: '7 alankara patterns — the foundation of all Carnatic improvisation.',
    teacherNotes: ['Alankarams are the grammar of Carnatic music. Master these first.',
      'Each of the 7 patterns has a specific ascending and descending form.',
      'Practice in Adi tala (8 beats).',
      'Once all 7 are solid, try them in different speeds.'],
    keyPoints: ['7 distinct patterns A through G', 'Practice in Adi tala', 'Three speeds'] },
  { id: 'githam-vatapi', title: 'Githam – Vatapi Ganapathim', raga: 'Hamsadhvani',  duration: '12 min', level: 'Beginner',
    desc: 'Your first complete composition — Vatapi in the auspicious raga Hamsadhvani.',
    teacherNotes: ['This is the most commonly taught first githam.',
      'Hamsadhvani uses only 5 svaras: Sa Ri Ga Pa Ni.',
      'The raga has a bright, joyful character.',
      'Learn the sahitya (lyrics) separately first, then add the melody.'],
    keyPoints: ['5-svara raga (pentatonic)', 'Bright devotional character', 'Sahitya + melody alignment'] },
  { id: 'kalyani-alapana', title: 'Kalyani – Free Alapana', raga: 'Kalyani',        duration: '15 min', level: 'Intermediate',
    desc: 'Explore Kalyani freely — no tala, pure raga expression.',
    teacherNotes: ['Alapana is free-form: there is no tala, only the raga.',
      'Kalyani has a raised 4th (Prati Madhyamam).',
      'Start low (mandara sthayi), explore slowly upward.',
      'The goal is expression, not speed.'],
    keyPoints: ['Prati Madhyamam (F#)', 'Slow exploration from low to high', 'Expression over speed'] },
]

type Recording = { id: string; title?: string; url: string; compressedUrl?: string; raga?: string; duration?: number; createdAt: string }

function formatDur(sec?: number | null) {
  if (!sec) return '--:--'
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function PracticePage() {
  const [expanded, setExpand]   = useState<string | null>(null)
  const [notes, setNotes]       = useState<Record<string, string>>({})
  const [saved, setSaved]       = useState<Record<string, boolean>>({})
  const [counts, setCounts]     = useState<Record<string, number>>({})

  // Recorder state
  const [recording, setRecording]     = useState(false)
  const [recSeconds, setRecSeconds]   = useState(0)
  const [uploading, setUploading]     = useState(false)
  const [uploadMsg, setUploadMsg]     = useState('')
  const [recRaga, setRecRaga]         = useState('General')
  const [recTitle, setRecTitle]       = useState('')
  const mediaRef   = useRef<MediaRecorder | null>(null)
  const chunksRef  = useRef<Blob[]>([])
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  // Recordings list
  const [myRecordings, setMyRecordings] = useState<Recording[]>([])
  const [recLoading, setRecLoading]     = useState(true)

  useEffect(() => {
    try {
      const n = localStorage.getItem('practice_notes')
      const c = localStorage.getItem('practice_counts')
      if (n) setNotes(JSON.parse(n))
      if (c) setCounts(JSON.parse(c))
    } catch {}
    loadRecordings()
  }, [])

  async function loadRecordings() {
    setRecLoading(true)
    try {
      const data = await api.recordings.my()
      setMyRecordings(data)
    } catch {}
    setRecLoading(false)
  }

  // ── MediaRecorder ──────────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = handleStop
      mr.start(1000) // collect in 1s chunks
      mediaRef.current = mr
      setRecording(true)
      setRecSeconds(0)
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000)
    } catch (err) {
      alert('Microphone access denied. Please allow microphone access in your browser.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current?.stream.getTracks().forEach(t => t.stop())
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
  }

  async function handleStop() {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const formData = new FormData()
    formData.append('audio', blob, `${recTitle || 'practice'}-${Date.now()}.webm`)
    formData.append('type', 'PRACTICE')
    formData.append('raga', recRaga)
    if (recTitle) formData.append('title', recTitle)

    setUploading(true)
    setUploadMsg('Uploading...')
    try {
      await api.recordings.upload(formData)
      setUploadMsg('Saved! Compressing in background...')
      await loadRecordings()
      setRecTitle('')
      setTimeout(() => setUploadMsg(''), 3000)
    } catch {
      setUploadMsg('Upload failed. Try again.')
    }
    setUploading(false)
  }

  async function deleteRecording(id: string) {
    if (!confirm('Delete this recording?')) return
    await api.recordings.delete(id)
    setMyRecordings(r => r.filter(x => x.id !== id))
  }

  // ── Exercise helpers ───────────────────────────────────
  const saveNote = (id: string) => {
    localStorage.setItem('practice_notes', JSON.stringify(notes))
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
            <p className="text-stone-500 text-sm mt-0.5">Record · Upload · Track your progress</p>
          </div>
          <div className="flex gap-2">
            <Link href="/student/pitch" className="bg-white border border-stone-200 hover:border-amber-300 text-stone-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors">🎵 Pitch Lab</Link>
            <Link href="/student/tala"  className="bg-white border border-stone-200 hover:border-amber-300 text-stone-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors">🥁 Tala</Link>
            <Link href="/student/compare" className="bg-white border border-stone-200 hover:border-amber-300 text-stone-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors">📊 Compare</Link>
          </div>
        </div>

        {/* Recorder */}
        <div className="bg-gradient-to-r from-amber-900 to-stone-900 rounded-2xl p-5">
          <p className="text-amber-300/70 text-xs uppercase tracking-widest mb-3">Session Recorder</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input value={recTitle} onChange={e => setRecTitle(e.target.value)}
              placeholder="Session title (optional)"
              className="flex-1 bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"/>
            <select value={recRaga} onChange={e => setRecRaga(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400">
              {['General','Mayamalavagowla','Hamsadhvani','Kalyani','Bhairavi','Thodi','Shankarabharanam','Kambhoji','Ananda Bhairavi'].map(r =>
                <option key={r} value={r} className="bg-stone-900">{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            {recording && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"/>
                <span className="text-red-200 text-sm font-mono">{formatDur(recSeconds)}</span>
              </div>
            )}
            {uploadMsg && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${uploadMsg.includes('failed') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                {uploadMsg}
              </span>
            )}
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={uploading}
              className={`ml-auto w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 ${
                recording ? 'bg-red-500 hover:bg-red-400 animate-pulse' : 'bg-white/20 hover:bg-white/30'
              }`}>
              {uploading ? <Loader2 size={22} className="text-white animate-spin"/> :
               recording  ? <MicOff size={22} className="text-white"/> :
                            <Mic    size={22} className="text-white"/>}
            </button>
          </div>
          <p className="text-white/30 text-xs mt-3">
            {recording ? 'Click stop when done — your recording will compress automatically' : 'Click mic to start recording'}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Sessions', value: totalPracticed,              icon: '🎵' },
            { label: 'Exercises Tried', value: Object.keys(counts).length, icon: '📋' },
            { label: 'Recordings Saved', value: myRecordings.length,       icon: '🎙️' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-stone-100 rounded-xl p-3 text-center shadow-sm">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-lg font-serif font-bold text-stone-900">{s.value}</p>
              <p className="text-xs text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* My Recordings */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-serif font-semibold text-stone-800">My Recordings</h2>
            <span className="text-xs text-stone-400">{myRecordings.length} saved</span>
          </div>
          {recLoading ? (
            <div className="p-8 text-center text-stone-400 text-sm flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin"/> Loading…
            </div>
          ) : myRecordings.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              <Mic size={32} className="mx-auto mb-2 opacity-30"/>
              No recordings yet. Start recording above!
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {myRecordings.map(r => (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm truncate">{r.title || 'Practice Session'}</p>
                    <p className="text-xs text-stone-400">{r.raga || 'General'} · {formatDur(r.duration)} · {formatDate(r.createdAt)}</p>
                    {r.compressedUrl ? (
                      <audio controls src={r.compressedUrl} className="mt-1.5 h-7 w-full max-w-xs" style={{ height: 28 }}/>
                    ) : r.url ? (
                      <audio controls src={r.url} className="mt-1.5 h-7 w-full max-w-xs" style={{ height: 28 }}/>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {r.compressedUrl && (
                      <a href={r.compressedUrl} download className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                        <Download size={14}/>
                      </a>
                    )}
                    <button onClick={() => deleteRecording(r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise list */}
        <div className="space-y-3">
          <h2 className="font-serif font-semibold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Music size={14}/> Guided Exercises ({EXERCISES.length})
          </h2>
          {EXERCISES.map(ex => {
            const isOpen    = expanded === ex.id
            const practiced = counts[ex.id] ?? 0
            return (
              <div key={ex.id} className={`bg-white border-2 rounded-2xl shadow-sm transition-all ${
                isOpen ? 'border-amber-400 shadow-amber-100' : 'border-stone-100 hover:border-stone-200'
              }`}>
                <button className="w-full p-4 flex items-start gap-3 text-left" onClick={() => setExpand(isOpen ? null : ex.id)}>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Music size={16} className="text-amber-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-800 text-sm">{ex.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ex.level === 'Beginner' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{ex.level}</span>
                      {practiced > 0 && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">×{practiced}</span>}
                    </div>
                    <p className="text-xs text-amber-600 font-medium mt-0.5">{ex.raga}</p>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed pr-4">{ex.desc}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-stone-400"><Clock size={11}/> {ex.duration}</div>
                  </div>
                  <div className="flex-shrink-0 text-stone-300 mt-1">{isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</div>
                </button>

                {isOpen && (
                  <div className="border-t border-stone-100 divide-y divide-stone-50">
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
                          <span key={i} className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-medium">✓ {kp}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <BookOpen size={13}/> My Practice Notes
                      </h4>
                      <textarea rows={3} value={notes[ex.id] ?? ''}
                        onChange={e => setNotes(p => ({ ...p, [ex.id]: e.target.value }))}
                        placeholder="What went well? What needs work? Write down 1-2 specific things to focus on next time…"
                        className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none resize-none text-stone-700 placeholder-stone-300"/>
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
