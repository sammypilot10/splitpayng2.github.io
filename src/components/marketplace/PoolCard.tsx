// src/components/marketplace/PoolCard.tsx
import { Database } from '@/types/supabase'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Users, Component } from 'lucide-react'
import Link from 'next/link'

type Pool = Database['public']['Tables']['pools']['Row']

// Massive dictionary to match services to their official brand colors and SVG logos
const getIconData = (name: string) => {
  const normalized = name.toLowerCase()
  
  // Video
  if (normalized.includes('netflix')) return { url: 'https://cdn.simpleicons.org/netflix/E50914', bg: 'bg-[#E50914]/10' }
  if (normalized.includes('prime')) return { url: 'https://cdn.simpleicons.org/primevideo/00A8E1', bg: 'bg-[#00A8E1]/10' }
  if (normalized.includes('youtube')) return { url: 'https://cdn.simpleicons.org/youtube/FF0000', bg: 'bg-[#FF0000]/10' }
  if (normalized.includes('crunchyroll')) return { url: 'https://cdn.simpleicons.org/crunchyroll/F47521', bg: 'bg-[#F47521]/10' }
  
  // Music
  if (normalized.includes('spotify')) return { url: 'https://cdn.simpleicons.org/spotify/1ED760', bg: 'bg-[#1ED760]/10' }
  if (normalized.includes('apple')) return { url: 'https://cdn.simpleicons.org/applemusic/FA243C', bg: 'bg-[#FA243C]/10' }
  
  // AI Tools
  if (normalized.includes('chatgpt') || normalized.includes('openai')) return { url: 'https://cdn.simpleicons.org/openai/412991', bg: 'bg-[#412991]/10' }
  if (normalized.includes('claude') || normalized.includes('anthropic')) return { url: 'https://cdn.simpleicons.org/anthropic/D97757', bg: 'bg-[#D97757]/10' }
  if (normalized.includes('gemini')) return { url: 'https://cdn.simpleicons.org/googlegemini/8E75B2', bg: 'bg-[#8E75B2]/10' }
  if (normalized.includes('perplexity')) return { url: 'https://cdn.simpleicons.org/perplexity/22B8CD', bg: 'bg-[#22B8CD]/10' }
  if (normalized.includes('copilot') || normalized.includes('github')) return { url: 'https://cdn.simpleicons.org/github/181717', bg: 'bg-[#181717]/10' }
  
  // Software
  if (normalized.includes('canva')) return { url: 'https://cdn.simpleicons.org/canva/00C4CC', bg: 'bg-[#00C4CC]/10' }
  if (normalized.includes('microsoft')) return { url: 'https://cdn.simpleicons.org/microsoft365/D83B01', bg: 'bg-[#D83B01]/10' }
  if (normalized.includes('adobe')) return { url: 'https://cdn.simpleicons.org/adobe/FF0000', bg: 'bg-[#FF0000]/10' }
  
  // Gaming
  if (normalized.includes('playstation')) return { url: 'https://cdn.simpleicons.org/playstation/003791', bg: 'bg-[#003791]/10' }
  if (normalized.includes('xbox')) return { url: 'https://cdn.simpleicons.org/xbox/107C10', bg: 'bg-[#107C10]/10' }
  if (normalized.includes('nintendo')) return { url: 'https://cdn.simpleicons.org/nintendoswitch/E60012', bg: 'bg-[#E60012]/10' }

  // Fallback for custom entries
  return { url: null, bg: 'bg-fintech-navy/5' }
}

export function PoolCard({ pool }: { pool: Pool }) {
  const fillPercentage = (pool.current_seats / pool.max_seats) * 100
  const isFull = pool.current_seats >= pool.max_seats
  const icon = getIconData(pool.service_name)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${icon.bg}`}>
          {icon.url ? (
            <img src={icon.url} alt={pool.service_name} className="w-6 h-6" />
          ) : (
            <Component className="w-6 h-6 text-fintech-navy/40" />
          )}
        </div>
        <StatusBadge status={isFull ? 'full' : 'active'} />
      </div>

      <div className="mb-4 flex-grow">
        <h3 className="font-bold text-lg text-fintech-navy mb-1 line-clamp-1" title={pool.service_name}>
          {pool.service_name}
        </h3>
        <p className="text-2xl font-extrabold text-fintech-navy">
          ₦{pool.price_per_seat.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ seat</span>
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Users size={14} /> Capacity
          </span>
          <span className="text-sm font-bold text-fintech-navy">{pool.current_seats} / {pool.max_seats}</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-fintech-gold'}`} 
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* 🔥 THE FIX: Conditionally render the Link so disabled buttons can't be clicked */}
        {isFull ? (
          <Button variant="outline" disabled className="w-full">
            Pool Full
          </Button>
        ) : (
          <Link href={`/pools/${pool.id}`} className="w-full block">
            <Button variant="primary" className="w-full bg-fintech-navy hover:bg-fintech-navy/90 text-white font-bold transition-all">
              Join Pool
            </Button>
          </Link>
        )}
        
        <p className="text-[10px] text-center text-gray-400 leading-tight">
          Account sharing may violate service terms. Use at your own risk. 48h Escrow applied.
        </p>
      </div>
    </div>
  )
}