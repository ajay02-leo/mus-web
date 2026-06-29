'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Music, LogOut, X } from 'lucide-react'

interface NavItem { label: string; path: string; icon: any; badge?: number }
interface Props { navItems: NavItem[]; isOpen: boolean; onClose: () => void }

export default function Sidebar({ navItems, isOpen, onClose }: Props) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => { onClose() }, [pathname])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const displayName = user?.teacher?.displayName ?? user?.student?.displayName ?? user?.email ?? ''
  const initials = displayName.split(' ').map((n: string) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'
  const handleLogout = async () => { await logout(); router.push('/') }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 min-h-screen flex flex-col flex-shrink-0 bg-[#1c0f05]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-5 py-4 border-b border-amber-900/30 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center group-hover:bg-amber-600 transition-colors">
              <Music size={16} className="text-white" />
            </div>
            <span className="text-white font-serif text-base font-semibold">SwaraSangam</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-amber-200/50 hover:text-white p-1 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{displayName}</p>
              <p className="text-amber-400/70 text-xs capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link key={item.label} href={item.path ?? '#'} onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-700/30 border-l-4 border-amber-500 text-amber-200 pl-3'
                    : 'text-amber-200/55 hover:bg-amber-900/30 hover:text-amber-200'
                }`}>
                <Icon size={17} className="flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto bg-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-amber-900/30">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-200/55 hover:bg-red-900/20 hover:text-red-400 w-full transition-colors">
            <LogOut size={17} className="flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
