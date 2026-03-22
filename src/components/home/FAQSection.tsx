'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Plus, Minus } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const FAQS = [
  { q: "How does the 48-hour escrow work?", a: "When you join a pool, your payment is held securely by Paystack. You have 48 hours to test the credentials. If they work, confirm and the host gets paid. If not, dispute it for a 100% refund. Auto-confirms after 48 hours." },
  { q: "Is it safe to share or receive passwords?", a: "Yes. SplitPayNG uses AES-256-GCM encryption client-side. Passwords are encrypted on your device before reaching our database — our servers never see plaintext passwords." },
  { q: "What are the fees?", a: "Free for Members (you only pay the seat price). For Hosts, SplitPayNG deducts a 20% platform fee from monthly payouts to cover escrow, Paystack fees, and maintenance." },
  { q: "How does monthly billing work?", a: "We use the Paystack Subscription API. You're automatically billed monthly. Cancel anytime from your dashboard to stop the next billing cycle." },
  { q: "What is the difference between Public and Private pools?", a: "Public pools are listed on the marketplace. Private pools are hidden — the host gives you a direct link for instant access without public listing." },
]

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  useGSAP(() => {
    if (!ref.current) return
    gsap.from('.faq-hdr', {
      y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' },
    })
    gsap.from(ref.current.querySelectorAll('.faq-item'), {
      y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%' },
    })
  }, { scope: ref })

  return (
    <section ref={ref} className="py-24 px-6 lg:px-16" style={{ background: '#05080F', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="faq-hdr text-center mb-16">
          <p className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: '#D4AF37' }}>FAQ</p>
          <h2 className="font-black text-white mb-3" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>Questions? Answers.</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)' }}>Everything you need to know about SplitPayNG.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="faq-item rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{
                background: open === i ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.02)',
                border: open === i ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.05)',
              }}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center justify-between p-6 gap-4">
                <h3 className="font-bold text-white text-base">{faq.q}</h3>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: open === i ? '#D4AF37' : 'rgba(255,255,255,0.05)' }}
                >
                  {open === i
                    ? <Minus size={13} color="#05080F" />
                    : <Plus size={13} color="rgba(255,255,255,0.4)" />}
                </div>
              </div>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}