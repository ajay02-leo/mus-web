'use client'
import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { STUDENT_NAV, TEACHER_NAV } from '@/data/navData'
import { Bell, Search, User, Settings, LogOut, Menu, ChevronRight, CheckCheck, LayoutDashboard } from 'lucide-react'

const NOTIF_COLOR: Record<string, string> = {
  assignment_graded:   'bg-green-100 text-green-700',
  session_reminder:    'bg-blue-100 text-blue-600',
  new_assignment:      'bg-amber-100 text-amber-700',
  submission_received: 'bg-purple-100 text-purple-700',
  new_enrollment:      'bg-pink-100 text-pink-700',
  default:             'bg-stone-100 text-stone-600',
}

const ADMIN_NAV = [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard }]

interface Props { children: ReactNode; noPad?: boolean }

export default function DashboardLayout({ children, noPad = false }: Props) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [profileOpen, setProfile]     = useState(false)
  const [notifs, setNotifs]           = useState<any[]>([])
  const [readIds, setReadIds]         = useState<Set<string>>(new Set())

  const isTeacher = user?.role === 'TEACHER'
  const isAdmin   = user?.role === 'ADMIN'
  const navItems  = isAdmin ? ADMIN_NAV : isTeacher ? TEACHER_NAV : STUDENT_NAV

  useEffect(() => {
    if (!user) return
    api.notifications.list().then(d => setNotifs(Array.isArray(d) ? d : [])).catch(() => {})
  }, [user])

  const unread = notifs.filter(n => !n.read && !readIds.has(n.id)).length

  const markAllRead = async () => {
    try { await api.notifications.markAllRead(); setReadIds(new Set(notifs.map(n => n.id))) } catch {}
  }
  const markRead = async (id: string) => {
    try { await api.notifications.markRead(id); setReadIds(prev => new Set([...prev, id])) } catch {}
  }

  const displayName  = user?.teacher?.displayName ?? user?.student?.displayName ?? user?.email ?? '?'
  const initials     = displayName.split(' ').map((n: string) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'
  const profilePath  = isAdmin ? '/admin' : isTeacher ? '/teacher/profile' : '/student/profile'
  const settingsPath = isAdmin ? '/admin' : isTeacher ? '/teacher/settings' : '/student/settings'

  const closeDropdowns = () => { setNotifOpen(false); setProfile(false) }
  const handleLogout   = async () => { closeDropdowns(); await logout(); router.push('/') }

  return (
    <div className="flex min-h-screen bg-amber-50/60">
      {(notifOpen || profileOpen) && <div className="fixed inset-0 z-30" onClick={closeDropdowns} />}

      <Sidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto min-w-0 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-stone-100 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 flex-shrink-0 gap-3">
          {/* Hamburger (mobile) */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-colors flex-shrink-0">
            <Menu size={20} />
          </button>

          {/* Search (desktop only) */}
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input placeholder="Search…" className="pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-amber-400 w-44" />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Bell */}
            <div className="relative z-50">
              <button onClick={() => { setNotifOpen(o => !o); setProfile(false) }}
                className="relative p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-colors">
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold">{unread}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                    <p className="font-serif font-semibold text-stone-900 text-sm">Notifications</p>
                    <button onClick={markAllRead} className="text-xs text-amber-700 hover:text-amber-600 flex items-center gap-1">
                      <CheckCheck size={12}/> Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-50">
                    {notifs.length === 0 ? (
                      <p className="p-6 text-stone-400 text-sm text-center">No notifications</p>
                    ) : notifs.map(n => {
                      const isRead = n.read || readIds.has(n.id)
                      return (
                        <div key={n.id} onClick={() => markRead(n.id)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-amber-50/50 transition-colors cursor-pointer ${!isRead ? 'bg-amber-50/30' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${NOTIF_COLOR[n.type] ?? NOTIF_COLOR.default}`}>
                            {n.title?.[0] ?? '!'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-stone-800 text-xs truncate">{n.title}</p>
                              {!isRead && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"/>}
                            </div>
                            <p className="text-stone-400 text-xs mt-0.5 line-clamp-2">{n.body}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative z-50">
              <button onClick={() => { setProfile(o => !o); setNotifOpen(false) }}
                className="w-9 h-9 rounded-full bg-amber-700 flex items-center justify-center text-white text-sm font-bold hover:bg-amber-600 transition-colors ring-2 ring-transparent hover:ring-amber-200">
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="font-semibold text-stone-800 text-sm truncate">{displayName}</p>
                    <p className="text-stone-400 text-xs mt-0.5 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium capitalize">{user?.role?.toLowerCase()}</span>
                  </div>
                  <div className="py-1">
                    <Link href={profilePath} onClick={closeDropdowns} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 transition-colors">
                      <User size={15} className="text-stone-400"/> View Profile
                    </Link>
                    <Link href={settingsPath} onClick={closeDropdowns} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 transition-colors">
                      <Settings size={15} className="text-stone-400"/> Settings
                    </Link>
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={15} className="text-red-500"/> Log out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={`flex-1 ${noPad ? '' : 'p-4 md:p-6 lg:p-8'}`}>{children}</div>
      </main>
    </div>
  )
}
