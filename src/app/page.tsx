// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { PageLoader } from '@/components/home/PageLoader'
import { HeroSection } from '@/components/home/HeroSection'
import { MarqueeTicker } from '@/components/home/MarqueeTicker'
import { HowItWorks } from '@/components/home/HowItWorks'
import { StatsSection } from '@/components/home/StatsSection'
import { MarketplaceSection } from '@/components/home/MarketplaceSection'
import { CalculatorSection } from '@/components/home/CalculatorSection'
import { FAQSection } from '@/components/home/FAQSection'
import { CTASection } from '@/components/home/CTASection'
import Link from 'next/link'

type Pool = Database['public']['Tables']['pools']['Row']

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient()
  const category = searchParams?.category

  let query = supabase
    .from('pools')
    .select('*, profiles(username)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  const pools = data as Pool[] | null

  return (
    <div style={{ background: '#05080F', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      <PageLoader />

      {/* Sticky Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-5"
        style={{ background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="text-xl font-black text-white">
          SplitPay<span style={{ color: '#D4AF37' }}>NG</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <a href="#marketplace" className="hover:text-white transition-colors">Marketplace</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth">
            <button className="text-sm font-bold px-4 py-2 transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Sign In
            </button>
          </Link>
          <Link href="/auth">
            <button
              className="text-sm font-black px-5 py-2.5 rounded-full transition-all hover:scale-105"
              style={{ background: '#D4AF37', color: '#05080F' }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </header>

      <HeroSection />
      <MarqueeTicker />
      <div id="how-it-works"><HowItWorks /></div>
      <StatsSection poolCount={pools?.length || 0} />
      <div id="marketplace"><MarketplaceSection pools={pools} error={error} /></div>
      <CalculatorSection />
      <FAQSection />
      <CTASection />

      <footer className="py-10 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: '#030509' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.15)' }}>
          © 2026 SplitPayNG · Proudly Built for Nigeria
        </p>
      </footer>
    </div>
  )
}