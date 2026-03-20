// src/app/browse/page.tsx
import { createClient } from '@/lib/supabase/server'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Users, Tv, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BrowsePoolsPage() {
  const supabase = createClient()
  
  // Fetch all pools from the database
  const { data: poolsData } = await supabase
    .from('pools')
    .select('*')
    .order('created_at', { ascending: false })

  // 🔥 THE FIX: Tell TypeScript this is an array of objects
  const pools = poolsData as any[] | null

  // Filter out pools that are completely full
  const availablePools = pools?.filter(pool => pool.current_seats < pool.max_seats) || []

  return (
    <div className="min-h-screen bg-fintech-slate flex flex-col">
      {/* We will set the role to "member" here so they see the member view */}
      <AppNavbar userRole="member" />
      
      <main className="flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-fintech-navy mb-4 flex items-center justify-center sm:justify-start gap-3">
              <Sparkles className="text-fintech-gold" size={32} />
              Browse Available Pools
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl">
              Stop paying full price for subscriptions. Join a verified pool, split the bill, and get premium access for a fraction of the cost.
            </p>
          </div>

          {availablePools.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
              <Tv className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-fintech-navy mb-2">No pools available right now</h3>
              <p className="text-gray-500 mb-6">Check back later or become a Host and create your own!</p>
              <Link href="/create-pool">
                <Button className="bg-fintech-navy text-white hover:bg-fintech-navy/90">
                  Host a Pool
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePools.map((pool) => (
                <div key={pool.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
                      <Tv size={28} />
                    </div>
                    <div className="bg-gray-50 px-3 py-1 rounded-full text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Users size={12} />
                      {pool.max_seats - pool.current_seats} seats left
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-fintech-navy mb-1">{pool.service_name}</h2>
                    <p className="text-sm text-gray-400 font-medium mb-6">Hosted by Verified Member</p>
                    
                    <div className="flex items-end gap-1 mb-8">
                      <span className="text-3xl font-bold text-fintech-navy">
                        ₦{pool.price_per_seat.toLocaleString()}
                      </span>
                      <span className="text-gray-400 font-medium mb-1">/month</span>
                    </div>
                  </div>

                  <Link href={`/pools/${pool.id}`} className="w-full mt-auto">
                    <Button className="w-full bg-fintech-navy hover:bg-fintech-navy/90 text-white py-6 font-bold text-lg group-hover:bg-fintech-gold group-hover:text-fintech-navy transition-colors">
                      Join Pool
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}