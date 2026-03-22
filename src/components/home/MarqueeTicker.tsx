'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Lock, Zap, Shield, CheckCircle2, CreditCard, MapPin, Star, Wallet } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const ITEMS = [
  { icon: Lock, text: 'Escrow Protected' },
  { icon: Zap, text: 'Netflix · Spotify · ChatGPT' },
  { icon: Shield, text: 'AES-256 Encryption' },
  { icon: CheckCircle2, text: 'Zero Scams Since Launch' },
  { icon: CreditCard, text: 'Powered by Paystack' },
  { icon: MapPin, text: 'Built for Nigeria' },
  { icon: Star, text: '4.9 / 5 Trust Score' },
  { icon: Wallet, text: '₦12M+ Saved by Users' },
]

export function MarqueeTicker() {
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!trackRef.current) return
    const w = trackRef.current.scrollWidth / 2
    gsap.to(trackRef.current, { x: -w, duration: 22, repeat: -1, ease: 'none' })
  }, { scope: trackRef })

  const all = [...ITEMS, ...ITEMS]

  return (
    <div
      className="py-4 overflow-hidden"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(212,175,55,0.02)',
      }}
    >
      <div ref={trackRef} className="flex gap-10 whitespace-nowrap will-change-transform">
        {all.map((item, i) => {
          const Icon = item.icon
          return (
            <span
              key={i}
              className="flex items-center gap-2.5 text-sm font-semibold"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <Icon size={13} style={{ color: '#D4AF37', flexShrink: 0 }} />
              {item.text}
              <span style={{ color: '#D4AF37', opacity: 0.4, marginLeft: '1rem' }}>◆</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}