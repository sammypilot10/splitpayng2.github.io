// src/components/marketplace/PoolCard.tsx
import { Database } from '@/types/supabase'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { BrandLogo } from '@/components/pools/BrandLogo'

type Pool = Database['public']['Tables']['pools']['Row']

// ============================================================
//  BRAND COLOR MAPPINGS (for card styling only)
// ============================================================
const getBrandColors = (name: string) => {
  const n = name.toLowerCase()

  if (n.includes('netflix')) return { bg: 'rgba(229,9,20,0.12)', border: 'rgba(229,9,20,0.2)' }
  if (n.includes('spotify')) return { bg: 'rgba(29,185,84,0.12)', border: 'rgba(29,185,84,0.2)' }
  if (n.includes('apple'))   return { bg: 'rgba(162,170,173,0.12)', border: 'rgba(162,170,173,0.2)' }
  if (n.includes('youtube')) return { bg: 'rgba(255,0,0,0.12)', border: 'rgba(255,0,0,0.2)' }
  if (n.includes('prime'))   return { bg: 'rgba(26,152,255,0.12)', border: 'rgba(26,152,255,0.2)' }
  if (n.includes('canva'))   return { bg: 'rgba(0,196,204,0.12)', border: 'rgba(0,196,204,0.2)' }
  if (n.includes('capcut'))  return { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.2)' }
  if (n.includes('dstv'))    return { bg: 'rgba(0,152,219,0.12)', border: 'rgba(0,152,219,0.2)' }
  if (n.includes('disney'))  return { bg: 'rgba(17,60,207,0.12)', border: 'rgba(17,60,207,0.2)' }
  if (n.includes('hulu'))    return { bg: 'rgba(28,231,131,0.12)', border: 'rgba(28,231,131,0.2)' }
  if (n.includes('showmax')) return { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)' }

  // Fallback for random services
  return { bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.15)' }
}

// ============================================================
//  POOL CARD COMPONENT
// ============================================================
export function PoolCard({ pool, hostUsername }: { pool: Pool & { profiles?: { username?: string } }; hostUsername?: string }) {
  const fillPercentage = (pool.current_seats / pool.max_seats) * 100
  const isFull = pool.current_seats >= pool.max_seats
  const colors = getBrandColors(pool.service_name)

  // Resolve the username: denormalized column → JOIN → prop → fallback
  const displayUsername = (pool as any).host_username || (pool as any).profiles?.username || hostUsername || null

  return (
    <div
      className="group relative flex flex-col h-full rounded-[1.5rem] p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.border = '1px solid rgba(212,175,55,0.25)'
        el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.1)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.border = '1px solid rgba(255,255,255,0.07)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
      }}
    >
      {/* Top row — icon + badge */}
      <div className="flex justify-between items-start mb-5">

        {/* 🔥 OFFICIAL LOGO: Uses BrandLogo with real CDN logos */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <BrandLogo name={pool.service_name} size={26} />
        </div>

        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={
            isFull
              ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
              : { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
          }
        >
          {isFull ? 'Full' : 'Seats Available'}
        </span>
      </div>

      {/* Name + Host Badge + Price */}
      <div className="flex-grow mb-5">
        <h3
          className="font-black text-white text-lg leading-tight mb-1 line-clamp-1"
          title={pool.service_name}
        >
          {pool.service_name}
        </h3>

        {/* 🔥 VENDOR IDENTITY: Show host username badge */}
        {displayUsername && (
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
            Hosted by <span style={{ color: '#D4AF37' }}>@{displayUsername}</span>
          </p>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black" style={{ color: '#D4AF37' }}>
            ₦{pool.price_per_seat.toLocaleString()}
          </span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>/ seat</span>
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span
            className="text-xs font-semibold flex items-center gap-1.5"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <Users size={12} /> Capacity
          </span>
          <span className="text-xs font-bold text-white">
            {pool.current_seats}
            <span style={{ color: 'rgba(255,255,255,0.3)' }}> / {pool.max_seats}</span>
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${fillPercentage}%`,
              background: isFull
                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                : 'linear-gradient(90deg, #D4AF37, #F5D060)',
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        {isFull ? (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-bold cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            Pool Full
          </button>
        ) : (
          <Link href={`/pools/${pool.id}`} className="block w-full">
            <button
              className="w-full py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
                color: '#05080F',
                boxShadow: '0 4px 20px rgba(212,175,55,0.2)',
              }}
            >
              Join Pool
            </button>
          </Link>
        )}

        <p
          className="text-[10px] text-center leading-tight"
          style={{ color: 'rgba(255,255,255,0.18)' }}
        >
          Account sharing may violate service terms. Use at your own risk. 48h Escrow applied.
        </p>
      </div>
    </div>
  )
}