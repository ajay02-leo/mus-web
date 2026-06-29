'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import {
  Calendar, Megaphone, Users, LayoutDashboard, LogOut,
  Plus, Trash2, Pin, PinOff, Eye, EyeOff, Edit3, X, CheckCircle,
  Send, Bell, Music, Trophy, BookOpen, Mic2, Radio,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  id: string; title: string; description?: string; type: string
  date: string; time: string; venue: string; seats: number
  booked: number; price: number; isPublished: boolean
  artists: string[]; tags: string[]
  _count?: { registrations: number }
}

interface Post {
  id: string; title: string; body: string; category: string
  authorName: string; pinned: boolean; createdAt: string
  likedBy: string[]; _count: { comments: number }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EVENT_TYPES = ['CONCERT', 'WORKSHOP', 'MASTERCLASS', 'SHOWCASE']
const EVENT_ICONS: Record<string, any> = { CONCERT: Music, WORKSHOP: BookOpen, MASTERCLASS: Mic2, SHOWCASE: Trophy }
const TARGET_ROLES = [
  { value: 'ALL', label: 'All Users' },
  { value: 'STUDENT', label: 'Students Only' },
  { value: 'TEACHER', label: 'Teachers Only' },
]

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{label}</span>
}

// ─── Event Form Modal ─────────────────────────────────────────────────────────

