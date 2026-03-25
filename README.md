# 🛡️ SplitPayNG 

**Share premium subscriptions without the financial anxiety.**

SplitPayNG is a secure, automated fintech marketplace designed for the Nigerian market. It connects people looking to share the cost of premium digital subscriptions (like Netflix, Spotify, DSTV Stream, and AI Tools) while eliminating the risk of social media scams.

### ✨ The Problem We Solve
Account sharing is common, but it requires blind trust. Buyers get scammed by fake sellers, and legitimate account owners struggle to collect monthly payments from their sharers. 

### 🚀 Our Solution
SplitPayNG acts as a trustless middleman by combining **end-to-end credential encryption** with a **strict 48-hour Escrow system**.

### 🛠️ Key Features
* **48-Hour Escrow Protection (Paystack):** When a member joins a pool, their money is locked. The host only gets paid after the member verifies the login credentials work.
* **Military-Grade Security:** All passwords are encrypted on the client side using AES-256-GCM before reaching the database.
* **Automated Dispute Resolution:** A dedicated Admin Dashboard to manage disputes, contact hosts via WhatsApp, and process one-click refunds.
* **Automated Email Notifications:** Integrated with Resend API for instant alerts on refunds, payouts, and dispute updates.
* **Beautiful UI/UX:** Built with Next.js, Tailwind CSS, and smooth GSAP animations.

### 💻 Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, GSAP, Lucide Icons
* **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
* **Payments & Escrow:** Paystack Subscription & Transfers API
* **Emails:** Resend API