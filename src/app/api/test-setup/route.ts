import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const testEmail = 'sammypilot10@gmail.com';
    
    // 1. Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (!profile) return NextResponse.json({ error: `User ${testEmail} not found` }, { status: 404 });
    
    // 2. Find any active pool
    const { data: pool } = await supabase
      .from('pools')
      .select('*')
      .limit(1)
      .single();

    if (!pool) return NextResponse.json({ error: 'No pools found' }, { status: 404 });

    // 3. Clear old test data
    await supabase.from('pool_members').delete().eq('member_id', profile.id).eq('pool_id', pool.id);

    // 4. Create membership due in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(12, 0, 0, 0);

    const { data: member, error: memberErr } = await supabase
      .from('pool_members')
      .insert({
        pool_id: pool.id,
        member_id: profile.id,
        status: 'active',
        retry_count: 0,
        next_billing_date: threeDaysFromNow.toISOString(),
        escrow_status: 'released',
        escrow_expires_at: new Date().toISOString(),
        paystack_auth_code: 'AUTH_test123'
      })
      .select()
      .single();

    if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });

    return NextResponse.json({ 
      success: true, 
      user: profile.id, 
      pool: pool.service_name, 
      next_billing_date: threeDaysFromNow.toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
