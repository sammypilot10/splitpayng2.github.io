'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'left' | 'right'
  delay?: number
}

export function AnimatedSection({ 
  children, 
  className = '', 
  direction = 'up',
  delay = 0 
}: AnimatedSectionProps) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration: 1,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 82%',
      },
    }

    if (direction === 'up') fromVars.y = 70
    if (direction === 'left') fromVars.x = -70
    if (direction === 'right') fromVars.x = 70

    gsap.from(container.current, fromVars)

    // Stagger any children with class "section-reveal"
    gsap.from('.section-reveal', {
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
      },
    })
  }, { scope: container })

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  )
}