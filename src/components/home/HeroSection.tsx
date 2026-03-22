'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { ShieldCheck, Users, CheckCircle2, ArrowRight } from 'lucide-react'

gsap.registerPlugin(useGSAP)

function WordReveal({ text, className = '', style = {} }: { text: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={style}>
      {text.split(' ').map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.28em' }}>
          <span className="word-inner" style={{ display: 'inline-block', transform: 'translateY(110%)' }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  )
}

type PoolItem = {
  name: string
  price: string
  seats: string
  color: string
  icon: string | null
  useImg: boolean
  label?: string
}

const POOL_ITEMS: PoolItem[] = [
  { name: 'Netflix Premium 4K', price: '₦2,500/seat', seats: '4/5', color: 'E50914', icon: 'netflix', useImg: true },
  { name: 'Spotify Family',     price: '₦1,200/seat', seats: '5/6', color: '1ED760', icon: 'spotify', useImg: true },
  { name: 'ChatGPT Plus',       price: '₦3,500/seat', seats: '2/4', color: '74AA9C', icon: null,      useImg: false, label: 'GPT' },
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mockupRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!mockupRef.current) return
      const x = (e.clientX / window.innerWidth  - 0.5) * 18
      const y = (e.clientY / window.innerHeight - 0.5) * 18
      gsap.to(mockupRef.current, { rotateY: x, rotateX: -y, duration: 1.2, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useGSAP(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({ delay: 1.5 })
    tl.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' })
      .to(containerRef.current.querySelectorAll('.word-inner'), {
        y: 0, duration: 1, stagger: 0.05, ease: 'power4.out',
      }, '-=0.2')
      .from('.hero-para',  { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .from('.hero-btn',   { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.5')
      .from('.hero-trust', { opacity: 0, x: -20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .from('.hero-mockup', { opacity: 0, x: 80, scale: 0.93, duration: 1.4, ease: 'power4.out' }, '-=1.2')

    gsap.to('.hero-mockup', { y: -16, duration: 3.5, repeat: -1, yoyo: true, ease: 'power1.inOut', delay: 3 })
    gsap.to('.hero-glow',   { scale: 1.3, opacity: 0.35, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center px-6 lg:px-16 overflow-hidden"
      style={{ paddingTop: '80px' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div
        className="hero-glow absolute top-1/3 left-1/4 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 65%)',
          transformOrigin: 'center',
        }}
      />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

        {/* ── Left Column ── */}
        <div className="flex flex-col items-start">
          <div
            className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
            style={{
              border: '1px solid rgba(212,175,55,0.3)',
              background: 'rgba(212,175,55,0.06)',
              color: '#D4AF37',
            }}
          >
            <ShieldCheck size={14} />
            100% Escrow Protected by Paystack
          </div>

          <h1
            className="font-black leading-[0.92] tracking-tight mb-8"
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
          >
            <div className="text-white"><WordReveal text="Split Premium" /></div>
            <div className="text-white"><WordReveal text="Costs," /></div>
            <div>
              <WordReveal
                text="Without the Risk."
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 50%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              />
            </div>
          </h1>

          <p
            className="hero-para text-lg leading-relaxed mb-10 max-w-lg"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Nigeria's most secure marketplace for shared subscriptions. Join pools for Netflix,
            Spotify, ChatGPT Plus & more — money locked in escrow until your access is verified.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="/browse">
              <button
                className="hero-btn group flex items-center gap-2 px-8 py-4 rounded-full font-black text-base transition-all hover:scale-105"
                style={{ background: '#D4AF37', color: '#05080F', boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}
              >
                Browse Pools
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/auth?returnTo=/create-pool">
              <button
                className="hero-btn px-8 py-4 rounded-full font-bold text-base transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
              >
                Become a Host
              </button>
            </Link>
          </div>

          <div className="hero-trust flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full overflow-hidden"
                  style={{ border: '2px solid #05080F' }}
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3" fill="#D4AF37" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Trusted by 5,000+ Nigerians
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Column — 3D Mockup ── */}
        <div
          className="hero-mockup relative"
          ref={mockupRef}
          style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
        >
          <div
            className="rounded-[2rem] p-6 relative"
            style={{
              background: 'rgba(13,21,37,0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Active Pools</h3>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: '#4ade80',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                ● Live Escrow
              </span>
            </div>

            <div className="space-y-3">
              {POOL_ITEMS.map(item => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `#${item.color}18` }}
                  >
                    {item.useImg ? (
                      <img
                        src={`https://cdn.simpleicons.org/${item.icon}/${item.color}`}
                        alt={item.name}
                        className="w-5 h-5"
                      />
                    ) : (
                      <span
                        className="text-[11px] font-black tracking-tight"
                        style={{ color: `#${item.color}` }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.price}</p>
                  </div>

                  {/* Seats */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-white">
                      <Users size={11} style={{ color: '#D4AF37' }} />
                      {item.seats}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: '#4ade80' }}>1 left</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Escrow badge */}
            <div
              className="absolute -bottom-5 -right-5 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
                boxShadow: '0 16px 48px rgba(212,175,55,0.45)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(5,8,15,0.2)' }}
              >
                <CheckCircle2 size={16} color="#05080F" />
              </div>
              <div>
                <p className="text-[10px] font-semibold" style={{ color: 'rgba(5,8,15,0.6)' }}>
                  Payment Secured
                </p>
                <p className="text-sm font-black" style={{ color: '#05080F' }}>Escrow Locked</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}