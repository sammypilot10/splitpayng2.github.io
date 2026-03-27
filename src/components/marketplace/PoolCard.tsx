// src/components/marketplace/PoolCard.tsx
import { Database } from '@/types/supabase'
import { Users, Component, PlaySquare, Bot } from 'lucide-react'
import Link from 'next/link'

type Pool = Database['public']['Tables']['pools']['Row']

// ============================================================
//  INLINE SVG BRAND ICONS — Zero CDN dependency, never breaks
// ============================================================

function PrimeVideoIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16.5C7.5 19 15.5 20 20.5 16" stroke="#00A8E1" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="19.5,14.5 22,15.5 20,18.5" fill="#00A8E1" />
      <text x="12" y="13.5" fontFamily="system-ui,-apple-system,sans-serif" fontStyle="italic" fontWeight="900" fontSize="9" fill="#00A8E1" textAnchor="middle" letterSpacing="-0.5">prime</text>
    </svg>
  )
}

function DSTVIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#0098db" />
      <text x="12" y="15.5" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="8" fill="white" textAnchor="middle" letterSpacing="-0.2">DStv</text>
    </svg>
  )
}

function NetflixIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#141414" />
      {/* Classic Netflix N: left bar + diagonal + right bar */}
      <rect x="5" y="3" width="3.5" height="18" fill="#E50914" />
      <rect x="15.5" y="3" width="3.5" height="18" fill="#E50914" />
      <polygon points="8.5,3 15.5,18 15.5,21 8.5,6" fill="#E50914" />
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

function YouTubeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="5" width="22" height="14" rx="5" fill="#FF0000" />
      <polygon points="10,8.5 10,15.5 17,12" fill="white" />
    </svg>
  )
}

function CrunchyrollIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11.5" fill="#F47521" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <polygon points="10.5,9.5 10.5,14.5 16,12" fill="white" />
    </svg>
  )
}

function SpotifyIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1ED760" />
      <path d="M7 15.5C10.1 13.8 14.3 13.5 17.8 14.7" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 12C9.8 10 15.2 9.8 19 11.6" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 8.5C11.2 6.6 16.5 6.5 20.5 8.7" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function AppleMusicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#FC3C44" />
      <path d="M15.5 5v9.5a2.8 2.8 0 01-2.8 2.8 2.8 2.8 0 01-2.8-2.8 2.8 2.8 0 012.8-2.8c.4 0 .78.08 1.1.22V7.8L9.3 9v9.5A2.8 2.8 0 016.5 21.3 2.8 2.8 0 013.7 18.5a2.8 2.8 0 012.8-2.8c.4 0 .78.08 1.1.22V5.8l7.9-0.8z" fill="white" />
    </svg>
  )
}

function AudiomackIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#FFA200" />
      {/* EQ bars — Audiomack's waveform motif */}
      <rect x="3.5" y="10.5" width="2.5" height="3" rx="1.2" fill="white" />
      <rect x="7" y="8" width="2.5" height="8" rx="1.2" fill="white" />
      <rect x="10.5" y="5.5" width="2.5" height="13" rx="1.2" fill="white" />
      <rect x="14" y="8" width="2.5" height="8" rx="1.2" fill="white" />
      <rect x="17.5" y="10.5" width="2.5" height="3" rx="1.2" fill="white" />
    </svg>
  )
}

function OpenAIIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#74AA9C" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.676zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

function AnthropicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#D97757" />
      {/* Anthropic wordmark "A" — two angled strokes with crossbar */}
      <path d="M7 20L12 4L17 20" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 14.5H14.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

function GeminiIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#1a1a2e" />
      {/* Gemini 4-pointed star: the official logo mark */}
      <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#gem-grad)" />
      <defs>
        <linearGradient id="gem-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#8E75B2" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function PerplexityIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#1C1B22" />
      {/* Diamond top + vertical line + two horizontals — Perplexity's mark */}
      <path d="M12 3L17 8H12H7L12 3Z" fill="#22B8CD" />
      <rect x="10.8" y="8" width="2.4" height="13" rx="0.8" fill="#22B8CD" />
      <line x1="7" y1="12.5" x2="17" y2="12.5" stroke="#22B8CD" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7" y1="17" x2="17" y2="17" stroke="#22B8CD" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MidJourneyIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#1a1a1a" />
      {/* Simplified boat/ship shape — MJ's iconic logo */}
      <path d="M4 17 Q12 5 20 17" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M7 17 L17 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5 L12 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GitHubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#24292E" />
      <path d="M12 2.247C6.477 2.247 2 6.724 2 12.247c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.411 22 16.663 22 12.247 22 6.724 17.523 2.247 12 2.247z" />
    </svg>
  )
}

function CanvaIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#7D2AE7" />
      {/* Canva C-mark */}
      <path
        d="M17 15.3C15.9 17.1 14 18.2 11.8 18.2c-3.4 0-5.8-2.7-5.8-6.2S8.4 5.8 11.8 5.8c2.1 0 3.9 1 5 2.7L14.9 9.8C14.2 8.8 13.1 8.2 11.8 8.2c-2.1 0-3.6 1.7-3.6 3.8s1.5 3.8 3.6 3.8c1.3 0 2.5-.7 3.1-1.9L17 15.3z"
        fill="white"
      />
    </svg>
  )
}

function MicrosoftIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Windows 4-square grid */}
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  )
}

function AdobeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#FF0000" />
      {/* Adobe A triangle */}
      <polygon points="12,3.5 21.5,21 2.5,21" fill="none" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
      <line x1="8.8" y1="16" x2="15.2" y2="16" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function PlayStationIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#003791" />
      {/* PS logotype */}
      <text
        x="12" y="16"
        fontFamily="Arial,Helvetica,sans-serif"
        fontWeight="900" fontSize="9.5" fill="white"
        textAnchor="middle" letterSpacing="0.8"
      >PS</text>
    </svg>
  )
}

function XboxIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11.5" fill="#107C10" />
      <path d="M7 7L17 17M17 7L7 17" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function NintendoIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#E60012" />
      <text
        x="12" y="16.5"
        fontFamily="Arial Black,Arial,sans-serif"
        fontWeight="900" fontSize="11" fill="white"
        textAnchor="middle"
      >N</text>
    </svg>
  )
}

// ============================================================
//  ICON COMPONENT MAP  (replaces CDN url-based switching)
// ============================================================

type SvgIconKey =
  | 'prime' | 'dstv' | 'netflix' | 'showmax' | 'youtube'
  | 'crunchyroll' | 'spotify' | 'applemusic' | 'audiomack'
  | 'openai' | 'anthropic' | 'gemini' | 'perplexity' | 'midjourney' | 'github'
  | 'canva' | 'microsoft' | 'adobe'
  | 'playstation' | 'xbox' | 'nintendo'

const ICON_MAP: Record<SvgIconKey, React.FC<{ size?: number }>> = {
  prime: PrimeVideoIcon,
  dstv: DSTVIcon,
  netflix: NetflixIcon,
  showmax: ShowmaxIcon,
  youtube: YouTubeIcon,
  crunchyroll: CrunchyrollIcon,
  spotify: SpotifyIcon,
  applemusic: AppleMusicIcon,
  audiomack: AudiomackIcon,
  openai: OpenAIIcon,
  anthropic: AnthropicIcon,
  gemini: GeminiIcon,
  perplexity: PerplexityIcon,
  midjourney: MidJourneyIcon,
  github: GitHubIcon,
  canva: CanvaIcon,
  microsoft: MicrosoftIcon,
  adobe: AdobeIcon,
  playstation: PlayStationIcon,
  xbox: XboxIcon,
  nintendo: NintendoIcon,
}

// ============================================================
//  ICON DATA MAP — All inline, zero CDN
// ============================================================

type IconData = {
  svgIcon: SvgIconKey | null
  bg: string
  border: string
  label?: string
  labelColor?: string
}

