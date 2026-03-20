// src/components/layout/AppNavbar.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Plus, LayoutDashboard, ShieldAlert, Key, User } from 'lucide-react'

interface AppNavbarProps {
  userRole?: string;
}

export function AppNavbar({ userRole }: AppNavbarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      // Set the user's email so we can display it!
      setUserEmail(user.email || null)

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const profile = data as { role: string } | null

      if (profile?.role === 'admin') {
        setIsAdmin(true)
      }
      setIsLoading(false)
    }
    
    fetchUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Force a hard reload to clear all states and go to auth
    window.location.href = '/auth'
  }

  return (
    <nav className="bg-[#0A0F1E] text-white px-6 py-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Platform Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          SplitPay<span className="text-[#C9A84C]">NG</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/browse" 
            className={`text-sm font-medium flex items-center gap-2 transition-colors ${
              pathname === '/browse' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] pb-1' : 'text-gray-300 hover:text-white pb-1'
            }`}
          >
            Browse Pools
          </Link>

          {userEmail && (
            <>
              <Link 
                href="/dashboard/subscriptions" 
                className={`text-sm font-medium flex items-center gap-2 transition-colors ${
                  pathname === '/dashboard/subscriptions' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] pb-1' : 'text-gray-300 hover:text-white pb-1'
                }`}
              >
                <Key size={16} /> My Subscriptions
              </Link>
              
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium flex items-center gap-2 transition-colors ${
                  pathname === '/dashboard' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] pb-1' : 'text-gray-300 hover:text-white pb-1'
                }`}
              >
                <LayoutDashboard size={16} /> Host Dashboard
              </Link>
            </>
          )}

          {isAdmin && (
            <Link 
              href="/admin/dashboard" 
              className="text-xs font-bold flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors bg-red-400/10 px-3 py-1.5 rounded-full border border-red-500/20"
            >
              <ShieldAlert size={14} /> Admin Panel
            </Link>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 sm:gap-6">
          {isLoading ? (
            <div className="w-20 h-5 bg-gray-800 animate-pulse rounded"></div>
          ) : userEmail ? (
            <>
              {/* AUTHENTICATED: Show Email and Sign Out */}
              <Link href="/create-pool" className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                <Plus size={16} /> Create Pool
              </Link>

              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1.5 rounded-full border border-[#C9A84C]/20">
                <User size={14} /> {userEmail}
              </div>

              <div className="w-px h-5 bg-gray-700 hidden sm:block"></div>

              <button 
                onClick={handleSignOut} 
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              {/* UNAUTHENTICATED: Show Login / Get Started */}
              <Link href="/auth">
                <button className="text-gray-300 hover:text-white transition-colors text-sm font-medium hidden sm:block">
                  Sign In
                </button>
              </Link>
              <Link href="/auth">
                <button className="bg-[#C9A84C] hover:bg-yellow-500 text-[#0A0F1E] px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-md">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}