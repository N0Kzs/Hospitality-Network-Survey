# Phase 4 and 5 guide: database (Neon) and confirmation emails

Written 6 Oct 2026 for the YFC-BonEagle / Lightera Hospitality Network Survey. This file is meant to be used on its own, without a chat assistant. It contains the decisions to make, every setup click, the code, prompts to give Antigravity, checklists, and troubleshooting.

Prices and limits below were checked in September 2026 and **will change**. Re-check the pricing pages before you rely on a number.

---

## 0. Before you start

### 0.1 What must already be true

- [ ] Phase 1 survey works (fill it in, branching works).
- [ ] Phase 3 admin works on mock data.
- [ ] **Phase 2 login is finished and tested.** Do not store real respondents' names and emails until `/admin` and `/api/admin/export` are protected.
- [ ] The project is committed to git, and `.env*.local` is listed in `.gitignore`.

### 0.2 Decisions to make first (write the answers here)

| # | Decision | Recommendation | Your answer |
|---|---|---|---|
| 1 | Which account owns the database? | A **company** account (company email), not a personal one. The data belongs to the company, and a personal account is a risk if you leave. | |
| 2 | Neon region | The AWS region closest to your users and to where the website is hosted. For the Philippines, Singapore (Asia Pacific) is normally the closest option. **The region cannot be changed later.** | |
| 3 | Where will the website be hosted? | Vercel is the simplest for Next.js. Ask IT if the company requires its own hosting. | |
| 4 | Email provider (Phase 5) | Resend, if IT can add DNS records for a company domain. See section 7. | |
| 5 | Sending domain / address | e.g. `survey@mail.<company-domain>` (a subdomain keeps survey email separate from staff email). Needs IT for DNS. | |
| 6 | Who receives "hot lead" alerts? | Sales email address(es). | |
| 7 | Who is the Data Protection Officer / privacy contact? | Ask the company. See section 9. | |
| 8 | Reply-to mailbox | A real mailbox someone reads, e.g. `sales@...`. | |

### 0.3 Rough costs

- **Neon Free plan:** no credit card; about 0.5 GB storage per project, a monthly compute allowance, and compute that goes to sleep after about 5 minutes of no use (the first request after sleeping is slower by around a second). Free has only a **short backup/history window (about 6 hours)**, so keep your own exports (section 6.4) or move to the paid Launch plan (pay for what you use, no monthly minimum) once real data is in.
- **Storage need:** one response is a few kilobytes, so 0.5 GB holds on the order of 100,000 responses. Storage is not your concern.
- **Resend Free plan:** about 3,000 emails per month, **max 100 per day**, one custom domain (recently raised to up to three). Pro is about $20/month for 50,000. A trade-show day with more than 100 completions would hit the daily cap, which is why the design in section 8 never blocks a submission on email.

---

# PHASE 4: Database (Neon + PostgreSQL)

## 1. Concepts (5-minute version)

- **Neon** hosts a PostgreSQL database for you. You get a **connection string** (a URL that includes a password). Anyone with it can read and write your data, so it lives only in `.env.local` and in the hosting dashboard's environment variables. Never commit it, never paste it into chat, never put `NEXT_PUBLIC_` in front of its name.
- A **project** is your database server. It has **branches** (copies of the database). Use the `main` branch for real data and make a separate `dev` branch for testing, so test submissions never mix with real ones.
- We use **one table** `survey_responses`. The 43 answers are stored together in one `jsonb` column (`answers`), plus a few important fields as normal columns so the admin can search and filter quickly. No ORM is needed for one table.

## 2. Neon setup (I will manually do this, about 10 minutes)

