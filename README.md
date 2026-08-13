# St Loot

St Loot is a web-first mystery box marketplace where every opening awards a guaranteed physical prize and 100% of net proceeds are designated for charity. The initial catalog focuses on fragrance through a planned perfume-company partnership.

The current release is a pre-launch foundation: product discovery, box previews, waitlist capture, transparent impact messaging, and the initial Supabase data model. It does not accept payments or support cash withdrawals.

## Local development

1. Copy `.env.example` to `.env.local` and add the Supabase publishable/anonymous key.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The interface runs in preview mode when Supabase credentials are absent. Waitlist submissions are stored after the environment variables and database migration are configured.

## Deployment

Railway can deploy this repository directly. The included `railway.json` builds the Vite app and serves the production bundle. Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` before the first production build.

The intended MVP address is `https://stloot.cofounderplus.com`.

## MVP guardrails

- Every box opening must resolve to a real prize.
- No wagering, cash-equivalent prizes, withdrawals, or loot battles.
- Payments stay disabled until product, fulfillment, accounting, and legal reviews are complete.
- Charity proceeds are calculated from the append-only impact ledger, not from marketing estimates.
- St. Jude Children's Research Hospital is a placeholder beneficiary and is not presented as a formal partner.

