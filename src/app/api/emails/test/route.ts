// src/app/api/emails/test/route.ts
// Temporary test endpoint — DELETE before deploying to production
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emails'

export async function POST(req: Request) {
  try {
    const { to, template, data } = await req.json()
    
    if (!to || !template) {
      return NextResponse.json({ error: 'Missing "to" or "template"' }, { status: 400 })
    }

    await sendEmail({ 
      to, 
      subject: `[TEST] SplitPayNG — ${template}`, 
      template, 
      data: data || { poolName: 'Netflix Premium', billingDate: 'April 3, 2026', amount: 2500, memberEmail: 'deadbeat@test.com' }
    })

    return NextResponse.json({ sent: true, to, template })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
