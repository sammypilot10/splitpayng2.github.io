'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedCTA({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Whole section scales up from slightly smaller
    gsap.from(container.current, {
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
      },
    })

    // Shimmer effect on the CTA button
    gsap.to('.cta-button', {
      boxShadow: '0 0 40px rgba(234, 179, 8, 0.5)',
      duration: 1.5,
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