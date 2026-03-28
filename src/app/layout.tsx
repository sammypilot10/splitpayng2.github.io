// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AlertTriangle } from 'lucide-react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SplitPayNG | Secure Subscription Sharing',
  description: 'Join private and public subscription pools securely with 48-hour escrow protection.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} flex flex-col min-h-screen bg-fintech-slate`}>
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Global Footer containing our mandatory compliance disclaimer */}
        <footer className="bg-fintech-navy text-fintech-slate py-10 border-t border-white/10 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
            {/* Prominent Legal Disclaimer (Non-Negotiable) */}
            <div className="inline-flex items-center gap-2 bg-fintech-gold/10 border border-fintech-gold/30 text-fintech-gold text-xs py-3 px-6 rounded-xl font-medium mb-6 max-w-2xl text-left sm:text-center leading-relaxed">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>
                <strong>Disclaimer:</strong> Account sharing may violate service provider terms — use at your own risk. SplitPayNG acts solely as an escrow and sharing facilitator.
              </span>
            </div>
            
            <p className="text-sm text-fintech-slate/50">
              © {new Date().getFullYear()} SplitPayNG. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}