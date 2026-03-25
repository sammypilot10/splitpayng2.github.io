// src/components/marketplace/PoolCard.tsx
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
// 🔥 Added new Lucide icons for services that don't have SimpleIcons
import { Users, Component, Tv, PlaySquare, Bot } from 'lucide-react'
import Link from 'next/link'

type Pool = Database['public']['Tables']['pools']['Row']

function OpenAIIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#74AA9C" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.676zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  )
}

type IconData = {
  url: string | null
  bg: string
  border: string
  label?: string
  labelColor?: string
  svgIcon?: string
}

const getIconData = (name: string): IconData => {
  const n = name.toLowerCase()
  if (n.includes('netflix'))                           return { url: 'https://cdn.simpleicons.org/netflix/E50914',        bg: 'rgba(229,9,20,0.12)',     border: 'rgba(229,9,20,0.2)' }
  // 🔥 Fixed Prime Video by using the reliable 'amazon' slug
  if (n.includes('prime'))                             return { url: 'https://cdn.simpleicons.org/amazon/00A8E1',         bg: 'rgba(0,168,225,0.12)',    border: 'rgba(0,168,225,0.2)' }
  // 🔥 Added custom Lucide fallbacks for DSTV and Showmax
  if (n.includes('dstv'))                              return { url: null, svgIcon: 'tv',                                 bg: 'rgba(0,152,219,0.12)',    border: 'rgba(0,152,219,0.2)', labelColor: '#0098db' }
  if (n.includes('showmax'))                           return { url: null, svgIcon: 'play',                               bg: 'rgba(216,25,33,0.12)',    border: 'rgba(216,25,33,0.2)', labelColor: '#d81921' }
  
  if (n.includes('youtube'))                           return { url: 'https://cdn.simpleicons.org/youtube/FF0000',        bg: 'rgba(255,0,0,0.12)',      border: 'rgba(255,0,0,0.2)' }
  if (n.includes('crunchyroll'))                       return { url: 'https://cdn.simpleicons.org/crunchyroll/F47521',    bg: 'rgba(244,117,33,0.12)',   border: 'rgba(244,117,33,0.2)' }
  if (n.includes('spotify'))                           return { url: 'https://cdn.simpleicons.org/spotify/1ED760',        bg: 'rgba(30,215,96,0.12)',    border: 'rgba(30,215,96,0.2)' }
  if (n.includes('apple'))                             return { url: 'https://cdn.simpleicons.org/applemusic/FA243C',     bg: 'rgba(250,36,60,0.12)',    border: 'rgba(250,36,60,0.2)' }
  if (n.includes('audiomack'))                         return { url: 'https://cdn.simpleicons.org/audiomack/FFA200',      bg: 'rgba(255,162,0,0.12)',    border: 'rgba(255,162,0,0.2)' }
  
  if (n.includes('chatgpt') || n.includes('openai'))   return { url: null, svgIcon: 'openai',                             bg: 'rgba(116,170,156,0.12)',  border: 'rgba(116,170,156,0.2)' }
  if (n.includes('claude') || n.includes('anthropic')) return { url: 'https://cdn.simpleicons.org/anthropic/D97757',      bg: 'rgba(217,119,87,0.12)',   border: 'rgba(217,119,87,0.2)' }
  if (n.includes('gemini'))                            return { url: 'https://cdn.simpleicons.org/googlegemini/8E75B2',   bg: 'rgba(142,117,178,0.12)',  border: 'rgba(142,117,178,0.2)' }
  if (n.includes('perplexity'))                        return { url: 'https://cdn.simpleicons.org/perplexity/22B8CD',     bg: 'rgba(34,184,205,0.12)',   border: 'rgba(34,184,205,0.2)' }
  if (n.includes('midjourney'))                        return { url: null, svgIcon: 'bot',                                bg: 'rgba(255,255,255,0.08)',  border: 'rgba(255,255,255,0.2)', labelColor: '#ffffff' }
  if (n.includes('copilot') || n.includes('github'))   return { url: 'https://cdn.simpleicons.org/github/ffffff',         bg: 'rgba(255,255,255,0.08)',  border: 'rgba(255,255,255,0.12)' }
  
  if (n.includes('canva'))                             return { url: 'https://cdn.simpleicons.org/canva/00C4CC',          bg: 'rgba(0,196,204,0.12)',    border: 'rgba(0,196,204,0.2)' }
  if (n.includes('microsoft'))                         return { url: 'https://cdn.simpleicons.org/microsoft365/D83B01',   bg: 'rgba(216,59,1,0.12)',     border: 'rgba(216,59,1,0.2)' }
  if (n.includes('adobe'))                             return { url: 'https://cdn.simpleicons.org/adobe/FF0000',          bg: 'rgba(255,0,0,0.12)',      border: 'rgba(255,0,0,0.2)' }
  
  if (n.includes('playstation'))                       return { url: 'https://cdn.simpleicons.org/playstation/003791',    bg: 'rgba(0,55,145,0.12)',     border: 'rgba(0,55,145,0.2)' }
  if (n.includes('xbox'))                              return { url: 'https://cdn.simpleicons.org/xbox/107C10',           bg: 'rgba(16,124,16,0.12)',    border: 'rgba(16,124,16,0.2)' }
  if (n.includes('nintendo'))                          return { url: 'https://cdn.simpleicons.org/nintendoswitch/E60012', bg: 'rgba(230,0,18,0.12)',     border: 'rgba(230,0,18,0.2)' }
  
  return { url: null,                                                                                                     bg: 'rgba(212,175,55,0.08)',   border: 'rgba(212,175,55,0.15)' }
}

export function PoolCard({ pool }: { pool: Pool }) {
  const fillPercentage = (pool.current_seats / pool.max_seats) * 100
  const isFull        = pool.current_seats >= pool.max_seats
  const icon          = getIconData(pool.service_name)

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
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: icon.bg, border: `1px solid ${icon.border}` }}
        >
          {/* 🔥 This rendering logic handles all our new custom fallbacks */}
          {icon.url ? (
            <img src={icon.url} alt={pool.service_name} className="w-6 h-6" />
          ) : icon.svgIcon === 'openai' ? (
            <OpenAIIcon size={22} />
          ) : icon.svgIcon === 'tv' ? (
            <Tv size={20} style={{ color: icon.labelColor }} />
          ) : icon.svgIcon === 'play' ? (
            <PlaySquare size={20} style={{ color: icon.labelColor }} />
          ) : icon.svgIcon === 'bot' ? (
            <Bot size={20} style={{ color: icon.labelColor }} />
          ) : icon.label ? (
            <span className="text-[11px] font-black" style={{ color: icon.labelColor || '#D4AF37' }}>
              {icon.label}
            </span>
          ) : (
            <Component size={20} style={{ color: '#D4AF37' }} />
          )}
        </div>

        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={
            isFull
              ? { background: 'rgba(239,68,68,0.1)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
              : { background: 'rgba(34,197,94,0.1)',  color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
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