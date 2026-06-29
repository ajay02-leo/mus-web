'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import TamburaSVG from '@/components/TamburaSVG'
import { Eye, EyeOff, Music, GraduationCap, BookOpen, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'

const ROLES = [
  {
    id: 'STUDENT', label: 'Student', Icon: GraduationCap,
    desc: 'Learn & practice music', redirect: '/student',
    color: 'border-amber-600 bg-amber-50', activeIcon: 'text-amber-700',
    perks: ['Real-time pitch detection', 'AI Guru coaching 24/7', 'Assignments with reference recordings', 'Gamified XP & streak system', 'Skill progress analytics'],
  },
  {
    id: 'TEACHER', label: 'Teacher', Icon: BookOpen,
    desc: 'Teach & manage students', redirect: '/teacher',
    color: 'border-stone-600 bg-stone-50', activeIcon: 'text-stone-700',
    perks: ['Full student skill analytics', 'Create assignments with recordings', 'Smart scheduling & attendance', 'Monthly progress reports', 'Earnings dashboard'],
  },
]

export default function LoginPage() {
  const [role, setRole]     = useState('STUDENT')
  const [email, setEmail]   = useState('')
  const [password, setPwd]  = useState('')
  const [showPwd, setShow]  = useState(false)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const { login }  = useAuth()
  const router     = useRouter()
  const selected   = ROLES.find(r => r.id === role)!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoad(true); setError(null)
    try {
      await login(email, password)
      router.push(selected.redirect)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[44%] relative overflow-hidden bg-[#1c0f05]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-800/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"/>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"/>
        <span className="absolute top-1/4 left-4 text-amber-700/15 text-9xl font-serif select-none pointer-events-none">♪</span>

        <div className="relative z-10 p-8 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-amber-700 rounded-xl flex items-center justify-center shadow-lg">
            <Music size={19} className="text-white"/>
          </div>
          <span className="text-white font-serif text-2xl font-semibold tracking-wide">SwaraSangam</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 -mt-8">
          <TamburaSVG className="h-52 w-auto opacity-85 animate-float mb-8 drop-shadow-2xl"/>
          <div className="w-full max-w-xs">
            <p className="text-amber-300/70 text-xs font-semibold uppercase tracking-widest mb-4 text-center">
              {selected.label} gets access to
            </p>
            <ul className="space-y-3">
              {selected.perks.map(p => (
                <li key={p} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5"/>
                  <span className="text-amber-100/75 text-sm leading-snug">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-8">
          <div className="border-t border-amber-900/40 pt-6">
            <blockquote>
              <p className="text-amber-200/60 text-sm font-serif italic leading-relaxed mb-2">
                &ldquo;Every swara is a step towards the divine.&rdquo;
              </p>
              <cite className="text-amber-400/45 text-xs not-italic">— Ancient Carnatic wisdom</cite>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm mb-8 transition-colors">
            <ArrowLeft size={15}/> Back to home
          </Link>

          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center">
              <Music size={16} className="text-white"/>
            </div>
            <span className="text-stone-900 font-serif text-xl font-semibold">SwaraSangam</span>
          </div>

          <h1 className="text-3xl font-serif text-stone-900 mb-1">Welcome back</h1>
          <p className="text-stone-500 text-sm mb-8">Sign in to continue your musical journey.</p>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

          <div className="mb-7">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">I am signing in as…</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => {
                const active = role === r.id
                return (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      active ? `${r.color} shadow-md` : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}>
                    <r.Icon size={22} className={active ? r.activeIcon : 'text-stone-400'}/>
                    <div className="text-center">
                      <div className={`text-xs font-bold ${active ? 'text-stone-800' : 'text-stone-500'}`}>{r.label}</div>
                      <div className="text-xs text-stone-400 leading-tight hidden sm:block">{r.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder={`${role.toLowerCase()}@example.com`}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition-all"/>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-stone-700">Password</label>
                <button type="button" className="text-amber-700 text-xs font-medium hover:text-amber-600 transition-colors">Forgot password?</button>
              </div>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPwd(e.target.value)} required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition-all"/>
                <button type="button" onClick={() => setShow(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPwd ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-200">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in…</>
              ) : (
                <>Sign in as {selected.label} <ArrowRight size={16}/></>
              )}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            New to SwaraSangam?{' '}
            <Link href="/register" className="text-amber-700 font-semibold hover:text-amber-600">Create free account</Link>
          </p>

          <p className="text-center mt-6">
            <Link href="/admin/login" className="text-stone-300 hover:text-stone-400 text-xs transition-colors">Admin portal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
