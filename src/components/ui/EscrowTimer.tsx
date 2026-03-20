'use client'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function EscrowTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const distance = expiry - now

      if (distance < 0) {
        clearInterval(interval)
        setIsExpired(true)
        setTimeLeft('Escrow Locked')
        return
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m remaining`)
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (isExpired) return <span className="text-xs font-bold text-gray-400">Escrow Concluded</span>

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-fintech-gold bg-fintech-gold/10 px-3 py-1.5 rounded-full animate-pulse">
      <Clock size={14} />
      {timeLeft}
    </div>
  )
}