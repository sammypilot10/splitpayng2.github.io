import { NextResponse } from 'next/server'

export async function GET() {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  return NextResponse.json({
    maintenance: maintenanceMode,
    message: maintenanceMode 
      ? 'SplitPayNG is temporarily under maintenance. We will be back shortly.' 
      : 'All systems operational',
    timestamp: new Date().toISOString()
  })
}
