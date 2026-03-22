'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { PoolCard } from '@/components/marketplace/PoolCard'
import { CategoryFilter } from '@/components/marketplace/CategoryFilter'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function MarketplaceSection({ pools, error }: { pools: any[] | null; error: any }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.from('.ms-header', {
      opacity: 0, y: 50, duration: 1, ease: 'power4.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' },
    })

    gsap.from(ref.current.querySelectorAll('.ms-card'), {
      opacity: 0,
      y: 80,
      scale: 0.95,
      duration: 0.8,
      stagger: { amount: 0.7, from: 'start' },
      ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%' },
    })
  }, { scope: ref })

  return (
    <section ref={ref} className="px-6 lg:px-16 py-24 max-w-7xl mx-auto w-full">
      <div className="ms-header flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: '#D4AF37' }}>Marketplace</p>
          <h2 className="font-black text-white" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>Public Pools</h2>
        </div>
        <CategoryFilter />
      </div>

      {error ? (
        <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          Failed to load pools.
        </div>
      ) : pools?.length === 0 ? (
        <div className="p-16 rounded-[2rem] text-center" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-lg mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>No pools in this category yet.</p>
          <Link href="/auth?returnTo=/create-pool"><Button variant="outline">Be the first Host</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {pools?.map(pool => (
            <div key={pool.id} className="ms-card">
              <PoolCard pool={pool} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}