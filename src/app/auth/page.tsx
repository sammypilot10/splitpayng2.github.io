// src/app/auth/page.tsx
'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, ShieldCheck, Zap, Lock, Mail, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

// We separate the form logic into its own component so we can wrap it in Suspense
function AuthForm() {
  const searchParams = useSearchParams()
  // 🔥 Grab the Return Ticket from the URL (defaults to /dashboard if empty)
  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [ndprConsent, setNdprConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // 👻🔫 THE GHOST SESSION ASSASSIN
  // Automatically wipe any lingering sessions when landing on the auth page.
  useEffect(() => {
    const clearLingeringSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.auth.signOut()
      }
    }
    clearLingeringSession()
  }, [supabase])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isLogin && !ndprConsent) {
      setError('You must accept the NDPR terms to create an account.')
      setLoading(false)
      return
    }

    // 🔥 DEDUCE ROLE: If they are trying to go to /dashboard or /create-pool, they want to be a Host!
    const intendedRole = (returnTo === '/dashboard' || returnTo === '/create-pool') ? 'host' : 'member';

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        // 🔥 Teleport the user to the Return Ticket URL!
        window.location.href = returnTo
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              ndpr_consent: ndprConsent,
              // 🔥 THE FIX: Explicitly save their role to the 'profiles' table via user_metadata
              role: intendedRole 
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          }
        })
        if (error) throw error
        alert('Welcome to SplitPayNG! Please check your email for the confirmation link.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) return setError('Please enter your email address to receive a Magic Link.')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` }
    })
    setLoading(false)
    if (error) setError(error.message)
    else alert('Magic link sent! Check your inbox.')
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-fintech-navy tracking-tight mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-sm text-gray-500">
          {isLogin ? 'Enter your details to access your dashboard.' : 'Start sharing subscriptions securely today.'}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-fintech-navy mb-1.5">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-fintech-gold/20 focus:border-fintech-gold block w-full pl-10 p-3.5 transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-fintech-navy">Password</label>
            {isLogin && (
              <a href="#" className="text-xs font-medium text-fintech-gold hover:text-fintech-navy transition-colors">
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-fintech-gold/20 focus:border-fintech-gold block w-full pl-10 pr-10 p-3.5 transition-all outline-none"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div className="flex items-start mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                id="ndpr"
                checked={ndprConsent}
                onChange={(e) => setNdprConsent(e.target.checked)}
                className="w-4 h-4 border border-gray-300 rounded bg-white accent-fintech-gold focus:ring-3 focus:ring-fintech-gold/30 cursor-pointer"
              />
            </div>
            <label htmlFor="ndpr" className="ml-3 text-xs text-gray-600 leading-relaxed cursor-pointer">
              I consent to the collection and processing of my personal data in accordance with the Nigerian Data Protection Regulation (NDPR).
            </label>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full py-6 text-base font-semibold rounded-xl shadow-lg shadow-fintech-navy/10 mt-2" 
          isLoading={loading}
        >
          {isLogin ? 'Sign in to account' : 'Create account'}
        </Button>
      </form>

      <div className="mt-8 flex items-center justify-between">
        <span className="w-full border-b border-gray-200"></span>
        <span className="px-4 text-xs text-gray-400 uppercase tracking-wider font-medium bg-white">Or</span>
        <span className="w-full border-b border-gray-200"></span>
      </div>

      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={handleMagicLink} 
          className="w-full py-5 text-sm font-medium rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700"
          disabled={loading}
        >
          <Zap className="mr-2 h-4 w-4 text-fintech-gold" />
          Continue with Magic Link
        </Button>
      </div>

      <p className="mt-10 text-center text-sm text-gray-500">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => {
            setIsLogin(!isLogin)
            setError(null)
          }} 
          className="font-semibold text-fintech-navy hover:text-fintech-gold transition-colors"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </>
  )
}

// The main exported page wraps the form in Suspense
export default function AuthPage() {
  return (
    <div className="min-h-screen flex w-full bg-white font-sans">
      
      {/* Left Panel - Branding & Trust Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-fintech-navy relative overflow-hidden flex-col justify-between p-16 text-white">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-fintech-gold/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            SplitPay<span className="text-fintech-gold">NG</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Share premium subscriptions without the financial anxiety.
          </h1>
          <p className="text-lg text-fintech-slate/70 mb-10">
            Join thousands of Nigerians pooling resources for Netflix, Spotify, and more. 
            Protected by our strict 48-hour escrow system.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                <ShieldCheck className="text-fintech-gold" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">48-Hour Escrow Protection</h3>
                <p className="text-sm text-fintech-slate/60">Funds are held until access is verified.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                <Lock className="text-fintech-gold" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">End-to-End Encryption</h3>
                <p className="text-sm text-fintech-slate/60">Credentials are secured with AES-256-GCM.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                <Zap className="text-fintech-gold" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Automated Paystack Payouts</h3>
                <p className="text-sm text-fintech-slate/60">Seamless recurring billing and host transfers.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-fintech-slate/50">
          © {new Date().getFullYear()} SplitPayNG. All rights reserved.
        </div>
      </div>

      {/* Right Panel - The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-fintech-slate/30 relative">
        {/* Mobile Logo visible only on small screens */}
        <div className="absolute top-8 left-8 lg:hidden">
           <Link href="/" className="text-2xl font-bold tracking-tight text-fintech-navy">
            SplitPay<span className="text-fintech-gold">NG</span>
          </Link>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10">
          
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-fintech-navy mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* 🔥 We wrap the form logic in Suspense to make Next.js happy */}
          <Suspense fallback={<div className="text-center py-10 text-gray-500">Loading secure connection...</div>}>
            <AuthForm />
          </Suspense>

        </div>
      </div>
    </div>
  )
}