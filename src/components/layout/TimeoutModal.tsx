// src/components/layout/TimeoutModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function TimeoutModal() {
  const [showWarning, setShowWarning] = useState(false)
  const supabase = createClient()
  
  const TIMEOUT_MS = 15 * 60 * 1000 // 15 mins
  const WARNING_MS = 2 * 60 * 1000 // 2 mins before timeout

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let warningId: NodeJS.Timeout

    const resetTimers = () => {
      clearTimeout(timeoutId)
      clearTimeout(warningId)
      setShowWarning(false)

      warningId = setTimeout(() => setShowWarning(true), TIMEOUT_MS - WARNING_MS)
      timeoutId = setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/auth?timeout=true'
      }, TIMEOUT_MS)
    }

    // Listen for activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimers))
    resetTimers()

    return () => events.forEach(e => window.removeEventListener(e, resetTimers))
  }, [supabase])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl max-w-sm text-center shadow-2xl">
        <h3 className="text-xl font-bold text-[#0A0F1E] mb-2">Are you still there?</h3>
        <p className="text-gray-500 mb-6">For your security, your session will expire in 2 minutes due to inactivity.</p>
        <Button onClick={() => setShowWarning(false)} className="w-full">
          Keep me signed in
        </Button>
      </div>
    </div>
  )
}