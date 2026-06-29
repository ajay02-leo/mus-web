'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Users, Star, Search, Filter, ChevronRight, CheckCircle, Music } from 'lucide-react'
import TamburaSVG from '@/components/TamburaSVG'

const LEVELS = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-amber-100 text-amber-700',
  ADVANCED: 'bg-red-100 text-red-700',
}

export default function Marketplace() {
  const { user } = useAuth()
  const router   = useRouter()
  const [courses, setCourses]     = useState<any[]>([])
  const [loading, setLoad]        = useState(true)
  const [search, setSearch]       = useState('')
  const [level, setLevel]         = useState('ALL')
  const [enrolledIds, setEnrolled] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.courses.browse().then(data => setCourses(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoad(false))
  }, [])

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      api.courses.enrolled()
        .then((enrs: any[]) => setEnrolled(new Set(enrs.map((e: any) => e.courseId ?? e.course?.id))))
        .catch(() => {})
    }
  }, [user])

  const filtered = courses.filter(c => {
    const matchLevel  = level === 'ALL' || c.level === level
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.teacher?.displayName?.toLowerCase().includes(search.toLowerCase())
    return matchLevel && matchSearch
  })

  const handleEnrollClick = (c: any) => {
    if (!user) { router.push('/register'); return }
    if (user.role !== 'STUDENT') return
    if (enrolledIds.has(c.id)) return
    // Free course — enroll directly; paid → go to payment page
    if ((c.price ?? 0) === 0) {
      api.courses.enroll(c.id, { paidAmount: 0 }).then(() => {
        setEnrolled(prev => new Set([...prev, c.id]))
      }).catch(() => {})
    } else {
      router.push(`/student/payment?courseId=${c.id}&title=${encodeURIComponent(c.title)}&price=${c.price}&teacher=${encodeURIComponent(c.teacher?.displayName ?? '')}`)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Nav */}
      <nav className="bg-white border-b border-stone-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-900 rounded-lg flex items-center justify-center">
              <Music size={16} className="text-amber-300"/>
            </div>
            <span className="font-serif font-bold text-stone-900">Swara Sangam</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href={`/${user.role.toLowerCase()}`} className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                My Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors">Sign In</Link>
                <Link href="/register" className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Course Marketplace</span>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mt-3 leading-tight">
              Find Your <span className="text-amber-400">Perfect</span> Teacher
            </h1>
            <p className="text-stone-300 mt-4 text-lg leading-relaxed max-w-xl">
              Browse approved courses from master musicians. Enroll with a single payment and start learning today.
            </p>
            <div className="flex flex-wrap gap-6 mt-8 text-sm text-stone-400">
              {[['500+', 'Students enrolled'], ['25+', 'Expert teachers'], ['100%', 'Online & flexible']].map(([v, l]) => (
                <div key={l}><span className="text-amber-400 font-bold text-2xl font-serif">{v}</span><br/>{l}</div>
              ))}
            </div>
          </div>
          <div className="w-48 opacity-60 flex-shrink-0"><TamburaSVG /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by course name or teacher…"
              className="w-full pl-9 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white shadow-sm"/>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-stone-400"/>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${level === l ? 'bg-amber-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <BookOpen size={40} className="mx-auto mb-3 text-stone-200"/>
            <p className="font-medium">No approved courses available yet</p>
            <p className="text-sm mt-1 text-stone-300">Check back soon — teachers are adding new courses.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c: any) => {
              const isEnrolled = enrolledIds.has(c.id)
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="bg-gradient-to-br from-amber-950 to-stone-900 p-6 relative overflow-hidden">
                    <div className="absolute right-4 top-4 w-16 h-16 opacity-10"><TamburaSVG /></div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[c.level] ?? 'bg-stone-100 text-stone-600'}`}>{c.level}</span>
                    <h3 className="font-serif font-bold text-white text-lg mt-3 leading-tight pr-12">{c.title}</h3>
                    <p className="text-amber-400/70 text-xs mt-1">{c.ragas?.[0] ?? c.raga ?? 'Multiple ragas'}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-3 text-xs text-stone-400 mb-4">
                      <span className="flex items-center gap-1"><Users size={11}/> {c._count?.enrollments ?? 0} enrolled</span>
                      <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" fill="#d97706"/> 4.9</span>
                      {c.teacher?.displayName && <span className="truncate">{c.teacher.displayName}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-amber-800 font-bold text-xl font-serif">
                        {(c.price ?? 0) === 0 ? 'Free' : `₹${(c.price).toLocaleString('en-IN')}`}
                      </span>
                      {isEnrolled ? (
                        <span className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                          <CheckCircle size={14}/> Enrolled
                        </span>
                      ) : (
                        <button onClick={() => handleEnrollClick(c)}
                          className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                          <ChevronRight size={14}/>
                          {(c.price ?? 0) === 0 ? 'Enroll Free' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!user && (
        <div className="bg-gradient-to-r from-amber-900 to-stone-900 py-16 px-6 mt-12">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-serif font-bold mb-4">Ready to Begin Your Journey?</h2>
            <p className="text-stone-300 mb-8">Join hundreds of students learning the divine art of Carnatic music.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg">
              Start Learning Today <ChevronRight size={20}/>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
