// src/app/global-error.tsx
'use client'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body className="flex h-screen items-center justify-center bg-[#0A0F1E] text-white">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#C9A84C]">System Exception</h2>
          <p className="text-gray-400">A secure runtime error occurred.</p>
          <Button onClick={() => reset()} variant="outline" className="border-gray-700 hover:bg-gray-800">
            Recover Session
          </Button>
        </div>
      </body>
    </html>
  )
}