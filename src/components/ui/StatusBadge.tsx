// src/components/ui/StatusBadge.tsx
import { cn } from '@/lib/utils'

export interface StatusBadgeProps {
  status: 'active' | 'full' | 'private' | 'public' | 'closed'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    active: 'bg-green-100 text-green-700 border-green-200',
    full: 'bg-red-100 text-red-700 border-red-200',
    private: 'bg-fintech-navy/10 text-fintech-navy border-fintech-navy/20',
    public: 'bg-fintech-gold/10 text-fintech-gold border-fintech-gold/20',
    closed: 'bg-gray-100 text-gray-500 border-gray-200'
  }

  const labels = {
    active: 'Seats Available',
    full: 'Pool Full',
    private: 'Private',
    public: 'Public',
    closed: 'Closed'
  }

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', styles[status], className)}>
      {labels[status]}
    </span>
  )
}