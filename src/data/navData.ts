import {
  LayoutDashboard, Calendar, BookOpen, Mic, Bot,
  TrendingUp, Settings, Users, IndianRupee, Video, User,
  Gamepad2, Gauge, Timer, Layers, Sun, ShoppingBag, Tv, MessageSquare,
  ClipboardList, FileBarChart, Library, UserCheck,
} from 'lucide-react'

export const STUDENT_NAV = [
  { label: 'Dashboard',     path: '/student',              icon: LayoutDashboard },
  { label: 'My Classes',    path: '/student/classes',      icon: Calendar },
  { label: 'Assignments',   path: '/student/assignments',  icon: ClipboardList },
  { label: 'Learn',         path: '/student/learn',        icon: Gamepad2 },
  { label: 'Practice Room', path: '/student/practice',     icon: Mic },
  { label: 'Pitch Detect',  path: '/student/pitch',        icon: Gauge },
  { label: 'Tala Keeper',   path: '/student/tala',         icon: Timer },
  { label: 'Compare',       path: '/student/compare',      icon: Layers },
  { label: 'Live Class',    path: '/student/live',         icon: Video },
  { label: 'AI Guru',       path: '/student/ai',           icon: Bot },
  { label: 'Raga Today',    path: '/student/raga',         icon: Sun },
  { label: 'Progress',      path: '/student/progress',     icon: TrendingUp },
  { label: 'Marketplace',   path: '/marketplace',          icon: ShoppingBag },
  { label: 'Events',        path: '/events',               icon: Tv },
  { label: 'Community',     path: '/community',            icon: MessageSquare },
  { label: 'Profile',       path: '/student/profile',      icon: User },
  { label: 'Settings',      path: '/student/settings',     icon: Settings },
]

export const TEACHER_NAV = [
  { label: 'Dashboard',     path: '/teacher',                  icon: LayoutDashboard },
  { label: 'My Students',   path: '/teacher/students',         icon: Users },
  { label: 'Schedule',      path: '/teacher/schedule',         icon: Calendar },
  { label: 'Assignments',   path: '/teacher/assignments',      icon: ClipboardList, badge: 0 },
  { label: 'My Courses',    path: '/teacher/courses',          icon: BookOpen },
  { label: 'Review Queue',  path: '/teacher/reviews',          icon: Mic, badge: 0 },
  { label: 'Attendance',    path: '/teacher/attendance',       icon: UserCheck },
  { label: 'Reports',       path: '/teacher/reports',          icon: FileBarChart },
  { label: 'Resources',     path: '/teacher/resources',        icon: Library },
  { label: 'Earnings',      path: '/teacher/earnings',         icon: IndianRupee },
  { label: 'Marketplace',   path: '/marketplace',              icon: ShoppingBag },
  { label: 'Events',        path: '/events',                   icon: Tv },
  { label: 'Community',     path: '/community',                icon: MessageSquare },
  { label: 'Profile',       path: '/teacher/profile',          icon: User },
  { label: 'Settings',      path: '/teacher/settings',         icon: Settings },
]
