// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { CategoryFilter } from '@/components/marketplace/CategoryFilter'
import { PoolCard } from '@/components/marketplace/PoolCard'
import { SavingsCalculator } from '@/components/marketplace/SavingsCalculator'
import Link from 'next/link'
import { ShieldCheck, Users, CheckCircle2, ChevronDown, Lock, Zap } from 'lucide-react'

// 1. Explicitly type the Supabase data
type Pool = Database['public']['Tables']['pools']['Row']

// 2. Allow dynamic rendering for search parameters (Filters)
export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient()
  const category = searchParams?.category

  // 3. Server-Side Data Fetching for the Marketplace
  let query = supabase
    .from('pools')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  const pools = data as Pool[] | null

  // 4. FAQ Data
  const faqs = [
    {
      question: "How does the 48-hour escrow work?",
      answer: "When you join a pool, your payment is held securely by Paystack in our escrow. You have 48 hours to test the login credentials. If they work, you confirm, and the host gets paid. If they don't, you dispute it, and you get a 100% full refund. If you do nothing, it auto-confirms after 48 hours."
    },
    {
      question: "Is it safe to share or receive passwords?",
      answer: "Yes. SplitPayNG uses military-grade AES-256-GCM encryption client-side. This means passwords are encrypted on your device before they even reach our database. Our servers never see the plaintext passwords, keeping both Hosts and Members completely secure."
    },
    {
      question: "What are the fees?",
      answer: "It is completely free for Members to join a pool (you only pay the seat price). For Hosts, SplitPayNG deducts a flat 20% platform fee from the monthly payout to cover escrow management, Paystack processing fees, and platform maintenance."
    },
    {
      question: "How does monthly billing work?",
      answer: "We use the Paystack Subscription API. Once you join a pool, you will be automatically billed every month for your seat. You can cancel your subscription at any time from your dashboard to stop the next billing cycle."
    },
    {
      question: "What is the difference between Public and Private pools?",
      answer: "Public pools are listed on our marketplace for anyone to join via the escrow system. Private pools are hidden from the marketplace; the host will give you a direct link, granting you instant access without public listing."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-fintech-slate">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-fintech-navy">
          SplitPay<span className="text-fintech-gold">NG</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="font-semibold hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link href="/auth">
            <Button variant="primary" className="rounded-full shadow-md">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex items-center justify-center p-6 lg:p-12 max-w-7xl mx-auto w-full mb-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fintech-gold/10 text-fintech-gold font-medium text-sm mb-6 border border-fintech-gold/20">
              <ShieldCheck size={16} />
              <span>100% Escrow Protected</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-fintech-navy leading-[1.1] mb-6">
              Split Premium Costs, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fintech-gold to-yellow-600">
                Without the Risk.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-fintech-navy/70 max-w-xl mb-10 leading-relaxed">
              The Nigerian marketplace for shared subscriptions. Join pools for Netflix, Spotify, ChatGPT Plus, and more. Your money is held securely until your access is verified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* 🔥 FIXED: Pointing this directly to our new /browse page! */}
              <Link href="/browse" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-xl shadow-fintech-navy/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                  Browse Public Pools
                </Button>
              </Link>
              <Link href="/auth" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-2 bg-white hover:bg-gray-50 transition-all">
                  Become a Host
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm font-medium text-fintech-navy/60">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p>Trusted by 5,000+ Nigerians</p>
            </div>
          </div>

          {/* Right Column - Real UI Mockup */}
          <div className="relative w-full max-w-lg mx-auto lg:max-w-none mt-10 lg:mt-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-fintech-gold/30 via-blue-400/20 to-fintech-navy/5 rounded-full blur-3xl -z-10" />

            <div className="relative bg-white/60 backdrop-blur-2xl border border-white rounded-[2rem] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-fintech-navy text-lg">Active Pools</h3>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Live Escrow</span>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 flex items-center justify-center flex-shrink-0">
                    <img src="https://cdn.simpleicons.org/netflix/E50914" alt="Netflix" className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-fintech-navy">Netflix Premium 4K</h4>
                    <p className="text-xs text-gray-500">₦2,500 / month per seat</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-bold text-fintech-navy">
                      <Users size={14} className="text-fintech-gold" /> 4/5
                    </div>
                    <p className="text-[10px] text-green-600 font-medium">1 seat left</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-[#1ED760]/10 flex items-center justify-center flex-shrink-0">
                    <img src="https://cdn.simpleicons.org/spotify/1ED760" alt="Spotify" className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-fintech-navy">Spotify Family</h4>
                    <p className="text-xs text-gray-500">₦1,200 / month per seat</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-bold text-fintech-navy">
                      <Users size={14} className="text-fintech-gold" /> 5/6
                    </div>
                    <p className="text-[10px] text-green-600 font-medium">1 seat left</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 lg:-right-10 bg-fintech-navy text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="bg-green-500 rounded-full p-1">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300 font-medium">Payment Secured</p>
                  <p className="text-sm font-bold">Escrow Locked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className="max-w-5xl mx-auto w-full px-6 mb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-fintech-navy">₦12M+</p>
            <p className="text-sm text-gray-500 font-medium">Saved by users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-fintech-navy">4.9/5</p>
            <p className="text-sm text-gray-500 font-medium">Trust Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-fintech-navy">0</p>
            <p className="text-sm text-gray-500 font-medium">Scams via Escrow</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-fintech-gold">{pools?.length || 0}</p>
            <p className="text-sm text-gray-500 font-medium">Active Pools</p>
          </div>
        </div>
      </section>

      {/* Dynamic Marketplace Grid */}
      <section id="marketplace" className="max-w-7xl mx-auto px-6 w-full mb-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-fintech-navy">Public Marketplace</h2>
          <CategoryFilter />
        </div>

        {error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center">Failed to load pools.</div>
        ) : pools?.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-gray-100 text-center shadow-sm">
            <p className="text-gray-500 text-lg mb-4">No public pools available in this category right now.</p>
            <Link href="/auth">
              <Button variant="outline">Become the first Host</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pools?.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Calculator Section */}
      <section className="bg-fintech-navy py-24 px-6 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Stop paying full price for subscriptions you rarely use.</h2>
            <p className="text-lg text-fintech-slate/60 mb-8 leading-relaxed">
              Why pay ₦5,000 a month for Netflix when you only use one screen? SplitPayNG connects you with others to share the cost safely. Our AES-256-GCM encrypted vault ensures passwords remain secure.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><ShieldCheck className="text-fintech-gold"/> 100% Escrow protected</li>
              <li className="flex items-center gap-3"><Lock className="text-fintech-gold"/> End-to-end encrypted credentials</li>
              <li className="flex items-center gap-3"><Zap className="text-fintech-gold"/> Automated Paystack billing</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-fintech-gold/20 blur-[100px] rounded-full z-0" />
            <div className="relative z-10">
              <SavingsCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20 px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-fintech-navy mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know about sharing securely on SplitPayNG.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details 
                key={index} 
                className="group bg-gray-50 rounded-2xl border border-gray-100 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-fintech-navy font-semibold hover:text-fintech-gold transition-colors">
                  <span className="text-lg">{faq.question}</span>
                  <ChevronDown className="shrink-0 transition duration-300 group-open:-rotate-180" />
                </summary>
                
                <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-24 px-6 text-center border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-fintech-navy mb-6">Ready to maximize your money?</h2>
          <p className="text-gray-600 mb-10 text-lg">
            Join thousands of Nigerians safely sharing premium subscriptions today.
          </p>
          <Link href="/auth">
            <Button variant="primary" className="text-xl px-10 py-6 rounded-full shadow-2xl shadow-fintech-navy/20 hover:-translate-y-1 transition-transform">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}