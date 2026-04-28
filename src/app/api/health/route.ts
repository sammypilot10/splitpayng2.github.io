import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {
      database: 'unknown',
      env_vars: 'unknown'
    }
  }

  // Check database connectivity
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabase.from('profiles').select('id').limit(1)
    checks.services.database = error ? 'error' : 'ok'
  } catch {
    checks.services.database = 'error'
    checks.status = 'degraded'
  }

  // Check required env vars
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'PAYSTACK_SECRET_KEY',
    'RESEND_API_KEY',
    'CRON_SECRET',
    'ENCRYPTION_KEY'
  ]
  const missingVars = requiredEnvVars.filter(v => !process.env[v])
  checks.services.env_vars = missingVars.length === 0 ? 'ok' : `missing: ${missingVars.join(', ')}`

  if (missingVars.length > 0) checks.status = 'degraded'

  return NextResponse.json(checks, { 
    status: checks.status === 'ok' ? 200 : 503 
  })
}
