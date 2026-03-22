'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function AnimatedMarketplace({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!container.current) return

    const header = container.current.querySelector('.marketplace-header')
    const cards = container.current.querySelectorAll('.pool-card')

    if (header) {
      gsap.from(header, {
        x: -50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
        },
      })
    }

    if (cards.length > 0) {
      gsap.from(cards, {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: {
          amount: 0.6,
          from: 'start',
        },
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
        },
      })
    }
  }, { scope: container, dependencies: [] })

  return (
    <div ref={container} className="max-w-7xl mx-auto px-6 w-full mb-24">
      {children}
    </div>
  )
}