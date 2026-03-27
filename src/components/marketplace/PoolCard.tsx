// src/components/marketplace/PoolCard.tsx
import { Database } from '@/types/supabase'
import { Users } from 'lucide-react'
import Link from 'next/link'

type Pool = Database['public']['Tables']['pools']['Row']

// ============================================================
//  AUTHENTIC INLINE BRAND LOGOS
// ============================================================

function AuthenticIcon({ name, fallbackText, color, size = 24 }: { name: string; fallbackText: string; color: string; size?: number }) {
  const n = name.toLowerCase()

  // 1. Netflix (Authentic 'N')
  if (n.includes('netflix')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#E50914" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.3 0H2.1v24h4.2v-8.4l7.4 8.4h4.2V0h-4.2v8.4l-7.4-8.4z" />
    </svg>
  )

  // 2. Spotify (Authentic Waves)
  if (n.includes('spotify')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1ED760" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.45 17.34c-.2.325-.62.435-.945.235-2.585-1.585-5.84-1.94-9.67-1.06-.375.085-.75-.15-.835-.525-.085-.375.15-.75.525-.835 4.19-.965 7.79-.56 10.69 1.215.325.2.435.62.235.97zm1.36-3.045c-.255.41-.8.545-1.21.29-2.985-1.84-7.55-2.4-10.9-1.315-.465.15-.97-.105-1.12-.57-.15-.465.105-.97.57-1.12 3.86-1.245 8.91-.61 12.37 1.52.41.255.545.8.29 1.21zm.105-3.18C15.42 8.79 10.45 8.6 6.1 9.93c-.56.17-1.16-.145-1.33-.705-.17-.56.145-1.16.705-1.33 4.96-1.52 10.65-1.3 14.54 1.01.5.3.66.945.36 1.445-.3.5-.945.66-1.445.36z" />
    </svg>
  )

  // 3. Apple Music (Authentic Note)
  if (n.includes('apple')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FA243C" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm3.328-18.067l4.135.845a.692.692 0 0 1 .553.673v9.064c0 1.256-1.408 2.053-2.616 1.487-1.282-.602-1.928-2.007-1.378-3.078.432-.843 1.472-1.125 2.296-.64V8.12l-4.22-.85v7.243c0 1.256-1.407 2.053-2.615 1.487-1.282-.602-1.928-2.007-1.378-3.078.432-.843 1.472-1.125 2.296-.64V6.608a.692.692 0 0 1 .929-.675z" />
    </svg>
  )

  // 4. YouTube (Authentic Play Button)
  if (n.includes('youtube')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )

  // 5. Prime Video (Authentic Check/Smile)
  if (n.includes('prime')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#00A8E1" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.2 16.51c-1.35.66-3.15 1.08-4.8 1.08-4.8 0-7.8-2.64-7.8-2.64C2.58 17.5 7.6 20.44 13.06 20.44c1.86 0 3.75-.42 5.37-1.17l-5.23-2.76zM22.56 13.91l-1.68 3.54-3.51-1.68 5.19-1.86z" />
      <text x="12" y="13.5" fontFamily="system-ui,-apple-system,sans-serif" fontStyle="italic" fontWeight="900" fontSize="9" fill="#00A8E1" textAnchor="middle" letterSpacing="-0.5">prime</text>
    </svg>
  )

  // 6. Canva (Authentic Gradient Circle)
  if (n.includes('canva')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#00C4CC" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#00C4CC" />
      <path d="M17 15.3C15.9 17.1 14 18.2 11.8 18.2c-3.4 0-5.8-2.7-5.8-6.2S8.4 5.8 11.8 5.8c2.1 0 3.9 1 5 2.7L14.9 9.8C14.2 8.8 13.1 8.2 11.8 8.2c-2.1 0-3.6 1.7-3.6 3.8s1.5 3.8 3.6 3.8c1.3 0 2.5-.7 3.1-1.9L17 15.3z" fill="white" />
    </svg>
  )

  // 7. CapCut (Authentic Clean Shape)
  if (n.includes('capcut')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-2.348c5.33 0 9.652-4.323 9.652-9.652S17.33 2.348 12 2.348 2.348 6.67 2.348 12 6.67 21.652 12 21.652zM12 5.217L5.217 12 12 18.783 18.783 12 12 5.217z" />
    </svg>
  )

  // 8. DSTV (Custom)
  if (n.includes('dstv')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#0098db" />
      <text x="12" y="15.5" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="8" fill="white" textAnchor="middle" letterSpacing="-0.2">DStv</text>
    </svg>
  )

  // 🔥 THE FIX: If no matching brand is found, render the fallback text cleanly
  return (
    <span className="text-xl font-black" style={{ color: color }}>
      {fallbackText}
    </span>
  )
}

// ============================================================
//  BRAND COLOR MAPPINGS
// ============================================================
const getBrandColors = (name: string) => {
  const n = name.toLowerCase()

  if (n.includes('netflix')) return { bg: 'rgba(229,9,20,0.12)', border: 'rgba(229,9,20,0.2)', text: '#E50914' }
  if (n.includes('spotify')) return { bg: 'rgba(30,215,96,0.12)', border: 'rgba(30,215,96,0.2)', text: '#1ED760' }
  if (n.includes('apple')) return { bg: 'rgba(250,36,60,0.12)', border: 'rgba(250,36,60,0.2)', text: '#FA243C' }
  if (n.includes('youtube')) return { bg: 'rgba(255,0,0,0.12)', border: 'rgba(255,0,0,0.2)', text: '#FF0000' }
  if (n.includes('prime')) return { bg: 'rgba(0,168,225,0.12)', border: 'rgba(0,168,225,0.2)', text: '#00A8E1' }
  if (n.includes('canva')) return { bg: 'rgba(0,196,204,0.12)', border: 'rgba(0,196,204,0.2)', text: '#00C4CC' }
  if (n.includes('capcut')) return { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.2)', text: '#FFFFFF' }
  if (n.includes('dstv')) return { bg: 'rgba(0,152,219,0.12)', border: 'rgba(0,152,219,0.2)', text: '#0098db' }

  // Fallback for random services
  return { bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.15)', text: '#D4AF37' }
}

// ============================================================
//  POOL CARD COMPONENT
// ============================================================
export function PoolCard({ pool }: { pool: Pool }) {
  const fillPercentage = (pool.current_seats / pool.max_seats) * 100
  const isFull = pool.current_seats >= pool.max_seats
  const colors = getBrandColors(pool.service_name)

  // Create a clean initial fallback letter for unrecognized pools (like "T" for "Trace TV")
  const fallbackLetter = pool.service_name.substring(0, 1).toUpperCase()

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

        {/* THE MAGIC LOGO BOX */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          {/* 🔥 FIXED: We now pass the fallback text directly into the Icon component */}
          <AuthenticIcon
            name={pool.service_name}
            fallbackText={fallbackLetter}
            color={colors.text}
            size={26}
          />
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