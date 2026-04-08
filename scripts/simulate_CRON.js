require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const TEST_EMAIL = 'sammypilot10@gmail.com';

async function sendTestEmail(template, data) {
  let html = '';
  let subject = '';
  
  if (template === 'UPCOMING_RENEWAL') {
    subject = `Reminder: Your ${data.poolName} subscription renews in 3 days`;
    html = `
      <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C9A84C;">Upcoming Subscription Renewal</h2>
        <p style="font-size: 16px;">Your <strong>${data?.poolName}</strong> subscription will be auto-renewed in <strong>3 days</strong> on <strong>${data?.billingDate}</strong>.</p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>Amount:</strong> ₦${data?.amount?.toLocaleString()}</p>
        </div>
        <p style="font-size: 16px;">Make sure your card is up to date to avoid service interruption.</p>
        <div style="margin: 24px 0;">
          <a href="https://splitpay.ng/dashboard/cards" style="background-color: #0A0F1E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Manage Card</a>
        </div>
        <p style="font-size: 14px; color: #666;">Cheers,<br>The SplitPayNG Team</p>
      </div>`;
  } else if (template === 'HOST_MEMBER_EVICTED') {
    subject = `Action Required: Evict Member from ${data.poolName}`;
    html = `
      <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #ff4444; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #fffafb;">
        <h2 style="color: #E53E3E;">Action Required: Evict Member</h2>
        <p style="font-size: 16px;">A member in your <strong>${data?.poolName}</strong> pool has failed to pay their subscription for 3 consecutive days. They have formally been kicked out of the pool.</p>
        <p style="font-size: 16px;"><strong>Member Email:</strong> ${data?.memberEmail}</p>
        <div style="background: #E53E3E; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; font-weight: bold;">
          CRITICAL: Please log into ${data?.poolName} and change your password immediately to revoke their access.
        </div>
        <p style="font-size: 16px;">After changing your password, remember to update it on the SplitPayNG Host Dashboard so your paying members can regain access.</p>
      </div>`;
  }

  try {
    const response = await resend.emails.send({
      from: 'SplitPayNG <onboarding@resend.dev>',
      to: TEST_EMAIL,
      subject,
      html
    });
    
    if (response.error) {
      console.error(`❌ Email failed for template ${template}:`, response.error);
    } else {
      console.log(`✅ Email Sent successfully: ${template}`);
    }
  } catch (err) {
    console.error(`❌ Fetch failed for Resend:`, err.message);
  }
}

async function runTests() {
  console.log("🚀 Starting E2E Billing Email Simulation for", TEST_EMAIL);
  
  console.log(`\n▶️ Testing 3-Day Renewal Reminder...`);
  await sendTestEmail('UPCOMING_RENEWAL', {
    poolName: "Netflix Premium",
    billingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    amount: 2500
  });

  console.log(`\n▶️ Testing Member Eviction (Host Password Change Reminder)...`);
  await sendTestEmail('HOST_MEMBER_EVICTED', {
    poolName: "Netflix Premium", 
    memberEmail: 'failed_member@example.com'
  });
  
  console.log(`\n🎉 Tests completed! Please check your inbox at ${TEST_EMAIL}.`);
}

runTests().catch(console.error);
