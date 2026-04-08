// src/lib/emails.ts
import { Resend } from 'resend'

// Safe initialization (won't crash if env var is missing during local dev)
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key')

interface EmailPayload {
  to: string;
  subject: string;
  template: 'MEMBER_JOINED' | 'PAYMENT_FAILED' | 'PAYMENT_FAILED_HOST' | 'ACCESS_CONFIRMED' | 'DISPUTE_RAISED' | 'WELCOME_USER' | 'UPCOMING_RENEWAL' | 'HOST_MEMBER_EVICTED';
  data?: any; // Made optional just in case an email doesn't need extra data
}

export async function sendEmail({ to, subject, template, data }: EmailPayload) {
  let html = ''

  switch (template) {
    // 🔥 NEW: The Welcome Email for new users!
    case 'WELCOME_USER':
      html = `
        <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #C9A84C; margin-bottom: 10px;">Welcome to SplitPayNG!</h1>
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
          <h2 style="color: #10B981;">New Member Joined!</h2>
          <p style="font-size: 16px;">Great news! Someone just joined your <strong>${data?.poolName}</strong> pool.</p>
          <p style="font-size: 16px;">Their payment has been secured in Escrow. Once they test your vault credentials and confirm access, the funds will be released to your available balance.</p>
          <p style="font-size: 14px; color: #666;">Keep up the great work!</p>
        </div>`
      break;

    case 'PAYMENT_FAILED':
      html = `
        <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E53E3E;">Payment Failed</h2>
          <p style="font-size: 16px;">We couldn't process your renewal for <strong>${data?.poolName}</strong>.</p>
          <p style="font-size: 16px;">You have a <strong>48-hour grace period</strong> to update your payment method before losing access.</p>
          <div style="margin: 24px 0;">
            <a href="https://splitpay.ng/dashboard/cards" style="background-color: #E53E3E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Update Card Now</a>
          </div>
          <p style="font-size: 14px; color: #666;">If you believe this is an error, please contact support.</p>
        </div>`
      break;

    // 🔥 NEW: Notify the Host when a member's payment fails
    case 'PAYMENT_FAILED_HOST':
      html = `
        <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">Member Payment Failed</h2>
          <p style="font-size: 16px;">A member's renewal payment for your <strong>${data?.poolName}</strong> pool has failed.</p>
          <p style="font-size: 16px;">Their seat is being held in a <strong>48-hour grace period</strong>. If they do not update their card within 48 hours, the seat will be automatically opened to the public.</p>
          <p style="font-size: 16px;">No action is needed from you right now. We'll keep you updated.</p>
          <p style="font-size: 14px; color: #666;">— The SplitPayNG Team</p>
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

    // 🔥 NEW: Upcoming renewal reminder (3 days before billing)
    case 'UPCOMING_RENEWAL':
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
        </div>`
      break;

    // 🔥 NEW: Urgent Notification to Host when a member is evicted
    case 'HOST_MEMBER_EVICTED':
      html = `
        <div style="font-family: Arial, sans-serif; color: #0A0F1E; padding: 30px; border: 1px solid #ff4444; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #fffafb;">
          <h2 style="color: #E53E3E;">Action Required: Evict Member</h2>
          <p style="font-size: 16px;">A member in your <strong>${data?.poolName}</strong> pool has failed to pay their subscription for 3 consecutive days. They have formally been kicked out of the pool.</p>
          <p style="font-size: 16px;"><strong>Member Email:</strong> ${data?.memberEmail}</p>
          <div style="background: #E53E3E; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; font-weight: bold;">
            CRITICAL: Please log into ${data?.poolName} and change your password immediately to revoke their access.
          </div>
          <p style="font-size: 16px;">After changing your password, remember to update it on the SplitPayNG Host Dashboard so your paying members can regain access.</p>
        </div>`
      break;

    default:
      html = `<p>Notification from SplitPayNG.</p>`
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const { error: resendError } = await resend.emails.send({
        from: 'SplitPayNG <onboarding@resend.dev>',
        to,
        subject,
        html
      })
      
      if (resendError) {
        throw new Error(`Resend Interface Error: ${resendError.message}`)
      }

      console.log(`✅ Automated Email sent to ${to} (Template: ${template})`)
    } else {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject} | Template: ${template}`)
    }
  } catch (error) {
    console.error("Email delivery failed:", error)
  }
}