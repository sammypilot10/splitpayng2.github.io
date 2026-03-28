// src/app/browse/page.tsx
import { createClient } from '@/lib/supabase/server'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { BrandLogo } from '@/components/pools/BrandLogo'
import { Users, Tv, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BrowsePoolsPage() {
  const supabase = createClient()

  // Fetch all pools from the database
  const { data: poolsData } = await supabase
    .from('pools')
    .select('*, profiles(username)')
    .eq('is_public', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // 🔥 THE FIX: Tell TypeScript this is an array of objects
  const pools = poolsData as any[] | null

  // Filter out pools that are completely full
  const availablePools = pools?.filter(pool => pool.current_seats < pool.max_seats) || []

  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col">
      {/* We will set the role to "member" here so they see the member view */}
      <AppNavbar userRole="member" />

      <main className="flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center sm:justify-start gap-3">
              <Sparkles className="text-fintech-gold" size={32} />
              Browse Available Pools
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Stop paying full price for subscriptions. Join a verified pool, split the bill, and get premium access for a fraction of the cost.
            </p>
          </div>

          {availablePools.length === 0 ? (
            <div className="bg-white/5 rounded-3xl border border-white/10 p-16 text-center shadow-sm">
              <Tv className="mx-auto text-white/30 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">No pools available right now</h3>
              <p className="text-gray-400 mb-6">Check back later or become a Host and create your own!</p>
              <Link href="/create-pool">
                <Button className="bg-fintech-gold text-[#05080F] hover:bg-fintech-gold/90 font-bold">
                  Host a Pool
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePools.map((pool) => {
                return (
                  <div key={pool.id} className="bg-white/5 rounded-3xl border border-white/10 p-8 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col h-full group">
                    <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-auto min-w-[3.5rem] px-3 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      <BrandLogo name={pool.service_name} size={28} />
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-300 flex items-center gap-1.5 border border-white/5">
                        <Users size={12} className="text-fintech-gold" />
                        {pool.max_seats - pool.current_seats} seats left
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h2 className="text-2xl font-bold text-white mb-1">{pool.service_name}</h2>
                      <p className="text-sm text-gray-400 font-medium mb-6">Hosted by <span className="text-fintech-gold">@{pool.profiles?.username || 'VerifiedMember'}</span></p>

                      <div className="flex items-end gap-1 mb-8">
                        <span className="text-3xl font-bold text-fintech-gold">
                          ₦{pool.price_per_seat.toLocaleString()}
                        </span>
                        <span className="text-gray-500 font-medium mb-1">/month</span>
                      </div>
                    </div>

                    <Link href={`/pools/${pool.id}`} className="w-full mt-auto">
                      <Button className="w-full bg-white/10 hover:bg-fintech-gold text-white font-bold py-6 group-hover:text-[#05080F] border border-white/20 group-hover:border-fintech-gold transition-all">
                        Join Pool
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}