'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import {
  Users, GraduationCap, BookOpen, IndianRupee, TrendingUp,
  ShieldCheck, Ban, Search, RefreshCw, BarChart3, Clock,
  CheckCircle, XCircle, ChevronRight, BadgeCheck, BadgeX
} from 'lucide-react'

const ROLE_BADGE: Record<string, string> = {
  STUDENT: 'bg-blue-50 text-blue-700',
  TEACHER: 'bg-amber-50 text-amber-700',
  ADMIN:   'bg-purple-50 text-purple-700',
}
const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    'bg-green-50 text-green-700',
  SUSPENDED: 'bg-red-50 text-red-700',
}
const COURSE_STATUS: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: 'Pending',  color: 'bg-yellow-50 text-yellow-700' },
  APPROVED:       { label: 'Approved', color: 'bg-green-50 text-green-700'  },
  REJECTED:       { label: 'Rejected', color: 'bg-red-50 text-red-700'      },
}

type Tab = 'users' | 'courses' | 'payments' | 'stats' | 'teachers'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tab, setTab]           = useState<Tab>('users')
  const [users, setUsers]       = useState<any[]>([])
  const [courses, setCourses]   = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [paymentsTotal, setPaymentsTotal] = useState(0)
  const [loading, setLoad]      = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleF]  = useState('ALL')
  const [courseFilter, setCF]   = useState('ALL')
  const [statsData, setStats]   = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [teacherFilter, setTF]  = useState('ALL')

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') router.replace('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    Promise.all([
      api.admin.users({ limit: 100 }).then(setUsers),
      api.admin.courses().then(setCourses),
      api.admin.payments().then((d: any) => { setPayments(d?.payments ?? []); setPaymentsTotal(d?.total ?? 0) }),
      api.admin.stats().then(setStats),
      api.admin.teachers().then(setTeachers),
    ]).catch(() => {}).finally(() => setLoad(false))
  }, [user])

  if (authLoading || user?.role !== 'ADMIN') return null

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchQ    = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchQ
  })

  const filteredCourses = courses.filter(c =>
    courseFilter === 'ALL' || c.status === courseFilter
  )

  const pendingCount = courses.filter(c => c.status === 'PENDING_REVIEW').length
  const unverifiedCount = teachers.filter(t => !t.isVerified).length

  const filteredTeachers = teachers.filter(t =>
    teacherFilter === 'ALL' ? true : teacherFilter === 'VERIFIED' ? t.isVerified : !t.isVerified
  )

  const handleVerifyTeacher = async (t: any) => {
    try {
      if (t.isVerified) {
        await api.admin.unverifyTeacher(t.id)
        setTeachers(prev => prev.map(x => x.id === t.id ? { ...x, isVerified: false } : x))
      } else {
        await api.admin.verifyTeacher(t.id)
        setTeachers(prev => prev.map(x => x.id === t.id ? { ...x, isVerified: true } : x))
      }
    } catch {}
  }

  const handleSuspend = async (u: any) => {
    try {
      if (u.status === 'SUSPENDED') {
        await api.admin.restore(u.id)
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'ACTIVE' } : x))
      } else {
        await api.admin.suspend(u.id)
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'SUSPENDED' } : x))
      }
    } catch {}
  }

  const handleApprove = async (id: string) => {
    try {
      await api.admin.approveCourse(id)
      setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED', isPublished: true } : c))
    } catch {}
  }

  const handleReject = async (id: string) => {
    try {
      await api.admin.rejectCourse(id)
      setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED', isPublished: false } : c))
    } catch {}
  }

  const s = statsData?.stats ?? {}
  const STATS = [
    { label: 'Total Students',  value: String(s.totalStudents ?? '—'),                            icon: GraduationCap, color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Active Teachers', value: String(s.totalTeachers ?? '—'),                            icon: Users,         color: 'text-amber-600',  bg: 'bg-amber-50'  },
    { label: 'Active Courses',  value: String(s.totalCourses ?? '—'),                             icon: BookOpen,      color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Total Revenue',   value: `₹${(paymentsTotal ?? 0).toLocaleString('en-IN')}`,        icon: IndianRupee,   color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const monthlySignups: { month: string; students: number; teachers: number }[] = statsData?.monthlySignups ?? []
  const maxSignup = Math.max(...monthlySignups.map(m => m.students), 1)

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'users',    label: 'Users'     },
    { key: 'teachers', label: 'Teachers', badge: unverifiedCount },
    { key: 'courses',  label: 'Courses',  badge: pendingCount    },
    { key: 'payments', label: 'Payments'  },
    { key: 'stats',    label: 'Analytics' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} className="text-purple-600"/>
              <h1 className="text-2xl font-serif font-bold text-stone-900">Admin Dashboard</h1>
            </div>
            <p className="text-stone-500 text-sm">Platform management, course approvals, and payments.</p>
          </div>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">ADMIN</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-400">{s.label}</span>
                <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon size={15} className={s.color}/>
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-stone-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px ${tab === t.key ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
              {t.label}
              {t.badge ? (
                <span className="bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                  className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none bg-white shadow-sm"/>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['ALL', 'STUDENT', 'TEACHER', 'ADMIN'].map(r => (
                  <button key={r} onClick={() => setRoleF(r)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${roleFilter === r ? 'bg-amber-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
            ) : (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                              {u.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <p className="font-medium text-stone-800">{u.name}</p>
                              <p className="text-xs text-stone-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role] ?? 'bg-stone-50 text-stone-600'}`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[u.status] ?? STATUS_BADGE.ACTIVE}`}>{u.status ?? 'ACTIVE'}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-stone-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {u.role !== 'ADMIN' && (
                            <button onClick={() => handleSuspend(u)}
                              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${u.status === 'SUSPENDED' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                              {u.status === 'SUSPENDED' ? <><RefreshCw size={11}/> Restore</> : <><Ban size={11}/> Suspend</>}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="py-12 text-center text-stone-400 text-sm">No users found.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Teachers tab */}
        {tab === 'teachers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-stone-500">{teachers.length} teachers · {teachers.filter(t => t.isVerified).length} verified</p>
              <div className="flex gap-1.5">
                {[['ALL', 'All'], ['VERIFIED', 'Verified'], ['UNVERIFIED', 'Pending']].map(([val, label]) => (
                  <button key={val} onClick={() => setTF(val)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${teacherFilter === val ? 'bg-amber-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    {['Teacher', 'Email', 'Courses', 'Sessions', 'Verified', 'Action'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredTeachers.map((t: any) => (
                    <tr key={t.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                            {t.displayName?.[0]?.toUpperCase() ?? 'T'}
                          </div>
                          <div>
                            <p className="font-medium text-stone-800 flex items-center gap-1.5">
                              {t.displayName}
                              {t.isVerified && <BadgeCheck size={14} className="text-blue-500 flex-shrink-0"/>}
                            </p>
                            <p className="text-xs text-stone-400">{t.specialization?.join(', ') || 'No specialization'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-stone-400">{t.user?.email}</td>
                      <td className="px-5 py-4 text-center text-stone-600 font-medium">{t._count?.courses ?? 0}</td>
                      <td className="px-5 py-4 text-center text-stone-600 font-medium">{t._count?.sessions ?? 0}</td>
                      <td className="px-5 py-4">
                        {t.isVerified
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full"><BadgeCheck size={11}/> Verified</span>
                          : <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">Unverified</span>}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleVerifyTeacher(t)}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${t.isVerified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                          {t.isVerified ? <><BadgeX size={11}/> Revoke</> : <><BadgeCheck size={11}/> Verify</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTeachers.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-sm">No teachers found.</div>
              )}
            </div>
          </div>
        )}

        {/* Courses tab */}
        {tab === 'courses' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'].map(f => (
                <button key={f} onClick={() => setCF(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${courseFilter === f ? 'bg-amber-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                  {f === 'ALL' ? 'All' : f === 'PENDING_REVIEW' ? `Pending (${pendingCount})` : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
                <BookOpen size={32} className="text-stone-200 mx-auto mb-3"/>
                <p className="text-stone-500 text-sm">No courses in this category.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map((c: any) => {
                  const st = COURSE_STATUS[c.status] ?? COURSE_STATUS.PENDING_REVIEW
                  return (
                    <div key={c.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-amber-900 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BookOpen size={16} className="text-amber-300"/>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-800 leading-tight">{c.title}</p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {c.teacher?.displayName ?? 'Unknown teacher'} · {c.level} · ₹{(c.price ?? 0).toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-stone-400">
                              {c._count?.enrollments ?? 0} enrolled · Submitted {new Date(c.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                        {c.status === 'PENDING_REVIEW' && (
                          <>
                            <button onClick={() => handleApprove(c.id)}
                              className="flex items-center gap-1 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl transition-colors">
                              <CheckCircle size={12}/> Approve
                            </button>
                            <button onClick={() => handleReject(c.id)}
                              className="flex items-center gap-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl transition-colors">
                              <XCircle size={12}/> Reject
                            </button>
                          </>
                        )}
                        {c.status === 'APPROVED' && (
                          <button onClick={() => handleReject(c.id)}
                            className="flex items-center gap-1 text-xs font-semibold bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 px-3 py-2 rounded-xl transition-colors">
                            <XCircle size={12}/> Revoke
                          </button>
                        )}
                        {c.status === 'REJECTED' && (
                          <button onClick={() => handleApprove(c.id)}
                            className="flex items-center gap-1 text-xs font-semibold bg-stone-50 hover:bg-green-50 text-stone-500 hover:text-green-700 px-3 py-2 rounded-xl transition-colors">
                            <CheckCircle size={12}/> Re-approve
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Payments tab */}
        {tab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-stone-500">{payments.length} transactions · Total collected: <span className="font-bold text-stone-800">₹{paymentsTotal.toLocaleString('en-IN')}</span></p>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
            ) : payments.length === 0 ? (
              <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center shadow-sm">
                <IndianRupee size={32} className="text-stone-200 mx-auto mb-3"/>
                <p className="text-stone-500 text-sm">No payments yet. Students will appear here after enrolling.</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      {['Student', 'Course', 'Teacher', 'Amount', 'Ref', 'Date'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-stone-800">{p.studentName}</p>
                          <p className="text-xs text-stone-400">{p.studentEmail}</p>
                        </td>
                        <td className="px-5 py-4 text-stone-700 max-w-[180px]">
                          <p className="truncate">{p.courseTitle}</p>
                        </td>
                        <td className="px-5 py-4 text-stone-600 text-xs">{p.teacherName}</td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-green-700">₹{(p.amount ?? 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-stone-400 max-w-[120px]">
                          <span className="truncate block font-mono">{p.paymentRef ?? '—'}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-stone-400">
                          {new Date(p.paidAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats tab */}
        {tab === 'stats' && (
          <div className="space-y-5">
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 size={16} className="text-amber-600"/>
                  <h3 className="font-serif font-semibold text-stone-800">Monthly Signups</h3>
                </div>
                {monthlySignups.length === 0 ? (
                  <p className="text-stone-400 text-sm text-center py-8">No data yet.</p>
                ) : (
                  <div className="flex items-end gap-2 h-36">
                    {monthlySignups.map(m => (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-stone-600">{m.students}</span>
                        <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '80%' }}>
                          <div className="w-full bg-amber-400 rounded-t-md" style={{ height: `${(m.students / maxSignup) * 100}%` }}/>
                          <div className="w-full bg-purple-300 rounded-t-sm" style={{ height: `${Math.max((m.teachers / maxSignup) * 30, 2)}%` }}/>
                        </div>
                        <span className="text-xs text-stone-400">{m.month}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block"/>Students</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-300 rounded-sm inline-block"/>Teachers</span>
                </div>
              </div>
              <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif font-semibold text-stone-800 mb-5">Platform Health</h3>
                <div className="space-y-4">
                  {[
                    { label: 'API Uptime',   value: '99.97%', detail: 'Last 30 days' },
                    { label: 'Avg Response', value: '142ms',  detail: 'P95: 380ms'   },
                    { label: 'Error Rate',   value: '0.03%',  detail: 'Last 24 hours' },
                  ].map(h => (
                    <div key={h.label} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"/>
                      <div>
                        <p className="text-xs text-stone-400">{h.label}</p>
                        <p className="text-lg font-serif font-bold text-stone-900 mt-0.5">{h.value}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{h.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
