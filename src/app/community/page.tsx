'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Music, MessageSquare, ThumbsUp, Bookmark, Share2, Plus, Search, TrendingUp, Users, Tag, ChevronRight } from 'lucide-react'

const CATEGORIES = ['All', 'Ragas', 'Technique', 'Compositions', 'Practice Tips', 'Concerts', 'Equipment', 'Beginner Q&A']

const ROLE_BADGE: Record<string, string> = {
  TEACHER: 'bg-amber-100 text-amber-700',
  STUDENT: 'bg-stone-100 text-stone-600',
  ADMIN:   'bg-purple-100 text-purple-700',
}

export default function Community() {
  const { user } = useAuth()
  const [posts, setPosts]       = useState<any[]>([])
  const [stats, setStats]       = useState<any>({})
  const [loading, setLoad]      = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch]     = useState('')
  const [liked, setLiked]       = useState<Record<string, boolean>>({})
  const [bookmarked, setBook]   = useState<Record<string, boolean>>({})
  const [showNew, setShowNew]   = useState(false)
  const [newPost, setNewPost]   = useState({ title: '', body: '', category: 'Ragas' })
  const [posting, setPosting]   = useState(false)

  const load = () => {
    const params: any = {}
    if (category !== 'All') params.category = category
    if (search) params.search = search
    return api.community.posts(params).then(data => {
      setPosts(data)
      // Seed liked/bookmarked from server data for current user
      if (user) {
        const likedMap: Record<string, boolean> = {}
        const bookMap: Record<string, boolean> = {}
        data.forEach((p: any) => {
          likedMap[p.id] = (p.likedBy ?? []).includes(user.id)
          bookMap[p.id] = (p.bookmarkedBy ?? []).includes(user.id)
        })
        setLiked(likedMap)
        setBook(bookMap)
      }
    })
  }

  useEffect(() => {
    Promise.all([
      load(),
      api.community.stats().then(setStats),
    ]).catch(() => {}).finally(() => setLoad(false))
  }, [])

  useEffect(() => {
    if (!loading) load().catch(() => {})
  }, [category, search])

  const toggleLike = async (id: string) => {
    if (!user) return
    const was = liked[id]
    setLiked(prev => ({ ...prev, [id]: !prev[id] }))
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (was ? -1 : 1) } : p))
    try { await api.community.likePost(id) } catch {
      setLiked(prev => ({ ...prev, [id]: was }))
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (was ? 1 : -1) } : p))
    }
  }

  const toggleBookmark = async (id: string) => {
    if (!user) return
    const was = bookmarked[id]
    setBook(prev => ({ ...prev, [id]: !prev[id] }))
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarks: p.bookmarks + (was ? -1 : 1) } : p))
    try { await api.community.bookmarkPost(id) } catch {
      setBook(prev => ({ ...prev, [id]: was }))
    }
  }

  const submitPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return
    setPosting(true)
    try {
      const post = await api.community.createPost(newPost)
      setPosts(prev => [{ ...post, authorName: user?.teacher?.displayName ?? user?.student?.displayName ?? 'You', authorRole: user?.role, authorAvatar: (user?.teacher?.displayName ?? user?.student?.displayName ?? 'U')[0].toUpperCase(), likes: 0, bookmarks: 0, replies: 0 }, ...prev])
      setNewPost({ title: '', body: '', category: 'Ragas' })
      setShowNew(false)
    } catch {}
    setPosting(false)
  }

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
            <Link href="/events" className="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors">Events</Link>
            {user ? (
              <Link href={`/${user.role.toLowerCase()}`} className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Dashboard</Link>
            ) : (
              <Link href="/login" className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main feed */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">Community</h1>
                <p className="text-stone-500 text-sm mt-0.5">Discuss, learn, and connect with fellow musicians.</p>
              </div>
              {user && (
                <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  <Plus size={15}/> New Post
                </button>
              )}
            </div>

            {showNew && (
              <div className="bg-white border border-amber-200 rounded-2xl p-5 mb-6 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-4">Create a Post</h3>
                <div className="space-y-3">
                  <select value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                    placeholder="Post title…" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none"/>
                  <textarea rows={4} value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))}
                    placeholder="Share your thoughts, questions, or insights…" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none resize-none"/>
                  <div className="flex gap-2">
                    <button onClick={submitPost} disabled={posting}
                      className="bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      {posting ? 'Posting…' : 'Post'}
                    </button>
                    <button onClick={() => setShowNew(false)} className="border border-stone-200 text-stone-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative mb-5">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions…"
                className="w-full pl-9 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white shadow-sm"/>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${category === c ? 'bg-amber-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                  {c}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <MessageSquare size={32} className="mx-auto mb-3 text-stone-200"/>
                <p className="font-medium">No posts yet</p>
                <p className="text-sm mt-1">Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${post.pinned ? 'border-amber-200' : 'border-stone-100'}`}>
                    {post.pinned && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mb-3">
                        <TrendingUp size={12}/> Pinned by moderator
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                        {post.authorAvatar ?? post.authorName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-stone-800 text-sm">{post.authorName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[post.authorRole] ?? ROLE_BADGE.STUDENT}`}>{post.authorRole}</span>
                          <span className="text-xs text-stone-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-xs text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full mt-1 inline-block">{post.category}</span>
                      </div>
                    </div>
                    <h3 className="font-serif font-semibold text-stone-900 mb-2 text-lg leading-tight">{post.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.body}</p>

                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map((t: string) => (
                          <span key={t} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                            <Tag size={9}/> {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-stone-400 pt-3 border-t border-stone-50">
                      <button onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${liked[post.id] ? 'text-amber-600' : 'hover:text-stone-600'}`}>
                        <ThumbsUp size={13} fill={liked[post.id] ? 'currentColor' : 'none'}/> {post.likes ?? 0}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-stone-600 transition-colors">
                        <MessageSquare size={13}/> {post.replies ?? 0} replies
                      </button>
                      <button onClick={() => toggleBookmark(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${bookmarked[post.id] ? 'text-amber-600' : 'hover:text-stone-600'}`}>
                        <Bookmark size={13} fill={bookmarked[post.id] ? 'currentColor' : 'none'}/> {post.bookmarks ?? 0}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-stone-600 transition-colors ml-auto">
                        <Share2 size={13}/> Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0 space-y-5">
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-serif font-semibold text-stone-800 mb-4">Community Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Members',      value: stats.members ?? '—',    icon: Users },
                  { label: 'Discussions',  value: stats.totalPosts ?? '—', icon: MessageSquare },
                  { label: 'Posts today',  value: stats.todayPosts ?? '—', icon: TrendingUp },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <s.icon size={14} className="text-amber-600"/>{s.label}
                    </div>
                    <span className="font-bold text-stone-900 text-sm">{String(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {!user && (
              <div className="bg-gradient-to-br from-amber-900 to-stone-900 rounded-2xl p-5 text-white text-center">
                <p className="font-serif font-bold text-lg mb-2">Join the Conversation</p>
                <p className="text-stone-300 text-xs mb-4">Sign up to post, like, and bookmark discussions.</p>
                <Link href="/register" className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  <ChevronRight size={14}/> Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
