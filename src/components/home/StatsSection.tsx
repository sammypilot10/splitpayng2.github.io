'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function StatsSection({ poolCount }: { poolCount: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.from(ref.current, {
      y: 80, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%' },
    })

    ref.current.querySelectorAll('.stat-card').forEach((card, i) => {
      gsap.from(card, {
        y: 40, opacity: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      })
    })
  }, { scope: ref })

  return (
    <section className="px-6 lg:px-16 py-16 max-w-7xl mx-auto w-full" ref={ref}>
      <div
        className="grid grid-cols-2 md:grid-cols-4 overflow-hidden rounded-[2rem]"
        style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
      >
        {[
          { val: '₦12M+', label: 'Saved by users', sub: 'and growing daily' },
          { val: '4.9/5', label: 'Trust score', sub: 'from verified users' },
          { val: '0', label: 'Scams recorded', sub: 'since we launched' },
          { val: `${poolCount}+`, label: 'Active pools', sub: 'live right now', gold: true },
        ].map((s, i, arr) => (
          <div
            key={i}
            className="stat-card p-8 lg:p-12 text-center"
            style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined }}
          >
            <p className="text-4xl lg:text-5xl font-black mb-2" style={{ color: s.gold ? '#D4AF37' : 'white' }}>
              {s.val}
            </p>
            <p className="text-white font-semibold text-sm mb-1">{s.label}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}