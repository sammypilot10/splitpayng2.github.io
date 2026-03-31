// src/lib/serviceConfig.ts
// ============================================================================
// SINGLE SOURCE OF TRUTH: Service Sharing Limits
// ============================================================================
// To update a limit (e.g., Netflix changes from 5 to 7 profiles), just change
// the ONE entry below. Every part of the app reads from this file.
//
// totalCapacity = the maximum number of people the service officially supports
//                 (including the account owner / host).
// shareableSeats = totalCapacity - 1 (the host keeps one seat for themselves).
//
// For individual-only plans (ChatGPT Plus, Claude Pro, etc.), we allow the
// host to share with up to 2 additional members as a platform policy.
// ============================================================================

export interface ServiceConfig {
  /** Official total user/profile/screen capacity (including the host) */
  totalCapacity: number
  /** Maximum seats the host can list for other people (totalCapacity - 1) */
  shareableSeats: number
  /** Short label shown in the UI explaining the limit */
  limitLabel: string
}

/**
 * Master dictionary of every known service and its sharing limits.
 * Keys MUST match the `name` values in PRESET_SERVICES exactly.
 */
const SERVICE_LIMITS: Record<string, ServiceConfig> = {
  // ── Video Streaming ────────────────────────────────────────────────
  'Netflix Premium': {
    totalCapacity: 5,
    shareableSeats: 4,
    limitLabel: '5 profiles (4 shareable)',
  },
  'Amazon Prime Video': {
    totalCapacity: 6,
    shareableSeats: 5,
    limitLabel: '6 profiles (5 shareable)',
  },
  'Showmax Pro': {
    totalCapacity: 5,
    shareableSeats: 4,
    limitLabel: '5 profiles (4 shareable)',
  },
  'DSTV Stream': {
    totalCapacity: 4,
    shareableSeats: 3,
    limitLabel: '4 devices (3 shareable)',
  },
  'YouTube Premium': {
    totalCapacity: 6,
    shareableSeats: 5,
    limitLabel: '6 family members (5 shareable)',
  },
  'Crunchyroll': {
    totalCapacity: 5,
    shareableSeats: 4,
    limitLabel: '5 profiles (4 shareable)',
  },
  'Disney+': {
    totalCapacity: 7,
    shareableSeats: 6,
    limitLabel: '7 profiles (6 shareable)',
  },

  // ── Music ──────────────────────────────────────────────────────────
  'Spotify Family': {
    totalCapacity: 6,
    shareableSeats: 5,
    limitLabel: '6 accounts (5 shareable)',
  },
  'Apple Music Family': {
    totalCapacity: 6,
    shareableSeats: 5,
    limitLabel: '6 family members (5 shareable)',
  },
  'Audiomack Premium': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },

  // ── AI Tools ───────────────────────────────────────────────────────
  'ChatGPT Plus': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },
  'Claude Pro': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },
  'Gemini Advanced': {
    totalCapacity: 6,
    shareableSeats: 5,
    limitLabel: '6 family members (5 shareable)',
  },
  'Perplexity Pro': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },
  'Midjourney': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },
  'GitHub Copilot': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },

  // ── Software ───────────────────────────────────────────────────────
  'Canva Pro': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },
  'Microsoft 365 Family': {
    totalCapacity: 6,
    shareableSeats: 5,
    limitLabel: '6 users (5 shareable)',
  },
  'Adobe Creative Cloud': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Individual plan (2 shareable)',
  },

  // ── Gaming ─────────────────────────────────────────────────────────
  'PlayStation Plus': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Console share (2 shareable)',
  },
  'Xbox Game Pass Ultimate': {
    totalCapacity: 3,
    shareableSeats: 2,
    limitLabel: 'Console share (2 shareable)',
  },
  'Nintendo Switch Online': {
    totalCapacity: 8,
    shareableSeats: 7,
    limitLabel: '8 family members (7 shareable)',
  },
}

// ── Default for unknown / custom services ────────────────────────────
const DEFAULT_CONFIG: ServiceConfig = {
  totalCapacity: 5,
  shareableSeats: 4,
  limitLabel: 'Default limit (4 shareable)',
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Returns the full config for a service, or the default for unknown services.
 */
export function getServiceConfig(serviceName: string): ServiceConfig {
  return SERVICE_LIMITS[serviceName] ?? DEFAULT_CONFIG
}

/**
 * Returns just the maximum number of seats a host can list for a given service.
 * This is the number used to cap the "max seats" input in the creation wizard.
 */
export function getMaxShareableSeats(serviceName: string): number {
  return getServiceConfig(serviceName).shareableSeats
}

/**
 * Returns the human-readable limit label for a service.
 */
export function getServiceLimitLabel(serviceName: string): string {
  return getServiceConfig(serviceName).limitLabel
}

/**
 * Validates that the requested seat count does not exceed the service's limit.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateSeatCount(serviceName: string, requestedSeats: number): string | null {
  const config = getServiceConfig(serviceName)
  if (requestedSeats < 1) {
    return 'You must offer at least 1 seat.'
  }
  if (requestedSeats > config.shareableSeats) {
    return `${serviceName} supports a maximum of ${config.shareableSeats} shareable seat${config.shareableSeats === 1 ? '' : 's'} (${config.totalCapacity} total including you). Please reduce your seat count.`
  }
  return null
}
