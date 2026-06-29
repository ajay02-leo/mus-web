'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import HomePage from './home/HomePage'

export default function Root() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'STUDENT') router.replace('/student')
      else if (user.role === 'TEACHER') router.replace('/teacher')
      else if (user.role === 'ADMIN') router.replace('/admin')
    }
  }, [user, loading, router])

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>
  if (user) return null
  return <HomePage />
}
