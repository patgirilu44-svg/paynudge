# PAYNUDGE — CLAUDE PROJECT CONTEXT

## What is PayNudge
US-market payment recovery SaaS for freelancers.
Helps send Friendly/Firm/Final payment reminder messages via Email, SMS, or copy-paste.

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Supabase (auth + database)
- Groq API (AI generation — Llama 3.3 70B) — FREE tier
- Resend (email sending) — FREE tier
- Twilio (SMS sending) — paid, cheap
- Tailwind CSS + Radix UI (high quality UI)
- Vercel (deployment)

## AI Strategy
- ALL AI calls → Groq only (fast + free)
- Groq handles: message draft, tone, email subject line
- NO Claude API (cost reasons)
- Cache results, debounce tab switches — no unnecessary calls

## Features (this build)
1. Auth — login / signup (Supabase Auth)
2. Client management — add/edit clients (name, email, phone, company)
3. Invoice tracking — amount, due date, status, description
4. Nudge generator — Friendly / Firm / Final tone × Email / SMS / Copy
5. Email output — via Resend
6. SMS output — via Twilio

## Database Schema (Supabase)
### clients
- id (uuid, pk)
- user_id (uuid, fk → auth.users)
- name (text)
- email (text)
- phone (text)
- company (text)
- created_at (timestamp)

### invoices
- id (uuid, pk)
- user_id (uuid, fk → auth.users)
- client_id (uuid, fk → clients)
- amount (numeric)
- currency (text, default 'USD')
- due_date (date)
- status (text: pending/overdue/paid)
- description (text)
- created_at (timestamp)

### nudges
- id (uuid, pk)
- user_id (uuid, fk → auth.users)
- invoice_id (uuid, fk → invoices)
- tone (text: friendly/firm/final)
- channel (text: email/sms/copy)
- content (text)
- subject (text, nullable — email only)
- created_at (timestamp)

## Groq Flow
User selects invoice + tone + channel
→ Groq generates draft
→ Frontend displays (with char count for SMS)
→ User sends or copies
→ Supabase saves nudge record

## Dev Rules (Termux)
- Start server: npm run dev -- --webpack --hostname 0.0.0.0
- Write files: heredoc (cat > file << 'EOF')
- Prefer complete file rewrites over sed patches
- One file at a time — validate before next
- git push --force if rebase aborts

## File Structure
paynudge/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── clients/page.tsx
│   │   ├── invoices/page.tsx
│   │   └── nudge/[invoiceId]/page.tsx
│   ├── api/
│   │   ├── nudge/route.ts
│   │   ├── send-email/route.ts
│   │   └── send-sms/route.ts
│   └── layout.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   └── groq.ts
├── components/
│   ├── ui/ (buttons, inputs, cards)
│   └── dashboard/ (sidebar, nav)
├── .env.local
└── CLAUDE_CONTEXT.md

## Domain
paynudge.com

## Current Build Status
- [x] Next.js project created
- [x] Supabase, Groq, Resend, Twilio, Radix UI installed
- [ ] Supabase project created online
- [ ] .env.local configured
- [ ] DB tables created
- [ ] Auth working
- [ ] UI built
