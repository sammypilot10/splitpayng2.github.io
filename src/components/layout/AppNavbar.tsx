// src/components/layout/AppNavbar.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Plus, LayoutDashboard, ShieldAlert, Key, User, Menu, X, CreditCard } from 'lucide-react'

interface AppNavbarProps {
  userRole?: string;
}

export function AppNavbar({ userRole }: AppNavbarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRoleDb, setUserRoleDb] = useState<string>(userRole || 'member')
  const [isLoading, setIsLoading] = useState(true)

  // State to control the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      setUserEmail(user.email || null)

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const profile = data as { role: string } | null

      if (profile?.role) {
        setUserRoleDb(profile.role)
        if (profile.role === 'admin') setIsAdmin(true)
      }
      setIsLoading(false)
    }

    fetchUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <nav className="bg-[#0A0F1E] text-white sticky top-0 z-50 shadow-md">
      {/* The Main Desktop/Header Row */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* 🔥 Platform Logo Updated to Image */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <img
            src="/logo.png"
            alt="SplitPayNG Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links (DESKTOP ONLY) */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/browse"
            className={`text-sm font-medium flex items-center gap-2 transition-colors ${pathname === '/browse' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] pb-1' : 'text-gray-300 hover:text-white pb-1'
              }`}
          >
            Browse Pools
          </Link>

          {userEmail && (
            <>
              {(userRoleDb === 'member' || isAdmin) && (
                <>
                  <Link
                    href="/dashboard/subscriptions"
                    className={`text-sm font-medium flex items-center gap-2 transition-colors ${pathname === '/dashboard/subscriptions' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] pb-1' : 'text-gray-300 hover:text-white pb-1'
                      }`}
                  >
                    <Key size={16} /> My Subscriptions
                  </Link>

                  <Link
                    href="/dashboard/cards"
                    className={`text-sm font-medium flex items-center gap-2 transition-colors ${pathname === '/dashboard/cards' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] pb-1' : 'text-gray-300 hover:text-white pb-1'
                      }`}
                  >
                    <CreditCard size={16} /> Payment Methods
                  </Link>
                </>
              )}

              {(userRoleDb === 'host' || isAdmin) && (
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium flex items-center gap-2 transition-colors ${pathname === '/dashboard' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] pb-1' : 'text-gray-300 hover:text-white pb-1'
                    }`}
                >
                  <LayoutDashboard size={16} /> Host Dashboard
                </Link>
              )}
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

        {/* Action Buttons (Right Side) */}
        <div className="flex items-center gap-4">

          {/* Mobile Menu Toggle Button (Visible only on mobile) */}
          <div className="md:hidden flex items-center">
            {!isLoading && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>

          {/* Desktop Auth Buttons (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-6">
            {isLoading ? (
              <div className="w-20 h-5 bg-gray-800 animate-pulse rounded"></div>
            ) : userEmail ? (
              <>
                <Link href="/create-pool" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <Plus size={16} /> Create Pool
                </Link>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1.5 rounded-full border border-[#C9A84C]/20">
                  <User size={14} /> {userEmail}
                </div>

                <div className="w-px h-5 bg-gray-700"></div>

                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <button className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
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
      </div>

      {/* THE NEW MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0A0F1E] border-t border-gray-800 shadow-xl animate-in slide-in-from-top-2 flex flex-col px-6 py-6 space-y-6">

          {userEmail && (
            <div className="flex items-center gap-2 text-sm font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-4 py-2 rounded-xl border border-[#C9A84C]/20 w-fit mb-2">
              <User size={14} /> {userEmail}
            </div>
          )}

          <Link href="/browse" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium flex items-center gap-2 ${pathname === '/browse' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>
            Browse Pools
          </Link>

          {userEmail && (
            <>
              {(userRoleDb === 'member' || isAdmin) && (
                <>
                  <Link href="/dashboard/subscriptions" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium flex items-center gap-2 ${pathname === '/dashboard/subscriptions' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>
                    <Key size={18} /> My Subscriptions
                  </Link>

                  <Link href="/dashboard/cards" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium flex items-center gap-2 ${pathname === '/dashboard/cards' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>
                    <CreditCard size={18} /> Payment Methods
                  </Link>
                </>
              )}

              {(userRoleDb === 'host' || isAdmin) && (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium flex items-center gap-2 ${pathname === '/dashboard' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>
                  <LayoutDashboard size={18} /> Host Dashboard
                </Link>
              )}

              <Link href="/create-pool" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium flex items-center gap-2 text-gray-300">
                <Plus size={18} /> Create Pool
              </Link>
            </>
          )}

          {isAdmin && (
            <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold flex items-center gap-2 text-red-400">
              <ShieldAlert size={16} /> Admin Panel
            </Link>
          )}

          <div className="w-full h-px bg-gray-800 my-2"></div>

          {userEmail ? (
            <button onClick={handleSignOut} className="text-red-400 flex items-center gap-2 text-base font-bold text-left w-full">
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <div className="flex flex-col gap-4 pt-2">
              <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <button className="w-full border border-gray-700 text-gray-300 hover:text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <button className="w-full bg-[#C9A84C] text-[#0A0F1E] px-5 py-3 rounded-xl text-sm font-bold shadow-md">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}