function EventModal({ event, onClose, onSave }: {
  event: Partial<Event> | null; onClose: () => void; onSave: (data: any) => void
}) {
  const isNew = !event?.id
  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    type: event?.type ?? 'CONCERT',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 10) : '',
    time: event?.time ?? '',
    venue: event?.venue ?? '',
    seats: event?.seats ?? 100,
    price: event?.price ?? 0,
    artists: event?.artists?.join(', ') ?? '',
    tags: event?.tags?.join(', ') ?? '',
    isPublished: event?.isPublished ?? false,
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const data = {
      ...form,
      seats: Number(form.seats),
      price: Number(form.price),
      artists: form.artists.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
    }
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-white font-semibold">{isNew ? 'Create Event' : 'Edit Event'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white"><X size={18}/></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-400 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none">
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none [color-scheme:dark]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Time (e.g. 6:30 PM)</label>
              <input value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} placeholder="7:00 PM"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Venue *</label>
              <input value={form.venue} onChange={e => setForm(f => ({...f, venue: e.target.value}))} required
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Seats</label>
              <input type="number" min={1} value={form.seats} onChange={e => setForm(f => ({...f, seats: Number(e.target.value)}))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Price (₹)</label>
              <input type="number" min={0} value={form.price} onChange={e => setForm(f => ({...f, price: Number(e.target.value)}))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none"/>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-400 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none resize-none"/>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-400 mb-1">Artists (comma-separated)</label>
              <input value={form.artists} onChange={e => setForm(f => ({...f, artists: e.target.value}))} placeholder="Ravi Shankar, Zakir Hussain"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none"/>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-400 mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="classical, fusion"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none"/>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="pub" checked={form.isPublished} onChange={e => setForm(f => ({...f, isPublished: e.target.checked}))}
                className="w-4 h-4 rounded accent-amber-600"/>
              <label htmlFor="pub" className="text-sm text-stone-300">Publish immediately (visible to users)</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-stone-700 text-stone-400 rounded-xl text-sm hover:bg-stone-800">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving…' : isNew ? 'Create Event' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContentManagerPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'dashboard' | 'events' | 'broadcast' | 'community'>('dashboard')

  // Stats
  const [stats, setStats] = useState<any>(null)

  // Events
  const [events, setEvents] = useState<Event[]>([])
  const [eventModal, setEventModal] = useState<Partial<Event> | null | false>(false)

  // Broadcast
  const [bTitle, setBTitle] = useState('')
  const [bBody, setBBody]   = useState('')
  const [bType, setBType]   = useState('ANNOUNCEMENT')
  const [bTarget, setBTarget] = useState('ALL')
  const [bSending, setBSending] = useState(false)
  const [bResult, setBResult]   = useState<string | null>(null)

  // Community
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    if (!loading && user && user.role !== 'CONTENT_MANAGER' && user.role !== 'ADMIN') {
      router.push('/admin/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    api.content.stats().then(setStats).catch(() => {})
  }, [user])

  useEffect(() => {
    if (tab === 'events') api.content.events().then(setEvents).catch(() => {})
  }, [tab])

  useEffect(() => {
    if (tab === 'community') api.content.posts().then(setPosts).catch(() => {})
  }, [tab])

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!user || (user.role !== 'CONTENT_MANAGER' && user.role !== 'ADMIN')) return null

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleSaveEvent = async (data: any) => {
    if (eventModal && (eventModal as Event).id) {
      const updated = await api.content.updateEvent((eventModal as Event).id, data)
      setEvents(evs => evs.map(e => e.id === updated.id ? updated : e))
    } else {
      const created = await api.content.createEvent(data)
      setEvents(evs => [created, ...evs])
    }
    setEventModal(false)
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await api.content.deleteEvent(id)
    setEvents(evs => evs.filter(e => e.id !== id))
  }

  const handleTogglePublish = async (id: string) => {
    const updated = await api.content.toggleEventPublish(id)
    setEvents(evs => evs.map(e => e.id === updated.id ? updated : e))
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setBSending(true); setBResult(null)
    try {
      const res = await api.content.broadcast({ title: bTitle, body: bBody, type: bType, targetRole: bTarget })
      setBResult(`Sent to ${res.sent} users`)
      setBTitle(''); setBBody('')
    } catch (err: any) {
      setBResult(`Error: ${err.message}`)
    }
    setBSending(false)
  }

  const handlePinPost = async (id: string) => {
    await api.content.pinPost(id)
    setPosts(ps => ps.map(p => p.id === id ? {...p, pinned: !p.pinned} : p))
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await api.content.deletePost(id)
    setPosts(ps => ps.filter(p => p.id !== id))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const TABS = [
    { key: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
    { key: 'events',    label: 'Events',      icon: Calendar },
    { key: 'broadcast', label: 'Broadcast',   icon: Megaphone },
    { key: 'community', label: 'Community',   icon: Users },
  ] as const

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-stone-900 border-r border-stone-800 flex flex-col">
        <div className="px-5 py-5 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-900/40 border border-amber-700/50 rounded-lg flex items-center justify-center">
              <Radio size={15} className="text-amber-400"/>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Content Hub</p>
              <p className="text-stone-500 text-xs mt-0.5">SwaraSangam</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === key ? 'bg-amber-900/40 text-amber-300' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}>
              <Icon size={16}/>{label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-stone-300 text-xs font-semibold truncate">{user.email}</p>
            <p className="text-stone-600 text-xs">Content Manager</p>
          </div>
          <button onClick={() => { logout(); router.push('/admin/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 text-stone-500 hover:text-red-400 rounded-lg text-sm transition-colors">
            <LogOut size={14}/> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div className="p-8">
            <h1 className="text-2xl font-serif text-white mb-1">Content Dashboard</h1>
            <p className="text-stone-500 text-sm mb-8">Manage events, notifications, and community content.</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Events', value: stats?.totalEvents ?? '—', sub: `${stats?.publishedEvents ?? 0} published`, icon: Calendar, color: 'text-amber-400' },
                { label: 'Upcoming Events', value: stats?.upcomingEvents ?? '—', sub: 'live & open for registration', icon: Trophy, color: 'text-green-400' },
                { label: 'Broadcasts Sent', value: stats?.totalNotifications ?? '—', sub: 'total announcements', icon: Bell, color: 'text-blue-400' },
                { label: 'Community Posts', value: stats?.totalPosts ?? '—', sub: `${stats?.pinnedPosts ?? 0} pinned`, icon: Users, color: 'text-purple-400' },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-stone-400 text-sm">{label}</p>
                    <Icon size={16} className={color}/>
                  </div>
                  <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
                  <p className="text-stone-600 text-xs">{sub}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <h2 className="text-stone-300 font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => { setTab('events'); setEventModal({}) }}
                className="flex items-center gap-3 bg-stone-900 border border-stone-800 hover:border-amber-700 rounded-xl p-4 text-left transition-colors group">
                <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center group-hover:bg-amber-900/50">
                  <Plus size={18} className="text-amber-400"/>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">New Event</p>
                  <p className="text-stone-500 text-xs">Create concert/workshop</p>
                </div>
              </button>
              <button onClick={() => setTab('broadcast')}
                className="flex items-center gap-3 bg-stone-900 border border-stone-800 hover:border-blue-700 rounded-xl p-4 text-left transition-colors group">
                <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-900/50">
                  <Megaphone size={18} className="text-blue-400"/>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Broadcast</p>
                  <p className="text-stone-500 text-xs">Send platform notification</p>
                </div>
              </button>
              <button onClick={() => setTab('community')}
                className="flex items-center gap-3 bg-stone-900 border border-stone-800 hover:border-purple-700 rounded-xl p-4 text-left transition-colors group">
                <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-900/50">
                  <Users size={18} className="text-purple-400"/>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Moderate</p>
                  <p className="text-stone-500 text-xs">Review community posts</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Events ── */}
        {tab === 'events' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-serif text-white">Events</h1>
                <p className="text-stone-500 text-sm mt-0.5">Concerts, workshops, masterclasses & showcases</p>
              </div>
              <button onClick={() => setEventModal({})}
                className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                <Plus size={15}/> Create Event
              </button>
            </div>
            {events.length === 0 ? (
              <div className="text-center py-20 text-stone-600">
                <Calendar size={40} className="mx-auto mb-3 opacity-40"/>
                <p>No events yet — create your first event!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(ev => {
                  const Icon = EVENT_ICONS[ev.type] ?? Music
                  return (
                    <div key={ev.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-amber-400"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-medium text-sm">{ev.title}</p>
                          <Badge label={ev.type} color="bg-stone-800 text-stone-400"/>
                          {ev.isPublished
                            ? <Badge label="Published" color="bg-green-900/40 text-green-400"/>
                            : <Badge label="Draft" color="bg-yellow-900/40 text-yellow-500"/>}
                        </div>
                        <p className="text-stone-500 text-xs mt-0.5">
                          {new Date(ev.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {ev.time} · {ev.venue}
                          {ev.price > 0 ? ` · ₹${ev.price}` : ' · Free'}
                          {` · ${ev._count?.registrations ?? ev.booked}/${ev.seats} seats`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleTogglePublish(ev.id)} title={ev.isPublished ? 'Unpublish' : 'Publish'}
                          className="p-2 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors">
                          {ev.isPublished ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                        <button onClick={() => setEventModal(ev)} title="Edit"
                          className="p-2 rounded-lg text-stone-400 hover:text-blue-400 hover:bg-stone-800 transition-colors">
                          <Edit3 size={15}/>
                        </button>
                        <button onClick={() => handleDeleteEvent(ev.id)} title="Delete"
                          className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Broadcast ── */}
        {tab === 'broadcast' && (
          <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-serif text-white mb-1">Broadcast Notifications</h1>
            <p className="text-stone-500 text-sm mb-8">Send in-app notifications to users about new events, features, or updates.</p>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <form onSubmit={handleBroadcast} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Notification Type</label>
                    <select value={bType} onChange={e => setBType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white focus:border-amber-600 focus:outline-none">
                      <option value="ANNOUNCEMENT">Announcement</option>
                      <option value="EVENT">New Event</option>
                      <option value="FEATURE">New Feature</option>
                      <option value="REMINDER">Reminder</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Target Audience</label>
                    <select value={bTarget} onChange={e => setBTarget(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white focus:border-amber-600 focus:outline-none">
                      {TARGET_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Notification Title *</label>
                  <input value={bTitle} onChange={e => setBTitle(e.target.value)} required
                    placeholder="e.g. New Carnatic Concert this Saturday!"
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-600 focus:border-amber-600 focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Message *</label>
                  <textarea rows={4} value={bBody} onChange={e => setBBody(e.target.value)} required
                    placeholder="Write your notification message here. Keep it concise and engaging."
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-600 focus:border-amber-600 focus:outline-none resize-none"/>
                  <p className="text-stone-600 text-xs mt-1">{bBody.length}/300 characters</p>
                </div>

                {/* Preview */}
                {(bTitle || bBody) && (
                  <div className="bg-stone-800 border border-stone-700 rounded-xl p-4">
                    <p className="text-xs text-stone-500 mb-2 font-semibold uppercase tracking-wider">Preview</p>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0">
                        <Bell size={14} className="text-amber-400"/>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{bTitle || 'Title here'}</p>
                        <p className="text-stone-400 text-xs mt-0.5 leading-relaxed">{bBody || 'Message here'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {bResult && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                    bResult.startsWith('Error') ? 'bg-red-900/20 border border-red-800/40 text-red-400' : 'bg-green-900/20 border border-green-800/40 text-green-400'
                  }`}>
                    <CheckCircle size={15}/> {bResult}
                  </div>
                )}

                <button type="submit" disabled={bSending}
                  className="w-full flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors">
                  {bSending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Sending…</>
                    : <><Send size={15}/> Send Notification</>}
                </button>
              </form>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-950/30 border border-blue-800/30 rounded-xl p-4 space-y-2">
              <p className="text-blue-300 text-sm font-semibold">Best practices</p>
              <ul className="text-blue-400/70 text-xs space-y-1 list-disc list-inside">
                <li>Keep titles under 60 characters for mobile display</li>
                <li>Use "New Event" type for upcoming concerts/workshops</li>
                <li>Target students for learning tips; teachers for platform updates</li>
                <li>Avoid sending more than 2 broadcasts per week to prevent fatigue</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Community ── */}
        {tab === 'community' && (
          <div className="p-8">
            <h1 className="text-2xl font-serif text-white mb-1">Community Moderation</h1>
            <p className="text-stone-500 text-sm mb-6">Pin featured posts and remove content that violates community guidelines.</p>
            {posts.length === 0 ? (
              <div className="text-center py-20 text-stone-600">
                <Users size={40} className="mx-auto mb-3 opacity-40"/>
                <p>No community posts found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className={`bg-stone-900 border rounded-xl p-4 flex items-start gap-4 ${post.pinned ? 'border-amber-700/50' : 'border-stone-800'}`}>
                    {post.pinned && (
                      <div className="absolute">
                        <Pin size={12} className="text-amber-400"/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {post.pinned && <Badge label="Pinned" color="bg-amber-900/40 text-amber-400"/>}
                        <Badge label={post.category} color="bg-stone-800 text-stone-400"/>
                        <span className="text-stone-500 text-xs">{post.authorName}</span>
                        <span className="text-stone-700 text-xs">·</span>
                        <span className="text-stone-600 text-xs">{new Date(post.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="text-white text-sm font-medium">{post.title}</p>
                      <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{post.body}</p>
                      <p className="text-stone-600 text-xs mt-1">{post.likedBy?.length ?? 0} likes · {post._count?.comments ?? 0} comments</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handlePinPost(post.id)} title={post.pinned ? 'Unpin' : 'Pin to top'}
                        className={`p-2 rounded-lg transition-colors ${post.pinned ? 'text-amber-400 bg-amber-900/20 hover:bg-amber-900/40' : 'text-stone-400 hover:text-amber-400 hover:bg-stone-800'}`}>
                        {post.pinned ? <PinOff size={15}/> : <Pin size={15}/>}
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} title="Delete post"
                        className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Event modal */}
      {eventModal !== false && (
        <EventModal
          event={eventModal || null}
          onClose={() => setEventModal(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  )
}
