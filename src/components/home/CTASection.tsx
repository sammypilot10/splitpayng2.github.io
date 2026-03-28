'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.from('.cta-bg-glow', {
      scale: 0,
      opacity: 0,
      duration: 1.8,
      ease: 'power4.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' },
    })

    gsap.from(ref.current.querySelectorAll('.cta-item'), {
      y: 60, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%' },
    })

    gsap.to('.cta-main-btn', {
      boxShadow: '0 0 70px rgba(212,175,55,0.7), 0 0 140px rgba(212,175,55,0.2)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' },
    })
  }, { scope: ref })

  return (
    <section
      ref={ref}
      className="py-36 px-6 relative overflow-hidden text-center"
      style={{ background: '#05080F', borderTop: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div
        className="cta-bg-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '44px 44px' }}
      />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-8">
        <div className="cta-item inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
          Built for Nigeria
        </div>

        <h2 className="cta-item font-black text-white leading-[0.92]" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
          Ready to maximize<br />
          <span style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            your money?
          </span>
        </h2>

        <p className="cta-item text-xl max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Join thousands of Nigerians saving on premium subscriptions with total security.
        </p>

        <div className="cta-item flex flex-col sm:flex-row gap-4">
          <Link href="/auth">
            <button
              className="cta-main-btn group flex items-center gap-3 px-10 py-5 rounded-full font-black text-lg transition-all hover:scale-105"
              style={{ background: '#D4AF37', color: '#05080F', boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}
            >
              Create Free Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/browse">
            <button
              className="px-10 py-5 rounded-full font-bold text-lg text-white transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Browse Pools
            </button>
          </Link>
        </div>

        <div className="cta-item flex flex-wrap justify-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>✓ Free to join</span>
          <span>✓ Cancel anytime</span>
          <span>✓ 100% Escrow protected</span>
          <span>✓ Nigerian company</span>
        </div>
      </div>
    </section>
  )
}