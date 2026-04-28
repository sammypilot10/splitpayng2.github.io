'use client'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-6">
      <div className="bg-white/5 border border-red-500/20 rounded-3xl p-12 text-center max-w-md w-full">
        <AlertTriangle size={48} className="mx-auto text-red-400 mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-white/50 text-sm mb-6">
          We encountered an unexpected error. Your funds and data are safe.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={reset} 
            className="flex-1 bg-fintech-gold text-[#05080F] font-bold"
          >
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1 border-white/20 text-white"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
