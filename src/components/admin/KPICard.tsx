// src/components/admin/KPICard.tsx
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function KPICard({ 
  title, value, trend, trendUp, icon: Icon, 
  iconColor = "text-[#C9A84C]", iconBg = "bg-[#C9A84C]/10" 
}: KPICardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>
        <span className={`text-sm font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-extrabold text-[#0A0F1E]">{value}</p>
      </div>
    </div>
  )
}