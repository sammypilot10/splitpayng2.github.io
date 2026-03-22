'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function AnimatedCTA({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!container.current) return

    const button = container.current.querySelector('.cta-button')

    gsap.from(container.current, {
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 88%',
      },
    })

    if (button) {
      gsap.to(button, {
        boxShadow: '0 0 40px rgba(234, 179, 8, 0.5)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        scrollTrigger: {
          trigger: button,
          start: 'top 90%',
        },
      })
    }
  }, { scope: container, dependencies: [] })

  return (
    <div ref={container} className="w-full">
      {children}
    </div>
  )
}