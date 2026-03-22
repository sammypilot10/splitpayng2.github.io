'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function PageLoader() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const tl = gsap.timeline({ delay: 0.2 })

    tl.to('.pl-logo', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to('.pl-bar', {
        scaleX: 1,
        transformOrigin: 'left center',
        duration: 0.7,
        ease: 'power4.inOut',
      })
      .to('.pl-bar', {
        scaleX: 0,
        transformOrigin: 'right center',
        duration: 0.7,
        ease: 'power4.inOut',
        delay: 0.2,
      })
      .to(ref.current, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
      }, '-=0.3')
  }, { scope: ref })

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8"
      style={{ background: '#05080F' }}
    >
      <div
        className="pl-logo text-3xl font-black"
        style={{ opacity: 0, transform: 'translateY(20px)', color: 'white' }}
      >
        SplitPay<span style={{ color: '#D4AF37' }}>NG</span>
      </div>
      <div
        className="pl-bar w-40 h-[2px] rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          transform: 'scaleX(0)',
        }}
      />
    </div>
  )
}