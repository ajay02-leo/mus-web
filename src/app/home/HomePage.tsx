'use client'
import Link from 'next/link'
import TamburaSVG from '@/components/TamburaSVG'
import { Music, Star, Users, BookOpen, Bot, Mic, Calendar, TrendingUp,
  Gauge, Timer, Layers, Sun, CheckCircle, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react'

const STATS = [
  { value: '2,400+', label: 'Students Enrolled' },
  { value: '85+',    label: 'Expert Teachers' },
  { value: '50+',    label: 'Ragas Taught' },
  { value: '98%',    label: 'Satisfaction Rate' },
]

const FEATURES = [
  { icon: Mic,       title: 'AI Pitch Detection',     desc: 'Real-time shruti analysis while you sing' },
  { icon: Bot,       title: 'AI Guru',                desc: 'Instant Carnatic music guidance 24/7' },
  { icon: Calendar,  title: 'Smart Scheduling',       desc: 'Book sessions with verified vidwans' },
  { icon: TrendingUp,title: 'Progress Analytics',     desc: '5-dimension skill tracking dashboard' },
  { icon: Timer,     title: 'Tala Keeper',            desc: 'Interactive rhythm trainer' },
  { icon: Gauge,     title: 'Pitch Lab',              desc: 'Visualize every swara in real time' },
  { icon: Layers,    title: 'Recording Compare',      desc: 'Side-by-side with your teacher\'s reference' },
  { icon: Sun,       title: 'Raga of the Day',        desc: 'Daily raga spotlight with theory' },
  { icon: GraduationCap, title: 'Gamified Learning',  desc: 'XP, badges, levels, and streaks' },
]

const TEACHERS = [
  { avatar: 'VK', name: 'Vidwan S. Krishnamurthy', specialty: 'Carnatic Vocal', rating: 4.9, students: 142 },
  { avatar: 'LS', name: 'Smt. Lalitha Subramanian', specialty: 'Veena',          rating: 4.8, students: 88  },
  { avatar: 'RV', name: 'Pandit R. Venkataraman',   specialty: 'Mridangam',      rating: 5.0, students: 55  },
  { avatar: 'MP', name: 'Dr. Meenakshi Pillai',      specialty: 'Flute',          rating: 4.7, students: 120 },
]

const SERVICES = [
  { icon: '🎵', title: 'One-on-One Training',   desc: 'Private lessons with expert vidwans',        price: 'From ₹800/hr', badge: 'Most Popular' },
  { icon: '👥', title: 'Group Classes',          desc: 'Learn alongside peers, structured sessions', price: 'From ₹300/hr', badge: 'Budget Friendly' },
  { icon: '🤖', title: 'AI-Powered Training',   desc: 'AI companion that hears and guides you',     price: 'From ₹200/mo', badge: 'New ✨' },
  { icon: '💻', title: 'Online Classes',         desc: 'HD virtual classes from anywhere',           price: 'From ₹500/hr', badge: 'Flexible' },
  { icon: '🎶', title: 'Song-Specific Training', desc: 'Deep dive into a specific kriti',            price: 'From ₹600/session', badge: null },
  { icon: '🎭', title: 'Live Concerts',          desc: 'Participate in curated Carnatic concerts',  price: 'From ₹500/event', badge: null },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-950 font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-amber-900/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-amber-700 rounded-xl flex items-center justify-center">
            <Music size={19} className="text-white"/>
          </div>
          <span className="text-white font-serif text-xl font-semibold tracking-wide">SwaraSangam</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-amber-200/70 hover:text-white text-sm font-medium transition-colors px-4 py-2">Sign in</Link>
          <Link href="/register" className="bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-800/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-800/40 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"/>
              <span className="text-amber-300 text-xs font-semibold tracking-wider uppercase">India&apos;s #1 Carnatic Platform</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif text-white leading-tight mb-6">
              Learn Carnatic Music from the{' '}
              <span className="text-amber-400">Finest Vidwans</span>
            </h1>
            <p className="text-stone-400 text-lg leading-relaxed mb-10 max-w-xl">
              Expert one-on-one training, AI-powered practice tools, and structured courses — from Foundation to Advanced Alapana.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-semibold text-base transition-colors flex items-center gap-2 shadow-lg shadow-amber-900/30">
                Start your journey <ArrowRight size={18}/>
              </Link>
              <a href="#features" className="border border-stone-700 hover:border-amber-700 text-stone-300 hover:text-white px-8 py-4 rounded-2xl font-semibold text-base transition-colors">
                Explore features
              </a>
            </div>
            <div className="flex flex-wrap gap-8 mt-12">
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-serif font-bold text-amber-400">{s.value}</div>
                  <div className="text-stone-500 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex justify-center relative">
            <TamburaSVG className="h-80 w-auto opacity-90 animate-float drop-shadow-2xl"/>
            {/* Floating stat cards */}
            {[
              { label: 'Shruti Accuracy', value: '94%', pos: 'top-0 -left-8' },
              { label: 'Practice Streak', value: '14 days', pos: 'top-1/3 -right-4' },
              { label: 'AI Guru',         value: 'Online',  pos: 'bottom-12 -left-4' },
            ].map(c => (
              <div key={c.label} className={`absolute ${c.pos} bg-stone-900/90 backdrop-blur-md border border-amber-900/50 rounded-2xl px-4 py-3 shadow-xl`}>
                <div className="text-amber-400 text-xs font-semibold">{c.label}</div>
                <div className="text-white text-sm font-serif font-bold mt-0.5">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-stone-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl font-serif text-white mb-4">Everything you need to excel</h2>
            <p className="text-stone-400 max-w-xl mx-auto">From real-time pitch detection to AI-powered coaching — SwaraSangam has the tools to take you from beginner to concert-ready.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-stone-900 border border-stone-800 hover:border-amber-800/50 rounded-2xl p-6 group transition-colors">
                  <div className="w-12 h-12 bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-800/40 transition-colors">
                    <Icon size={22} className="text-amber-400"/>
                  </div>
                  <h3 className="font-serif text-white text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6 bg-stone-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Our Services</p>
            <h2 className="text-4xl font-serif text-white">Learn your way</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-stone-950 border border-stone-800 rounded-2xl p-6 hover:border-amber-800/50 transition-colors">
                {s.badge && <span className="text-xs font-bold bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full mb-3 inline-block">{s.badge}</span>}
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-serif text-white text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-stone-400 text-sm mb-4">{s.desc}</p>
                <p className="text-amber-400 font-semibold text-sm">{s.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section className="py-24 px-6 bg-stone-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Expert Teachers</p>
            <h2 className="text-4xl font-serif text-white">Learn from the masters</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEACHERS.map(t => (
              <div key={t.name} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-amber-800/50 transition-colors">
                <div className="bg-gradient-to-br from-amber-900 to-stone-900 p-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-white font-serif font-semibold text-sm leading-tight">{t.name}</p>
                    <p className="text-amber-400/70 text-xs">{t.specialty}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor"/><span className="text-sm font-bold">{t.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400 text-xs">
                    <Users size={12}/> {t.students} students
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-amber-900 to-stone-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-serif text-white mb-4">Begin your musical journey today</h2>
          <p className="text-amber-200/70 text-lg mb-10">Join 2,400+ students learning Carnatic music with India&apos;s finest teachers.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register?role=student" className="bg-white text-amber-900 hover:bg-amber-50 px-8 py-4 rounded-2xl font-bold text-base transition-colors flex items-center gap-2">
              <GraduationCap size={20}/> Join as Student
            </Link>
            <Link href="/register?role=teacher" className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-2xl font-bold text-base transition-colors flex items-center gap-2">
              <BookOpen size={20}/> Join as Teacher
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-900 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-amber-700 rounded-lg flex items-center justify-center">
            <Music size={15} className="text-white"/>
          </div>
          <span className="text-white font-serif text-lg">SwaraSangam</span>
        </div>
        <p className="text-stone-600 text-sm">© 2026 SwaraSangam. Built with love for Carnatic music.</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link href="/login" className="text-stone-500 hover:text-amber-400 text-xs transition-colors">Sign In</Link>
          <Link href="/admin/login" className="text-stone-700 hover:text-stone-500 text-xs transition-colors">Admin</Link>
        </div>
      </footer>
    </div>
  )
}
