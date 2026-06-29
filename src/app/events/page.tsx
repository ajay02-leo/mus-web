'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Music, Calendar, MapPin, Clock, Users, ChevronRight, Mic, Star, ExternalLink } from 'lucide-react'

const TYPE_STYLES: Record<string, string> = {
  CONCERT:     'bg-amber-100 text-amber-800',
  WORKSHOP:    'bg-blue-100 text-blue-800',
  SHOWCASE:    'bg-purple-100 text-purple-700',
  MASTERCLASS: 'bg-red-100 text-red-700',
}

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents]         = useState<any[]>([])
  const [loading, setLoad]          = useState(true)
  const [filter, setFilter]         = useState('ALL')
  const [registeredIds, setRegIds]  = useState<Set<string>>(new Set())
  const [registering, setReg]       = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.events.list(),
      user ? api.events.myRegistrations() : Promise.resolve([]),
    ]).then(([evts, myIds]) => {
      setEvents(evts)
      setRegIds(new Set(myIds))
    }).catch(() => {
      api.events.list().then(setEvents).catch(() => {})
    }).finally(() => setLoad(false))
  }, [user])

  const handleRegister = async (id: string) => {
    if (!user) { window.location.href = '/login'; return }
    setReg(id)
    try {
      await api.events.register(id)
      setRegIds(prev => new Set([...prev, id]))
      setEvents(prev => prev.map(e => e.id === id ? { ...e, booked: e.booked + 1 } : e))
    } catch {}
    setReg(null)
  }

  const types = ['ALL', 'CONCERT', 'WORKSHOP', 'MASTERCLASS', 'SHOWCASE']
  const filtered = filter === 'ALL' ? events : events.filter(e => e.type === filter)
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <nav className="bg-white border-b border-stone-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-900 rounded-lg flex items-center justify-center">
              <Music size={16} className="text-amber-300"/>
            </div>
            <span className="font-serif font-bold text-stone-900">Swara Sangam</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors">Courses</Link>
            {user ? (
              <Link href={`/${user.role.toLowerCase()}`} className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors">Sign In</Link>
                <Link href="/register" className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-amber-950 to-stone-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Live Events</span>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mt-3">Concerts & Workshops</h1>
          <p className="text-stone-300 mt-4 text-lg max-w-2xl mx-auto">
            Experience the living tradition of Carnatic music — in concert halls, intimate workshops, and online masterclasses.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === t ? 'bg-amber-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm mt-1">Check back soon for upcoming events.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(ev => {
              const seats   = ev.seats ?? 100
              const booked  = ev.booked ?? ev._count?.registrations ?? 0
              const availPct = Math.round((booked / seats) * 100)
              const isAlmostFull = availPct >= 85
              const isFree = ev.price === 0
              const isRegistered = registeredIds.has(ev.id)

              return (
                <div key={ev.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row gap-5">
                    <div className="flex-shrink-0 w-20 lg:w-16 text-center">
                      <div className="bg-amber-900 text-white rounded-2xl px-4 py-3 lg:px-2">
                        <p className="text-amber-300 text-xs font-bold uppercase">{new Date(ev.date).toLocaleString('en', { month: 'short' })}</p>
                        <p className="text-white text-3xl lg:text-2xl font-serif font-bold leading-none">{new Date(ev.date).getDate()}</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${TYPE_STYLES[ev.type] ?? 'bg-stone-100 text-stone-600'}`}>{ev.type}</span>
                        {isAlmostFull && <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600">Almost Full</span>}
                        {isFree && <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">Free</span>}
                      </div>
                      <h2 className="font-serif font-bold text-stone-900 text-xl mb-2">{ev.title}</h2>
                      <p className="text-stone-500 text-sm leading-relaxed mb-4">{ev.description}</p>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-400 mb-4">
                        <span className="flex items-center gap-1.5"><Calendar size={12}/> {formatDate(ev.date)}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12}/> {ev.time}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12}/> {ev.venue}</span>
                        <span className="flex items-center gap-1.5"><Users size={12}/> {seats - booked} seats left</span>
                      </div>

                      {ev.artists?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {ev.artists.map((a: string) => (
                            <span key={a} className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                              <Mic size={10}/> {a}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isAlmostFull ? 'bg-red-400' : 'bg-amber-500'}`} style={{ width: `${availPct}%` }}/>
                        </div>
                        <span className="text-xs text-stone-400">{booked}/{seats}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end justify-between gap-4 lg:pl-4 lg:border-l border-stone-100">
                      <div className="text-right">
                        <p className="text-2xl font-serif font-bold text-amber-800">{isFree ? 'Free' : `₹${ev.price}`}</p>
                        {!isFree && <p className="text-xs text-stone-400">per person</p>}
                      </div>
                      {isRegistered ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2.5 rounded-xl text-sm font-bold">✓ Registered!</span>
                        </div>
                      ) : (
                        <button onClick={() => handleRegister(ev.id)}
                          disabled={booked >= seats || registering === ev.id}
                          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
                          {registering === ev.id
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            : booked >= seats ? 'Sold Out' : <><ChevronRight size={15}/> {isFree ? 'Register Free' : 'Book Now'}</>
                          }
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
    </div>
  )
}
