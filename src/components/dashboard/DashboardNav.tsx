'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  Sparkles, 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut,
  Users,
  Mail,
  PenTool
} from 'lucide-react'

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
    { name: 'Research', href: '/dashboard/research', icon: TrendingUp },
    { name: 'Marketing Plans', href: '/dashboard/plans', icon: FileText },
    { name: 'Content Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Lead Generation', href: '/dashboard/leads', icon: Users },
    { name: 'Email Marketing', href: '/dashboard/emails', icon: Mail },
    { name: 'Blog Content', href: '/dashboard/blog', icon: PenTool },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const settingsSubNav = [
    { name: 'General', href: '/dashboard/settings' },
    { name: 'AI Providers', href: '/dashboard/settings/ai-providers' },
  ]

  return (
    <div className="flex w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Sparkles className="h-6 w-6 text-blue-600" />
        <span className="font-bold">Shakes Marketing</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
