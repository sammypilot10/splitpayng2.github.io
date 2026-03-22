'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Search, Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const steps = [
  {
    number: '01',
    icon: Search,
    color: '#D4AF37',
    title: 'Browse & Join a Pool',
    desc: 'Explore hundreds of verified subscription pools. Find Netflix, Spotify, ChatGPT Plus, and more at a fraction of the cost.',
  },
  {
    number: '02',
    icon: Lock,
    color: '#60A5FA',
    title: 'Payment Goes into Escrow',
    desc: 'Your money is locked by Paystack — not sent to the host. You have 48 hours to verify credentials before payment releases.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    color: '#4ade80',
    title: 'Verify & Confirm Access',
    desc: 'Test the encrypted credentials. Confirm if they work and the host gets paid. If not, you get a 100% refund. Zero risk.',
  },
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !trackRef.current) return

    gsap.from('.hiw-header', {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    })

    const totalWidth = trackRef.current.scrollWidth - window.innerWidth + 80

    gsap.to(trackRef.current, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1.5,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        anticipatePin: 1,
      },
    })

    const cards = containerRef.current.querySelectorAll('.hiw-card')
    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: `${20 + i * 15}% top`,
          toggleActions: 'play none none none',
        },
      })
    })
  }, { scope: containerRef })

  return (
    <div style={{ background: '#05080F', overflow: 'hidden' }}>
      <section ref={containerRef} style={{ background: '#05080F' }}>

        <div className="hiw-header pt-20 px-6 lg:px-16 text-center mb-16">
          <p
            className="text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: '#D4AF37' }}
          >
            How It Works
          </p>
          <h2
            className="font-black text-white"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            Three steps to savings
          </h2>
        </div>

        <div
          ref={trackRef}
          className="flex items-stretch gap-6 pb-24"
          style={{ width: 'max-content', paddingLeft: '10vw', paddingRight: '10vw' }}
        >
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={i}
                className="hiw-card flex-shrink-0 w-[400px] rounded-[2rem] p-10 flex flex-col justify-between"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-10">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `${s.color}12`,
                        border: `1px solid ${s.color}28`,
                      }}
                    >
                      <Icon size={28} color={s.color} />
                    </div>
                    <span
                      className="text-8xl font-black leading-none"
                      style={{ color: s.color, opacity: 0.07 }}
                    >
                      {s.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">{s.title}</h3>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {s.desc}
                  </p>
                </div>

                <div className="flex gap-2 mt-10">
                  {steps.map((_, j) => (
                    <div
                      key={j}
                      className="h-[3px] flex-1 rounded-full"
                      style={{
                        background: j <= i ? s.color : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          <div
            className="hiw-card flex-shrink-0 w-[320px] rounded-[2rem] p-10 flex flex-col items-center justify-center text-center"
            style={{
              background: 'rgba(212,175,55,0.05)',
              border: '1px solid rgba(212,175,55,0.15)',
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(212,175,55,0.1)' }}
            >
              <ArrowRight size={36} color="#D4AF37" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Ready?</h3>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Join thousands saving money today
            </p>
            
            {/* 🔥 THIS IS WHAT WAS BROKEN! I replaced it with a proper Next.js Link tag */}
            <Link 
              href="/browse"
              className="px-7 py-3 rounded-full font-black text-sm transition-all hover:scale-105 inline-block"
              style={{ background: '#D4AF37', color: '#05080F' }}
            >
              Get Started Free
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}