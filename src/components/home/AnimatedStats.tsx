'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function AnimatedStats({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!container.current) return

    const statItems = container.current.querySelectorAll('.stat-item')

    gsap.from(container.current, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 90%',
      },
    })

    if (statItems.length > 0) {
      gsap.from(statItems, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 88%',
        },
      })
    }
  }, { scope: container, dependencies: [] })

  return (
    <div ref={container} className="max-w-5xl mx-auto w-full px-6 mb-20">
      {children}
    </div>
  )
}