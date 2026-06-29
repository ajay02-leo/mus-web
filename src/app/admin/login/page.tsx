'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Lock, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail]  = useState('')
  const [pwd, setPwd]      = useState('')
  const [show, setShow]    = useState(false)
  const [loading, setLoad] = useState(false)
  const [error, setError]  = useState<string | null>(null)
  const { login }  = useAuth()
  const router     = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoad(true); setError(null)
    try {
      const user = await login(email, pwd)
      if (user?.role === 'CONTENT_MANAGER') router.push('/content-manager')
      else if (user?.role === 'ADMIN') router.push('/admin')
      else { setError('Access denied: Admin or Content Manager credentials required'); return }
    }
    catch (err: any) { setError(err.message) }
    finally { setLoad(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none"/>
      <div className="relative w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm mb-8 transition-colors">
          <ArrowLeft size={14}/> Back to login
        </Link>
        <div className="bg-stone-900 border border-stone-700/60 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-stone-800 to-stone-900 border-b border-stone-700/50 px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-purple-900/40 border border-purple-700/50 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={26} className="text-purple-300"/>
            </div>
            <div className="text-center">
              <h1 className="text-white font-serif text-xl font-semibold">Staff Portal</h1>
              <p className="text-stone-400 text-xs mt-0.5">Admin & Content Manager access — authorised personnel only</p>
            </div>
          </div>
          <div className="px-8 py-7">
            {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-800/40 rounded-xl text-red-400 text-xs">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Admin Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@swarasangam.com"
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-600 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Enter admin password"
                    className="w-full px-4 py-3 pr-11 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-600 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all"/>
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                    {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-purple-900/20 border border-purple-800/40 rounded-xl px-3.5 py-3">
                <Lock size={13} className="text-purple-400 flex-shrink-0 mt-0.5"/>
                <p className="text-purple-300/70 text-xs leading-relaxed">Two-factor authentication required for production accounts.</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-purple-800 hover:bg-purple-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40">
                {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Authenticating…</> : <>Sign in to Admin <ArrowRight size={15}/></>}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-stone-700 text-xs mt-6">SwaraSangam © 2026 · Admin access is logged and monitored</p>
      </div>
    </div>
  )
}
