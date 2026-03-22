'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin()

export function AnimatedHero({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline()

    // Staggered entrance for all gsap-reveal elements
    tl.from('.hero-reveal', {
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power4.out',
    })

    // Subtle floating animation on the mockup card
    gsap.to('.hero-mockup', {
      y: -12,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })

    // Glow pulse on the background blob
    gsap.to('.hero-glow', {
      scale: 1.15,
      opacity: 0.6,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, { scope: container })

  return (
    <div ref={container} className="w-full">
      {children}
    </div>
  )
}