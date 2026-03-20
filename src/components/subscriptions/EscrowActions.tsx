// src/components/subscriptions/EscrowActions.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react'
import { confirmAccess, disputeAccess } from '@/lib/escrow'

interface EscrowActionsProps {
  membershipId: string;
  onUpdate: () => void;
}

export function EscrowActions({ membershipId, onUpdate }: EscrowActionsProps) {
  const [loading, setLoading] = useState<'confirm' | 'dispute' | null>(null)

  const handleConfirm = async () => {
    setLoading('confirm')
    try {
      await confirmAccess(membershipId)
      onUpdate() // Trigger UI refresh
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDispute = async () => {
    if (!window.confirm("Are you sure you want to raise a dispute? Your access will be suspended while we investigate.")) return;
    
    setLoading('dispute')
    try {
      await disputeAccess(membershipId)
      onUpdate()
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-3 mt-4">
      <Button 
        onClick={handleConfirm} 
        disabled={loading !== null}
        className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white"
      >
        {loading === 'confirm' ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} className="mr-2"/> Confirm Access</>}
      </Button>
      <Button 
        variant="ghost" 
        onClick={handleDispute} 
        disabled={loading !== null}
        className="w-1/2 text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-100"
      >
        {loading === 'dispute' ? <Loader2 className="animate-spin" size={16} /> : <><ShieldAlert size={16} className="mr-2"/> Dispute</>}
      </Button>
    </div>
  )
}