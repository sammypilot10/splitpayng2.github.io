'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedStats({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Slide up the whole stats card on scroll
    gsap.from(container.current, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
      },
    })

    // Each stat number counts up
    const statNumbers = container.current?.querySelectorAll('.stat-number')
    statNumbers?.forEach((el) => {
      gsap.from(el, {
        innerText: 0,
        duration: 2,
        ease: 'power2.out',
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        },
      })
    })

    // Stagger each stat column in
    gsap.from('.stat-item', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
      },
    })
  }, { scope: container })

  return (
    <div ref={container} className="max-w-5xl mx-auto w-full px-6 mb-20">
      {children}
    </div>
  )
}