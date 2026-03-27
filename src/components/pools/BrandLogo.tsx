'use client'

import { Tv } from 'lucide-react'
import { FaSpotify, FaAmazon, FaApple, FaYoutube } from 'react-icons/fa'

export function BrandLogo({ domain, name, size = 28 }: { domain?: string | null, name: string, size?: number }) {
  const normalized = name.toLowerCase()

  if (normalized.includes('spotify')) {
    return <FaSpotify size={size} color="#1DB954" className="drop-shadow-sm" />
  }
  
  if (normalized.includes('amazon') || normalized.includes('prime')) {
    return <FaAmazon size={size} color="#00A8E1" className="drop-shadow-sm" />
  }
  
  if (normalized.includes('apple')) {
    return <FaApple size={size} color="#FFFFFF" className="drop-shadow-sm" />
  }
  
  if (normalized.includes('youtube')) {
    return <FaYoutube size={size} color="#FF0000" className="drop-shadow-sm" />
  }
  
  if (normalized.includes('dstv')) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-[#00A1DF] to-[#005a8f] rounded shadow-sm leading-none border border-white/10"
        style={{ width: size * 1.5, height: size * 0.8, fontSize: size * 0.45 }}
      >
        <span className="text-white font-black tracking-tighter drop-shadow-md">DStv</span>
      </div>
    )
  }
  
  if (normalized.includes('netflix')) {
    return (
      <div 
        className="flex items-center justify-center leading-none"
        style={{ width: size, height: size, fontSize: size * 0.9 }}
      >
        <span className="text-[#E50914] font-black tracking-tighter drop-shadow-md" style={{ fontFamily: 'Arial, sans-serif' }}>N</span>
      </div>
    )
  }

  // Fallback for custom pools
  return <Tv size={size} className="text-gray-400" />
}