1. Go to **neon.com** and sign up with your **company email**. (You can use "Continue with Google/GitHub" only if that is a company account.)
2. **Create project**
   - Name: `lightera-survey`
   - Postgres version: the default
   - Region: your decision from 0.2 (#2)
   - Database name: leave `neondb`
3. In the project dashboard click **Connect**. Pick the **main** branch, the default database and role, and copy the **connection string**. It looks like `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`. A host containing `-pooler` is the pooled connection; that is fine for this app.
4. Create a **dev** branch: **Branches → Create branch**, name `dev`, parent `main`. Copy its connection string too.
5. In the project root create `.env.local` (if you do not have one from Phase 2) and add:

   ```
   DATABASE_URL="postgresql://...your DEV branch string..."
   ```

   Use the **dev** string on your computer. The **main** string goes only into the hosting dashboard when you go live.
6. Restart `pnpm dev` after any change to `.env.local` (environment files are read at start-up).

## 3. Create the table

Create `db/schema.sql` in the project (so it is tracked in git):

```sql
-- Hospitality Network Survey: one row per completed survey
create table if not exists survey_responses (
  id               uuid primary key default gen_random_uuid(),
  submitted_at     timestamptz not null default now(),

  -- Fields promoted from the answers for fast search/filter in the admin
  company          text not null,   -- q1
  respondent_name  text not null,   -- q2
  job_title        text not null,   -- q3
  email            text not null,   -- q4
  org_role         text,            -- q5
  investment_plan  text,            -- q13
  pol_interest     text,            -- q26
  follow_up        text,            -- q41

  -- Everything the respondent answered (keys q1..q43, plus qN__other)
  answers          jsonb not null,

  -- Phase 5: confirmation email tracking
  email_status     text not null default 'pending',  -- pending | sent | failed | skipped
  email_sent_at    timestamptz,
  email_error      text,
  email_message_id text
);

create index if not exists survey_responses_submitted_idx   on survey_responses (submitted_at desc);
create index if not exists survey_responses_investment_idx  on survey_responses (investment_plan);
create index if not exists survey_responses_follow_up_idx   on survey_responses (follow_up);
```

The email columns are included now so Phase 5 needs no database change.

**Apply it:** Neon dashboard → **SQL Editor** → make sure the **dev** branch is selected → paste the whole file → **Run**. Then run `select count(*) from survey_responses;` and expect `0`. Later repeat on the `main` branch before launch.

## 4. Code

### 4.1 Install

```
pnpm add @neondatabase/serverless server-only
```

(`server-only` makes the build fail if client code ever imports the database file.)

### 4.2 `lib/db.ts`

```ts
import 'server-only'
import { neon } from '@neondatabase/serverless'

let client: ReturnType<typeof neon> | null = null

/** Returns the shared Neon SQL client. Fails loudly if DATABASE_URL is missing. */
export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set. Add it to .env.local (and to the hosting environment variables).')
    client = neon(url)
  }
  return client
}

// Usage: const rows = await sql().query('select * from survey_responses where id = $1', [id])
```

### 4.3 Clean the incoming answers: `lib/survey/sanitize.ts` (new file)

Never trust the browser. This keeps only known questions with valid options and sensible lengths, then drops answers for questions the respondent could not have seen.

```ts
import { sections } from './questions'
import { visibleAnswers } from './flow'
import type { Answers } from './types'

export function sanitizeAnswers(input: unknown): Answers {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const out: Answers = {}

  for (const section of sections) {
    for (const q of section.questions) {
      const v = raw[q.id]

      if (typeof v === 'string' && (q.type === 'text' || q.type === 'email' || q.type === 'textarea' || q.type === 'single')) {
        const t = v.trim().slice(0, q.type === 'textarea' ? 4000 : 300)
        if (!t) continue
        if (q.type === 'single' && !q.options?.includes(t)) continue
        out[q.id] = t
      } else if (Array.isArray(v) && q.type === 'multi') {
        const picked = [...new Set(v.filter((x): x is string => typeof x === 'string' && !!q.options?.includes(x)))]
        const limited = q.max ? picked.slice(0, q.max) : picked
        if (limited.length) out[q.id] = limited
      }

      const other = raw[`${q.id}__other`]
      if (typeof other === 'string' && other.trim() && q.options?.includes('Other')) {
        const chosen = out[q.id]
        const list = Array.isArray(chosen) ? chosen : chosen ? [chosen] : []
        if (list.includes('Other')) out[`${q.id}__other`] = other.trim().slice(0, 300)
      }
    }
  }
  return visibleAnswers(out)
}
```

### 4.4 Save submissions: replace `app/api/survey/route.ts`

```ts
import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sanitizeAnswers } from '@/lib/survey/sanitize'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REQUIRED = ['q1', 'q2', 'q3', 'q4', 'q13', 'q37']
const MAX_BODY_BYTES = 100_000

export async function POST(request: Request) {
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Too large.' }, { status: 413 })

  let body: unknown
  try { body = JSON.parse(text) } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }

  const answers = sanitizeAnswers((body as { answers?: unknown })?.answers)

  const missing = REQUIRED.filter((id) => !answers[id])
  if (missing.length) return NextResponse.json({ error: 'Missing required answers.', missing }, { status: 422 })
  const email = String(answers.q4)
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Invalid email address.' }, { status: 422 })

  const one = (id: string) => (typeof answers[id] === 'string' ? (answers[id] as string) : null)

  try {
    const rows = await sql().query(
      `insert into survey_responses
         (company, respondent_name, job_title, email, org_role, investment_plan, pol_interest, follow_up, answers)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       returning id`,
      [answers.q1, answers.q2, answers.q3, email, one('q5'), one('q13'), one('q26'), one('q41'), JSON.stringify(answers)],
    )
    const id = (rows[0] as { id: string }).id

    // PHASE 5: send the confirmation email here (after the row is saved). See section 8.

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    console.error('[survey] insert failed', err)
    return NextResponse.json({ error: 'Could not save your response.' }, { status: 500 })
  }
}
```

Notes: the server sets the submission time itself (the browser's `submittedAt` is ignored); the user sees a generic error and the real error is only in the server log.

### 4.5 Swap the admin data layer: `lib/admin/data.ts`

Keep **every function name and signature exactly as they are**; only the inside changes from mock data to SQL. That is why the admin pages do not change.

Map between rows and the `SurveyResponse` type:

```ts
function rowToResponse(r: Record<string, unknown>): SurveyResponse {
  return {
    id: String(r.id),
    submittedAt: new Date(r.submitted_at as string | Date).toISOString(),
    answers: r.answers as Answers,
  }
}
```

Build the filter clause with **parameters** (never paste user text into the SQL string):

```ts
function buildWhere(f: ResponseFilters) {
  const clauses: string[] = []
  const params: unknown[] = []
  const p = (v: unknown) => { params.push(v); return `$${params.length}` }

  if (f.search?.trim()) {
    const like = `%${f.search.trim().replace(/[\\%_]/g, '\\$&')}%`
    const n = p(like)
    clauses.push(`(company ilike ${n} or respondent_name ilike ${n} or email ilike ${n})`)
  }
  if (f.q13) {
    if (f.q13 === 'active') {
      const list = ACTIVE_PLANS.map((v) => p(v)).join(',')   // the 3 "active investment" answers from lib/admin/leads.ts
      clauses.push(`investment_plan in (${list})`)
    } else clauses.push(`investment_plan = ${p(f.q13)}`)
  }
  if (f.q26) clauses.push(`pol_interest = ${p(f.q26)}`)
  if (f.q41) clauses.push(`follow_up = ${p(f.q41)}`)
  if (f.q5)  clauses.push(`org_role = ${p(f.q5)}`)
  if (f.from) clauses.push(`submitted_at >= ${p(f.from)}::date`)
  if (f.to)   clauses.push(`submitted_at < (${p(f.to)}::date + 1)`)

  return { where: clauses.length ? `where ${clauses.join(' and ')}` : '', params }
}
```

List with paging, total, single response and counting:

```ts
// listResponses
const { where, params } = buildWhere(filters)
const pageSize = filters.pageSize ?? 20
const offset = ((filters.page ?? 1) - 1) * pageSize
const rows = await sql().query(
  `select id, submitted_at, answers from survey_responses ${where}
   order by submitted_at desc limit ${pageSize} offset ${offset}`, params)       // pageSize/offset are numbers computed above, not user text
const total = Number((await sql().query(`select count(*) as n from survey_responses ${where}`, params))[0].n)

// getResponse(id): reject anything that is not a UUID first, or Postgres throws
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null
const rows = await sql().query('select id, submitted_at, answers from survey_responses where id = $1', [id])

// countBy(questionId): works for single and multi questions. Pass the id only after
// checking it exists in lib/survey/questions.ts. Then merge with that question's option
// order in JS so zero counts still appear.
const rows = await sql().query(
  `select label, count(*)::int as count from (
     select jsonb_array_elements_text(
              case when jsonb_typeof(answers -> $1::text) = 'array' then answers -> $1::text else '[]'::jsonb end) as label
       from survey_responses ${whereWithShiftedParams}
     union all
     select answers ->> $1::text as label from survey_responses
      where jsonb_typeof(answers -> $1::text) = 'string' ${andWhereWithShiftedParams}
   ) t group by label`, [questionId, ...params])
```

(Antigravity can complete `getStats` and the shifted-parameter detail; the prompt in 4.7 asks for it.)

Finally delete `lib/admin/mock.ts` or move it to `scripts/` for seeding the dev branch only (see 4.6). **No file under `app/` may import it.**

### 4.6 Optional: load the mock data into the dev branch

Useful to test the admin screens against the real database. Write a script `scripts/seed-dev.mjs` that reads `DATABASE_URL`, **refuses to run if the URL host does not match the dev branch** (a safety check you configure, e.g. `SEED_ALLOWED_HOST`), and inserts the mock respondents. **Never seed the `main` branch.**

### 4.7 Prompt to give Antigravity for Phase 4

> Read `docs/PHASE-4-5-GUIDE.md` sections 1 to 6. Implement Phase 4 only (not Phase 5). Do not change `components/survey/` or the admin page components. Steps, stopping to report after each: (1) add `db/schema.sql`, `lib/db.ts`, `lib/survey/sanitize.ts` exactly as in the guide; (2) replace `app/api/survey/route.ts` with the version in the guide; (3) rewrite `lib/admin/data.ts` to use SQL with the same exported function names and signatures, parameterized queries only, UUID check in `getResponse`; (4) remove mock imports from `app/`; (5) run `pnpm exec tsc --noEmit` and `pnpm build`. I will create the Neon project, run the schema, and put `DATABASE_URL` in `.env.local` myself. Never print or log the connection string. Tell me your plan before step 1, and report each acceptance item as pass or fail only after testing it.

### 4.8 Acceptance checklist

- [ ] Fill in the survey as a test person → in Neon **SQL Editor** (dev branch): `select company, email, follow_up, answers from survey_responses order by submitted_at desc limit 1;` shows your answers.
- [ ] Log in to `/admin` → the new response appears in Responses, Leads (if it qualifies), and the Overview counts.
- [ ] Filters, paging, search, the detail page, and the CSV/Excel download all work with real data.
- [ ] A made-up id such as `/admin/responses/abc` shows "not found", not a server error.
- [ ] A submission with a missing required answer (test with `curl`) is rejected with 422.
- [ ] A submission containing an unknown key (e.g. `"hack":"x"`) is stored without that key.
- [ ] `DATABASE_URL` does not appear in `git status` or in any browser bundle (search the built `.next/static` folder for `neon.tech`).
- [ ] `pnpm exec tsc --noEmit` and `pnpm build` pass.

## 5. Going live with the database

1. In your hosting dashboard (Vercel: Project → Settings → Environment Variables) add `DATABASE_URL` with the **main** branch string, `SESSION_SECRET`, `ADMIN_USERS`. Do the same later for the Phase 5 variables.
2. In Neon, switch the SQL Editor to **main** and run `db/schema.sql` there.
3. Clear test data if any slipped in: `truncate survey_responses;` (on main, **before** announcing the link).
4. Deploy, submit one test response on the live site, confirm it appears in `/admin`, then delete that row.

## 6. Operations

1. **Reset a test database:** `truncate survey_responses;` on the dev branch only.
2. **Rotate a leaked connection string:** Neon → Branches/Roles → reset the role password, update `.env.local` and the hosting variable, redeploy.
3. **Data retention:** decide how long you keep responses (see section 9) and write down the date you will review or delete them.
4. **Backups:** on the Free plan, download an Excel export from `/admin` weekly (or upgrade to the paid plan, which keeps a longer history). Store exports somewhere access-controlled, because they contain personal data.
5. **Cold starts:** after about 5 minutes without traffic the Free database sleeps; the next request may take an extra second or so. Not a bug.

---

# PHASE 5: Confirmation emails

## 7. Choose the email route

| Option | Good | Watch out |
|---|---|---|
| **A. Resend (recommended)** | Simplest to code; free tier is enough for most surveys; good delivery logs. | Needs a domain you control, plus DNS records added by IT. Free plan: 100 emails/day. |
| **B. Company Microsoft 365 / Google Workspace via SMTP (nodemailer)** | Sends from a real company mailbox; no new vendor. | IT must approve; SMTP login is often disabled by policy; mailbox sending limits; passwords/app passwords to manage. |
| **C. Amazon SES** | Very cheap at scale. | More setup (AWS account, leaving "sandbox" mode). |

The rest of this guide uses Resend. The design (sections 8.1 to 8.3) is the same for any provider; only `lib/email/send.ts` changes.

## 8. Design rules (these matter more than the provider)

1. **Save first, email second.** The response is stored before any email is attempted. If the email fails, the respondent still sees "Thank you" and the data is safe.
2. **Record the result** in `email_status` (`sent`, `failed`, `skipped`) with `email_error`. Admins can then see which respondents did not get an email and resend it.
3. **Do not include their answers in the email.** The address was typed by the respondent and could be wrong or someone else's. Send a short thank-you only, never budget or project details.
4. **Prevent abuse.** A public form that sends email to any address can be used to spam a third party. Limit to **one confirmation per email address per 24 hours**, keep the hidden honeypot field from Phase 1, and add per-IP limiting. If abuse appears, add a bot check such as Cloudflare Turnstile.
5. **Promise only what the company will do.** If you write "Our team will contact you within 2 business days", someone must actually do it. Get the wording approved by your head.
6. **Transactional only.** This email confirms receipt. Do not add marketing content. Marketing follow-up needs the respondent's consent (see section 9).
7. **Logos in email should be PNG, not WebP.** Some email programs (notably Outlook desktop) do not show WebP. Export `YFC-email.png` and `Lightera-email.png` (about 200px wide) into `public/Logo/`, and reference them by full public URL (`https://your-site/Logo/YFC-email.png`). Email programs cannot load your local files.
8. **Always include a plain-text version** along with the HTML.

## 9. Privacy and legal checklist (ask the company; this is not legal advice)

The survey collects names, work emails, job titles and company information, which are personal data. For respondents in the Philippines this normally falls under the Data Privacy Act of 2012 (RA 10173). Ask the company's legal team or Data Protection Officer to confirm and approve:

- [ ] A **privacy notice** linked from the welcome screen and in the confirmation email: what you collect, why, who sees it, how long you keep it, how to contact the DPO, how someone asks for deletion.
- [ ] **Consent wording** for follow-up contact (Q41 is already an opt-in) and for any future marketing email.
- [ ] **Retention period** and who deletes data when it ends.
- [ ] Whether storing data in a Singapore (or other overseas) region is acceptable.
- [ ] Who has admin accounts, and a rule to remove accounts of people who leave.

## 10. Setup (you and IT)

1. **Pick the sending address** and domain (decision #5). Use a subdomain, for example `mail.<company-domain>`.
2. Create a Resend account with a company email. In Resend: **Domains → Add Domain**, enter the subdomain, then Resend shows **DNS records** (SPF, DKIM, and sometimes more). **Send these to IT** to add. Verification can take minutes to a few hours. Wait for the status **Verified**.
3. Resend: **API Keys → Create API Key**, permission **Sending access**, restricted to your domain if offered. **Copy it once** (it is not shown again).
4. Add to `.env.local` (and later to hosting variables):

   ```
   RESEND_API_KEY="re_..."
   EMAIL_FROM="YFC-BonEagle International <survey@mail.your-domain.com>"
   EMAIL_REPLY_TO="sales@your-domain.com"
   LEAD_NOTIFY_TO="sales1@your-domain.com,sales2@your-domain.com"
   NEXT_PUBLIC_SITE_URL="https://your-live-site.example"
   ```

   (`NEXT_PUBLIC_SITE_URL` is public on purpose; it is not secret.)
5. **Until the domain is verified**, Resend normally lets you test only with its shared test sender and only to your own account's email address. Use that for your first tests.
6. Also ask IT to add a **DMARC** record for the domain. SPF + DKIM + DMARC together are what keep your email out of spam folders.

## 11. Code

### 11.1 Install

```
pnpm add resend
```

### 11.2 `lib/email/send.ts`

```ts
import 'server-only'
import { Resend } from 'resend'

let client: Resend | null = null

export async function sendEmail(opts: { to: string | string[]; subject: string; html: string; text: string }) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!key || !from) return { ok: false as const, error: 'Email is not configured (RESEND_API_KEY / EMAIL_FROM missing).' }

  client ??= new Resend(key)
  const { data, error } = await client.emails.send({
    from,
    to: opts.to,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  })
  if (error) return { ok: false as const, error: `${error.name}: ${error.message}` }
  return { ok: true as const, id: data?.id ?? '' }
}
```

If your Resend SDK version names the reply-to option differently, the TypeScript error will tell you; check the Resend docs for the current name.

### 11.3 `lib/email/templates.ts`

```ts
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function confirmationEmail(opts: { name: string; followUp?: string; siteUrl: string }) {
  const first = opts.name.trim().split(/\s+/)[0] || 'there'
  const next =
    opts.followUp === 'Yes, please contact me'
      ? 'Our team will be in touch with you about your projects.'      // <- wording must be approved by the company
      : opts.followUp === 'I would first like to receive more information'
        ? 'We will send you more information about Lightera Passive Optical LAN.'
        : 'Your responses have been recorded.'

  const subject = 'Thank you for completing the Hospitality Network Survey'

  const text = [
    `Hello ${first},`,
    '',
    'Thank you for completing the Hospitality Network Survey from YFC-BonEagle International Inc.',
    next,
    '',
    'You received this email because this address was entered on our survey. If that was not you, you can ignore this message.',
    '',
    'YFC-BonEagle International Inc.',
  ].join('\n')

  const html = `<!doctype html><html><body style="margin:0;background:#f4f5fa;font-family:Arial,Helvetica,sans-serif;color:#12163a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #dde0ee;border-radius:12px;">
      <tr><td style="padding:28px 32px 8px;">
        <img src="${opts.siteUrl}/Logo/YFC-email.png" alt="YFC-BonEagle International" height="36" style="height:36px;border:0;">
      </td></tr>
      <tr><td style="padding:8px 32px 0;font-size:22px;font-weight:bold;line-height:1.3;">Thank you, ${esc(first)}.</td></tr>
      <tr><td style="padding:12px 32px 0;font-size:16px;line-height:1.6;color:#444a72;">
        Thank you for completing the Hospitality Network Survey. ${esc(next)}
      </td></tr>
      <tr><td style="padding:24px 32px 28px;font-size:12px;line-height:1.5;color:#666c8f;">
        You received this email because this address was entered on our survey. If that was not you, you can ignore this message.<br>
        YFC-BonEagle International Inc.
      </td></tr>
    </table>
  </td></tr></table></body></html>`

  return { subject, html, text }
}

export function leadAlertEmail(opts: { company: string; name: string; title: string; email: string; investment?: string; followUp?: string; adminUrl: string }) {
  const subject = `New survey lead: ${opts.company}`
  const text = `${opts.name} (${opts.title}) at ${opts.company}\nEmail: ${opts.email}\nInvestment plans: ${opts.investment ?? '-'}\nFollow-up: ${opts.followUp ?? '-'}\n\nOpen in admin: ${opts.adminUrl}`
  const html = `<p><strong>${esc(opts.name)}</strong> (${esc(opts.title)}) at <strong>${esc(opts.company)}</strong></p>
<p>Email: ${esc(opts.email)}<br>Investment plans: ${esc(opts.investment ?? '-')}<br>Follow-up: ${esc(opts.followUp ?? '-')}</p>
<p><a href="${opts.adminUrl}">Open in admin</a></p>`
  return { subject, html, text }
}
```

Always escape (`esc`) anything the respondent typed before putting it in HTML.

### 11.4 `lib/email/confirm.ts`

```ts
import 'server-only'
import { sql } from '@/lib/db'
import { sendEmail } from './send'
import { confirmationEmail, leadAlertEmail } from './templates'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export async function sendConfirmationFor(id: string, a: Record<string, unknown>) {
  const email = String(a.q4)

  // One confirmation per address per 24 hours (abuse protection)
  const recent = await sql().query(
    `select 1 from survey_responses
      where lower(email) = lower($1) and email_status = 'sent' and email_sent_at > now() - interval '24 hours' limit 1`,
    [email],
  )
  if (recent.length) {
    await sql().query(`update survey_responses set email_status = 'skipped', email_error = 'Duplicate within 24h' where id = $1`, [id])
    return
  }

  const mail = confirmationEmail({ name: String(a.q2), followUp: typeof a.q41 === 'string' ? a.q41 : undefined, siteUrl: SITE })
  const res = await sendEmail({ to: email, ...mail })

  if (res.ok) {
    await sql().query(`update survey_responses set email_status = 'sent', email_sent_at = now(), email_message_id = $2, email_error = null where id = $1`, [id, res.id])
  } else {
    await sql().query(`update survey_responses set email_status = 'failed', email_error = $2 where id = $1`, [id, res.error.slice(0, 500)])
  }
}

export async function sendLeadAlert(id: string, a: Record<string, unknown>, isLead: boolean) {
  const to = (process.env.LEAD_NOTIFY_TO ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!isLead || to.length === 0) return
  const mail = leadAlertEmail({
    company: String(a.q1), name: String(a.q2), title: String(a.q3), email: String(a.q4),
    investment: typeof a.q13 === 'string' ? a.q13 : undefined,
    followUp: typeof a.q41 === 'string' ? a.q41 : undefined,
    adminUrl: `${SITE}/admin/responses/${id}`,
  })
  const res = await sendEmail({ to, ...mail })
  if (!res.ok) console.error('[email] lead alert failed', res.error)
}
```

`isLead` comes from the lead rules already in `lib/admin/leads.ts` (priority Hot or Warm is a sensible threshold; confirm with sales).

### 11.5 Hook it into `app/api/survey/route.ts`

Replace the `// PHASE 5` comment with this. `after()` runs the work after the response is sent so the respondent does not wait for email. It is available in current Next.js versions (15.1 and later); if your version does not have it, use `await` inside a `try/catch` instead.

```ts
import { after } from 'next/server'
import { sendConfirmationFor, sendLeadAlert } from '@/lib/email/confirm'
import { getLeadPriority } from '@/lib/admin/leads'   // use the real exported name

// ...after the insert succeeds:
after(async () => {
  try {
    await sendConfirmationFor(id, answers)
    const priority = getLeadPriority({ id, submittedAt: new Date().toISOString(), answers })
    await sendLeadAlert(id, answers, priority === 'hot' || priority === 'warm')
  } catch (err) {
    console.error('[email] post-submit tasks failed', err)
  }
})
```

(Adjust `getLeadPriority` to whatever `lib/admin/leads.ts` actually exports and returns.)

### 11.6 Admin additions

- Show `email_status` in the Response detail page, and a small badge in the Responses table (Sent / Failed / Skipped).
- A **"Resend confirmation"** button on the detail page for rows with `failed`. It must be a `POST` to a route under `/api/admin/` (so it is protected by the login), and it should call `sendConfirmationFor`.

### 11.7 Prompt to give Antigravity for Phase 5

> Read `docs/PHASE-4-5-GUIDE.md` sections 7 to 11 and implement Phase 5. Phase 4 is already done. Create `lib/email/send.ts`, `templates.ts`, `confirm.ts` as in the guide, hook them into `app/api/survey/route.ts` using `after()` (or await with try/catch if this Next.js version lacks `after`), and add the email status badge and a protected "Resend confirmation" action in the admin. Email failures must never make a survey submission fail. Escape all user text in HTML. Do not put API keys in client code or logs. Use the real name exported by `lib/admin/leads.ts` for lead priority. Tell me your plan first; report each acceptance item pass or fail only after testing it.

### 11.8 Acceptance checklist

- [ ] Submitting the survey with your own address delivers a confirmation within about a minute. Check the **spam** folder too.
- [ ] The email looks right in Gmail and in Outlook (logo visible, plain-text version exists).
- [ ] The row shows `email_status = 'sent'` and a message id.
- [ ] Temporarily set a wrong `RESEND_API_KEY`: the survey still shows "Thank you", the row shows `failed` with a readable error, and "Resend confirmation" works after you restore the key.
- [ ] A second submission with the same email within 24 hours is `skipped`.
- [ ] A Hot or Warm lead triggers the alert to `LEAD_NOTIFY_TO`; a non-lead does not.
- [ ] Email headers in Gmail ("Show original") show `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`.
- [ ] No secret appears in `git status` or in the built browser files.

---

# Launch checklist (all phases)

- [ ] Login works; `/admin` and `/api/admin/*` are blocked when logged out.
- [ ] Environment variables set in hosting: `DATABASE_URL` (main branch), `SESSION_SECRET`, `ADMIN_USERS`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `LEAD_NOTIFY_TO`, `NEXT_PUBLIC_SITE_URL`.
- [ ] `db/schema.sql` run on the **main** branch; table is empty before launch.
- [ ] Privacy notice approved and linked; retention period decided.
- [ ] One end-to-end test on the live site (survey → saved → admin → email), then delete the test row.
- [ ] Admin passwords are strong; each admin has their own login.
- [ ] Weekly export scheduled (or paid Neon plan chosen).
- [ ] Someone is named to answer leads and to read the reply-to mailbox.
- [ ] Hosting domain / HTTPS confirmed; the survey link is the final one that will be shared.
- [ ] `/admin` is not linked from the public survey and is marked `noindex`.

# Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `DATABASE_URL is not set` | The variable is missing from `.env.local`, or you did not restart `pnpm dev`. In hosting, add it under environment variables and redeploy. |
| `relation "survey_responses" does not exist` | The schema was run on a different branch. In Neon's SQL Editor, check which branch is selected, run `db/schema.sql` there. |
| `password authentication failed` | The connection string is stale (password reset) or has a typo; copy it again from **Connect**. Keep it inside double quotes. |
| First request very slow, later ones fast | Free-plan database waking up after sleep. Normal. |
| `invalid input syntax for type uuid` | A non-UUID reached a query. Use the UUID check in `getResponse`. |
| Admin shows no data after the swap | Wrong branch in `.env.local`, or no rows yet. Run `select count(*) from survey_responses;` in the same branch. |
| Resend error: domain not verified / 403 | DNS records not added or not propagated yet. Wait, and press **Verify** in Resend. Until then send only with the test sender to your own address. |
| Emails go to spam | Missing SPF/DKIM/DMARC, new domain with no history, or spammy wording. Fix DNS first, keep the content short and plain. |
| Resend 429 / daily limit | Free plan allows 100 emails per day. Rows will show `failed`; use "Resend confirmation" the next day or move to the Pro plan. |
| `after` is not exported from `next/server` | Older Next.js. Upgrade, or use `await` in a try/catch inside the route. |
| Logo missing in the email | You used a WebP or a relative URL. Use a PNG at a full public `https://` address. |
| Build fails with a `server-only` message | A client component imported `lib/db.ts` or `lib/email/*`. Only API routes and server components may import them. |
| Edits in `.env.local` have no effect | Restart the dev server. In hosting, redeploy after changing variables. |

# Order of work (summary)

1. Confirm Phase 2 login is done. Make the decisions in 0.2.
2. Create Neon project, `dev` branch, `.env.local` (section 2).
3. Run `db/schema.sql` in the Neon SQL Editor (section 3).
4. Give Antigravity the Phase 4 prompt (4.7). Test with checklist 4.8.
5. Ask IT for the sending domain and DNS records; set up Resend (section 10). IT may take days, so start this early, in parallel with step 4.
6. Give Antigravity the Phase 5 prompt (11.7). Test with checklist 11.8.
7. Get the privacy notice approved (section 9).
8. Go live with the launch checklist.
