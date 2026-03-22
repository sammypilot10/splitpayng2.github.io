'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function AnimatedHero({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!container.current) return

    const reveals = container.current.querySelectorAll('.hero-reveal')
    const mockup = container.current.querySelector('.hero-mockup')
    const glow = container.current.querySelector('.hero-glow')

    if (reveals.length > 0) {
      gsap.from(reveals, {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power4.out',
        delay: 0.2,
      })
    }

    if (mockup) {
      gsap.to(mockup, {
        y: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1,
      })
    }

    if (glow) {
      gsap.to(glow, {
        scale: 1.15,
        opacity: 0.6,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }
  }, { scope: container, dependencies: [] })

  return (
    <div ref={container} className="w-full">
      {children}
    </div>
  )
}