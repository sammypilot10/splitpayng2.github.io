'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedMarketplace({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Header slides in from left
    gsap.from('.marketplace-header', {
      x: -50,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
      },
    })

    // Cards stagger in with a premium cascade effect
    gsap.from('.pool-card', {
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: {
        amount: 0.6,
        from: 'start',
      },
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.pool-card',
        start: 'top 85%',
      },
    })
  }, { scope: container })

  return (
    <div ref={container} className="max-w-7xl mx-auto px-6 w-full mb-24">
      {children}
    </div>
  )
}