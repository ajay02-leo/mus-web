'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Music, GraduationCap, BookOpen, ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'

const ROLES = [
  { id: 'STUDENT', label: 'Student', Icon: GraduationCap, desc: 'I want to learn Carnatic music' },
  { id: 'TEACHER', label: 'Teacher', Icon: BookOpen,    desc: 'I want to teach students' },
]

type Step = 'role' | 'account' | 'profile'

function RegisterForm() {
  const searchParams = useSearchParams()
  const initial = searchParams.get('role')?.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT'
  const [step, setStep]     = useState<Step>('role')
  const [role, setRole]     = useState(initial)
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [pwd, setPwd]       = useState('')
  const [show, setShow]     = useState(false)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const { login } = useAuth()
  const router    = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoad(true); setError(null)
    try {
      await api.auth.register({ name, email, password: pwd, role: role as 'STUDENT' | 'TEACHER' })
      await login(email, pwd)
      router.push(role === 'TEACHER' ? '/teacher' : '/student')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoad(false)
    }
  }

  const STEPS = ['role', 'account', 'profile']
  const stepIdx = STEPS.indexOf(step)

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <nav className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center">
            <Music size={16} className="text-white"/>
          </div>
          <span className="font-serif text-lg font-semibold text-stone-900">SwaraSangam</span>
        </Link>
        <Link href="/login" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
          Already have an account? <span className="text-amber-700 font-semibold">Sign in</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                  i < stepIdx ? 'bg-amber-700 text-white' : i === stepIdx ? 'bg-amber-700 text-white ring-4 ring-amber-100' : 'bg-stone-200 text-stone-400'
                }`}>
                  {i < stepIdx ? <CheckCircle size={16}/> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-amber-700' : 'bg-stone-200'}`}/>}
              </div>
            ))}
          </div>

          {step === 'role' && (
            <div>
              <h1 className="text-3xl font-serif text-stone-900 mb-2">Join SwaraSangam</h1>
              <p className="text-stone-500 text-sm mb-8">Choose how you'll use the platform to get started.</p>
              <div className="space-y-4 mb-8">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left ${
                      role === r.id ? 'border-amber-600 bg-amber-50 shadow-md' : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${role === r.id ? 'bg-amber-100' : 'bg-stone-100'}`}>
                      <r.Icon size={22} className={role === r.id ? 'text-amber-700' : 'text-stone-400'}/>
                    </div>
                    <div>
                      <div className={`font-bold ${role === r.id ? 'text-stone-900' : 'text-stone-600'}`}>{r.label}</div>
                      <div className="text-stone-400 text-sm">{r.desc}</div>
                    </div>
                    {role === r.id && <CheckCircle size={20} className="text-amber-600 ml-auto flex-shrink-0"/>}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('account')} className="w-full bg-amber-700 hover:bg-amber-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-100">
                Continue as {role.charAt(0) + role.slice(1).toLowerCase()} <ArrowRight size={16}/>
              </button>
            </div>
          )}

          {step === 'account' && (
            <div>
              <button onClick={() => setStep('role')} className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm mb-6 transition-colors">
                <ArrowLeft size={14}/> Back
              </button>
              <h1 className="text-3xl font-serif text-stone-900 mb-2">Create your account</h1>
              <p className="text-stone-500 text-sm mb-8">Register as a {role.charAt(0) + role.slice(1).toLowerCase()}. It&apos;s free to join.</p>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Min. 8 characters" minLength={8}
                      className="w-full px-4 py-3 pr-11 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition-all"/>
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                      {show ? <EyeOff size={17}/> : <Eye size={17}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-100">
                  {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Creating account…</> : <>Create account <ArrowRight size={16}/></>}
                </button>
              </form>
              <p className="text-xs text-stone-400 text-center mt-4">By creating an account you agree to our Terms of Service.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>}>
      <RegisterForm />
    </Suspense>
  )
}
