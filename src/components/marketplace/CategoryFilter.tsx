'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Video', 'Music', 'Software', 'Gaming']

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'All'

  const handleFilter = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'All') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border",
            currentCategory === cat 
              ? "bg-fintech-navy text-white border-fintech-navy shadow-md" 
              : "bg-white text-fintech-navy/70 border-gray-200 hover:border-fintech-gold/50 hover:text-fintech-navy"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}