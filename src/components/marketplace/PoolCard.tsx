// src/components/marketplace/PoolCard.tsx
import { Database } from '@/types/supabase'
import { Users, Component } from 'lucide-react'
import Link from 'next/link'

type Pool = Database['public']['Tables']['pools']['Row']

// ── Inline SVG Icons (never break, no CDN) ──────────────────────────────────

function NetflixIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#E50914">
      <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.594.52.33 1.05.63 1.58.913L20.6 0h-5.399L12 8.256 9.026.001zm5.85 14.93L8.7 8.256 6.226 0H.799l5.398 15.247c1.018.368 2.063.7 3.051.983z"/>
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1ED760">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function PrimeVideoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#00A8E1">
      <path d="M13.127 5.923c-.84-.06-1.77.12-2.64.6L8.31 7.944c-.09.06-.15.09-.15.18v7.68c0 .09.06.15.15.15.03 0 .06 0 .09-.03l2.31-1.35c.09-.06.15-.12.15-.24V10.2c0-.12.06-.21.15-.27l1.05-.6c.21-.12.45-.18.69-.18.51 0 .78.3.78.81v3.84c0 .09.06.15.15.15.03 0 .06 0 .09-.03l2.31-1.35c.09-.06.15-.12.15-.24V9.363c0-2.07-1.17-3.36-3.123-3.44zM5.49 8.163L3.18 9.513c-.09.06-.15.12-.15.24v3.96c0 .09.06.15.15.15.03 0 .06 0 .09-.03l2.31-1.35c.09-.06.15-.12.15-.24v-3.81c0-.09-.06-.15-.15-.15-.03 0-.06 0-.09.03zm13.02 5.43l-2.31 1.35c-.09.06-.15.12-.15.24v1.14c0 .09.06.15.15.15.03 0 .06 0 .09-.03l2.31-1.35c.09-.06.15-.12.15-.24v-1.14c0-.09-.06-.15-.15-.15-.03 0-.06 0-.09.03z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  )
}

function OpenAIIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#74AA9C">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.676zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  )
}

function CanvaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#00C4CC">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.536 15.168c-.458.93-1.458 1.555-2.553 1.555-1.583 0-2.87-1.287-2.87-2.87 0-.205.022-.405.063-.598-.735.302-1.253.994-1.253 1.808 0 1.084.879 1.963 1.963 1.963.459 0 .882-.159 1.215-.423.204.46.318.969.318 1.504 0 2.03-1.646 3.676-3.676 3.676S5.07 19.137 5.07 17.107c0-1.395.778-2.612 1.922-3.248a4.74 4.74 0 0 1-.139-1.147c0-2.618 2.122-4.74 4.74-4.74.87 0 1.684.235 2.382.645.426-.41.999-.663 1.631-.663 1.287 0 2.33 1.043 2.33 2.33 0 .416-.11.806-.303 1.143.189.497.293 1.035.293 1.597 0 .758-.172 1.477-.48 2.144h.09z"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#D83B01">
      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
    </svg>
  )
}

function AdobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M13.966 22.624l-1.69-4.281H8.771l3.106-8.988 5.373 13.27h-3.284zM8.468 1.376H0v21.248zm7.064 0H24v21.248z"/>
    </svg>
  )
}

function PlayStationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#003791">
      <path d="M9.5 17.5v-11l2 .667V15.5l3-1V3.5l-8.5-2v14l3.5 2zm4-1.667V9.167l3 1v5l2.5-1v-5.833L12 5.5v12.667l1.5-.334zM0 15.833L6 18.5V16.5L0 14v1.833z"/>
    </svg>
  )
}

function XboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#107C10">
      <path d="M4.102 4.802C5.88 3.048 8.32 2 12 2s6.12 1.048 7.898 2.802c.208.203-.687-.124-1.968.744C16.704 6.348 14.691 8.148 12 11.148c-2.691-3-4.704-4.8-5.93-5.602-1.281-.868-2.176-.541-1.968-.744zM3.337 5.62C1.876 7.31 1 9.55 1 12c0 5.523 4.477 10 11 10 .685 0 1.354-.065 2-.188C9.67 20.107 5.1 16.75 3.337 5.62zM21.663 5.62C19.9 16.75 15.33 20.107 11 21.812c.646.123 1.315.188 2 .188 6.523 0 11-4.477 11-10 0-2.45-.876-4.69-2.337-6.38z"/>
    </svg>
  )
}

function NintendoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#E60012">
      <path d="M9.5 2h5C17.985 2 22 6.015 22 9.5v5c0 3.484-3.016 7.5-7.5 7.5h-5C6.015 21.5 2 17.484 2 13.999V9.5C2 6.015 6.015 2 9.5 2zm0 2C7.015 4 4 7.015 4 9.5v4.499C4 16.484 7.015 19.5 9.5 19.5h5c2.484 0 5.5-3.016 5.5-5.5V9.5C20 7.015 16.985 4 14.5 4zm-2 3h2v10h-2V7zm5.5 0a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5zm0 2a.5.5 0 0 0 0 1 .5.5 0 0 0 0-1zm0 5a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5zm0 2a.5.5 0 0 0 0 1 .5.5 0 0 0 0-1z"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  )
}

function AnthropicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#D97757">
      <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-3.654 0H6.57L0 20h3.603l1.388-3.5h5.819l1.388 3.5h3.603l-6.029-16.48zm-1.209 9.982H5.964l1.5-3.809 1.5 3.809z"/>
    </svg>
  )
}

function DSTVIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#D4AF37">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
    </svg>
  )
}

function ShowmaxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#D4AF37">
      <path d="M4 4l4 8-4 8h3l4-8-4-8H4zm9 0l4 8-4 8h3l4-8-4-8h-3z"/>
    </svg>
  )
}

function GeminiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#8E75B2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  )
}

// ── Icon Resolver ────────────────────────────────────────────────────────────

type IconEntry = {
  component: React.ReactNode
  bg: string
  border: string
}

const getIconData = (name: string): IconEntry => {
  const n = name.toLowerCase()

  if (n.includes('netflix'))
    return { component: <NetflixIcon />,      bg: 'rgba(229,9,20,0.12)',     border: 'rgba(229,9,20,0.25)' }
  if (n.includes('prime') || n.includes('amazon'))
    return { component: <PrimeVideoIcon />,   bg: 'rgba(0,168,225,0.12)',    border: 'rgba(0,168,225,0.25)' }
  if (n.includes('youtube'))
    return { component: <YouTubeIcon />,      bg: 'rgba(255,0,0,0.12)',      border: 'rgba(255,0,0,0.25)' }
  if (n.includes('spotify'))
    return { component: <SpotifyIcon />,      bg: 'rgba(30,215,96,0.12)',    border: 'rgba(30,215,96,0.25)' }
  if (n.includes('chatgpt') || n.includes('openai'))
    return { component: <OpenAIIcon />,       bg: 'rgba(116,170,156,0.12)',  border: 'rgba(116,170,156,0.25)' }
  if (n.includes('claude') || n.includes('anthropic'))
    return { component: <AnthropicIcon />,    bg: 'rgba(217,119,87,0.12)',   border: 'rgba(217,119,87,0.25)' }
  if (n.includes('gemini'))
    return { component: <GeminiIcon />,       bg: 'rgba(142,117,178,0.12)', border: 'rgba(142,117,178,0.25)' }
  if (n.includes('canva'))
    return { component: <CanvaIcon />,        bg: 'rgba(0,196,204,0.12)',    border: 'rgba(0,196,204,0.25)' }
  if (n.includes('microsoft') || n.includes('office'))
    return { component: <MicrosoftIcon />,    bg: 'rgba(216,59,1,0.12)',     border: 'rgba(216,59,1,0.25)' }
  if (n.includes('adobe'))
    return { component: <AdobeIcon />,        bg: 'rgba(255,0,0,0.12)',      border: 'rgba(255,0,0,0.25)' }
  if (n.includes('playstation'))
    return { component: <PlayStationIcon />,  bg: 'rgba(0,55,145,0.12)',     border: 'rgba(0,55,145,0.25)' }
  if (n.includes('xbox'))
    return { component: <XboxIcon />,         bg: 'rgba(16,124,16,0.12)',    border: 'rgba(16,124,16,0.25)' }
  if (n.includes('nintendo'))
    return { component: <NintendoIcon />,     bg: 'rgba(230,0,18,0.12)',     border: 'rgba(230,0,18,0.25)' }
  if (n.includes('github') || n.includes('copilot'))
    return { component: <GitHubIcon />,       bg: 'rgba(255,255,255,0.07)',  border: 'rgba(255,255,255,0.15)' }
  if (n.includes('dstv'))
    return { component: <DSTVIcon />,         bg: 'rgba(212,175,55,0.12)',   border: 'rgba(212,175,55,0.25)' }
  if (n.includes('showmax'))
    return { component: <ShowmaxIcon />,      bg: 'rgba(212,175,55,0.12)',   border: 'rgba(212,175,55,0.25)' }

  // Generic fallback
  return {
    component: <Component size={20} style={{ color: '#D4AF37' }} />,
    bg: 'rgba(212,175,55,0.08)',
    border: 'rgba(212,175,55,0.2)',
  }
}

// ── Card Component ───────────────────────────────────────────────────────────

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
      {/* Top row */}
      <div className="flex justify-between items-start mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: icon.bg, border: `1px solid ${icon.border}` }}
        >
          {icon.component}
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
          <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Users size={12} /> Capacity
          </span>
          <span className="text-xs font-bold text-white">
            {pool.current_seats}
            <span style={{ color: 'rgba(255,255,255,0.3)' }}> / {pool.max_seats}</span>
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
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

        <p className="text-[10px] text-center leading-tight" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Account sharing may violate service terms. Use at your own risk. 48h Escrow applied.
        </p>
      </div>
    </div>
  )
}