'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SavingsCalculator } from '@/components/marketplace/SavingsCalculator'
import { ShieldCheck, Lock, Zap } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function CalculatorSection() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.from(ref.current.querySelectorAll('.cs-left > *'), {
      x: -60, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%' },
    })

    gsap.from('.cs-right', {
      x: 60, opacity: 0, scale: 0.95, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%' },
    })
  }, { scope: ref })

  return (
    <section
      ref={ref}
      className="py-28 px-6 lg:px-16 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #080C14 0%, #0D1525 100%)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 65%)' }}
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="cs-left flex flex-col gap-6">
          <p className="text-sm font-bold tracking-widest uppercase" style={{ color: '#D4AF37' }}>Save More</p>
          <h2 className="font-black text-white leading-[1.05]" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}>
            Stop paying full price for subscriptions you barely use.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            SplitPayNG connects you with Nigerians sharing premium subscriptions safely. AES-256-GCM vault keeps passwords encrypted until escrow releases.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { Icon: ShieldCheck, text: '100% Escrow protected — full refund if anything goes wrong' },
              { Icon: Lock, text: 'End-to-end encrypted credentials — we never see your passwords' },
              { Icon: Zap, text: 'Automated Paystack billing — cancel anytime from your dashboard' },
            ].map(({ Icon, text }, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)' }}
                >
                  <Icon size={16} color="#D4AF37" />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="cs-right relative z-10">
          <SavingsCalculator />
        </div>
      </div>
    </section>
  )
}