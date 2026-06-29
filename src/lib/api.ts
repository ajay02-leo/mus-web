const BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : '/api'

type FetchOpts = RequestInit & { token?: string }

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { token, ...init } = opts
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Request failed')
  return data
}

export const api = {
  // ─── Auth ────────────────────────────────────────────────────────────────────
  auth: {
    register: (body: { email: string; password: string; name: string; role: 'STUDENT' | 'TEACHER' }) =>
      request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () =>
      request<any>('/auth/logout', { method: 'POST' }),
    me: (token?: string) =>
      request<any>('/auth/me', { token }),
    updatePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<any>('/auth/password', { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // ─── Students ────────────────────────────────────────────────────────────────
  students: {
    list: (params?: { page?: number; limit?: number }) =>
      request<any>(`/students?${new URLSearchParams(params as any ?? {})}`).then(d => d?.students ?? d ?? []),
    get: (id: string) =>
      request<any>(`/students/${id}`).then(d => d?.student ?? d),
    myStats: () =>
      request<any>('/students/me/stats'),
    updateProfile: (body: any) =>
      request<any>('/students/me/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },

  // ─── Teachers ────────────────────────────────────────────────────────────────
  teachers: {
    getMyProfile: () =>
      request<any>('/teachers/me/profile').then(d => d?.profile ?? d),
    updateMyProfile: (body: any) =>
      request<any>('/teachers/me/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },

  // ─── Sessions ────────────────────────────────────────────────────────────────
  sessions: {
    list: () => request<any>('/sessions').then(d => d?.sessions ?? d ?? []),
    create: (body: any) => request<any>('/sessions', { method: 'POST', body: JSON.stringify(body) }).then(d => d?.session ?? d),
    update: (id: string, body: any) => request<any>(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then(d => d?.session ?? d),
    delete: (id: string) => request<any>(`/sessions/${id}`, { method: 'DELETE' }),
    markAttendance: (id: string, body: { studentId: string; status: string }) =>
      request<any>(`/sessions/${id}/attendance`, { method: 'POST', body: JSON.stringify(body) }),
  },

  // ─── Assignments ─────────────────────────────────────────────────────────────
  assignments: {
    list: () => request<any>('/assignments').then(d => d?.assignments ?? d ?? []),
    get: (id: string) => request<any>(`/assignments/${id}`).then(d => d?.assignment ?? d),
    reviewQueue: () => request<any>('/assignments/review-queue').then(d => d?.submissions ?? []),
    create: (body: any) => request<any>('/assignments', { method: 'POST', body: JSON.stringify(body) }).then(d => d?.assignment ?? d),
    delete: (id: string) => request<any>(`/assignments/${id}`, { method: 'DELETE' }),
    submit: (id: string, body: any) => request<any>(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
    grade: (id: string, body: { submissionId: string; score: number; feedback: string }) =>
      request<any>(`/assignments/${id}/grade`, { method: 'POST', body: JSON.stringify(body) }),
  },

  // ─── Courses ─────────────────────────────────────────────────────────────────
  courses: {
    browse: (params?: any) => request<any>(`/courses?${new URLSearchParams(params ?? {})}`).then(d => d?.courses ?? d ?? []),
    get: (id: string) => request<any>(`/courses/${id}`).then(d => d?.course ?? d),
    my: () => request<any>('/courses/my').then(d => d?.courses ?? d ?? []),
    enrolled: () => request<any>('/courses/enrolled').then(d => d?.enrollments ?? d ?? []),
    create: (body: any) => request<any>('/courses', { method: 'POST', body: JSON.stringify(body) }).then(d => d?.course ?? d),
    update: (id: string, body: any) => request<any>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(d => d?.course ?? d),
    delete: (id: string) => request<any>(`/courses/${id}`, { method: 'DELETE' }),
    enroll: (id: string, body?: { paymentRef?: string; paidAmount?: number }) =>
      request<any>(`/courses/${id}/enroll`, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  },

  // ─── Resources ───────────────────────────────────────────────────────────────
  resources: {
    list: () => request<any>('/resources').then(d => d?.resources ?? d ?? []),
    create: (body: any) => request<any>('/resources', { method: 'POST', body: JSON.stringify(body) }).then(d => d?.resource ?? d),
    share: (id: string, studentIds: string[]) =>
      request<any>(`/resources/${id}/share`, { method: 'POST', body: JSON.stringify({ studentIds }) }),
    delete: (id: string) => request<any>(`/resources/${id}`, { method: 'DELETE' }),
  },

  // ─── Reports ─────────────────────────────────────────────────────────────────
  reports: {
    monthly: (month?: number, year?: number) =>
      request<any>(`/reports/monthly${month ? `?month=${month}&year=${year ?? new Date().getFullYear()}` : ''}`),
  },

  // ─── Notifications ───────────────────────────────────────────────────────────
  notifications: {
    list: () => request<any>('/notifications').then(d => d?.notifications ?? d ?? []),
    markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),
  },

  // ─── Earnings ────────────────────────────────────────────────────────────────
  earnings: {
    my: () => request<any>('/earnings'),
  },

  // ─── AI Guru ─────────────────────────────────────────────────────────────────
  ai: {
    chat: (messages: { role: 'user' | 'assistant'; content: string }[]) =>
      request<any>('/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) }).then(d => d?.reply ?? ''),
  },

  // ─── Settings ────────────────────────────────────────────────────────────────
  settings: {
    get: () => request<any>('/settings').then(d => d?.settings ?? {}),
    update: (body: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(body) }).then(d => d?.settings ?? {}),
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    users: (params?: { role?: string; search?: string; page?: number }) =>
      request<any>(`/admin/users?${new URLSearchParams(params as any ?? {})}`).then(d => d?.users ?? []),
    suspend: (id: string) => request<any>(`/admin/users/${id}/suspend`, { method: 'PATCH' }),
    restore: (id: string) => request<any>(`/admin/users/${id}/restore`, { method: 'PATCH' }),
    stats: () => request<any>('/admin/stats'),
    courses: (status?: string) =>
      request<any>(`/admin/courses${status ? `?status=${status}` : ''}`).then(d => d?.courses ?? []),
    approveCourse: (id: string) => request<any>(`/admin/courses/${id}/approve`, { method: 'PATCH' }),
    rejectCourse: (id: string) => request<any>(`/admin/courses/${id}/reject`, { method: 'PATCH' }),
    payments: () => request<any>('/admin/payments'),
    teachers: (params?: { verified?: string; search?: string }) =>
      request<any>(`/admin/teachers?${new URLSearchParams(params as any ?? {})}`).then(d => d?.teachers ?? []),
    verifyTeacher: (id: string) => request<any>(`/admin/teachers/${id}/verify`, { method: 'PATCH' }),
    unverifyTeacher: (id: string) => request<any>(`/admin/teachers/${id}/unverify`, { method: 'PATCH' }),
  },

  // ─── Recordings ──────────────────────────────────────────────────────────────
  recordings: {
    upload: (formData: FormData) =>
      fetch(`${BASE}/recordings/upload`, { method: 'POST', body: formData, credentials: 'include' })
        .then(r => r.json()),
    my: (params?: { type?: string; raga?: string }) =>
      request<any>(`/recordings/my?${new URLSearchParams(params as any ?? {})}`).then(d => d?.recordings ?? []),
    delete: (id: string) => request<any>(`/recordings/${id}`, { method: 'DELETE' }),
    studentRecordings: (userId: string) =>
      request<any>(`/recordings/student/${userId}`).then(d => d?.recordings ?? []),
  },

  // ─── Events ──────────────────────────────────────────────────────────────────
  events: {
    list: () => request<any>('/events').then(d => d?.events ?? []),
    register: (id: string) => request<any>(`/events/${id}/register`, { method: 'POST' }),
    myRegistrations: () => request<any>('/events/my-registrations').then(d => d?.eventIds ?? []),
  },

  // ─── Content Manager ─────────────────────────────────────────────────────────
  content: {
    stats: () => request<any>('/content/stats').then(d => d?.stats ?? {}),
    broadcast: (body: { title: string; body: string; type?: string; targetRole?: string }) =>
      request<any>('/content/broadcast', { method: 'POST', body: JSON.stringify(body) }),
    events: () => request<any>('/content/events').then(d => d?.events ?? []),
    createEvent: (body: any) => request<any>('/content/events', { method: 'POST', body: JSON.stringify(body) }).then(d => d?.event ?? d),
    updateEvent: (id: string, body: any) => request<any>(`/content/events/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then(d => d?.event ?? d),
    deleteEvent: (id: string) => request<any>(`/content/events/${id}`, { method: 'DELETE' }),
    toggleEventPublish: (id: string) => request<any>(`/content/events/${id}/toggle`, { method: 'PATCH' }).then(d => d?.event ?? d),
    posts: () => request<any>('/content/posts').then(d => d?.posts ?? []),
    pinPost: (id: string) => request<any>(`/content/posts/${id}/pin`, { method: 'PATCH' }),
    deletePost: (id: string) => request<any>(`/content/posts/${id}`, { method: 'DELETE' }),
  },

  // ─── Community ───────────────────────────────────────────────────────────────
  community: {
    posts: (params?: { category?: string; search?: string }) =>
      request<any>(`/community/posts?${new URLSearchParams(params as any ?? {})}`).then(d => d?.posts ?? []),
    createPost: (body: { category: string; title: string; body: string; tags?: string[] }) =>
      request<any>('/community/posts', { method: 'POST', body: JSON.stringify(body) }).then(d => d?.post ?? d),
    likePost: (id: string) => request<any>(`/community/posts/${id}/like`, { method: 'POST' }),
    bookmarkPost: (id: string) => request<any>(`/community/posts/${id}/bookmark`, { method: 'POST' }),
    comments: (id: string) => request<any>(`/community/posts/${id}/comments`).then(d => d?.comments ?? []),
    addComment: (id: string, body: string) =>
      request<any>(`/community/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
    stats: () => request<any>('/community/stats').then(d => d?.stats ?? {}),
  },
}
