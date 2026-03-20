// src/components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Component, ShieldAlert, 
  Banknote, RefreshCcw, ScrollText, Settings, LogOut 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: RefreshCcw },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Pools', href: '/admin/pools', icon: Component },
  { name: 'Disputes', href: '/admin/disputes', icon: ShieldAlert, badge: 3 },
  { name: 'Payouts', href: '/admin/payouts', icon: Banknote }, // Fixed: Banknote (singular)
  { name: 'Audit Logs', href: '/admin/audit', icon: ScrollText },
  { name: 'System', href: '/admin/system', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <aside className="w-64 bg-[#0A0F1E] text-gray-300 hidden md:flex flex-col h-full border-r border-gray-800 shadow-2xl z-50">
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin/dashboard" className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
          SplitPay<span className="text-[#C9A84C]">ADMIN</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] font-semibold' 
                  : 'hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-[#C9A84C]' : 'text-gray-400'} />
                {link.name}
              </div>
              {link.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={18} />
          Secure Logout
        </button>
      </div>
    </aside>
  )
}