const getIconData = (name: string): IconData => {
  const n = name.toLowerCase()

  // Streaming — Video
  if (n.includes('prime')) return { svgIcon: 'prime', bg: 'rgba(0,168,225,0.12)', border: 'rgba(0,168,225,0.2)' }
  if (n.includes('dstv')) return { svgIcon: 'dstv', bg: 'rgba(0,152,219,0.12)', border: 'rgba(0,152,219,0.2)' }
  if (n.includes('netflix')) return { svgIcon: 'netflix', bg: 'rgba(229,9,20,0.12)', border: 'rgba(229,9,20,0.2)' }
  if (n.includes('showmax')) return { svgIcon: 'showmax', bg: 'rgba(216,25,33,0.12)', border: 'rgba(216,25,33,0.2)' }
  if (n.includes('youtube')) return { svgIcon: 'youtube', bg: 'rgba(255,0,0,0.12)', border: 'rgba(255,0,0,0.2)' }
  if (n.includes('crunchyroll')) return { svgIcon: 'crunchyroll', bg: 'rgba(244,117,33,0.12)', border: 'rgba(244,117,33,0.2)' }

  // Streaming — Music
  if (n.includes('spotify')) return { svgIcon: 'spotify', bg: 'rgba(30,215,96,0.12)', border: 'rgba(30,215,96,0.2)' }
  if (n.includes('apple')) return { svgIcon: 'applemusic', bg: 'rgba(252,60,68,0.12)', border: 'rgba(252,60,68,0.2)' }
  if (n.includes('audiomack')) return { svgIcon: 'audiomack', bg: 'rgba(255,162,0,0.12)', border: 'rgba(255,162,0,0.2)' }

  // AI Tools
  if (n.includes('chatgpt') || n.includes('openai')) return { svgIcon: 'openai', bg: 'rgba(116,170,156,0.12)', border: 'rgba(116,170,156,0.2)' }
  if (n.includes('claude') || n.includes('anthropic')) return { svgIcon: 'anthropic', bg: 'rgba(217,119,87,0.12)', border: 'rgba(217,119,87,0.2)' }
  if (n.includes('gemini')) return { svgIcon: 'gemini', bg: 'rgba(142,117,178,0.12)', border: 'rgba(142,117,178,0.2)' }
  if (n.includes('perplexity')) return { svgIcon: 'perplexity', bg: 'rgba(34,184,205,0.12)', border: 'rgba(34,184,205,0.2)' }
  if (n.includes('midjourney')) return { svgIcon: 'midjourney', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)' }
  if (n.includes('copilot') || n.includes('github')) return { svgIcon: 'github', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' }

  // Creative / Productivity
  if (n.includes('canva')) return { svgIcon: 'canva', bg: 'rgba(125,42,231,0.12)', border: 'rgba(125,42,231,0.2)' }
  if (n.includes('microsoft')) return { svgIcon: 'microsoft', bg: 'rgba(0,164,239,0.12)', border: 'rgba(0,164,239,0.2)' }
  if (n.includes('adobe')) return { svgIcon: 'adobe', bg: 'rgba(255,0,0,0.12)', border: 'rgba(255,0,0,0.2)' }

  // Gaming
  if (n.includes('playstation')) return { svgIcon: 'playstation', bg: 'rgba(0,55,145,0.12)', border: 'rgba(0,55,145,0.2)' }
  if (n.includes('xbox')) return { svgIcon: 'xbox', bg: 'rgba(16,124,16,0.12)', border: 'rgba(16,124,16,0.2)' }
  if (n.includes('nintendo')) return { svgIcon: 'nintendo', bg: 'rgba(230,0,18,0.12)', border: 'rgba(230,0,18,0.2)' }

  // Fallback
  return { svgIcon: null, bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.15)' }
}

// ============================================================
//  POOL CARD
// ============================================================

export function PoolCard({ pool }: { pool: Pool }) {
  const fillPercentage = (pool.current_seats / pool.max_seats) * 100
  const isFull = pool.current_seats >= pool.max_seats
  const icon = getIconData(pool.service_name)

  const IconComponent = icon.svgIcon ? ICON_MAP[icon.svgIcon] : null

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
          {IconComponent ? (
            <IconComponent size={24} />
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