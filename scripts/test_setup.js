const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTest() {
  const testEmail = 'sammypilot10@gmail.com';
  console.log(`Setting up test data for ${testEmail}...`);

  // 1. Find user by email (we'll look in profiles)
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', testEmail)
    .single();

  if (profileErr || !profile) {
    console.log("❌ Test user not found in 'profiles'. Did you sign up on the site with this email?");
    return;
  }
  
  console.log(`✅ Found user: ${profile.id}`);

  // 2. Find any active pool to attach to
  const { data: pool, error: poolErr } = await supabase
    .from('pools')
    .select('*')
    .limit(1)
    .single();

  if (poolErr || !pool) {
    console.log("❌ No pools found in database. Create a pool first.");
    return;
  }
  
  console.log(`✅ Found test pool: ${pool.service_name} (${pool.id})`);

  // 3. Delete any existing test membership for this user/pool to start fresh
  await supabase
    .from('pool_members')
    .delete()
    .eq('member_id', profile.id)
    .eq('pool_id', pool.id);

  // 4. Create a test membership that is due in EXACTLY 3 days (for cron test)
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
      escrow_status: 'released', // or pending
      escrow_expires_at: new Date().toISOString(),
      paystack_auth_code: 'AUTH_test123' 
    })
    .select()
    .single();

  if (memberErr) {
    console.error("❌ Failed to create pool_member:", memberErr);
    return;
  }

  console.log(`✅ Created test membership!`);
  console.log(`   Internal ID: ${member.id}`);
  console.log(`   Next Billing: ${threeDaysFromNow.toISOString()}`);
  console.log(`\nNow running the 3-day cron test...`);
}

setupTest().catch(console.error);
