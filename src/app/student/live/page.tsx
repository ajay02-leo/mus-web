'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Video, Mic, MicOff, VideoOff, MessageSquare, Users, Phone, ExternalLink, Calendar } from 'lucide-react'

export default function LiveClass() {
  const [muted, setMuted]     = useState(false)
  const [camOff, setCam]      = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoad]    = useState(true)

  useEffect(() => {
    api.sessions.list()
      .then((list: any[]) => {
        const upcoming = list.filter(s => s.status === 'SCHEDULED')
        setSession(upcoming[0] ?? null)
      })
      .catch(() => {})
      .finally(() => setLoad(false))
  }, [])

  const teacherName = session?.teacher?.displayName ?? session?.teacher?.user?.name ?? 'Your Teacher'
  const initials    = teacherName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const sessionTitle = session?.raga ? `${session.raga} Session` : 'Carnatic Class'
  const scheduledStr = session?.scheduledAt ? new Date(session.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Live Class</h1>
          <p className="text-stone-500 text-sm mt-1">Your video session with your teacher.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : !session ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
            <Calendar size={36} className="text-stone-200 mx-auto mb-3"/>
            <p className="text-stone-500 font-medium">No upcoming sessions</p>
            <p className="text-stone-400 text-sm mt-1">Your teacher will schedule a session and share a meeting link.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Video area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Teacher video / meeting area */}
              <div className="bg-stone-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 bg-amber-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                  <p className="text-white font-semibold">{teacherName}</p>
                  {session.meetingUrl ? (
                    <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      <ExternalLink size={14}/> Join Meeting
                    </a>
                  ) : (
                    <p className="text-stone-400 text-sm">Waiting for teacher to share link…</p>
                  )}
                </div>
                <div className="absolute top-3 left-3 bg-black/40 rounded-full px-3 py-1 text-xs text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"/> {sessionTitle}
                </div>
                {scheduledStr && (
                  <div className="absolute top-3 right-3 bg-black/40 rounded-full px-3 py-1 text-xs text-white">
                    {scheduledStr}
                  </div>
                )}
              </div>

              {/* Self preview */}
              <div className="bg-stone-800 rounded-xl h-24 flex items-center justify-center relative">
                {camOff ? (
                  <div className="flex flex-col items-center gap-1 text-stone-500">
                    <VideoOff size={20}/>
                    <p className="text-xs">Camera off</p>
                  </div>
                ) : (
                  <div className="text-stone-500 text-sm">Your camera preview</div>
                )}
                <span className="absolute bottom-2 left-2 text-xs text-stone-400">You</span>
              </div>

              {/* Controls */}
              <div className="bg-stone-900 rounded-2xl p-4 flex items-center justify-center gap-4">
                <button onClick={() => setMuted(!muted)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-600 text-white' : 'bg-stone-700 hover:bg-stone-600 text-white'}`}>
                  {muted ? <MicOff size={18}/> : <Mic size={18}/>}
                </button>
                <button onClick={() => setCam(!camOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOff ? 'bg-red-600 text-white' : 'bg-stone-700 hover:bg-stone-600 text-white'}`}>
                  {camOff ? <VideoOff size={18}/> : <Video size={18}/>}
                </button>
                <button className="w-16 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors">
                  <Phone size={18} className="rotate-135"/>
                </button>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm flex flex-col overflow-hidden h-96 lg:h-auto">
              <div className="p-4 border-b border-stone-100 flex items-center gap-2">
                <MessageSquare size={16} className="text-stone-400"/>
                <span className="font-semibold text-stone-800 text-sm">Class Chat</span>
              </div>
              <div className="flex-1 p-4 text-center text-stone-400 text-sm flex items-center justify-center">
                <div>
                  <Users size={28} className="mx-auto mb-2 text-stone-200"/>
                  <p>Messages will appear here during the live session.</p>
                </div>
              </div>
              <div className="p-3 border-t border-stone-100 flex gap-2">
                <input placeholder="Type a message…" className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-400"/>
                <button className="bg-amber-700 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors">Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
