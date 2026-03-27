// src/components/marketplace/PoolCard.tsx
import { Database } from '@/types/supabase'
import { Users } from 'lucide-react'
import Link from 'next/link'

type Pool = Database['public']['Tables']['pools']['Row']

// ============================================================
//  CUSTOM AFRICAN/NICHE ICONS (Not on global CDNs)
// ============================================================
function DSTVIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#0098db" />
      <text x="12" y="15.5" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="8" fill="white" textAnchor="middle" letterSpacing="-0.2">DStv</text>
    </svg>
  )
}

function ShowmaxIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#D81921" />
      <polygon points="9,7 9,17 18,12" fill="white" />
    </svg>
  )
}

function AudiomackIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#FFA200" />
      <rect x="3.5" y="10.5" width="2.5" height="3" rx="1.2" fill="white" />
      <rect x="7" y="8" width="2.5" height="8" rx="1.2" fill="white" />
      <rect x="10.5" y="5.5" width="2.5" height="13" rx="1.2" fill="white" />
      <rect x="14" y="8" width="2.5" height="8" rx="1.2" fill="white" />
      <rect x="17.5" y="10.5" width="2.5" height="3" rx="1.2" fill="white" />
    </svg>
  )
}

// ============================================================
//  BRAND LOGO MAPPER (Pulls real logos from Global CDN)
// ============================================================
const getBrandDetails = (name: string) => {
  const n = name.toLowerCase()

  // Real Logos from SimpleIcons CDN (slug, hex color)
  if (n.includes('netflix')) return { type: 'cdn', slug: 'netflix', color: 'E50914', bg: 'rgba(229,9,20,0.12)', border: 'rgba(229,9,20,0.2)' }
  if (n.includes('spotify')) return { type: 'cdn', slug: 'spotify', color: '1ED760', bg: 'rgba(30,215,96,0.12)', border: 'rgba(30,215,96,0.2)' }
  if (n.includes('prime')) return { type: 'cdn', slug: 'primevideo', color: '00A8E1', bg: 'rgba(0,168,225,0.12)', border: 'rgba(0,168,225,0.2)' }
  if (n.includes('youtube')) return { type: 'cdn', slug: 'youtube', color: 'FF0000', bg: 'rgba(255,0,0,0.12)', border: 'rgba(255,0,0,0.2)' }
  if (n.includes('capcut')) return { type: 'cdn', slug: 'capcut', color: 'FFFFFF', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.2)' }
  if (n.includes('canva')) return { type: 'cdn', slug: 'canva', color: '00C4CC', bg: 'rgba(0,196,204,0.12)', border: 'rgba(0,196,204,0.2)' }
  if (n.includes('chatgpt') || n.includes('openai')) return { type: 'cdn', slug: 'openai', color: '74AA9C', bg: 'rgba(116,170,156,0.12)', border: 'rgba(116,170,156,0.2)' }
  if (n.includes('anthropic') || n.includes('claude')) return { type: 'cdn', slug: 'anthropic', color: 'D97757', bg: 'rgba(217,119,87,0.12)', border: 'rgba(217,119,87,0.2)' }
  if (n.includes('gemini')) return { type: 'cdn', slug: 'googlegemini', color: '8E75B2', bg: 'rgba(142,117,178,0.12)', border: 'rgba(142,117,178,0.2)' }
  if (n.includes('perplexity')) return { type: 'cdn', slug: 'perplexity', color: '22B8CD', bg: 'rgba(34,184,205,0.12)', border: 'rgba(34,184,205,0.2)' }
  if (n.includes('apple')) return { type: 'cdn', slug: 'applemusic', color: 'FA243C', bg: 'rgba(250,36,60,0.12)', border: 'rgba(250,36,60,0.2)' }
  if (n.includes('crunchyroll')) return { type: 'cdn', slug: 'crunchyroll', color: 'F47521', bg: 'rgba(244,117,33,0.12)', border: 'rgba(244,117,33,0.2)' }
  if (n.includes('microsoft')) return { type: 'cdn', slug: 'microsoft', color: '00A4EF', bg: 'rgba(0,164,239,0.12)', border: 'rgba(0,164,239,0.2)' }
  if (n.includes('playstation')) return { type: 'cdn', slug: 'playstation', color: '003791', bg: 'rgba(0,55,145,0.12)', border: 'rgba(0,55,145,0.2)' }
  if (n.includes('xbox')) return { type: 'cdn', slug: 'xbox', color: '107C10', bg: 'rgba(16,124,16,0.12)', border: 'rgba(16,124,16,0.2)' }
  if (n.includes('nintendo')) return { type: 'cdn', slug: 'nintendo', color: 'E60012', bg: 'rgba(230,0,18,0.12)', border: 'rgba(230,0,18,0.2)' }

  // Custom African / Music SVGs
  if (n.includes('dstv')) return { type: 'custom', name: 'DSTV', color: '0098db', bg: 'rgba(0,152,219,0.12)', border: 'rgba(0,152,219,0.2)' }
  if (n.includes('showmax')) return { type: 'custom', name: 'Showmax', color: 'D81921', bg: 'rgba(216,25,33,0.12)', border: 'rgba(216,25,33,0.2)' }
  if (n.includes('audiomack')) return { type: 'custom', name: 'Audiomack', color: 'FFA200', bg: 'rgba(255,162,0,0.12)', border: 'rgba(255,162,0,0.2)' }

  // Fallback (Uses the first letter of whatever they typed)
  return { type: 'text', name: name.substring(0, 1).toUpperCase(), color: 'D4AF37', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.15)' }
}

// ============================================================
//  POOL CARD COMPONENT
// ============================================================
export function PoolCard({ pool }: { pool: Pool }) {
  const fillPercentage = (pool.current_seats / pool.max_seats) * 100
  const isFull = pool.current_seats >= pool.max_seats
  const brand = getBrandDetails(pool.service_name)

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

        {/* 🔥 THIS IS THE MAGIC LOGO BOX */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: brand.bg, border: `1px solid ${brand.border}` }}
        >
          {brand.type === 'cdn' && (
            <img
              src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`}
              alt={pool.service_name}
              className="w-7 h-7 object-contain"
            />
          )}
          {brand.type === 'custom' && brand.name === 'DSTV' && <DSTVIcon size={24} />}
          {brand.type === 'custom' && brand.name === 'Showmax' && <ShowmaxIcon size={24} />}
          {brand.type === 'custom' && brand.name === 'Audiomack' && <AudiomackIcon size={24} />}
          {brand.type === 'text' && (
            <span className="text-xl font-black" style={{ color: `#${brand.color}` }}>
              {brand.name}
            </span>
          )}
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

      {/* Name + Price */}
      <div className="flex-grow mb-5">
        <h3
          className="font-black text-white text-lg leading-tight mb-2 line-clamp-1"
          title={pool.service_name}
        >
          {pool.service_name}
        </h3>
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