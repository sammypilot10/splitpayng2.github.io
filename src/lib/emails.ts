// src/lib/emails.ts
import { Resend } from 'resend'

// Safe initialization (won't crash if env var is missing during local dev)
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key')

interface EmailPayload {
  to: string;
  subject: string;
  // 🔥 ADDED 'WELCOME_USER' to your list of allowed templates!
  template: 'MEMBER_JOINED' | 'PAYMENT_FAILED' | 'ACCESS_CONFIRMED' | 'DISPUTE_RAISED' | 'WELCOME_USER';
  data?: any; // Made optional just in case an email doesn't need extra data
}

export async function sendEmail({ to, subject, template, data }: EmailPayload) {
  let html = ''

  switch (template) {
    // 🔥 NEW: The Welcome Email for new users!
    case 'WELCOME_USER':
      html = `
        <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #C9A84C; margin-bottom: 10px;">Welcome to SplitPayNG! 🚀</h1>
          <p style="font-size: 16px; line-height: 1.5;">We are thrilled to have you on board.</p>
          <p style="font-size: 16px; line-height: 1.5;">With SplitPayNG, you can finally stop overpaying for subscriptions. Browse available pools to get premium access for a fraction of the cost, or become a Host and start earning real cash from your unused seats!</p>
          <div style="margin: 30px 0;">
            <a href="https://splitpay.ng" style="background-color: #0A0F1E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Explore Pools Now</a>
          </div>
          <p style="font-size: 14px; color: #666;">Cheers,<br>The SplitPayNG Team</p>
        </div>`
      break;

    // 🔥 NEW: Alert the Host when someone pays to join their pool!
    case 'MEMBER_JOINED':
      html = `
        <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Cha-Ching! New Member! 🎉</h2>
          <p style="font-size: 16px;">Great news! Someone just joined your <strong>${data?.poolName}</strong> pool.</p>
          <p style="font-size: 16px;">Their payment has been secured in Escrow. Once they test your vault credentials and confirm access, the funds will be released to your available balance.</p>
          <p style="font-size: 14px; color: #666;">Keep up the great work!</p>
        </div>`
      break;

    case 'PAYMENT_FAILED':
      html = `
        <div style="font-family: sans-serif; color: #0A0F1E;">
          <h2>Payment Action Required</h2>
          <p>We couldn't process your renewal for <strong>${data?.poolName}</strong>.</p>
          <p>Please update your payment method within 48 hours to avoid losing access.</p>
        </div>`
      break;

    case 'ACCESS_CONFIRMED':
      html = `
        <div style="font-family: sans-serif; color: #0A0F1E;">
          <h2>Welcome to the Pool!</h2>
          <p>Your escrow payment is locked. You can now view the credentials for <strong>${data?.poolName}</strong> on your dashboard.</p>
        </div>`
      break;

    case 'DISPUTE_RAISED':
      html = `
        <div style="font-family: sans-serif; color: #0A0F1E; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #E53E3E;">Action Required: Dispute Raised</h2>
          <p>A member in your <strong>${data?.poolName}</strong> pool reported that the credentials are not working.</p>
          <p>Your payout for this seat is currently locked in Escrow.</p>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Log into your SplitPayNG Host Dashboard.</li>
            <li>Click "Update Vault Credentials" to fix any typos or reset the password.</li>
          </ol>
          <p>If the member is lying, our Admin team will investigate and resolve this.</p>
        </div>`
      break;

    default:
      html = `<p>Notification from SplitPayNG.</p>`
  }

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'SplitPayNG <onboarding@resend.dev>',
        to,
        subject,
        html
      })
      console.log(`✅ Automated Email sent to ${to} (Template: ${template})`)
    } else {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject} | Template: ${template}`)
    }
  } catch (error) {
    console.error("Email delivery failed:", error)
  }
}