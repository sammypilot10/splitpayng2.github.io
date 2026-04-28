# SplitPayNG Pre-Launch Checklist

## Environment Variables (Verify in Vercel Dashboard)
- [ ] NEXT_PUBLIC_SUPABASE_URL — set to production Supabase project URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY — anon key (safe to be public)
- [ ] SUPABASE_SERVICE_ROLE_KEY — service role key (NEVER expose client-side)
- [ ] PAYSTACK_SECRET_KEY — starts with sk_live_ (NOT sk_test_)
- [ ] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY — starts with pk_live_
- [ ] RESEND_API_KEY — production Resend API key
- [ ] RESEND_FROM_EMAIL — noreply@splitpay.ng (after domain verified in Resend)
- [ ] CREDENTIALS_ENCRYPTION_KEY — 32-byte random hex string
- [ ] ENCRYPTION_KEY — same as CREDENTIALS_ENCRYPTION_KEY
- [ ] CRON_SECRET — random secure string for cron authentication
- [ ] NEXT_PUBLIC_SITE_URL — https://splitpay.ng

## Database (Verify in Supabase Dashboard > SQL Editor)
- [ ] Run migration 012_missing_tables.sql (payouts + audit_logs tables)
- [ ] Run migration 013_rls_complete.sql (RLS policies)
- [ ] Verify adjust_profile_balance RPC function exists
- [ ] Verify mark_transaction_successful RPC function exists
- [ ] Verify get_total_gmv RPC function exists
- [ ] Verify pool_members has paystack_auth_code column

## Paystack (Verify in Paystack Dashboard)
- [ ] Switch from Test to Live mode
- [ ] Webhook URL set to: https://splitpay.ng/api/webhook/paystack
- [ ] Webhook events enabled: charge.success, charge.failed, transfer.success
- [ ] Bank transfer feature enabled (contact Paystack support)
- [ ] Test a live transaction with a real card

## Resend (Verify in Resend Dashboard)
- [ ] Domain splitpay.ng added and verified
- [ ] DNS records (SPF, DKIM, DMARC) configured
- [ ] Test email sending to real address

## Vercel (Verify in Vercel Dashboard)
- [ ] Custom domain splitpay.ng configured and SSL active
- [ ] Cron jobs visible and scheduled correctly
- [ ] All environment variables set (not just locally)
- [ ] Deployment is on main branch with latest fixes

## Manual Testing Flow
- [ ] Sign up as a new Member → receive welcome email
- [ ] Add a payment card → ₦50 charge + refund
- [ ] Browse pools → join a pool → Paystack checkout opens
- [ ] Complete payment → verify membership created with paystack_auth_code
- [ ] View credentials in vault → credentials decrypt correctly
- [ ] Click "Confirm Access" → host balance increases by 80%
- [ ] Sign up as a Host → set bank details → create a pool
- [ ] See the pool on /browse → pool shows correct seat count
- [ ] Host withdraws balance → transfer initiated

## Admin Testing
- [ ] Log in as admin@splitpay.ng
- [ ] /admin/dashboard loads with GMV stats
- [ ] /admin/disputes shows any test disputes
- [ ] Issue a test refund → member gets money back
