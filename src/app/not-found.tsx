// src/app/not-found.tsx
import Link from 'next/link'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-fintech-slate flex flex-col items-center">
      <AppNavbar userRole="member" />
      <main className="flex-grow flex flex-col items-center justify-center -mt-20">
        <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10 max-w-lg w-full">
          <AlertTriangle size={64} className="mx-auto text-fintech-gold mb-6" />
          <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          <h2 className="text-xl font-medium text-white/80 mb-4">Vault Not Found</h2>
          <p className="text-white/50 mb-8">
            The page or subscription pool you are looking for does not exist, has been removed, or you don't have permission to access it.
          </p>
          <Link href="/browse" className="w-full mb-3">
            <Button className="bg-fintech-gold text-[#05080F] font-bold hover:bg-fintech-gold/90 w-full mb-3">
              Browse Active Pools
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="border-gray-700 text-white hover:bg-white/5 w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
