'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Send, Bot, User, Sparkles } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'What are the arohanam and avarohanam of Shankarabharanam?',
  'How do I practice Sarali Varisai correctly?',
  'What is the difference between Varali and Todi ragas?',
  'Explain Tisra Jaati Ata Tala',
  'Tips for improving pitch accuracy',
]

export default function AIGuru() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaskaram! I am your AI Guru, here to guide you on your Carnatic music journey. Ask me anything about ragas, talas, exercises, theory, or practice tips!' }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoad]  = useState(false)
  const bottomRef           = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoad(true)

    try {
      const reply = await api.ai.chat(newMessages.map(m => ({ role: m.role, content: m.content })))
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not respond right now. Please try again.' }])
    }
    setLoad(false)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        <div className="mb-4">
          <h1 className="text-2xl font-serif font-bold text-stone-900">AI Guru</h1>
          <p className="text-stone-500 text-sm mt-1">Your personal Carnatic music expert — available 24/7.</p>
        </div>

        <div className="flex-1 bg-white border border-stone-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-amber-900 to-stone-900 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-700 rounded-xl flex items-center justify-center">
              <Bot size={20} className="text-white"/>
            </div>
            <div>
              <p className="font-serif font-semibold text-white">AI Guru</p>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-400 rounded-full"/><span className="text-amber-300/70 text-xs">Online · Powered by Claude</span></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={16} className="text-amber-700"/>
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-amber-700 text-white rounded-br-none' : 'bg-stone-50 text-stone-800 rounded-bl-none border border-stone-100'
                }`}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={15} className="text-stone-600"/>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-amber-700"/>
                </div>
                <div className="bg-stone-50 border border-stone-100 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:0ms]"/>
                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:150ms]"/>
                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:300ms]"/>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {messages.length <= 1 && (
            <div className="px-5 pb-3">
              <p className="text-xs text-stone-400 mb-2 flex items-center gap-1"><Sparkles size={11}/> Try asking…</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-stone-100">
            <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about ragas, talas, exercises…" disabled={loading}
                className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/15 transition-all"/>
              <button type="submit" disabled={!input.trim() || loading}
                className="w-11 h-11 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <Send size={16}/>
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
