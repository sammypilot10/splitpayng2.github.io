'use client'

import { useState } from 'react'

// ============================================================
//  OFFICIAL BRAND LOGO CONFIG — Single Source of Truth
//  Uses SimpleIcons CDN (official trademarked SVG paths)
//  and Clearbit for brands not on SimpleIcons
// ============================================================

interface BrandConfig {
  slug: string
  color: string
  source: 'simpleicons' | 'clearbit'
  customUrl?: string
}

const BRAND_CONFIG: Record<string, BrandConfig> = {
  // Global streaming
  netflix:   { slug: 'netflix',     color: 'E50914', source: 'simpleicons' },
  spotify:   { slug: 'spotify',     color: '1DB954', source: 'simpleicons' },
  youtube:   { slug: 'youtube',     color: 'FF0000', source: 'simpleicons' },
  apple:     { slug: 'appletv',     color: 'FFFFFF', source: 'simpleicons' },
  prime:     { slug: 'primevideo',  color: '1A98FF', source: 'simpleicons' },
  amazon:    { slug: 'primevideo',  color: '1A98FF', source: 'simpleicons' },
  hulu:      { slug: 'hulu',        color: '1CE783', source: 'simpleicons' },
  disney:    { slug: 'disneyplus',  color: '113CCF', source: 'simpleicons' },

  // Productivity
  canva:     { slug: 'canva',       color: '00C4CC', source: 'simpleicons' },
  capcut:    { slug: 'capcut',      color: 'FFFFFF', source: 'simpleicons' },

  // Nigerian / African
  dstv:      { slug: '',            color: '0098DB', source: 'clearbit', customUrl: 'https://logo.clearbit.com/dstv.com' },
  showmax:   { slug: '',            color: 'FFFFFF', source: 'clearbit', customUrl: 'https://logo.clearbit.com/showmax.com' },
}

// Build the logo URL from the config
function getLogoUrl(config: BrandConfig): string {
  if (config.source === 'clearbit' && config.customUrl) {
    return config.customUrl
  }
  return `https://cdn.simpleicons.org/${config.slug}/${config.color}`
}

// Map service names to brand colors for the fallback circle
const getBrandColor = (name: string): string => {
  const n = name.toLowerCase()
  if (n.includes('netflix')) return '#E50914'
  if (n.includes('spotify')) return '#1DB954'
  if (n.includes('apple'))   return '#A2AAAD'
  if (n.includes('youtube')) return '#FF0000'
  if (n.includes('prime') || n.includes('amazon')) return '#1A98FF'
  if (n.includes('canva'))   return '#00C4CC'
  if (n.includes('dstv'))    return '#0098DB'
  if (n.includes('disney'))  return '#113CCF'
  if (n.includes('hulu'))    return '#1CE783'
  if (n.includes('showmax')) return '#FFFFFF'
  if (n.includes('capcut'))  return '#FFFFFF'
  return '#D4AF37' // Default fintech-gold
}

// Find the matching brand config for a service name
function findBrandConfig(serviceName: string): BrandConfig | null {
  const normalized = serviceName.toLowerCase()
  for (const [key, config] of Object.entries(BRAND_CONFIG)) {
    if (normalized.includes(key)) {
      return config
    }
  }
  return null
}

// ============================================================
//  EXPORTED COMPONENT
// ============================================================

export function BrandLogo({ name, size = 28 }: { name: string; size?: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const config = findBrandConfig(name)

  // 🔥 If we found a brand config and the image hasn't errored, render the official logo
  if (config && !imgFailed) {
    const logoUrl = getLogoUrl(config)

    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="object-contain drop-shadow-sm"
        style={{ width: size, height: size }}
        onError={() => setImgFailed(true)}
        loading="lazy"
      />
    )
  }

  // 🔥 BULLETPROOF FALLBACK: First letter in a brand-colored circle
  const fallbackLetter = name.trim().charAt(0).toUpperCase()
  const brandColor = getBrandColor(name)

  return (
    <div
      className="flex items-center justify-center rounded-lg font-black select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: `${brandColor}22`,
        border: `1.5px solid ${brandColor}44`,
        color: brandColor,
        fontSize: size * 0.5,
        lineHeight: 1,
      }}
    >
      {fallbackLetter}
    </div>
  )
}
